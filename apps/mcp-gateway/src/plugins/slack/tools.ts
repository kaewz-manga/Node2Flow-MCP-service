/**
 * Slack Web API - MCP Tool Definitions (38 tools)
 * Ported from @node2flow/slack-mcp (community)
 */

import type { MCPToolDefinition } from '../../types';

export const TOOLS: MCPToolDefinition[] = [
  // ========== Messages (7) ==========
  {
    name: 'slack_send_message',
    description:
      'Send a message to a Slack channel, DM, or thread. Supports Block Kit for rich formatting. Always provide "text" as notification fallback even when using "blocks". Rate limit: 1 message/sec/channel.',
    annotations: {
      title: 'Send Message',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Channel ID (C...), DM ID (D...), or user ID to send to' },
        text: { type: 'string', description: 'Message text (required as fallback even when using blocks). Supports mrkdwn formatting.' },
        blocks: { type: 'array', description: 'Block Kit blocks for rich message layout (JSON array of block objects)' },
        thread_ts: { type: 'string', description: 'Thread timestamp to reply in a thread (e.g. "1234567890.123456")' },
        reply_broadcast: { type: 'boolean', description: 'Also post threaded reply to channel (only with thread_ts)' },
        unfurl_links: { type: 'boolean', description: 'Enable link unfurling (default: true)' },
        unfurl_media: { type: 'boolean', description: 'Enable media unfurling (default: true)' },
        mrkdwn: { type: 'boolean', description: 'Enable markdown parsing (default: true)' },
      },
      required: ['channel', 'text'],
    },
  },
  {
    name: 'slack_update_message',
    description:
      'Update an existing message. Bot can only update messages it posted. Provide new text and/or blocks.',
    annotations: {
      title: 'Update Message',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Channel containing the message' },
        ts: { type: 'string', description: 'Timestamp of the message to update (e.g. "1234567890.123456")' },
        text: { type: 'string', description: 'New message text' },
        blocks: { type: 'array', description: 'New Block Kit blocks' },
        attachments: { type: 'array', description: 'New attachments array' },
      },
      required: ['channel', 'ts'],
    },
  },
  {
    name: 'slack_delete_message',
    description: 'Delete a message. Bot can only delete messages it posted.',
    annotations: {
      title: 'Delete Message',
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Channel containing the message' },
        ts: { type: 'string', description: 'Timestamp of the message to delete' },
      },
      required: ['channel', 'ts'],
    },
  },
  {
    name: 'slack_schedule_message',
    description:
      'Schedule a message for future delivery. Max 120 days in the future. Max 30 scheduled messages per channel per 5 minutes.',
    annotations: {
      title: 'Schedule Message',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Channel ID to post to' },
        post_at: { type: 'number', description: 'Unix timestamp for when to deliver the message' },
        text: { type: 'string', description: 'Message text' },
        blocks: { type: 'array', description: 'Block Kit blocks for rich layout' },
        thread_ts: { type: 'string', description: 'Thread timestamp to reply in' },
      },
      required: ['channel', 'post_at', 'text'],
    },
  },
  {
    name: 'slack_delete_scheduled_message',
    description:
      'Delete a pending scheduled message before it is sent. Cannot delete messages posting within 60 seconds.',
    annotations: {
      title: 'Delete Scheduled Message',
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Channel of the scheduled message' },
        scheduled_message_id: { type: 'string', description: 'Scheduled message ID (from schedule_message response)' },
      },
      required: ['channel', 'scheduled_message_id'],
    },
  },
  {
    name: 'slack_list_scheduled_messages',
    description: 'List pending scheduled messages. Optionally filter by channel or time range.',
    annotations: {
      title: 'List Scheduled Messages',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Filter by channel ID' },
        oldest: { type: 'string', description: 'Start of time range (Unix timestamp)' },
        latest: { type: 'string', description: 'End of time range (Unix timestamp)' },
        cursor: { type: 'string', description: 'Pagination cursor from previous response' },
        limit: { type: 'number', description: 'Max results per page (default: 100)' },
      },
    },
  },
  {
    name: 'slack_get_permalink',
    description: 'Get a permanent URL for a specific message.',
    annotations: {
      title: 'Get Message Permalink',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Channel containing the message' },
        message_ts: { type: 'string', description: 'Timestamp of the message' },
      },
      required: ['channel', 'message_ts'],
    },
  },

  // ========== Conversations (12) ==========
  {
    name: 'slack_list_channels',
    description: 'List channels in the workspace. Filter by type: public_channel, private_channel, im, mpim.',
    annotations: {
      title: 'List Channels',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        types: { type: 'string', description: 'Comma-separated types: public_channel, private_channel, im, mpim (default: public_channel)' },
        exclude_archived: { type: 'boolean', description: 'Exclude archived channels (default: false)' },
        limit: { type: 'number', description: 'Max results per page (recommended: 200, max: 1000)' },
        cursor: { type: 'string', description: 'Pagination cursor from previous response' },
      },
    },
  },
  {
    name: 'slack_get_channel_info',
    description: 'Get detailed information about a channel including topic, purpose, member count.',
    annotations: {
      title: 'Get Channel Info',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Channel ID (e.g. "C1234567890")' },
        include_locale: { type: 'boolean', description: 'Include locale info' },
        include_num_members: { type: 'boolean', description: 'Include member count' },
      },
      required: ['channel'],
    },
  },
  {
    name: 'slack_get_channel_history',
    description:
      'Get message history from a channel. Returns messages in reverse chronological order. Free plan: 90-day history limit.',
    annotations: {
      title: 'Get Channel History',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Channel ID' },
        oldest: { type: 'string', description: 'Start of time range (Unix timestamp, inclusive)' },
        latest: { type: 'string', description: 'End of time range (Unix timestamp)' },
        inclusive: { type: 'boolean', description: 'Include messages at boundary timestamps' },
        limit: { type: 'number', description: 'Max messages to return (default: 100, max: 1000)' },
        cursor: { type: 'string', description: 'Pagination cursor from previous response' },
      },
      required: ['channel'],
    },
  },
  {
    name: 'slack_get_thread_replies',
    description: 'Get replies in a message thread. Returns the parent message and all replies.',
    annotations: {
      title: 'Get Thread Replies',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Channel containing the thread' },
        ts: { type: 'string', description: 'Timestamp of the parent message' },
        oldest: { type: 'string', description: 'Start of time range' },
        latest: { type: 'string', description: 'End of time range' },
        inclusive: { type: 'boolean', description: 'Include messages at boundary timestamps' },
        limit: { type: 'number', description: 'Max results (recommended: 200)' },
        cursor: { type: 'string', description: 'Pagination cursor' },
      },
      required: ['channel', 'ts'],
    },
  },
  {
    name: 'slack_get_channel_members',
    description: 'List all members of a channel. Returns user IDs with cursor-based pagination.',
    annotations: {
      title: 'Get Channel Members',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Channel ID' },
        limit: { type: 'number', description: 'Max results per page (recommended: 200, max: 1000)' },
        cursor: { type: 'string', description: 'Pagination cursor' },
      },
      required: ['channel'],
    },
  },
  {
    name: 'slack_create_channel',
    description:
      'Create a new public or private channel. Name must be lowercase, numbers, hyphens, underscores (max 80 chars).',
    annotations: {
      title: 'Create Channel',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Channel name (lowercase, numbers, hyphens, underscores, max 80 chars)' },
        is_private: { type: 'boolean', description: 'Create a private channel (default: false)' },
      },
      required: ['name'],
    },
  },
  {
    name: 'slack_archive_channel',
    description: 'Archive a channel. Archived channels can be unarchived later.',
    annotations: {
      title: 'Archive Channel',
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Channel ID to archive' },
      },
      required: ['channel'],
    },
  },
  {
    name: 'slack_invite_to_channel',
    description: 'Invite one or more users to a channel. Supports up to 1000 user IDs.',
    annotations: {
      title: 'Invite to Channel',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Channel ID' },
        users: { type: 'string', description: 'Comma-separated user IDs to invite (1-1000)' },
      },
      required: ['channel', 'users'],
    },
  },
  {
    name: 'slack_kick_from_channel',
    description: 'Remove a user from a channel.',
    annotations: {
      title: 'Kick from Channel',
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Channel ID' },
        user: { type: 'string', description: 'User ID to remove' },
      },
      required: ['channel', 'user'],
    },
  },
  {
    name: 'slack_join_channel',
    description: 'Join a public channel. Bot must have channels:join scope.',
    annotations: {
      title: 'Join Channel',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Public channel ID to join' },
      },
      required: ['channel'],
    },
  },
  {
    name: 'slack_set_channel_topic',
    description: 'Set or update the topic of a channel.',
    annotations: {
      title: 'Set Channel Topic',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Channel ID' },
        topic: { type: 'string', description: 'New topic text' },
      },
      required: ['channel', 'topic'],
    },
  },
  {
    name: 'slack_open_conversation',
    description: 'Open a DM or multi-person DM. Pass 1 user ID for DM, 2-8 for group DM.',
    annotations: {
      title: 'Open Conversation',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        users: { type: 'string', description: 'Comma-separated user IDs (1 = DM, 2-8 = group DM)' },
        return_im: { type: 'boolean', description: 'Return full conversation object' },
      },
      required: ['users'],
    },
  },

  // ========== Users (2) ==========
  {
    name: 'slack_list_users',
    description: 'List all users in the workspace including deactivated users. Supports cursor-based pagination.',
    annotations: {
      title: 'List Users',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Max results per page (recommended: 200, max: 1000)' },
        cursor: { type: 'string', description: 'Pagination cursor' },
        include_locale: { type: 'boolean', description: 'Include locale info for each user' },
      },
    },
  },
  {
    name: 'slack_get_user_info',
    description: 'Get detailed information about a user including profile, status, admin flags.',
    annotations: {
      title: 'Get User Info',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        user: { type: 'string', description: 'User ID (e.g. "U1234567890")' },
        include_locale: { type: 'boolean', description: 'Include locale info' },
      },
      required: ['user'],
    },
  },

  // ========== Reactions (3) ==========
  {
    name: 'slack_add_reaction',
    description:
      'Add an emoji reaction to a message. Use emoji name without colons (e.g. "thumbsup" not ":thumbsup:").',
    annotations: {
      title: 'Add Reaction',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Channel containing the message' },
        timestamp: { type: 'string', description: 'Timestamp of the message to react to' },
        name: { type: 'string', description: 'Emoji name without colons (e.g. "thumbsup", "heart", "eyes")' },
      },
      required: ['channel', 'timestamp', 'name'],
    },
  },
  {
    name: 'slack_remove_reaction',
    description: 'Remove an emoji reaction from a message.',
    annotations: {
      title: 'Remove Reaction',
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Channel containing the message' },
        timestamp: { type: 'string', description: 'Timestamp of the message' },
        name: { type: 'string', description: 'Emoji name to remove (without colons)' },
      },
      required: ['channel', 'timestamp', 'name'],
    },
  },
  {
    name: 'slack_get_reactions',
    description: 'Get all reactions for a specific message, including emoji names, counts, and user IDs.',
    annotations: {
      title: 'Get Reactions',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Channel containing the message' },
        timestamp: { type: 'string', description: 'Timestamp of the message' },
      },
      required: ['channel', 'timestamp'],
    },
  },

  // ========== Search (2) ==========
  {
    name: 'slack_search_messages',
    description:
      'Search for messages matching a query. Supports modifiers: in:#channel, from:@user, has:reaction, before:date, after:date. Free plan: 90-day history limit.',
    annotations: {
      title: 'Search Messages',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query (supports in:#channel, from:@user, has:reaction, before:YYYY-MM-DD, after:YYYY-MM-DD)' },
        sort: { type: 'string', description: '"score" (relevance) or "timestamp" (default: score)' },
        sort_dir: { type: 'string', description: '"asc" or "desc" (default: desc)' },
        count: { type: 'number', description: 'Results per page (max: 100)' },
        page: { type: 'number', description: 'Page number (max: 100)' },
        highlight: { type: 'boolean', description: 'Mark matching query terms in results' },
      },
      required: ['query'],
    },
  },
  {
    name: 'slack_search_files',
    description: 'Search for files matching a query. Supports same modifiers as message search.',
    annotations: {
      title: 'Search Files',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        sort: { type: 'string', description: '"score" or "timestamp"' },
        sort_dir: { type: 'string', description: '"asc" or "desc"' },
        count: { type: 'number', description: 'Results per page (max: 100)' },
        page: { type: 'number', description: 'Page number (max: 100)' },
        highlight: { type: 'boolean', description: 'Highlight matching terms' },
      },
      required: ['query'],
    },
  },

  // ========== Files (3) ==========
  {
    name: 'slack_upload_file',
    description:
      'Upload a text file to Slack. Uses the 2-step upload process (getUploadURLExternal + completeUploadExternal). For text/code content only.',
    annotations: {
      title: 'Upload File',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'File content as text string' },
        filename: { type: 'string', description: 'Filename with extension (e.g. "report.txt", "data.csv", "code.py")' },
        channel_id: { type: 'string', description: 'Channel ID to share the file in' },
        initial_comment: { type: 'string', description: 'Comment to post with the file' },
        thread_ts: { type: 'string', description: 'Thread timestamp to post file in' },
      },
      required: ['content', 'filename'],
    },
  },
  {
    name: 'slack_list_files',
    description:
      'List files in the workspace. Filter by channel, user, or type. Free plan: files older than 90 days are deleted.',
    annotations: {
      title: 'List Files',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Filter by channel ID' },
        user: { type: 'string', description: 'Filter by user ID' },
        types: { type: 'string', description: 'Filter by type: all, spaces, snippets, images, gdocs, zips, pdfs' },
        count: { type: 'number', description: 'Items per page' },
        page: { type: 'number', description: 'Page number' },
        ts_from: { type: 'string', description: 'Filter from timestamp (Unix)' },
        ts_to: { type: 'string', description: 'Filter to timestamp (Unix)' },
      },
    },
  },
  {
    name: 'slack_delete_file',
    description: 'Delete a file from the workspace.',
    annotations: {
      title: 'Delete File',
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        file: { type: 'string', description: 'File ID to delete' },
      },
      required: ['file'],
    },
  },

  // ========== Pins (3) ==========
  {
    name: 'slack_pin_message',
    description: 'Pin a message to a channel. Cannot pin channel join messages or files.',
    annotations: {
      title: 'Pin Message',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Channel ID' },
        timestamp: { type: 'string', description: 'Timestamp of the message to pin' },
      },
      required: ['channel', 'timestamp'],
    },
  },
  {
    name: 'slack_unpin_message',
    description: 'Unpin a message from a channel.',
    annotations: {
      title: 'Unpin Message',
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Channel ID' },
        timestamp: { type: 'string', description: 'Timestamp of the message to unpin' },
      },
      required: ['channel', 'timestamp'],
    },
  },
  {
    name: 'slack_list_pins',
    description: 'List all pinned items in a channel.',
    annotations: {
      title: 'List Pins',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Channel ID' },
      },
      required: ['channel'],
    },
  },

  // ========== Bookmarks (4) ==========
  {
    name: 'slack_add_bookmark',
    description: 'Add a bookmark (link) to a channel. Max 100 bookmarks per channel.',
    annotations: {
      title: 'Add Bookmark',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        channel_id: { type: 'string', description: 'Channel ID' },
        title: { type: 'string', description: 'Bookmark title' },
        link: { type: 'string', description: 'URL for the bookmark' },
        emoji: { type: 'string', description: 'Emoji for the bookmark icon (e.g. ":link:")' },
      },
      required: ['channel_id', 'title', 'link'],
    },
  },
  {
    name: 'slack_edit_bookmark',
    description: 'Update an existing bookmark in a channel.',
    annotations: {
      title: 'Edit Bookmark',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        bookmark_id: { type: 'string', description: 'Bookmark ID' },
        channel_id: { type: 'string', description: 'Channel ID' },
        title: { type: 'string', description: 'New title' },
        link: { type: 'string', description: 'New URL' },
        emoji: { type: 'string', description: 'New emoji' },
      },
      required: ['bookmark_id', 'channel_id'],
    },
  },
  {
    name: 'slack_remove_bookmark',
    description: 'Remove a bookmark from a channel.',
    annotations: {
      title: 'Remove Bookmark',
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        bookmark_id: { type: 'string', description: 'Bookmark ID' },
        channel_id: { type: 'string', description: 'Channel ID' },
      },
      required: ['bookmark_id', 'channel_id'],
    },
  },
  {
    name: 'slack_list_bookmarks',
    description: 'List all bookmarks in a channel.',
    annotations: {
      title: 'List Bookmarks',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        channel_id: { type: 'string', description: 'Channel ID' },
      },
      required: ['channel_id'],
    },
  },

  // ========== Team (1) ==========
  {
    name: 'slack_get_team_info',
    description: 'Get information about the workspace/team: name, domain, icon, etc.',
    annotations: {
      title: 'Get Team Info',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        team: { type: 'string', description: 'Team ID (for org-level tokens; optional for single-workspace tokens)' },
      },
    },
  },

  // ========== Emoji (1) ==========
  {
    name: 'slack_list_emoji',
    description:
      'List all custom emoji in the workspace. Returns emoji name-to-URL mapping. Aliases use "alias:emoji_name" format.',
    annotations: {
      title: 'List Emoji',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        include_categories: { type: 'boolean', description: 'Include emoji category info' },
      },
    },
  },
];
