/**
 * LINE Bot MCP Tool Definitions (11 tools)
 * Matches official line-bot-mcp-server
 */

import type { MCPToolDefinition } from '../../types';

export const TOOLS: MCPToolDefinition[] = [
  // ========== Messages (4) ==========
  {
    name: 'push_text_message',
    description: 'Push a simple text message to a user via LINE.',
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'LINE user ID to send the message to' },
        message: {
          type: 'object',
          description: 'Message object with text content',
          properties: {
            text: { type: 'string', description: 'The text message to send' },
          },
          required: ['text'],
        },
      },
      required: ['userId', 'message'],
    },
  },
  {
    name: 'push_flex_message',
    description: 'Push a highly customizable flex message to a user via LINE.',
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'LINE user ID to send the message to' },
        message: {
          type: 'object',
          description: 'Flex message object',
          properties: {
            altText: { type: 'string', description: 'Alternative text shown in notification' },
            contents: {
              type: 'object',
              description: 'Flex message container (bubble or carousel)',
              properties: {
                type: { type: 'string', enum: ['bubble', 'carousel'], description: 'Container type' },
              },
              required: ['type'],
            },
          },
          required: ['altText', 'contents'],
        },
      },
      required: ['userId', 'message'],
    },
  },
  {
    name: 'broadcast_text_message',
    description: 'Broadcast a simple text message via LINE to all users who have followed your LINE Official Account.',
    inputSchema: {
      type: 'object',
      properties: {
        message: {
          type: 'object',
          description: 'Message object with text content',
          properties: {
            text: { type: 'string', description: 'The text message to broadcast' },
          },
          required: ['text'],
        },
      },
      required: ['message'],
    },
  },
  {
    name: 'broadcast_flex_message',
    description: 'Broadcast a highly customizable flex message via LINE to all users who have added your LINE Official Account.',
    inputSchema: {
      type: 'object',
      properties: {
        message: {
          type: 'object',
          description: 'Flex message object',
          properties: {
            altText: { type: 'string', description: 'Alternative text shown in notification' },
            contents: {
              type: 'object',
              description: 'Flex message container (bubble or carousel)',
              properties: {
                type: { type: 'string', enum: ['bubble', 'carousel'], description: 'Container type' },
              },
              required: ['type'],
            },
          },
          required: ['altText', 'contents'],
        },
      },
      required: ['message'],
    },
  },

  // ========== Profile (1) ==========
  {
    name: 'get_profile',
    description: 'Get detailed profile information of a LINE user including display name, profile picture URL, status message and language.',
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'LINE user ID to get profile for' },
      },
      required: ['userId'],
    },
  },

  // ========== Quota (1) ==========
  {
    name: 'get_message_quota',
    description: 'Get the message quota and consumption of the LINE Official Account showing monthly message limit and current usage.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // ========== Rich Menu (5) ==========
  {
    name: 'get_rich_menu_list',
    description: 'Get the list of rich menus associated with your LINE Official Account.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'delete_rich_menu',
    description: 'Delete a rich menu from your LINE Official Account.',
    inputSchema: {
      type: 'object',
      properties: {
        richMenuId: { type: 'string', description: 'Rich menu ID to delete' },
      },
      required: ['richMenuId'],
    },
  },
  {
    name: 'set_rich_menu_default',
    description: 'Set a rich menu as the default rich menu.',
    inputSchema: {
      type: 'object',
      properties: {
        richMenuId: { type: 'string', description: 'Rich menu ID to set as default' },
      },
      required: ['richMenuId'],
    },
  },
  {
    name: 'cancel_rich_menu_default',
    description: 'Cancel the default rich menu.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'create_rich_menu',
    description: 'Create a rich menu based on given actions, generate and upload an image, then set as default.',
    inputSchema: {
      type: 'object',
      properties: {
        chatBarText: { type: 'string', description: 'Text displayed in the chat bar (max 14 chars)' },
        actions: {
          type: 'array',
          description: 'Array of 1-6 action objects. Each action has type (postback, message, uri, datetimepicker, camera, cameraRoll, location, richmenuswitch, clipboard) and label.',
          items: { type: 'object' },
        },
      },
      required: ['chatBarText', 'actions'],
    },
  },
];
