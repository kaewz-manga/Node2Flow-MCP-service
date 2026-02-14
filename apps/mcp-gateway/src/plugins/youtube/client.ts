/**
 * YouTube Data API v3 Client
 * Uses OAuth 2.0 (Client ID + Client Secret + Refresh Token) for all operations.
 * Access tokens are auto-refreshed.
 */

import type {
  YouTubeConfig,
  YouTubeListResponse,
  YouTubeVideo,
  YouTubeChannel,
  YouTubePlaylist,
  YouTubePlaylistItem,
  YouTubeCommentThread,
  YouTubeComment,
  YouTubeSearchResult,
  YouTubeVideoCategory,
  YouTubeSubscription,
} from './types';

export class YouTubeClient {
  private config: YouTubeConfig;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';
  private accessToken: string | null = null;
  private tokenExpiresAt = 0;

  constructor(config: YouTubeConfig) {
    this.config = config;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: this.config.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OAuth token refresh failed (${response.status}): ${error}`);
    }

    const data = await response.json() as { access_token: string; expires_in: number };
    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
    return this.accessToken;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: Record<string, unknown>,
    params: Record<string, string> = {}
  ): Promise<T> {
    const token = await this.getAccessToken();
    const query = new URLSearchParams(params).toString();
    const url = `${this.baseUrl}${path}${query ? `?${query}` : ''}`;

    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`YouTube API Error (${response.status}): ${error}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  }

  // ========== Read Operations (10) ==========

  async search(params: {
    q?: string;
    type?: string;
    channelId?: string;
    maxResults?: number;
    pageToken?: string;
    order?: string;
    publishedAfter?: string;
    publishedBefore?: string;
    regionCode?: string;
    relevanceLanguage?: string;
    videoDuration?: string;
    videoCaption?: string;
    videoLicense?: string;
    eventType?: string;
    part?: string;
  }): Promise<YouTubeListResponse<YouTubeSearchResult>> {
    const queryParams: Record<string, string> = {
      part: params.part || 'snippet',
    };
    if (params.q) queryParams.q = params.q;
    if (params.type) queryParams.type = params.type;
    if (params.channelId) queryParams.channelId = params.channelId;
    if (params.maxResults) queryParams.maxResults = String(params.maxResults);
    if (params.pageToken) queryParams.pageToken = params.pageToken;
    if (params.order) queryParams.order = params.order;
    if (params.publishedAfter) queryParams.publishedAfter = params.publishedAfter;
    if (params.publishedBefore) queryParams.publishedBefore = params.publishedBefore;
    if (params.regionCode) queryParams.regionCode = params.regionCode;
    if (params.relevanceLanguage) queryParams.relevanceLanguage = params.relevanceLanguage;
    if (params.videoDuration) queryParams.videoDuration = params.videoDuration;
    if (params.videoCaption) queryParams.videoCaption = params.videoCaption;
    if (params.videoLicense) queryParams.videoLicense = params.videoLicense;
    if (params.eventType) queryParams.eventType = params.eventType;
    return this.request('GET', '/search', undefined, queryParams);
  }

  async getVideo(params: {
    id: string;
    part?: string;
  }): Promise<YouTubeListResponse<YouTubeVideo>> {
    return this.request('GET', '/videos', undefined, {
      part: params.part || 'snippet,contentDetails,statistics',
      id: params.id,
    });
  }

  async getChannel(params: {
    id?: string;
    forUsername?: string;
    part?: string;
  }): Promise<YouTubeListResponse<YouTubeChannel>> {
    const queryParams: Record<string, string> = {
      part: params.part || 'snippet,contentDetails,statistics',
    };
    if (params.id) queryParams.id = params.id;
    if (params.forUsername) queryParams.forUsername = params.forUsername;
    return this.request('GET', '/channels', undefined, queryParams);
  }

  async listPlaylists(params: {
    channelId?: string;
    id?: string;
    maxResults?: number;
    pageToken?: string;
    part?: string;
  }): Promise<YouTubeListResponse<YouTubePlaylist>> {
    const queryParams: Record<string, string> = {
      part: params.part || 'snippet,contentDetails,status',
    };
    if (params.channelId) queryParams.channelId = params.channelId;
    if (params.id) queryParams.id = params.id;
    if (params.maxResults) queryParams.maxResults = String(params.maxResults);
    if (params.pageToken) queryParams.pageToken = params.pageToken;
    return this.request('GET', '/playlists', undefined, queryParams);
  }

  async listPlaylistItems(params: {
    playlistId: string;
    maxResults?: number;
    pageToken?: string;
    videoId?: string;
    part?: string;
  }): Promise<YouTubeListResponse<YouTubePlaylistItem>> {
    const queryParams: Record<string, string> = {
      part: params.part || 'snippet,contentDetails,status',
      playlistId: params.playlistId,
    };
    if (params.maxResults) queryParams.maxResults = String(params.maxResults);
    if (params.pageToken) queryParams.pageToken = params.pageToken;
    if (params.videoId) queryParams.videoId = params.videoId;
    return this.request('GET', '/playlistItems', undefined, queryParams);
  }

  async listComments(params: {
    videoId?: string;
    channelId?: string;
    id?: string;
    maxResults?: number;
    pageToken?: string;
    order?: string;
    textFormat?: string;
    part?: string;
  }): Promise<YouTubeListResponse<YouTubeCommentThread>> {
    const queryParams: Record<string, string> = {
      part: params.part || 'snippet,replies',
    };
    if (params.videoId) queryParams.videoId = params.videoId;
    if (params.channelId) queryParams.allThreadsRelatedToChannelId = params.channelId;
    if (params.id) queryParams.id = params.id;
    if (params.maxResults) queryParams.maxResults = String(params.maxResults);
    if (params.pageToken) queryParams.pageToken = params.pageToken;
    if (params.order) queryParams.order = params.order;
    if (params.textFormat) queryParams.textFormat = params.textFormat;
    return this.request('GET', '/commentThreads', undefined, queryParams);
  }

  async listCommentReplies(params: {
    parentId: string;
    maxResults?: number;
    pageToken?: string;
    textFormat?: string;
    part?: string;
  }): Promise<YouTubeListResponse<YouTubeComment>> {
    const queryParams: Record<string, string> = {
      part: params.part || 'snippet',
      parentId: params.parentId,
    };
    if (params.maxResults) queryParams.maxResults = String(params.maxResults);
    if (params.pageToken) queryParams.pageToken = params.pageToken;
    if (params.textFormat) queryParams.textFormat = params.textFormat;
    return this.request('GET', '/comments', undefined, queryParams);
  }

  async listVideoCategories(params: {
    regionCode?: string;
    hl?: string;
    id?: string;
    part?: string;
  }): Promise<YouTubeListResponse<YouTubeVideoCategory>> {
    const queryParams: Record<string, string> = {
      part: params.part || 'snippet',
    };
    if (params.regionCode) queryParams.regionCode = params.regionCode;
    if (params.hl) queryParams.hl = params.hl;
    if (params.id) queryParams.id = params.id;
    return this.request('GET', '/videoCategories', undefined, queryParams);
  }

  async listSubscriptions(params: {
    channelId?: string;
    id?: string;
    maxResults?: number;
    pageToken?: string;
    order?: string;
    part?: string;
  }): Promise<YouTubeListResponse<YouTubeSubscription>> {
    const queryParams: Record<string, string> = {
      part: params.part || 'snippet,contentDetails',
    };
    if (params.channelId) queryParams.channelId = params.channelId;
    if (params.id) queryParams.id = params.id;
    if (params.maxResults) queryParams.maxResults = String(params.maxResults);
    if (params.pageToken) queryParams.pageToken = params.pageToken;
    if (params.order) queryParams.order = params.order;
    return this.request('GET', '/subscriptions', undefined, queryParams);
  }

  async getPopularVideos(params: {
    regionCode?: string;
    videoCategoryId?: string;
    maxResults?: number;
    pageToken?: string;
    part?: string;
  }): Promise<YouTubeListResponse<YouTubeVideo>> {
    const queryParams: Record<string, string> = {
      part: params.part || 'snippet,contentDetails,statistics',
      chart: 'mostPopular',
    };
    if (params.regionCode) queryParams.regionCode = params.regionCode;
    if (params.videoCategoryId) queryParams.videoCategoryId = params.videoCategoryId;
    if (params.maxResults) queryParams.maxResults = String(params.maxResults);
    if (params.pageToken) queryParams.pageToken = params.pageToken;
    return this.request('GET', '/videos', undefined, queryParams);
  }

  // ========== Write Operations (10) ==========

  async postComment(
    videoId: string,
    text: string,
    channelId?: string
  ): Promise<YouTubeCommentThread> {
    const body: Record<string, unknown> = {
      snippet: {
        videoId,
        topLevelComment: {
          snippet: { textOriginal: text },
        },
      },
    };
    if (channelId) (body.snippet as Record<string, unknown>).channelId = channelId;
    return this.request('POST', '/commentThreads', body, { part: 'snippet' });
  }

  async replyComment(
    parentId: string,
    text: string
  ): Promise<YouTubeComment> {
    return this.request('POST', '/comments', {
      snippet: {
        parentId,
        textOriginal: text,
      },
    }, { part: 'snippet' });
  }

  async updateComment(
    commentId: string,
    text: string
  ): Promise<YouTubeComment> {
    return this.request('PUT', '/comments', {
      id: commentId,
      snippet: {
        textOriginal: text,
      },
    }, { part: 'snippet' });
  }

  async deleteComment(commentId: string): Promise<Record<string, unknown>> {
    return this.request('DELETE', '/comments', undefined, { id: commentId });
  }

  async createPlaylist(
    title: string,
    description?: string,
    privacyStatus?: string,
    tags?: string[]
  ): Promise<YouTubePlaylist> {
    const snippet: Record<string, unknown> = { title };
    if (description) snippet.description = description;
    if (tags) snippet.tags = tags;
    const body: Record<string, unknown> = {
      snippet,
      status: { privacyStatus: privacyStatus || 'private' },
    };
    return this.request('POST', '/playlists', body, { part: 'snippet,status' });
  }

  async updatePlaylist(
    playlistId: string,
    title?: string,
    description?: string,
    privacyStatus?: string
  ): Promise<YouTubePlaylist> {
    const body: Record<string, unknown> = { id: playlistId };
    const snippet: Record<string, unknown> = {};
    if (title) snippet.title = title;
    if (description !== undefined) snippet.description = description;
    if (Object.keys(snippet).length > 0) body.snippet = snippet;
    if (privacyStatus) body.status = { privacyStatus };
    const parts = [];
    if (body.snippet) parts.push('snippet');
    if (body.status) parts.push('status');
    return this.request('PUT', '/playlists', body, { part: parts.join(',') || 'snippet' });
  }

  async deletePlaylist(playlistId: string): Promise<Record<string, unknown>> {
    return this.request('DELETE', '/playlists', undefined, { id: playlistId });
  }

  async addPlaylistItem(
    playlistId: string,
    videoId: string,
    position?: number
  ): Promise<YouTubePlaylistItem> {
    const snippet: Record<string, unknown> = {
      playlistId,
      resourceId: {
        kind: 'youtube#video',
        videoId,
      },
    };
    if (position !== undefined) snippet.position = position;
    return this.request('POST', '/playlistItems', { snippet }, { part: 'snippet' });
  }

  async removePlaylistItem(playlistItemId: string): Promise<Record<string, unknown>> {
    return this.request('DELETE', '/playlistItems', undefined, { id: playlistItemId });
  }

  async rateVideo(
    videoId: string,
    rating: string
  ): Promise<Record<string, unknown>> {
    return this.request('POST', '/videos/rate', undefined, { id: videoId, rating });
  }
}
