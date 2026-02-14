/**
 * PostgREST REST API Client
 *
 * Connects to any PostgREST server.
 * Auth: JWT Bearer token (optional).
 */

import type { PostgrestConfig, OpenApiSchema, TableDescription, TableColumn } from './types';

export class PostgrestClient {
  private config: PostgrestConfig;

  constructor(config: PostgrestConfig) {
    // Remove trailing slash from URL
    this.config = {
      ...config,
      url: config.url.replace(/\/+$/, ''),
    };
  }

  /**
   * Build headers with optional JWT auth
   */
  private headers(extra?: Record<string, string>): Record<string, string> {
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.config.token) {
      h['Authorization'] = `Bearer ${this.config.token}`;
    }
    if (extra) {
      Object.assign(h, extra);
    }
    return h;
  }

  /**
   * Make a request to PostgREST
   */
  private async request<T>(
    method: string,
    path: string,
    opts?: {
      body?: unknown;
      headers?: Record<string, string>;
      query?: string;
    }
  ): Promise<T> {
    let url = `${this.config.url}${path}`;
    if (opts?.query) {
      url += (url.includes('?') ? '&' : '?') + opts.query;
    }

    const fetchOpts: RequestInit = {
      method,
      headers: this.headers(opts?.headers),
    };

    if (opts?.body !== undefined) {
      fetchOpts.body = JSON.stringify(opts.body);
    }

    const response = await fetch(url, fetchOpts);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(
        `PostgREST Error ${response.status}: ${(error as Record<string, string>).message || (error as Record<string, string>).details || response.statusText}`
      );
    }

    // Some responses have no body (204)
    const text = await response.text();
    if (!text) return {} as T;
    return JSON.parse(text) as T;
  }

  /**
   * Make a request that returns response with headers (for count)
   */
  private async requestWithHeaders(
    method: string,
    path: string,
    opts?: {
      headers?: Record<string, string>;
      query?: string;
    }
  ): Promise<{ data: unknown; headers: Record<string, string> }> {
    let url = `${this.config.url}${path}`;
    if (opts?.query) {
      url += (url.includes('?') ? '&' : '?') + opts.query;
    }

    const fetchOpts: RequestInit = {
      method,
      headers: this.headers(opts?.headers),
    };

    const response = await fetch(url, fetchOpts);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(
        `PostgREST Error ${response.status}: ${(error as Record<string, string>).message || (error as Record<string, string>).details || response.statusText}`
      );
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return { data, headers: responseHeaders };
  }

  // ========== Schema (2) ==========

  async getSchema(): Promise<OpenApiSchema> {
    return this.request<OpenApiSchema>('GET', '/', {
      headers: { 'Accept': 'application/openapi+json' },
    });
  }

  async describeTable(table: string): Promise<TableDescription> {
    const schema = await this.getSchema();

    // Try definitions (OpenAPI 2.x) or components.schemas (OpenAPI 3.x)
    const definitions = schema.definitions || schema.components?.schemas || {};
    const tableSchema = definitions[table];

    if (!tableSchema) {
      const available = Object.keys(definitions).join(', ');
      throw new Error(`Table "${table}" not found in schema. Available: ${available}`);
    }

    const required = new Set(tableSchema.required || []);
    const columns: TableColumn[] = Object.entries(tableSchema.properties).map(
      ([name, col]) => ({
        name,
        type: col.type,
        format: col.format,
        required: required.has(name),
        description: col.description,
        default: col.default,
        enum: col.enum,
        maxLength: col.maxLength,
      })
    );

    return { table, columns };
  }

  // ========== Read (3) ==========

  async listRecords(
    table: string,
    opts?: {
      select?: string;
      filter?: string;
      order?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<unknown> {
    const parts: string[] = [];
    if (opts?.select) parts.push(`select=${encodeURIComponent(opts.select)}`);
    if (opts?.order) parts.push(`order=${encodeURIComponent(opts.order)}`);
    if (opts?.limit !== undefined) parts.push(`limit=${opts.limit}`);
    if (opts?.offset !== undefined) parts.push(`offset=${opts.offset}`);

    // Filter is raw PostgREST filter string (e.g. "age=gt.18&status=eq.active")
    // Append it directly
    let query = parts.join('&');
    if (opts?.filter) {
      query = query ? `${query}&${opts.filter}` : opts.filter;
    }

    return this.request('GET', `/${encodeURIComponent(table)}`, { query });
  }

  async countRecords(
    table: string,
    opts?: {
      filter?: string;
      count?: 'exact' | 'planned' | 'estimated';
    }
  ): Promise<{ count: string | null; method: string }> {
    const countMethod = opts?.count || 'exact';
    const query = opts?.filter
      ? `${opts.filter}&limit=0`
      : 'limit=0';

    const { headers } = await this.requestWithHeaders(
      'GET',
      `/${encodeURIComponent(table)}`,
      {
        headers: {
          'Prefer': `count=${countMethod}`,
        },
        query,
      }
    );

    // Count is in content-range header: "0-0/123" or "*/123"
    const contentRange = headers['content-range'] || '';
    const match = contentRange.match(/\/(\d+|\*)/);
    const count = match ? match[1] : null;

    return { count, method: countMethod };
  }

  async callFunction(
    functionName: string,
    opts?: {
      params?: Record<string, unknown>;
      method?: 'GET' | 'POST';
    }
  ): Promise<unknown> {
    const method = opts?.method || 'POST';

    if (method === 'GET') {
      // GET: params as query string
      const parts: string[] = [];
      if (opts?.params) {
        for (const [key, value] of Object.entries(opts.params)) {
          if (value !== undefined && value !== null) {
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
          }
        }
      }
      return this.request('GET', `/rpc/${encodeURIComponent(functionName)}`, {
        query: parts.join('&'),
      });
    }

    // POST: params as JSON body
    return this.request('POST', `/rpc/${encodeURIComponent(functionName)}`, {
      body: opts?.params || {},
    });
  }

  // ========== Write (5) ==========

  async insertRecords(
    table: string,
    records: unknown,
    opts?: {
      return?: 'representation' | 'minimal' | 'headers-only';
      select?: string;
    }
  ): Promise<unknown> {
    const prefer: string[] = [];
    if (opts?.return) prefer.push(`return=${opts.return}`);

    const query = opts?.select ? `select=${encodeURIComponent(opts.select)}` : '';

    return this.request('POST', `/${encodeURIComponent(table)}`, {
      body: records,
      headers: prefer.length ? { 'Prefer': prefer.join(', ') } : undefined,
      query,
    });
  }

  async updateRecords(
    table: string,
    filter: string,
    data: Record<string, unknown>,
    opts?: {
      return?: 'representation' | 'minimal' | 'headers-only';
      select?: string;
    }
  ): Promise<unknown> {
    const prefer: string[] = [];
    if (opts?.return) prefer.push(`return=${opts.return}`);

    let query = filter;
    if (opts?.select) {
      query += `&select=${encodeURIComponent(opts.select)}`;
    }

    return this.request('PATCH', `/${encodeURIComponent(table)}`, {
      body: data,
      headers: prefer.length ? { 'Prefer': prefer.join(', ') } : undefined,
      query,
    });
  }

  async upsertRecords(
    table: string,
    records: unknown,
    opts?: {
      resolution?: 'merge-duplicates' | 'ignore-duplicates';
      return?: 'representation' | 'minimal' | 'headers-only';
      select?: string;
      onConflict?: string;
    }
  ): Promise<unknown> {
    const prefer: string[] = [];
    prefer.push(`resolution=${opts?.resolution || 'merge-duplicates'}`);
    if (opts?.return) prefer.push(`return=${opts.return}`);

    const parts: string[] = [];
    if (opts?.select) parts.push(`select=${encodeURIComponent(opts.select)}`);
    if (opts?.onConflict) parts.push(`on_conflict=${encodeURIComponent(opts.onConflict)}`);

    return this.request('POST', `/${encodeURIComponent(table)}`, {
      body: records,
      headers: { 'Prefer': prefer.join(', ') },
      query: parts.join('&'),
    });
  }

  async deleteRecords(
    table: string,
    filter: string,
    opts?: {
      return?: 'representation' | 'minimal' | 'headers-only';
      select?: string;
    }
  ): Promise<unknown> {
    const prefer: string[] = [];
    if (opts?.return) prefer.push(`return=${opts.return}`);

    let query = filter;
    if (opts?.select) {
      query += `&select=${encodeURIComponent(opts.select)}`;
    }

    return this.request('DELETE', `/${encodeURIComponent(table)}`, {
      headers: prefer.length ? { 'Prefer': prefer.join(', ') } : undefined,
      query,
    });
  }

  async replaceRecord(
    table: string,
    filter: string,
    data: Record<string, unknown>,
    opts?: {
      return?: 'representation' | 'minimal' | 'headers-only';
      select?: string;
    }
  ): Promise<unknown> {
    const prefer: string[] = [];
    if (opts?.return) prefer.push(`return=${opts.return}`);

    let query = filter;
    if (opts?.select) {
      query += `&select=${encodeURIComponent(opts.select)}`;
    }

    return this.request('PUT', `/${encodeURIComponent(table)}`, {
      body: data,
      headers: prefer.length ? { 'Prefer': prefer.join(', ') } : undefined,
      query,
    });
  }
}
