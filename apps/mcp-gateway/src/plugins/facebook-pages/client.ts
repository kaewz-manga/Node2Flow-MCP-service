/**
 * Facebook Graph API v21.0 Client
 * Auth via ?access_token=TOKEN query parameter.
 * Responses are JSON; errors have { error: { message, type, code } }.
 */

import type { FacebookPagesConfig } from './types';

interface FacebookApiError {
  error: {
    message: string;
    type: string;
    code: number;
    fbtrace_id?: string;
  };
}

export class FacebookClient {
  private config: FacebookPagesConfig;
  private baseUrl = 'https://graph.facebook.com/v21.0';

  constructor(config: FacebookPagesConfig) {
    this.config = config;
  }

  private async request<T>(
    path: string,
    method: 'GET' | 'POST' | 'DELETE' = 'GET',
    body?: Record<string, unknown>
  ): Promise<T> {
    const separator = path.includes('?') ? '&' : '?';
    const url = `${this.baseUrl}${path}${separator}access_token=${this.config.pageAccessToken}`;

    const options: RequestInit = { method };
    if (body && (method === 'POST' || method === 'DELETE')) {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = (await response.json()) as T | FacebookApiError;

    if (
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      (data as FacebookApiError).error
    ) {
      const err = (data as FacebookApiError).error;
      throw new Error(`Facebook API Error (${err.code}): ${err.message}`);
    }

    return data as T;
  }

  // ========== Pages ==========

  async listPages(): Promise<unknown> {
    return this.request('/me/accounts');
  }

  async getPage(pageId: string, fields?: string): Promise<unknown> {
    const f = fields || 'id,name,category,fan_count,link,picture';
    return this.request(`/${pageId}?fields=${encodeURIComponent(f)}`);
  }

  async getPageToken(pageId: string): Promise<unknown> {
    return this.request(`/${pageId}?fields=access_token`);
  }

  // ========== Posts ==========

  async listPosts(pageId: string, limit?: number, fields?: string): Promise<unknown> {
    const params: string[] = [];
    if (limit) params.push(`limit=${limit}`);
    if (fields) params.push(`fields=${encodeURIComponent(fields)}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.request(`/${pageId}/feed${qs}`);
  }

  async getPost(postId: string, fields?: string): Promise<unknown> {
    const qs = fields ? `?fields=${encodeURIComponent(fields)}` : '';
    return this.request(`/${postId}${qs}`);
  }

  async createPost(
    pageId: string,
    message?: string,
    link?: string,
    published?: boolean
  ): Promise<unknown> {
    const body: Record<string, unknown> = {};
    if (message !== undefined) body.message = message;
    if (link !== undefined) body.link = link;
    if (published !== undefined) body.published = published;
    return this.request(`/${pageId}/feed`, 'POST', body);
  }

  async updatePost(postId: string, message: string): Promise<unknown> {
    return this.request(`/${postId}`, 'POST', { message });
  }

  async deletePost(postId: string): Promise<unknown> {
    return this.request(`/${postId}`, 'DELETE');
  }

  async schedulePost(
    pageId: string,
    message: string,
    scheduledTime: number,
    link?: string
  ): Promise<unknown> {
    const body: Record<string, unknown> = {
      message,
      published: false,
      scheduled_publish_time: scheduledTime,
    };
    if (link !== undefined) body.link = link;
    return this.request(`/${pageId}/feed`, 'POST', body);
  }

  // ========== Comments ==========

  async listComments(objectId: string, limit?: number): Promise<unknown> {
    const qs = limit ? `?limit=${limit}` : '';
    return this.request(`/${objectId}/comments${qs}`);
  }

  async createComment(objectId: string, message: string): Promise<unknown> {
    return this.request(`/${objectId}/comments`, 'POST', { message });
  }

  async replyComment(commentId: string, message: string): Promise<unknown> {
    return this.request(`/${commentId}/comments`, 'POST', { message });
  }

  async deleteComment(commentId: string): Promise<unknown> {
    return this.request(`/${commentId}`, 'DELETE');
  }

  async hideComment(commentId: string, isHidden: boolean): Promise<unknown> {
    return this.request(`/${commentId}`, 'POST', { is_hidden: isHidden });
  }

  // ========== Photos ==========

  async uploadPhoto(
    pageId: string,
    url: string,
    caption?: string,
    published?: boolean
  ): Promise<unknown> {
    const body: Record<string, unknown> = { url };
    if (caption !== undefined) body.caption = caption;
    if (published !== undefined) body.published = published;
    return this.request(`/${pageId}/photos`, 'POST', body);
  }

  async listPhotos(pageId: string, limit?: number): Promise<unknown> {
    const qs = limit ? `?limit=${limit}` : '';
    return this.request(`/${pageId}/photos${qs}`);
  }

  async deletePhoto(photoId: string): Promise<unknown> {
    return this.request(`/${photoId}`, 'DELETE');
  }

  // ========== Videos ==========

  async uploadVideo(
    pageId: string,
    fileUrl: string,
    title?: string,
    description?: string
  ): Promise<unknown> {
    const body: Record<string, unknown> = { file_url: fileUrl };
    if (title !== undefined) body.title = title;
    if (description !== undefined) body.description = description;
    return this.request(`/${pageId}/videos`, 'POST', body);
  }

  async listVideos(pageId: string, limit?: number): Promise<unknown> {
    const qs = limit ? `?limit=${limit}` : '';
    return this.request(`/${pageId}/videos${qs}`);
  }

  async deleteVideo(videoId: string): Promise<unknown> {
    return this.request(`/${videoId}`, 'DELETE');
  }

  // ========== Insights ==========

  async getPageInsights(
    pageId: string,
    metric: string,
    period?: string,
    since?: string,
    until?: string
  ): Promise<unknown> {
    const params: string[] = [`metric=${encodeURIComponent(metric)}`];
    if (period) params.push(`period=${period}`);
    if (since) params.push(`since=${encodeURIComponent(since)}`);
    if (until) params.push(`until=${encodeURIComponent(until)}`);
    return this.request(`/${pageId}/insights?${params.join('&')}`);
  }

  async getPostInsights(postId: string, metric: string): Promise<unknown> {
    return this.request(
      `/${postId}/insights?metric=${encodeURIComponent(metric)}`
    );
  }

  async getPageFans(pageId: string): Promise<unknown> {
    return this.request(`/${pageId}/insights?metric=page_fans`);
  }

  async getPageViews(pageId: string, period?: string): Promise<unknown> {
    const p = period || 'day';
    return this.request(
      `/${pageId}/insights?metric=page_views_total&period=${p}`
    );
  }

  // ========== Conversations ==========

  async listConversations(pageId: string, limit?: number): Promise<unknown> {
    const qs = limit ? `?limit=${limit}` : '';
    return this.request(`/${pageId}/conversations${qs}`);
  }

  async getMessages(conversationId: string, limit?: number): Promise<unknown> {
    const qs = limit ? `?limit=${limit}` : '';
    return this.request(`/${conversationId}/messages${qs}`);
  }

  async sendMessage(
    pageId: string,
    recipientId: string,
    text: string
  ): Promise<unknown> {
    return this.request(`/${pageId}/messages`, 'POST', {
      recipient: { id: recipientId },
      message: { text },
      messaging_type: 'RESPONSE',
    });
  }

  async sendTyping(
    pageId: string,
    recipientId: string,
    action?: string
  ): Promise<unknown> {
    return this.request(`/${pageId}/messages`, 'POST', {
      recipient: { id: recipientId },
      sender_action: action || 'typing_on',
    });
  }
}
