/**
 * LINE Messaging API Client
 * Uses Channel Access Token for Bearer authentication
 */

import type {
  LineConfig,
  LineMessage,
  LineProfile,
  LineBotInfo,
  LineGroupSummary,
  LineGroupMembersCount,
  LineMemberIds,
  LineRichMenu,
  LineRichMenuList,
  LineQuota,
  LineQuotaConsumption,
  LineFollowersCount,
  LineWebhookInfo,
  LineWebhookTestResult,
  LineSendMessageResponse,
  LineFollowerIds,
} from './types';

export class LineClient {
  private config: LineConfig;
  private baseUrl = 'https://api.line.me/v2';

  constructor(config: LineConfig) {
    this.config = config;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.channelAccessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LINE API Error (${response.status}): ${error}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  }

  // ========== Messages ==========

  async pushMessage(
    to: string,
    messages: LineMessage[],
    notificationDisabled?: boolean
  ): Promise<LineSendMessageResponse> {
    const body: Record<string, unknown> = { to, messages };
    if (notificationDisabled) body.notificationDisabled = true;
    return this.request('/bot/message/push', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async replyMessage(
    replyToken: string,
    messages: LineMessage[],
    notificationDisabled?: boolean
  ): Promise<LineSendMessageResponse> {
    const body: Record<string, unknown> = { replyToken, messages };
    if (notificationDisabled) body.notificationDisabled = true;
    return this.request('/bot/message/reply', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async multicastMessage(
    to: string[],
    messages: LineMessage[],
    notificationDisabled?: boolean
  ): Promise<LineSendMessageResponse> {
    const body: Record<string, unknown> = { to, messages };
    if (notificationDisabled) body.notificationDisabled = true;
    return this.request('/bot/message/multicast', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async broadcastMessage(
    messages: LineMessage[],
    notificationDisabled?: boolean
  ): Promise<LineSendMessageResponse> {
    const body: Record<string, unknown> = { messages };
    if (notificationDisabled) body.notificationDisabled = true;
    return this.request('/bot/message/broadcast', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async validateMessage(messages: LineMessage[]): Promise<Record<string, unknown>> {
    return this.request('/bot/message/validate/push', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });
  }

  // ========== User & Bot Info ==========

  async getProfile(userId: string): Promise<LineProfile> {
    return this.request(`/bot/profile/${userId}`);
  }

  async getFollowerIds(start?: string, limit?: number): Promise<LineFollowerIds> {
    const query = new URLSearchParams();
    if (start) query.set('start', start);
    if (limit) query.set('limit', String(limit));
    const qs = query.toString();
    return this.request(`/bot/followers/ids${qs ? `?${qs}` : ''}`);
  }

  async getBotInfo(): Promise<LineBotInfo> {
    return this.request('/bot/info');
  }

  async displayLoadingAnimation(chatId: string, loadingSeconds?: number): Promise<Record<string, unknown>> {
    const body: Record<string, unknown> = { chatId };
    if (loadingSeconds) body.loadingSeconds = loadingSeconds;
    return this.request('/bot/chat/loading/start', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // ========== Group Chat ==========

  async getGroupSummary(groupId: string): Promise<LineGroupSummary> {
    return this.request(`/bot/group/${groupId}/summary`);
  }

  async getGroupMembersCount(groupId: string): Promise<LineGroupMembersCount> {
    return this.request(`/bot/group/${groupId}/members/count`);
  }

  async getGroupMemberIds(groupId: string, start?: string): Promise<LineMemberIds> {
    const query = start ? `?start=${start}` : '';
    return this.request(`/bot/group/${groupId}/members/ids${query}`);
  }

  async getGroupMemberProfile(groupId: string, userId: string): Promise<LineProfile> {
    return this.request(`/bot/group/${groupId}/member/${userId}`);
  }

  // ========== Rich Menu ==========

  async createRichMenu(data: {
    size: { width: number; height: number };
    selected: boolean;
    name: string;
    chatBarText: string;
    areas: Array<{
      bounds: { x: number; y: number; width: number; height: number };
      action: Record<string, unknown>;
    }>;
  }): Promise<{ richMenuId: string }> {
    return this.request('/bot/richmenu', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRichMenus(): Promise<LineRichMenuList> {
    return this.request('/bot/richmenu/list');
  }

  async getRichMenu(richMenuId: string): Promise<LineRichMenu> {
    return this.request(`/bot/richmenu/${richMenuId}`);
  }

  async deleteRichMenu(richMenuId: string): Promise<Record<string, unknown>> {
    return this.request(`/bot/richmenu/${richMenuId}`, { method: 'DELETE' });
  }

  async setDefaultRichMenu(richMenuId: string): Promise<Record<string, unknown>> {
    return this.request(`/bot/user/all/richmenu/${richMenuId}`, { method: 'POST' });
  }

  async linkRichMenuToUser(userId: string, richMenuId: string): Promise<Record<string, unknown>> {
    return this.request(`/bot/user/${userId}/richmenu/${richMenuId}`, { method: 'POST' });
  }

  // ========== Quota & Insights ==========

  async getQuota(): Promise<LineQuota> {
    return this.request('/bot/message/quota');
  }

  async getQuotaConsumption(): Promise<LineQuotaConsumption> {
    return this.request('/bot/message/quota/consumption');
  }

  async getFollowersCount(date: string): Promise<LineFollowersCount> {
    return this.request(`/bot/insight/followers?date=${date}`);
  }

  // ========== Webhook ==========

  async setWebhookUrl(endpoint: string): Promise<Record<string, unknown>> {
    return this.request('/bot/channel/webhook/endpoint', {
      method: 'PUT',
      body: JSON.stringify({ endpoint }),
    });
  }

  async getWebhookInfo(): Promise<LineWebhookInfo> {
    return this.request('/bot/channel/webhook/endpoint');
  }

  async testWebhook(endpoint?: string): Promise<LineWebhookTestResult> {
    const body = endpoint ? JSON.stringify({ endpoint }) : undefined;
    return this.request('/bot/channel/webhook/test', {
      method: 'POST',
      ...(body ? { body } : {}),
    });
  }
}
