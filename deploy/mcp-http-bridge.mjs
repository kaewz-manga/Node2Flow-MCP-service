#!/usr/bin/env node
/**
 * MCP HTTP Bridge (Multi-Tenant)
 * Wraps any stdio MCP server into a stateless HTTP JSON-RPC endpoint.
 * Supports per-request service tokens via headers for multi-tenant use.
 *
 * Usage:
 *   node mcp-http-bridge.mjs <command> [args...]
 *
 * Example:
 *   PORT=3000 node mcp-http-bridge.mjs npx @notionhq/notion-mcp-server
 *   PORT=3000 node mcp-http-bridge.mjs npx @line/line-bot-mcp-server
 *
 * Headers for per-request tokens:
 *   x-service-token: The actual service API token (e.g., Notion token, LINE token)
 *   x-service-token-env: ENV var name to set (e.g., NOTION_TOKEN, CHANNEL_ACCESS_TOKEN)
 *   x-service-extra-env: Extra env vars in KEY=VALUE format (e.g., DESTINATION_USER_ID=Uxxx)
 *
 * If no x-service-token header is provided, falls back to shared process mode
 * (uses tokens from the bridge's own environment variables).
 */

import { spawn } from 'child_process';
import http from 'http';
import crypto from 'crypto';

const PORT = parseInt(process.env.PORT || '3000', 10);
const AUTH_TOKEN = process.env.AUTH_TOKEN || '';
const POOL_IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// Parse command from args
const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error('Usage: node mcp-http-bridge.mjs <command> [args...]');
  process.exit(1);
}

// ─── Shared process (no per-request token) ───

let sharedProcess = null;
let sharedRequestId = 0;
let sharedPending = new Map();
let sharedBuffer = '';
let sharedInitialized = false;

function spawnSharedProcess() {
  console.log(`Starting shared MCP server: ${command} ${args.join(' ')}`);
  const child = spawn(command, args, {
    stdio: ['pipe', 'pipe', 'inherit'],
    env: { ...process.env },
    shell: true,
  });

  child.on('error', (err) => {
    console.error(`Shared MCP server error: ${err.message}`);
  });

  child.on('exit', (code) => {
    console.error(`Shared MCP server exited with code ${code}`);
    sharedProcess = null;
    sharedInitialized = false;
  });

  child.stdout.on('data', (data) => {
    sharedBuffer += data.toString();
    const lines = sharedBuffer.split('\n');
    sharedBuffer = lines.pop() || '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const msg = JSON.parse(trimmed);
        if (msg.id !== undefined && sharedPending.has(msg.id)) {
          const { resolve } = sharedPending.get(msg.id);
          sharedPending.delete(msg.id);
          resolve(msg);
        }
      } catch { /* Not JSON */ }
    }
  });

  return child;
}

function sendSharedRequest(method, params) {
  return new Promise((resolve, reject) => {
    if (!sharedProcess) {
      reject(new Error('Shared process not running'));
      return;
    }
    const id = ++sharedRequestId;
    sharedPending.set(id, { resolve, reject });
    const msg = JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n';
    sharedProcess.stdin.write(msg);
    setTimeout(() => {
      if (sharedPending.has(id)) {
        sharedPending.delete(id);
        reject(new Error('Request timeout'));
      }
    }, 30000);
  });
}

async function initSharedProcess() {
  sharedProcess = spawnSharedProcess();
  try {
    await sendSharedRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'mcp-http-bridge', version: '2.0.0' },
    });
    sharedProcess.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
    sharedInitialized = true;
    console.log('Shared MCP server initialized');
  } catch (err) {
    console.error(`Failed to initialize shared process: ${err.message}`);
  }
}

// ─── Per-token process pool ───

const tokenPool = new Map(); // tokenHash -> { child, pending, buffer, requestId, lastUsed, initialized }

function hashToken(token, envName, extraEnv) {
  return crypto.createHash('sha256').update(`${envName}:${token}:${extraEnv || ''}`).digest('hex').slice(0, 16);
}

function spawnTokenProcess(token, envName, extraEnv) {
  const env = { ...process.env };
  env[envName] = token;

  // Parse extra env vars
  if (extraEnv) {
    for (const part of extraEnv.split(',')) {
      const [key, ...valParts] = part.split('=');
      if (key && valParts.length > 0) {
        env[key.trim()] = valParts.join('=').trim();
      }
    }
  }

  console.log(`Spawning per-token MCP server (env: ${envName})`);
  const child = spawn(command, args, {
    stdio: ['pipe', 'pipe', 'inherit'],
    env,
    shell: true,
  });

  const entry = {
    child,
    pending: new Map(),
    buffer: '',
    requestId: 0,
    lastUsed: Date.now(),
    initialized: false,
  };

  child.on('error', (err) => {
    console.error(`Per-token MCP server error: ${err.message}`);
  });

  child.on('exit', (code) => {
    const hash = hashToken(token, envName, extraEnv);
    tokenPool.delete(hash);
    console.log(`Per-token MCP server exited (code: ${code})`);
  });

  child.stdout.on('data', (data) => {
    entry.buffer += data.toString();
    const lines = entry.buffer.split('\n');
    entry.buffer = lines.pop() || '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const msg = JSON.parse(trimmed);
        if (msg.id !== undefined && entry.pending.has(msg.id)) {
          const { resolve } = entry.pending.get(msg.id);
          entry.pending.delete(msg.id);
          resolve(msg);
        }
      } catch { /* Not JSON */ }
    }
  });

  return entry;
}

function sendTokenRequest(entry, method, params) {
  return new Promise((resolve, reject) => {
    const id = ++entry.requestId;
    entry.pending.set(id, { resolve, reject });
    const msg = JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n';
    entry.child.stdin.write(msg);
    setTimeout(() => {
      if (entry.pending.has(id)) {
        entry.pending.delete(id);
        reject(new Error('Request timeout'));
      }
    }, 30000);
  });
}

async function getOrCreateTokenProcess(token, envName, extraEnv) {
  const hash = hashToken(token, envName, extraEnv);
  let entry = tokenPool.get(hash);

  if (entry && entry.child && !entry.child.killed) {
    entry.lastUsed = Date.now();
    return entry;
  }

  // Spawn new process
  entry = spawnTokenProcess(token, envName, extraEnv);
  tokenPool.set(hash, entry);

  // Initialize
  try {
    await sendTokenRequest(entry, 'initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'mcp-http-bridge', version: '2.0.0' },
    });
    entry.child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
    entry.initialized = true;
    console.log(`Per-token MCP server initialized (hash: ${hash})`);
  } catch (err) {
    console.error(`Failed to initialize per-token process: ${err.message}`);
    entry.child.kill();
    tokenPool.delete(hash);
    throw err;
  }

  return entry;
}

// Cleanup idle processes
setInterval(() => {
  const now = Date.now();
  for (const [hash, entry] of tokenPool) {
    if (now - entry.lastUsed > POOL_IDLE_TIMEOUT) {
      console.log(`Cleaning up idle process (hash: ${hash})`);
      entry.child.kill();
      tokenPool.delete(hash);
    }
  }
}, 60000);

// ─── HTTP server ───

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-service-token, x-service-token-env, x-service-extra-env');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'POST' || req.url !== '/mcp') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found. Use POST /mcp' }));
    return;
  }

  // Auth check
  if (AUTH_TOKEN) {
    const auth = req.headers['authorization'] || '';
    if (auth !== `Bearer ${AUTH_TOKEN}`) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
  }

  // Read body
  let body = '';
  for await (const chunk of req) {
    body += chunk;
  }

  try {
    const request = JSON.parse(body);
    const { method, params, id: reqId } = request;

    let result;
    if (method === 'initialize') {
      result = {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'mcp-http-bridge', version: '2.0.0' },
      };
    } else if (method === 'tools/list' || method === 'tools/call') {
      // Check for per-request token
      const serviceToken = req.headers['x-service-token'];
      const serviceTokenEnv = req.headers['x-service-token-env'];
      const serviceExtraEnv = req.headers['x-service-extra-env'];

      let response;
      if (serviceToken && serviceTokenEnv) {
        // Per-token process
        const entry = await getOrCreateTokenProcess(serviceToken, serviceTokenEnv, serviceExtraEnv);
        response = await sendTokenRequest(entry, method, params || {});
      } else {
        // Shared process
        if (!sharedInitialized) {
          throw new Error('Shared MCP server not initialized');
        }
        response = await sendSharedRequest(method, params || {});
      }

      result = response.result;
      if (response.error) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ jsonrpc: '2.0', id: reqId, error: response.error }));
        return;
      }
    } else {
      result = {};
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ jsonrpc: '2.0', id: reqId, result }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32000, message: err.message },
    }));
  }
});

// Start
await initSharedProcess();
server.listen(PORT, '0.0.0.0', () => {
  console.log(`MCP HTTP Bridge (Multi-Tenant) listening on port ${PORT}`);
  console.log(`POST http://localhost:${PORT}/mcp`);
  console.log(`Per-request tokens via x-service-token + x-service-token-env headers`);
});
