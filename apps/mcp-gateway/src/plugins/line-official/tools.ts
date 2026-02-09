import type { MCPToolDefinition } from '../../types';

/**
 * Tool definitions from @line/line-bot-mcp-server v0.4.2
 * Prefixed with loff_ to avoid conflicts with custom line plugin
 * Remote names match directly (e.g., push_text_message)
 */
export const TOOLS: MCPToolDefinition[] = [
  // ===== Messaging =====
  {
    name: 'loff_push_text_message',
    description: 'Push a simple text message to a user via LINE. Use this for sending plain text messages without formatting.',
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'The user ID to receive the message' },
        message: {
          type: 'object',
          description: 'Text message object with type and text fields',
          properties: {
            type: { type: 'string', description: 'Must be "text"' },
            text: { type: 'string', description: 'The plain text content (max 5000 chars)' },
          },
        },
      },
      required: ['userId', 'message'],
    },
  },
  {
    name: 'loff_push_flex_message',
    description: 'Push a highly customizable flex message to a user via LINE. Supports both bubble (single container) and carousel (multiple swipeable bubbles) layouts.',
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'The user ID to receive the message' },
        message: {
          type: 'object',
          description: 'Flex message object with altText and contents',
          properties: {
            type: { type: 'string', description: 'Must be "flex"' },
            altText: { type: 'string', description: 'Alternative text (max 400 chars)' },
            contents: { type: 'object', description: 'Flex container (bubble or carousel)' },
          },
        },
      },
      required: ['userId', 'message'],
    },
  },
  {
    name: 'loff_broadcast_text_message',
    description: 'Broadcast a simple text message to all users who have followed your LINE Official Account.',
    inputSchema: {
      type: 'object',
      properties: {
        message: {
          type: 'object',
          description: 'Text message object',
          properties: {
            type: { type: 'string', description: 'Must be "text"' },
            text: { type: 'string', description: 'The plain text content (max 5000 chars)' },
          },
        },
      },
      required: ['message'],
    },
  },
  {
    name: 'loff_broadcast_flex_message',
    description: 'Broadcast a highly customizable flex message to all users who have followed your LINE Official Account.',
    inputSchema: {
      type: 'object',
      properties: {
        message: {
          type: 'object',
          description: 'Flex message object with altText and contents',
          properties: {
            type: { type: 'string', description: 'Must be "flex"' },
            altText: { type: 'string', description: 'Alternative text (max 400 chars)' },
            contents: { type: 'object', description: 'Flex container (bubble or carousel)' },
          },
        },
      },
      required: ['message'],
    },
  },
  // ===== Profile =====
  {
    name: 'loff_get_profile',
    description: 'Get detailed profile information of a LINE user including display name, profile picture URL, status message and language.',
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'The user ID to get profile for' },
      },
      required: ['userId'],
    },
  },
  // ===== Quota =====
  {
    name: 'loff_get_message_quota',
    description: 'Get the message quota and consumption of the LINE Official Account. Shows the monthly message limit and current usage.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  // ===== Rich Menu =====
  {
    name: 'loff_get_rich_menu_list',
    description: 'Get the list of rich menus associated with your LINE Official Account.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'loff_delete_rich_menu',
    description: 'Delete a rich menu from your LINE Official Account.',
    inputSchema: {
      type: 'object',
      properties: {
        richMenuId: { type: 'string', description: 'The ID of the rich menu to delete' },
      },
      required: ['richMenuId'],
    },
  },
  {
    name: 'loff_set_rich_menu_default',
    description: 'Set a rich menu as the default rich menu.',
    inputSchema: {
      type: 'object',
      properties: {
        richMenuId: { type: 'string', description: 'The ID of the rich menu to set as default' },
      },
      required: ['richMenuId'],
    },
  },
  {
    name: 'loff_cancel_rich_menu_default',
    description: 'Cancel the default rich menu.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'loff_create_rich_menu',
    description: 'Create a rich menu with actions. Generates and uploads a rich menu image. The menu will be registered as the default.',
    inputSchema: {
      type: 'object',
      properties: {
        chatBarText: { type: 'string', description: 'Text displayed in the chat bar (also used as menu name)' },
        actions: {
          type: 'array',
          description: 'Rich menu actions (1-6 items). Each action can be: postback, message, uri, datetimepicker, camera, cameraRoll, location, richmenuswitch, clipboard',
        },
      },
      required: ['chatBarText', 'actions'],
    },
  },
];
