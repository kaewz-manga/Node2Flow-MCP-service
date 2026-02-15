/**
 * Cloudflare API Client
 * Wrapper for Cloudflare REST API v4 calls with error handling and timeout
 */

import { CloudflareConfig } from './types';

export class CloudflareClient {
  private apiToken: string;
  private apiUrl: string;
  private timeout: number;
  private accountId: string | undefined;

  constructor(config: CloudflareConfig) {
    this.apiToken = config.apiToken;
    this.apiUrl = (config.apiUrl || 'https://api.cloudflare.com/client/v4').replace(/\/+$/, '');
    this.timeout = 30000;
    this.accountId = config.accountId;
  }

  /**
   * Make authenticated request to Cloudflare API
   * Extracts result from { success, errors, result } envelope
   */
  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(this.timeout),
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cloudflare API Error (${response.status}): ${error}`);
    }

    const data = await response.json() as { success: boolean; errors: any[]; result: T; result_info?: any };

    if (!data.success && data.errors?.length > 0) {
      throw new Error(`Cloudflare API Error: ${data.errors.map((e: any) => e.message).join(', ')}`);
    }

    return data.result;
  }

  /**
   * Require accountId to be set, throw if not
   */
  private requireAccountId(): string {
    if (!this.accountId) {
      throw new Error('Account ID not set. Use cf_set_active_account or provide account_id in config.');
    }
    return this.accountId;
  }

  // ========== Account Methods (2) ==========

  async listAccounts() {
    return this.request(`${this.apiUrl}/accounts`, { method: 'GET' });
  }

  setActiveAccount(accountId: string) {
    this.accountId = accountId;
    return { success: true, account_id: accountId };
  }

  // ========== Worker Methods (3) ==========

  async listWorkers() {
    const accountId = this.requireAccountId();
    return this.request(`${this.apiUrl}/accounts/${accountId}/workers/scripts`, { method: 'GET' });
  }

  async getWorker(scriptName: string) {
    const accountId = this.requireAccountId();
    return this.request(`${this.apiUrl}/accounts/${accountId}/workers/scripts/${scriptName}`, { method: 'GET' });
  }

  async getWorkerCode(scriptName: string) {
    const accountId = this.requireAccountId();
    const url = `${this.apiUrl}/accounts/${accountId}/workers/scripts/${scriptName}/content`;
    const response = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(this.timeout),
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cloudflare API Error (${response.status}): ${error}`);
    }

    const code = await response.text();
    return { script_name: scriptName, code };
  }

  // ========== D1 Database Methods (5) ==========

  async listD1Databases() {
    const accountId = this.requireAccountId();
    return this.request(`${this.apiUrl}/accounts/${accountId}/d1/database`, { method: 'GET' });
  }

  async createD1Database(name: string) {
    const accountId = this.requireAccountId();
    return this.request(`${this.apiUrl}/accounts/${accountId}/d1/database`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async getD1Database(databaseId: string) {
    const accountId = this.requireAccountId();
    return this.request(`${this.apiUrl}/accounts/${accountId}/d1/database/${databaseId}`, { method: 'GET' });
  }

  async deleteD1Database(databaseId: string) {
    const accountId = this.requireAccountId();
    return this.request(`${this.apiUrl}/accounts/${accountId}/d1/database/${databaseId}`, { method: 'DELETE' });
  }

  async queryD1Database(databaseId: string, sql: string, params?: unknown[]) {
    const accountId = this.requireAccountId();
    return this.request(`${this.apiUrl}/accounts/${accountId}/d1/database/${databaseId}/query`, {
      method: 'POST',
      body: JSON.stringify({ sql, params: params || [] }),
    });
  }

  // ========== KV Namespace Methods (5) ==========

  async listKVNamespaces() {
    const accountId = this.requireAccountId();
    return this.request(`${this.apiUrl}/accounts/${accountId}/storage/kv/namespaces`, { method: 'GET' });
  }

  async createKVNamespace(title: string) {
    const accountId = this.requireAccountId();
    return this.request(`${this.apiUrl}/accounts/${accountId}/storage/kv/namespaces`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  }

  async getKVNamespace(namespaceId: string) {
    const accountId = this.requireAccountId();
    return this.request(`${this.apiUrl}/accounts/${accountId}/storage/kv/namespaces/${namespaceId}`, { method: 'GET' });
  }

  async updateKVNamespace(namespaceId: string, title: string) {
    const accountId = this.requireAccountId();
    return this.request(`${this.apiUrl}/accounts/${accountId}/storage/kv/namespaces/${namespaceId}`, {
      method: 'PUT',
      body: JSON.stringify({ title }),
    });
  }

  async deleteKVNamespace(namespaceId: string) {
    const accountId = this.requireAccountId();
    return this.request(`${this.apiUrl}/accounts/${accountId}/storage/kv/namespaces/${namespaceId}`, { method: 'DELETE' });
  }

  // ========== R2 Bucket Methods (4) ==========

  async listR2Buckets() {
    const accountId = this.requireAccountId();
    return this.request(`${this.apiUrl}/accounts/${accountId}/r2/buckets`, { method: 'GET' });
  }

  async createR2Bucket(name: string) {
    const accountId = this.requireAccountId();
    return this.request(`${this.apiUrl}/accounts/${accountId}/r2/buckets`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async getR2Bucket(bucketName: string) {
    const accountId = this.requireAccountId();
    return this.request(`${this.apiUrl}/accounts/${accountId}/r2/buckets/${bucketName}`, { method: 'GET' });
  }

  async deleteR2Bucket(bucketName: string) {
    const accountId = this.requireAccountId();
    return this.request(`${this.apiUrl}/accounts/${accountId}/r2/buckets/${bucketName}`, { method: 'DELETE' });
  }

  // ========== Hyperdrive Config Methods (4) ==========

  async listHyperdriveConfigs() {
    const accountId = this.requireAccountId();
    return this.request(`${this.apiUrl}/accounts/${accountId}/hyperdrive/configs`, { method: 'GET' });
  }

  async getHyperdriveConfig(configId: string) {
    const accountId = this.requireAccountId();
    return this.request(`${this.apiUrl}/accounts/${accountId}/hyperdrive/configs/${configId}`, { method: 'GET' });
  }

  async editHyperdriveConfig(configId: string, updates: Record<string, unknown>) {
    const accountId = this.requireAccountId();
    return this.request(`${this.apiUrl}/accounts/${accountId}/hyperdrive/configs/${configId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteHyperdriveConfig(configId: string) {
    const accountId = this.requireAccountId();
    return this.request(`${this.apiUrl}/accounts/${accountId}/hyperdrive/configs/${configId}`, { method: 'DELETE' });
  }

  // ========== Documentation Methods (2) ==========

  async searchDocumentation(query: string) {
    const url = `https://developers.cloudflare.com/api/search?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cloudflare Docs Search Error (${response.status}): ${error}`);
    }

    return response.json();
  }

  migratePageToWorkersGuide() {
    return {
      title: 'Migrate from Cloudflare Pages to Workers',
      guide: [
        '1. Create a new Worker project with `npm create cloudflare@latest`',
        '2. Move your static assets to the `public/` directory',
        '3. Convert Pages Functions (`functions/`) to Worker routes',
        '4. Update `_redirects` and `_headers` to Worker middleware',
        '5. Configure `wrangler.toml` with `[site]` for static assets',
        '6. Update environment variables and bindings (D1, KV, R2)',
        '7. Set up custom domains via `routes` or `custom_domain` in wrangler.toml',
        '8. Test locally with `npx wrangler dev`',
        '9. Deploy with `npx wrangler deploy`',
        '10. Update DNS records if using custom domains',
      ],
      key_differences: {
        routing: 'Pages uses file-based routing; Workers use fetch handler',
        functions: 'Pages Functions become Worker route handlers',
        static_assets: 'Pages auto-serves; Workers need [site] config or Assets binding',
        builds: 'Pages has built-in CI/CD; Workers use wrangler deploy or GitHub Actions',
        bindings: 'Same D1/KV/R2 bindings, just different config location',
      },
      documentation: 'https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/',
    };
  }
}
