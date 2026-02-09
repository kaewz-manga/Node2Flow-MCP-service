/**
 * Notion REST API Client
 * Matches official @notionhq/notion-mcp-server v2.1.0
 * API Version: 2025-09-03
 */

import type {
  NotionConfig,
  NotionPage,
  NotionBlock,
  NotionDataSource,
  NotionDatabase,
  NotionComment,
  NotionUser,
  NotionList,
} from './types';

export class NotionClient {
  private config: NotionConfig;
  private baseUrl = 'https://api.notion.com/v1';

  constructor(config: NotionConfig) {
    this.config = config;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Notion-Version': '2025-09-03',
        'Content-Type': 'application/json',
        'User-Agent': 'notion-mcp-server',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Notion API Error (${response.status}): ${error}`);
    }

    return response.json() as Promise<T>;
  }

  // ========== Search ==========

  async search(params?: Record<string, unknown>): Promise<NotionList<NotionPage | NotionDatabase>> {
    return this.request('/search', { method: 'POST', body: JSON.stringify(params || {}) });
  }

  // ========== Pages ==========

  async createPage(params: {
    parent: Record<string, unknown>;
    properties: Record<string, unknown>;
    children?: unknown[];
    icon?: unknown;
    cover?: unknown;
  }): Promise<NotionPage> {
    return this.request('/pages', { method: 'POST', body: JSON.stringify(params) });
  }

  async getPage(pageId: string, filterProperties?: string): Promise<NotionPage> {
    const query = new URLSearchParams();
    if (filterProperties) query.set('filter_properties', filterProperties);
    const qs = query.toString();
    return this.request(`/pages/${pageId}${qs ? `?${qs}` : ''}`);
  }

  async updatePage(pageId: string, params: Record<string, unknown>): Promise<NotionPage> {
    return this.request(`/pages/${pageId}`, { method: 'PATCH', body: JSON.stringify(params) });
  }

  async movePage(pageId: string, parent: Record<string, unknown>): Promise<NotionPage> {
    return this.request(`/pages/${pageId}/move`, {
      method: 'POST',
      body: JSON.stringify({ parent }),
    });
  }

  async getPageProperty(pageId: string, propertyId: string, params?: {
    start_cursor?: string;
    page_size?: number;
  }): Promise<unknown> {
    const query = new URLSearchParams();
    if (params?.start_cursor) query.set('start_cursor', params.start_cursor);
    if (params?.page_size) query.set('page_size', String(params.page_size));
    const qs = query.toString();
    return this.request(`/pages/${pageId}/properties/${propertyId}${qs ? `?${qs}` : ''}`);
  }

  // ========== Blocks ==========

  async getBlock(blockId: string): Promise<NotionBlock> {
    return this.request(`/blocks/${blockId}`);
  }

  async getBlockChildren(blockId: string, params?: {
    start_cursor?: string;
    page_size?: number;
  }): Promise<NotionList<NotionBlock>> {
    const query = new URLSearchParams();
    if (params?.start_cursor) query.set('start_cursor', params.start_cursor);
    if (params?.page_size) query.set('page_size', String(params.page_size));
    const qs = query.toString();
    return this.request(`/blocks/${blockId}/children${qs ? `?${qs}` : ''}`);
  }

  async appendBlocks(blockId: string, children: unknown[], after?: string): Promise<NotionList<NotionBlock>> {
    const body: Record<string, unknown> = { children };
    if (after) body.after = after;
    return this.request(`/blocks/${blockId}/children`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async updateBlock(blockId: string, data: Record<string, unknown>): Promise<NotionBlock> {
    return this.request(`/blocks/${blockId}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async deleteBlock(blockId: string): Promise<NotionBlock> {
    return this.request(`/blocks/${blockId}`, { method: 'DELETE' });
  }

  // ========== Data Sources (2025-09-03) ==========

  async createDataSource(params: {
    parent: Record<string, unknown>;
    properties: Record<string, unknown>;
    title?: unknown[];
  }): Promise<NotionDataSource> {
    return this.request('/data_sources', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getDataSource(dataSourceId: string): Promise<NotionDataSource> {
    return this.request(`/data_sources/${dataSourceId}`);
  }

  async updateDataSource(dataSourceId: string, params: Record<string, unknown>): Promise<NotionDataSource> {
    return this.request(`/data_sources/${dataSourceId}`, {
      method: 'PATCH',
      body: JSON.stringify(params),
    });
  }

  async queryDataSource(dataSourceId: string, params?: Record<string, unknown>): Promise<NotionList<NotionPage>> {
    return this.request(`/data_sources/${dataSourceId}/query`, {
      method: 'POST',
      body: JSON.stringify(params || {}),
    });
  }

  async listDataSourceTemplates(dataSourceId: string, params?: {
    start_cursor?: string;
    page_size?: number;
  }): Promise<NotionList<NotionPage>> {
    const query = new URLSearchParams();
    if (params?.start_cursor) query.set('start_cursor', params.start_cursor);
    if (params?.page_size) query.set('page_size', String(params.page_size));
    const qs = query.toString();
    return this.request(`/data_sources/${dataSourceId}/templates${qs ? `?${qs}` : ''}`);
  }

  // ========== Database ==========

  async getDatabase(databaseId: string): Promise<NotionDatabase> {
    return this.request(`/databases/${databaseId}`);
  }

  // ========== Comments ==========

  async createComment(params: {
    parent: { page_id: string };
    rich_text: unknown[];
  }): Promise<NotionComment> {
    return this.request('/comments', { method: 'POST', body: JSON.stringify(params) });
  }

  async getComments(blockId: string, params?: {
    start_cursor?: string;
    page_size?: number;
  }): Promise<NotionList<NotionComment>> {
    const query = new URLSearchParams();
    query.set('block_id', blockId);
    if (params?.start_cursor) query.set('start_cursor', params.start_cursor);
    if (params?.page_size) query.set('page_size', String(params.page_size));
    return this.request(`/comments?${query.toString()}`);
  }

  // ========== Users ==========

  async listUsers(params?: {
    start_cursor?: string;
    page_size?: number;
  }): Promise<NotionList<NotionUser>> {
    const query = new URLSearchParams();
    if (params?.start_cursor) query.set('start_cursor', params.start_cursor);
    if (params?.page_size) query.set('page_size', String(params.page_size));
    const qs = query.toString();
    return this.request(`/users${qs ? `?${qs}` : ''}`);
  }

  async getUser(userId: string): Promise<NotionUser> {
    return this.request(`/users/${userId}`);
  }

  async getBotUser(): Promise<NotionUser> {
    return this.request('/users/me');
  }
}
