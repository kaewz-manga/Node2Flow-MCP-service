/**
 * WordPress REST API Client
 * Uses Application Password authentication
 */

import type { WordPressConfig } from './types';

export class WordPressClient {
  private config: WordPressConfig;

  constructor(config: WordPressConfig) {
    this.config = config;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.siteUrl}/wp-json${endpoint}`;
    const auth = btoa(`${this.config.username}:${this.config.applicationPassword}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`WordPress API Error (${response.status}): ${error}`);
    }

    return response.json();
  }

  // Posts
  async listPosts(params?: { per_page?: number; status?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.per_page) query.set('per_page', String(params.per_page));
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    return this.request(`/wp/v2/posts${qs ? `?${qs}` : ''}`);
  }

  async getPost(id: number) {
    return this.request(`/wp/v2/posts/${id}`);
  }

  async createPost(data: { title: string; content: string; status?: string; categories?: number[]; tags?: number[] }) {
    return this.request('/wp/v2/posts', { method: 'POST', body: JSON.stringify(data) });
  }

  async updatePost(id: number, data: { title?: string; content?: string; status?: string; categories?: number[]; tags?: number[] }) {
    return this.request(`/wp/v2/posts/${id}`, { method: 'POST', body: JSON.stringify(data) });
  }

  async deletePost(id: number) {
    return this.request(`/wp/v2/posts/${id}`, { method: 'DELETE' });
  }

  // Pages
  async listPages(params?: { per_page?: number; status?: string }) {
    const query = new URLSearchParams();
    if (params?.per_page) query.set('per_page', String(params.per_page));
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    return this.request(`/wp/v2/pages${qs ? `?${qs}` : ''}`);
  }

  async getPage(id: number) {
    return this.request(`/wp/v2/pages/${id}`);
  }

  async createPage(data: { title: string; content: string; status?: string; parent?: number }) {
    return this.request('/wp/v2/pages', { method: 'POST', body: JSON.stringify(data) });
  }

  async updatePage(id: number, data: { title?: string; content?: string; status?: string }) {
    return this.request(`/wp/v2/pages/${id}`, { method: 'POST', body: JSON.stringify(data) });
  }

  async deletePage(id: number) {
    return this.request(`/wp/v2/pages/${id}`, { method: 'DELETE' });
  }

  // Media
  async listMedia(params?: { per_page?: number; media_type?: string }) {
    const query = new URLSearchParams();
    if (params?.per_page) query.set('per_page', String(params.per_page));
    if (params?.media_type) query.set('media_type', params.media_type);
    const qs = query.toString();
    return this.request(`/wp/v2/media${qs ? `?${qs}` : ''}`);
  }

  async deleteMedia(id: number) {
    return this.request(`/wp/v2/media/${id}?force=true`, { method: 'DELETE' });
  }

  // Comments
  async listComments(params?: { post?: number; per_page?: number }) {
    const query = new URLSearchParams();
    if (params?.post) query.set('post', String(params.post));
    if (params?.per_page) query.set('per_page', String(params.per_page));
    const qs = query.toString();
    return this.request(`/wp/v2/comments${qs ? `?${qs}` : ''}`);
  }

  async createComment(data: { post: number; content: string; author_name?: string; author_email?: string }) {
    return this.request('/wp/v2/comments', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateComment(id: number, data: { content?: string; status?: string }) {
    return this.request(`/wp/v2/comments/${id}`, { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteComment(id: number) {
    return this.request(`/wp/v2/comments/${id}?force=true`, { method: 'DELETE' });
  }

  // Categories
  async listCategories() {
    return this.request('/wp/v2/categories?per_page=100');
  }

  async createCategory(data: { name: string; parent?: number; description?: string }) {
    return this.request('/wp/v2/categories', { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteCategory(id: number) {
    return this.request(`/wp/v2/categories/${id}?force=true`, { method: 'DELETE' });
  }

  // Tags
  async listTags() {
    return this.request('/wp/v2/tags?per_page=100');
  }

  async createTag(data: { name: string; description?: string }) {
    return this.request('/wp/v2/tags', { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteTag(id: number) {
    return this.request(`/wp/v2/tags/${id}?force=true`, { method: 'DELETE' });
  }

  // Users
  async listUsers() {
    return this.request('/wp/v2/users');
  }

  async getUser(id: number) {
    return this.request(`/wp/v2/users/${id}`);
  }

  // Site info
  async getSiteInfo() {
    return this.request('/');
  }
}
