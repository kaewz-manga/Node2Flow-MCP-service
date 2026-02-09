#!/usr/bin/env node
/**
 * MCP HTTP Bridge
 * Wraps any stdio MCP server into a stateless HTTP JSON-RPC endpoint.
 *
 * Usage:
 *   node mcp-http-bridge.mjs <command> [args...]
 *
 * Example:
 *   PORT=3000 node mcp-http-bridge.mjs npx @notionhq/notion-mcp-server
 *   PORT=3000 node mcp-http-bridge.mjs npx @line/line-bot-mcp-server
 *
 * Exposes POST /mcp endpoint that accepts JSON-RPC 2.0 requests:
 *   - tools/list → returns tool definitions
 *   - tools/call → executes a tool and returns result
 *   - initialize → returns server capabilities
 */

import { spawn } from 'child_process';
import http from 'http';

const PORT = parseInt(process.env.PORT || '3000', 10);
const AUTH_TOKEN = process.env.AUTH_TOKEN || '';

// Parse command from args
const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error('Usage: node mcp-http-bridge.mjs <command> [args...]');
  process.exit(1);
}

let requestId = 0;
const pendingRequests = new Map();
let buffer = '';

// Spawn the MCP server process
console.log(`Starting MCP server: ${command} ${args.join(' ')}`);
const child = spawn(command, args, {
  stdio: ['pipe', 'pipe', 'inherit'],
  env: { ...process.env },
  shell: true,
});

child.on('error', (err) => {
  console.error(`Failed to start MCP server: ${err.message}`);
  process.exit(1);
});

child.on('exit', (code) => {
  console.error(`MCP server exited with code ${code}`);
  process.exit(code || 1);
});

// Read JSON-RPC responses from stdout
child.stdout.on('data', (data) => {
  buffer += data.toString();
  // Try to parse complete JSON messages (newline-delimited)
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const msg = JSON.parse(trimmed);
      if (msg.id !== undefined && pendingRequests.has(msg.id)) {
        const { resolve } = pendingRequests.get(msg.id);
        pendingRequests.delete(msg.id);
        resolve(msg);
      }
    } catch {
      // Not JSON, ignore
    }
  }
});

// Send JSON-RPC request to child process
function sendRequest(method, params) {
  return new Promise((resolve, reject) => {
    const id = ++requestId;
    pendingRequests.set(id, { resolve, reject });
    const msg = JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n';
    child.stdin.write(msg);
    // Timeout after 30 seconds
    setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        reject(new Error('Request timeout'));
      }
    }, 30000);
  });
}

// Initialize MCP connection
async function initMcp() {
  try {
    await sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'mcp-http-bridge', version: '1.0.0' },
    });
    // Send initialized notification
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
    console.log('MCP server initialized');
  } catch (err) {
    console.error(`Failed to initialize MCP server: ${err.message}`);
    process.exit(1);
  }
}

// HTTP server
const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
        serverInfo: { name: 'mcp-http-bridge', version: '1.0.0' },
      };
    } else if (method === 'tools/list' || method === 'tools/call') {
      const response = await sendRequest(method, params || {});
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
await initMcp();
server.listen(PORT, '0.0.0.0', () => {
  console.log(`MCP HTTP Bridge listening on port ${PORT}`);
  console.log(`POST http://localhost:${PORT}/mcp`);
});
