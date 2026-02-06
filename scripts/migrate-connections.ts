/**
 * Connection Migration Script
 *
 * Transforms old n8n_connections (separate n8n_url + encrypted api_key)
 * into unified connections table (encrypted JSON config with product_type).
 *
 * Usage:
 *   1. Export old DB: wrangler d1 export n8n-management-mcp-db --remote --output=old-data.sql
 *   2. Run this script against both databases
 *
 * The script:
 *   - Reads old n8n_connections from platform-db (where they were copied)
 *   - Decrypts old api_key using ENCRYPTION_KEY
 *   - Re-encrypts as JSON config: { api_url: n8n_url, api_key: decrypted_key }
 *   - Inserts into gateway products-db connections table
 *   - Connection IDs are preserved (api_keys.connection_id still works)
 *
 * Run via wrangler:
 *   npx wrangler d1 execute node2flow-products-db --remote --file=<generated-sql>
 *
 * NOTE: This is a reference implementation. In practice, run via a one-off Worker
 * or local script that has access to both D1 databases and the ENCRYPTION_KEY.
 */

// This would be run as a Cloudflare Worker one-off script
// Env needs: OLD_DB (source), NEW_DB (gateway), ENCRYPTION_KEY

interface OldConnection {
  id: string;
  user_id: string;
  name: string;
  n8n_url: string;
  n8n_api_key_encrypted: string;
  status: string;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

interface MigrationEnv {
  OLD_DB: D1Database;    // n8n-management-mcp-db (source)
  NEW_DB: D1Database;    // node2flow-products-db (target)
  ENCRYPTION_KEY: string;
}

// Decrypt old format (AES-256-GCM, base64 encoded: iv + ciphertext)
async function decryptOld(encrypted: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key.padEnd(32, '0').slice(0, 32)),
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    keyMaterial,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

// Encrypt new format (AES-256-GCM, base64 encoded: iv + ciphertext)
async function encryptNew(config: Record<string, unknown>, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(config));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key.padEnd(32, '0').slice(0, 32)),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    keyMaterial,
    data
  );

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined));
}

export default {
  async fetch(request: Request, env: MigrationEnv): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname !== '/migrate') {
      return new Response(JSON.stringify({
        usage: 'POST /migrate to start migration',
        warning: 'This will write to the gateway DB. Backup first!',
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (request.method !== 'POST') {
      return new Response('Use POST', { status: 405 });
    }

    const results: string[] = [];
    let migrated = 0;
    let errors = 0;

    try {
      // Read all old connections
      const oldConnections = await env.OLD_DB.prepare(
        'SELECT * FROM n8n_connections WHERE status != ?'
      ).bind('deleted').all<OldConnection>();

      results.push(`Found ${oldConnections.results.length} connections to migrate`);

      for (const conn of oldConnections.results) {
        try {
          // Decrypt old API key
          const apiKey = await decryptOld(conn.n8n_api_key_encrypted, env.ENCRYPTION_KEY);

          // Create new config JSON
          const config = {
            api_url: conn.n8n_url,
            api_key: apiKey,
          };

          // Encrypt as new format
          const configEncrypted = await encryptNew(config, env.ENCRYPTION_KEY);

          // Insert into gateway DB (same ID for FK compatibility)
          await env.NEW_DB.prepare(
            `INSERT INTO connections (id, user_id, product_type, name, config_encrypted, status, last_used_at, created_at, updated_at)
             VALUES (?, ?, 'n8n', ?, ?, ?, ?, ?, ?)`
          ).bind(
            conn.id,
            conn.user_id,
            conn.name,
            configEncrypted,
            conn.status,
            conn.last_used_at,
            conn.created_at,
            conn.updated_at
          ).run();

          migrated++;
          results.push(`OK: ${conn.name} (${conn.id})`);
        } catch (err: any) {
          errors++;
          results.push(`ERROR: ${conn.name} (${conn.id}): ${err.message}`);
        }
      }

      results.push(`\nMigration complete: ${migrated} migrated, ${errors} errors`);

      return new Response(JSON.stringify({ success: true, migrated, errors, details: results }, null, 2), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ success: false, error: err.message, details: results }, null, 2), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};
