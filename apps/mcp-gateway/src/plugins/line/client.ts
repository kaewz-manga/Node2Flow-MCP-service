/**
 * LINE Messaging API Client
 * Matches official line-bot-mcp-server
 * Uses Channel Access Token for Bearer authentication
 */

import type {
  LineConfig,
  LineProfile,
  LineQuota,
  LineQuotaConsumption,
  LineRichMenu,
  LineRichMenuList,
  LineSendMessageResponse,
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

  async pushTextMessage(userId: string, text: string): Promise<LineSendMessageResponse> {
    return this.request('/bot/message/push', {
      method: 'POST',
      body: JSON.stringify({
        to: userId,
        messages: [{ type: 'text', text }],
      }),
    });
  }

  async pushFlexMessage(userId: string, altText: string, contents: Record<string, unknown>): Promise<LineSendMessageResponse> {
    return this.request('/bot/message/push', {
      method: 'POST',
      body: JSON.stringify({
        to: userId,
        messages: [{ type: 'flex', altText, contents }],
      }),
    });
  }

  async broadcastTextMessage(text: string): Promise<LineSendMessageResponse> {
    return this.request('/bot/message/broadcast', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ type: 'text', text }],
      }),
    });
  }

  async broadcastFlexMessage(altText: string, contents: Record<string, unknown>): Promise<LineSendMessageResponse> {
    return this.request('/bot/message/broadcast', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ type: 'flex', altText, contents }],
      }),
    });
  }

  // ========== Profile ==========

  async getProfile(userId: string): Promise<LineProfile> {
    return this.request(`/bot/profile/${userId}`);
  }

  // ========== Quota ==========

  async getMessageQuota(): Promise<{ quota: LineQuota; consumption: LineQuotaConsumption }> {
    const [quota, consumption] = await Promise.all([
      this.request<LineQuota>('/bot/message/quota'),
      this.request<LineQuotaConsumption>('/bot/message/quota/consumption'),
    ]);
    return { quota, consumption };
  }

  // ========== Rich Menu ==========

  async getRichMenuList(): Promise<LineRichMenuList> {
    return this.request('/bot/richmenu/list');
  }

  async deleteRichMenu(richMenuId: string): Promise<Record<string, unknown>> {
    return this.request(`/bot/richmenu/${richMenuId}`, { method: 'DELETE' });
  }

  async setRichMenuDefault(richMenuId: string): Promise<Record<string, unknown>> {
    return this.request(`/bot/user/all/richmenu/${richMenuId}`, { method: 'POST' });
  }

  async cancelRichMenuDefault(): Promise<Record<string, unknown>> {
    return this.request('/bot/user/all/richmenu', { method: 'DELETE' });
  }

  async createRichMenu(chatBarText: string, actions: Record<string, unknown>[]): Promise<{ richMenuId: string }> {
    const numActions = actions.length;
    const cols = Math.min(numActions, 3);
    const rows = Math.ceil(numActions / 3);
    const cellWidth = Math.floor(2500 / cols);
    const cellHeight = rows === 1 ? 843 : Math.floor(1686 / rows);

    const areas = actions.map((action, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      return {
        bounds: {
          x: col * cellWidth,
          y: row * cellHeight,
          width: cellWidth,
          height: cellHeight,
        },
        action,
      };
    });

    return this.request('/bot/richmenu', {
      method: 'POST',
      body: JSON.stringify({
        size: { width: 2500, height: rows === 1 ? 843 : 1686 },
        selected: true,
        name: 'Rich Menu',
        chatBarText,
        areas,
      }),
    });
  }
}
