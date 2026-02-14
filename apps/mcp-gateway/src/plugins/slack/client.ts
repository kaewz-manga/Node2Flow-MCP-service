/**
 * Slack Web API Client
 *
 * All methods use POST to https://slack.com/api/{method}
 * Auth: Authorization: Bearer xoxb-xxx
 *
 * IMPORTANT: Slack returns HTTP 200 for API errors — always check the `ok` field.
 */

import type { SlackConfig } from './types';

export interface SlackApiResponse {
  ok: boolean;
  error?: string;
  [key: string]: unknown;
}

export class SlackClient {
  private config: SlackConfig;
  private baseUrl = 'https://slack.com/api';

  constructor(config: SlackConfig) {
    this.config = config;
  }

  private async request<T extends SlackApiResponse>(
    method: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.baseUrl}/${method}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.botToken}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: params ? JSON.stringify(params) : undefined,
    });

    const data = (await response.json()) as T;

    if (!data.ok) {
      throw new Error(`Slack API Error: ${data.error || 'unknown_error'}`);
    }

    return data;
  }

  // ========== Messages ==========

  async postMessage(channel: string, text: string, opts?: Record<string, unknown>) {
    return this.request('chat.postMessage', { channel, text, ...opts });
  }

  async updateMessage(channel: string, ts: string, opts?: Record<string, unknown>) {
    return this.request('chat.update', { channel, ts, ...opts });
  }

  async deleteMessage(channel: string, ts: string) {
    return this.request('chat.delete', { channel, ts });
  }

  async scheduleMessage(
    channel: string,
    postAt: number,
    text: string,
    opts?: Record<string, unknown>
  ) {
    return this.request('chat.scheduleMessage', {
      channel,
      post_at: postAt,
      text,
      ...opts,
    });
  }

  async deleteScheduledMessage(channel: string, scheduledMessageId: string) {
    return this.request('chat.deleteScheduledMessage', {
      channel,
      scheduled_message_id: scheduledMessageId,
    });
  }

  async listScheduledMessages(opts?: Record<string, unknown>) {
    return this.request('chat.scheduledMessages.list', opts);
  }

  async getPermalink(channel: string, messageTs: string) {
    return this.request('chat.getPermalink', { channel, message_ts: messageTs });
  }

  // ========== Conversations ==========

  async listChannels(opts?: Record<string, unknown>) {
    return this.request('conversations.list', opts);
  }

  async getChannelInfo(channel: string, opts?: Record<string, unknown>) {
    return this.request('conversations.info', { channel, ...opts });
  }

  async getChannelHistory(channel: string, opts?: Record<string, unknown>) {
    return this.request('conversations.history', { channel, ...opts });
  }

  async getThreadReplies(channel: string, ts: string, opts?: Record<string, unknown>) {
    return this.request('conversations.replies', { channel, ts, ...opts });
  }

  async getChannelMembers(channel: string, opts?: Record<string, unknown>) {
    return this.request('conversations.members', { channel, ...opts });
  }

  async createChannel(name: string, opts?: Record<string, unknown>) {
    return this.request('conversations.create', { name, ...opts });
  }

  async archiveChannel(channel: string) {
    return this.request('conversations.archive', { channel });
  }

  async inviteToChannel(channel: string, users: string) {
    return this.request('conversations.invite', { channel, users });
  }

  async kickFromChannel(channel: string, user: string) {
    return this.request('conversations.kick', { channel, user });
  }

  async joinChannel(channel: string) {
    return this.request('conversations.join', { channel });
  }

  async setChannelTopic(channel: string, topic: string) {
    return this.request('conversations.setTopic', { channel, topic });
  }

  async openConversation(users: string, opts?: Record<string, unknown>) {
    return this.request('conversations.open', { users, ...opts });
  }

  // ========== Users ==========

  async listUsers(opts?: Record<string, unknown>) {
    return this.request('users.list', opts);
  }

  async getUserInfo(user: string, opts?: Record<string, unknown>) {
    return this.request('users.info', { user, ...opts });
  }

  // ========== Reactions ==========

  async addReaction(channel: string, timestamp: string, name: string) {
    return this.request('reactions.add', { channel, timestamp, name });
  }

  async removeReaction(channel: string, timestamp: string, name: string) {
    return this.request('reactions.remove', { channel, timestamp, name });
  }

  async getReactions(channel: string, timestamp: string) {
    return this.request('reactions.get', { channel, timestamp });
  }

  // ========== Search ==========

  async searchMessages(query: string, opts?: Record<string, unknown>) {
    return this.request('search.messages', { query, ...opts });
  }

  async searchFiles(query: string, opts?: Record<string, unknown>) {
    return this.request('search.files', { query, ...opts });
  }

  // ========== Files ==========

  async uploadFile(
    content: string,
    filename: string,
    opts?: { channel_id?: string; initial_comment?: string; thread_ts?: string }
  ) {
    // Step 1: Get upload URL
    const contentBytes = new TextEncoder().encode(content);
    const step1 = await this.request<
      SlackApiResponse & { upload_url: string; file_id: string }
    >('files.getUploadURLExternal', {
      filename,
      length: contentBytes.length,
    });

    // Step 2: Upload content to the external URL
    await fetch(step1.upload_url, {
      method: 'POST',
      body: content,
    });

    // Step 3: Complete the upload and share
    const completeParams: Record<string, unknown> = {
      files: [{ id: step1.file_id, title: filename }],
    };
    if (opts?.channel_id) completeParams.channel_id = opts.channel_id;
    if (opts?.initial_comment) completeParams.initial_comment = opts.initial_comment;
    if (opts?.thread_ts) completeParams.thread_ts = opts.thread_ts;

    return this.request('files.completeUploadExternal', completeParams);
  }

  async listFiles(opts?: Record<string, unknown>) {
    return this.request('files.list', opts);
  }

  async deleteFile(file: string) {
    return this.request('files.delete', { file });
  }

  // ========== Pins ==========

  async pinMessage(channel: string, timestamp: string) {
    return this.request('pins.add', { channel, timestamp });
  }

  async unpinMessage(channel: string, timestamp: string) {
    return this.request('pins.remove', { channel, timestamp });
  }

  async listPins(channel: string) {
    return this.request('pins.list', { channel });
  }

  // ========== Bookmarks ==========

  async addBookmark(
    channelId: string,
    title: string,
    link: string,
    opts?: Record<string, unknown>
  ) {
    return this.request('bookmarks.add', {
      channel_id: channelId,
      title,
      type: 'link',
      link,
      ...opts,
    });
  }

  async editBookmark(
    bookmarkId: string,
    channelId: string,
    opts?: Record<string, unknown>
  ) {
    return this.request('bookmarks.edit', {
      bookmark_id: bookmarkId,
      channel_id: channelId,
      ...opts,
    });
  }

  async removeBookmark(bookmarkId: string, channelId: string) {
    return this.request('bookmarks.remove', {
      bookmark_id: bookmarkId,
      channel_id: channelId,
    });
  }

  async listBookmarks(channelId: string) {
    return this.request('bookmarks.list', { channel_id: channelId });
  }

  // ========== Team ==========

  async getTeamInfo(opts?: Record<string, unknown>) {
    return this.request('team.info', opts);
  }

  // ========== Emoji ==========

  async listEmoji(opts?: Record<string, unknown>) {
    return this.request('emoji.list', opts);
  }
}
