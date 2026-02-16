/**
 * Instagram Graph API v21.0 Client
 * Auth via ?access_token=TOKEN query parameter.
 * Uses the same base URL as Facebook Graph API (graph.facebook.com).
 */

import type { InstagramConfig } from './types';

interface GraphApiError {
  error: {
    message: string;
    type: string;
    code: number;
    fbtrace_id?: string;
  };
}

export class InstagramClient {
  private config: InstagramConfig;
  private baseUrl = 'https://graph.facebook.com/v21.0';

  constructor(config: InstagramConfig) {
    this.config = config;
  }

  private async request<T>(
    path: string,
    method: 'GET' | 'POST' | 'DELETE' = 'GET',
    body?: Record<string, unknown>
  ): Promise<T> {
    const separator = path.includes('?') ? '&' : '?';
    const url = `${this.baseUrl}${path}${separator}access_token=${this.config.accessToken}`;

    const options: RequestInit = { method };
    if (body && (method === 'POST' || method === 'DELETE')) {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = (await response.json()) as T | GraphApiError;

    if (
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      (data as GraphApiError).error
    ) {
      const err = (data as GraphApiError).error;
      throw new Error(`Instagram API Error (${err.code}): ${err.message}`);
    }

    return data as T;
  }

  private getAccountId(args?: string): string {
    const id = args || this.config.accountId;
    if (!id) throw new Error('account_id is required (not set in config and not provided)');
    return id;
  }

  // ========== Account ==========

  async getAccount(accountId?: string, fields?: string): Promise<unknown> {
    const id = this.getAccountId(accountId);
    const f = fields || 'id,name,username,biography,followers_count,follows_count,media_count,profile_picture_url,website';
    return this.request(`/${id}?fields=${encodeURIComponent(f)}`);
  }

  async getAccountInsights(
    accountId?: string,
    metric?: string,
    period?: string,
    since?: string,
    until?: string
  ): Promise<unknown> {
    const id = this.getAccountId(accountId);
    const params: string[] = [];
    params.push(`metric=${encodeURIComponent(metric || 'impressions,reach,profile_views')}`);
    params.push(`period=${period || 'day'}`);
    if (since) params.push(`since=${encodeURIComponent(since)}`);
    if (until) params.push(`until=${encodeURIComponent(until)}`);
    return this.request(`/${id}/insights?${params.join('&')}`);
  }

  async listMedia(accountId?: string, limit?: number, fields?: string): Promise<unknown> {
    const id = this.getAccountId(accountId);
    const params: string[] = [];
    if (limit) params.push(`limit=${limit}`);
    if (fields) params.push(`fields=${encodeURIComponent(fields)}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.request(`/${id}/media${qs}`);
  }

  // ========== Publishing ==========

  async publishPhoto(
    accountId: string | undefined,
    imageUrl: string,
    caption?: string,
    locationId?: string,
    userTags?: string
  ): Promise<unknown> {
    const id = this.getAccountId(accountId);
    // Step 1: Create media container
    const containerBody: Record<string, unknown> = { image_url: imageUrl };
    if (caption) containerBody.caption = caption;
    if (locationId) containerBody.location_id = locationId;
    if (userTags) containerBody.user_tags = userTags;
    const container = await this.request<{ id: string }>(`/${id}/media`, 'POST', containerBody);
    // Step 2: Publish
    return this.request(`/${id}/media_publish`, 'POST', { creation_id: container.id });
  }

  async publishCarousel(
    accountId: string | undefined,
    children: string[],
    caption?: string,
    locationId?: string
  ): Promise<unknown> {
    const id = this.getAccountId(accountId);
    const body: Record<string, unknown> = {
      media_type: 'CAROUSEL',
      children: children,
    };
    if (caption) body.caption = caption;
    if (locationId) body.location_id = locationId;
    const container = await this.request<{ id: string }>(`/${id}/media`, 'POST', body);
    return this.request(`/${id}/media_publish`, 'POST', { creation_id: container.id });
  }

  async publishReel(
    accountId: string | undefined,
    videoUrl: string,
    caption?: string,
    coverUrl?: string,
    shareToFeed?: boolean,
    locationId?: string
  ): Promise<unknown> {
    const id = this.getAccountId(accountId);
    const body: Record<string, unknown> = {
      media_type: 'REELS',
      video_url: videoUrl,
    };
    if (caption) body.caption = caption;
    if (coverUrl) body.cover_url = coverUrl;
    if (shareToFeed !== undefined) body.share_to_feed = shareToFeed;
    if (locationId) body.location_id = locationId;
    const container = await this.request<{ id: string }>(`/${id}/media`, 'POST', body);
    return this.request(`/${id}/media_publish`, 'POST', { creation_id: container.id });
  }

  async publishStory(
    accountId: string | undefined,
    mediaUrl: string,
    mediaType: string
  ): Promise<unknown> {
    const id = this.getAccountId(accountId);
    const body: Record<string, unknown> = { media_type: 'STORIES' };
    if (mediaType === 'VIDEO') {
      body.video_url = mediaUrl;
    } else {
      body.image_url = mediaUrl;
    }
    const container = await this.request<{ id: string }>(`/${id}/media`, 'POST', body);
    return this.request(`/${id}/media_publish`, 'POST', { creation_id: container.id });
  }

  // ========== Media ==========

  async getMedia(mediaId: string, fields?: string): Promise<unknown> {
    const f = fields || 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count';
    return this.request(`/${mediaId}?fields=${encodeURIComponent(f)}`);
  }

  async getMediaInsights(mediaId: string, metric?: string): Promise<unknown> {
    const m = metric || 'impressions,reach,engagement,saved';
    return this.request(`/${mediaId}/insights?metric=${encodeURIComponent(m)}`);
  }

  async getChildren(mediaId: string, fields?: string): Promise<unknown> {
    const f = fields || 'id,media_type,media_url,timestamp';
    return this.request(`/${mediaId}/children?fields=${encodeURIComponent(f)}`);
  }

  // ========== Comments ==========

  async listComments(mediaId: string, limit?: number): Promise<unknown> {
    const qs = limit ? `?limit=${limit}` : '';
    return this.request(`/${mediaId}/comments${qs}`);
  }

  async getComment(commentId: string, fields?: string): Promise<unknown> {
    const f = fields || 'id,text,username,timestamp,like_count,replies';
    return this.request(`/${commentId}?fields=${encodeURIComponent(f)}`);
  }

  async replyComment(commentId: string, message: string): Promise<unknown> {
    return this.request(`/${commentId}/replies`, 'POST', { message });
  }

  async deleteComment(commentId: string): Promise<unknown> {
    return this.request(`/${commentId}`, 'DELETE');
  }

  async hideComment(commentId: string, hide: boolean): Promise<unknown> {
    return this.request(`/${commentId}`, 'POST', { hide });
  }

  async listReplies(commentId: string, limit?: number): Promise<unknown> {
    const params: string[] = [];
    if (limit) params.push(`limit=${limit}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.request(`/${commentId}/replies${qs}`);
  }

  // ========== Stories ==========

  async listStories(accountId?: string): Promise<unknown> {
    const id = this.getAccountId(accountId);
    return this.request(`/${id}/stories?fields=id,media_type,media_url,timestamp`);
  }

  async getStoryInsights(storyId: string, metric?: string): Promise<unknown> {
    const m = metric || 'impressions,reach,replies';
    return this.request(`/${storyId}/insights?metric=${encodeURIComponent(m)}`);
  }

  // ========== Hashtags ==========

  async searchHashtag(accountId: string | undefined, query: string): Promise<unknown> {
    const id = this.getAccountId(accountId);
    return this.request(`/ig_hashtag_search?user_id=${id}&q=${encodeURIComponent(query)}`);
  }

  async getHashtagRecent(hashtagId: string, accountId?: string, fields?: string): Promise<unknown> {
    const id = this.getAccountId(accountId);
    const f = fields || 'id,caption,media_type,media_url,permalink,timestamp';
    return this.request(`/${hashtagId}/recent_media?user_id=${id}&fields=${encodeURIComponent(f)}`);
  }

  async getHashtagTop(hashtagId: string, accountId?: string, fields?: string): Promise<unknown> {
    const id = this.getAccountId(accountId);
    const f = fields || 'id,caption,media_type,media_url,permalink,timestamp';
    return this.request(`/${hashtagId}/top_media?user_id=${id}&fields=${encodeURIComponent(f)}`);
  }

  // ========== Discovery ==========

  async discoverUser(accountId: string | undefined, username: string, fields?: string): Promise<unknown> {
    const id = this.getAccountId(accountId);
    const f = fields || 'id,name,username,biography,followers_count,follows_count,media_count,profile_picture_url';
    return this.request(`/${id}?fields=business_discovery.fields(${encodeURIComponent(f)}).username(${encodeURIComponent(username)})`);
  }

  // ========== Content Publishing Limit ==========

  async getContentPublishingLimit(accountId?: string, fields?: string): Promise<unknown> {
    const id = this.getAccountId(accountId);
    const f = fields || 'config,quota_usage';
    return this.request(`/${id}/content_publishing_limit?fields=${encodeURIComponent(f)}`);
  }

  // ========== Mentions ==========

  async listTags(accountId?: string, fields?: string): Promise<unknown> {
    const id = this.getAccountId(accountId);
    const f = fields || 'id,caption,media_type,media_url,permalink,timestamp';
    return this.request(`/${id}/tags?fields=${encodeURIComponent(f)}`);
  }

  async getMentionedMedia(mediaId: string, fields?: string): Promise<unknown> {
    const f = fields || 'id,caption,media_type,media_url,permalink,timestamp,username';
    return this.request(`/${mediaId}?fields=${encodeURIComponent(f)}`);
  }
}
