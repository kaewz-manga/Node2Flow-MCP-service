/**
 * LINE Messaging API - MCP Tool Definitions (25 tools)
 * Ported from @node2flow/line-bot-mcp (community, Smithery quality 85/100)
 */

import type { MCPToolDefinition } from '../../types';

export const TOOLS: MCPToolDefinition[] = [
  // ========== Message Tools (5) ==========
  {
    name: 'line_push_message',
    description:
      'Send a push message to a LINE user, group, or room. Supports all message types: text, image, video, audio, file, location, sticker, template, flex, and imagemap. Example text message: {"type":"text","text":"Hello"}. Example flex: {"type":"flex","altText":"...","contents":{...}}.',
    annotations: {
      title: 'Push Message',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          description: 'Recipient user ID (U...), group ID (C...), or room ID (R...)',
        },
        messages: {
          type: 'array',
          items: { type: 'object' },
          description: 'Array of message objects (max 5). Each must have a "type" field.',
        },
        notification_disabled: {
          type: 'boolean',
          description: 'If true, the user will not receive a push notification (default: false)',
        },
      },
      required: ['to', 'messages'],
    },
  },
  {
    name: 'line_reply_message',
    description:
      'Reply to a webhook event using a reply token. The token expires quickly, so use immediately after receiving an event. Free (does not consume message quota).',
    annotations: {
      title: 'Reply Message',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        reply_token: {
          type: 'string',
          description: 'Reply token from webhook event',
        },
        messages: {
          type: 'array',
          items: { type: 'object' },
          description: 'Array of message objects (max 5)',
        },
        notification_disabled: {
          type: 'boolean',
          description: 'Disable push notification',
        },
      },
      required: ['reply_token', 'messages'],
    },
  },
  {
    name: 'line_multicast_message',
    description:
      'Send a message to multiple users simultaneously (max 500 user IDs). More efficient than individual push messages.',
    annotations: {
      title: 'Multicast Message',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        to: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of user IDs (max 500)',
        },
        messages: {
          type: 'array',
          items: { type: 'object' },
          description: 'Array of message objects (max 5)',
        },
        notification_disabled: {
          type: 'boolean',
          description: 'Disable push notification',
        },
      },
      required: ['to', 'messages'],
    },
  },
  {
    name: 'line_broadcast_message',
    description:
      'Send a message to all followers of the bot. No user IDs needed. Consumes message quota based on number of followers.',
    annotations: {
      title: 'Broadcast Message',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        messages: {
          type: 'array',
          items: { type: 'object' },
          description: 'Array of message objects (max 5)',
        },
        notification_disabled: {
          type: 'boolean',
          description: 'Disable push notification',
        },
      },
      required: ['messages'],
    },
  },
  {
    name: 'line_validate_message',
    description:
      'Validate message objects before sending. Returns 200 OK if valid, or error details if invalid. Use to check message format before push/reply/multicast/broadcast.',
    annotations: {
      title: 'Validate Message',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        messages: {
          type: 'array',
          items: { type: 'object' },
          description: 'Array of message objects to validate',
        },
      },
      required: ['messages'],
    },
  },

  // ========== User & Bot Info Tools (4) ==========
  {
    name: 'line_get_profile',
    description:
      'Get a LINE user profile. Returns display name, profile picture URL, status message, and language. The user must have added the bot as a friend.',
    annotations: {
      title: 'Get User Profile',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'LINE user ID (starts with U)',
        },
      },
      required: ['user_id'],
    },
  },
  {
    name: 'line_get_follower_ids',
    description:
      'Get a list of user IDs of users who added the bot as friend. Returns up to 300 IDs per page. Use the next token for pagination.',
    annotations: {
      title: 'Get Follower IDs',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        start: {
          type: 'string',
          description: 'Continuation token from previous response for pagination',
        },
        limit: {
          type: 'number',
          description: 'Max number of user IDs per page (default 300, max 300)',
        },
      },
    },
  },
  {
    name: 'line_get_bot_info',
    description:
      'Get bot basic information: user ID, basic ID, display name, picture URL, chat mode, and mark-as-read mode.',
    annotations: {
      title: 'Get Bot Info',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response (e.g. "userId,displayName,chatMode")' },
      },
    },
  },
  {
    name: 'line_display_loading',
    description:
      'Display a loading animation in the chat. Useful before performing slow operations. Animation shows for the specified duration.',
    annotations: {
      title: 'Display Loading',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        chat_id: {
          type: 'string',
          description: 'User ID, group ID, or room ID to show loading animation',
        },
        loading_seconds: {
          type: 'number',
          description: 'Duration in seconds (5-60, default 20)',
        },
      },
      required: ['chat_id'],
    },
  },

  // ========== Group Chat Tools (4) ==========
  {
    name: 'line_get_group_summary',
    description:
      'Get group chat summary: group name, picture URL, and creation time.',
    annotations: {
      title: 'Get Group Summary',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        group_id: {
          type: 'string',
          description: 'LINE group ID (starts with C)',
        },
      },
      required: ['group_id'],
    },
  },
  {
    name: 'line_get_group_members_count',
    description:
      'Get the number of members in a group chat.',
    annotations: {
      title: 'Get Group Members Count',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        group_id: {
          type: 'string',
          description: 'LINE group ID',
        },
      },
      required: ['group_id'],
    },
  },
  {
    name: 'line_get_group_member_ids',
    description:
      'Get a list of user IDs of group members. Returns up to 100 IDs per page. Use the next token for pagination.',
    annotations: {
      title: 'Get Group Member IDs',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        group_id: {
          type: 'string',
          description: 'LINE group ID',
        },
        start: {
          type: 'string',
          description: 'Continuation token from previous response for pagination',
        },
      },
      required: ['group_id'],
    },
  },
  {
    name: 'line_get_group_member_profile',
    description:
      'Get profile of a specific member within a group chat.',
    annotations: {
      title: 'Get Group Member Profile',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        group_id: {
          type: 'string',
          description: 'LINE group ID',
        },
        user_id: {
          type: 'string',
          description: 'LINE user ID of the member',
        },
      },
      required: ['group_id', 'user_id'],
    },
  },

  // ========== Rich Menu Tools (6) ==========
  {
    name: 'line_create_rich_menu',
    description:
      'Create a rich menu for the bot. Returns the created rich menu ID. After creating, upload an image and set it as default or link to specific users.',
    annotations: {
      title: 'Create Rich Menu',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        size: {
          type: 'object',
          description: 'Menu size: {"width": 2500, "height": 1686} or {"width": 2500, "height": 843}',
        },
        selected: {
          type: 'boolean',
          description: 'Whether the menu is displayed by default (default: false)',
        },
        name: {
          type: 'string',
          description: 'Name of the rich menu (not displayed to users, max 300 chars)',
        },
        chat_bar_text: {
          type: 'string',
          description: 'Text displayed in the chat bar (max 14 chars)',
        },
        areas: {
          type: 'array',
          items: { type: 'object' },
          description: 'Array of tap area objects. Each has "bounds" (x, y, width, height) and "action" (postback, message, uri, etc.)',
        },
      },
      required: ['size', 'selected', 'name', 'chat_bar_text', 'areas'],
    },
  },
  {
    name: 'line_get_rich_menus',
    description:
      'List all rich menus created for the bot. Returns array of rich menu objects with IDs, names, sizes, and areas.',
    annotations: {
      title: 'List Rich Menus',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response (e.g. "richMenuId,name,selected")' },
      },
    },
  },
  {
    name: 'line_get_rich_menu',
    description:
      'Get details of a specific rich menu by ID.',
    annotations: {
      title: 'Get Rich Menu',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        rich_menu_id: {
          type: 'string',
          description: 'Rich menu ID (e.g., "richmenu-abc123...")',
        },
      },
      required: ['rich_menu_id'],
    },
  },
  {
    name: 'line_delete_rich_menu',
    description:
      'Delete a rich menu. If this was the default menu or linked to users, it will be unlinked automatically.',
    annotations: {
      title: 'Delete Rich Menu',
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        rich_menu_id: {
          type: 'string',
          description: 'Rich menu ID to delete',
        },
      },
      required: ['rich_menu_id'],
    },
  },
  {
    name: 'line_set_default_rich_menu',
    description:
      'Set a rich menu as the default for all users who have not been individually linked to a different rich menu.',
    annotations: {
      title: 'Set Default Rich Menu',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        rich_menu_id: {
          type: 'string',
          description: 'Rich menu ID to set as default',
        },
      },
      required: ['rich_menu_id'],
    },
  },
  {
    name: 'line_link_rich_menu_to_user',
    description:
      'Link a specific rich menu to a user. This overrides the default rich menu for that user.',
    annotations: {
      title: 'Link Rich Menu to User',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'LINE user ID',
        },
        rich_menu_id: {
          type: 'string',
          description: 'Rich menu ID to link',
        },
      },
      required: ['user_id', 'rich_menu_id'],
    },
  },

  // ========== Quota & Insights Tools (3) ==========
  {
    name: 'line_get_quota',
    description:
      'Get the monthly message quota for the bot. Returns the quota type and limit value.',
    annotations: {
      title: 'Get Message Quota',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response (e.g. "type,value")' },
      },
    },
  },
  {
    name: 'line_get_quota_consumption',
    description:
      'Get the number of messages sent this month. Use with line_get_quota to check remaining messages.',
    annotations: {
      title: 'Get Quota Consumption',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response (e.g. "totalUsage")' },
      },
    },
  },
  {
    name: 'line_get_followers_count',
    description:
      'Get follower statistics for a specific date: number of followers, targeted reaches, and blocks.',
    annotations: {
      title: 'Get Followers Count',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYYMMDD format (e.g., "20260207")',
        },
      },
      required: ['date'],
    },
  },

  // ========== Webhook Tools (3) ==========
  {
    name: 'line_set_webhook_url',
    description:
      'Set the webhook endpoint URL for receiving LINE events (messages, follows, etc.).',
    annotations: {
      title: 'Set Webhook URL',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        endpoint: {
          type: 'string',
          description: 'Webhook URL (must be HTTPS)',
        },
      },
      required: ['endpoint'],
    },
  },
  {
    name: 'line_get_webhook_info',
    description:
      'Get the current webhook endpoint URL and whether it is active.',
    annotations: {
      title: 'Get Webhook Info',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response (e.g. "endpoint,active")' },
      },
    },
  },
  {
    name: 'line_test_webhook',
    description:
      'Test webhook endpoint connectivity. Sends a test request to the configured webhook URL and returns the result.',
    annotations: {
      title: 'Test Webhook',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        endpoint: {
          type: 'string',
          description: 'Optional: specific URL to test (uses configured webhook URL if not provided)',
        },
      },
    },
  },
];
