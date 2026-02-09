/**
 * LINE Bot MCP Plugin - MCP Gateway
 * Matches official line-bot-mcp-server
 * 11 tools: Messages, Profile, Quota, Rich Menu
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { LineClient } from './client';

export const linePlugin: MCPPlugin = {
  id: 'line',
  name: 'LINE Messaging',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    return new LineClient({
      channelAccessToken: config.channel_access_token as string,
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const line = client as LineClient;

    try {
      let result: unknown;
      const message = args.message as Record<string, unknown> | undefined;

      switch (toolName) {
        // ========== Messages ==========
        case 'push_text_message':
          result = await line.pushTextMessage(args.userId as string, message!.text as string);
          break;
        case 'push_flex_message':
          result = await line.pushFlexMessage(
            args.userId as string,
            message!.altText as string,
            message!.contents as Record<string, unknown>,
          );
          break;
        case 'broadcast_text_message':
          result = await line.broadcastTextMessage(message!.text as string);
          break;
        case 'broadcast_flex_message':
          result = await line.broadcastFlexMessage(
            message!.altText as string,
            message!.contents as Record<string, unknown>,
          );
          break;

        // ========== Profile ==========
        case 'get_profile':
          result = await line.getProfile(args.userId as string);
          break;

        // ========== Quota ==========
        case 'get_message_quota':
          result = await line.getMessageQuota();
          break;

        // ========== Rich Menu ==========
        case 'get_rich_menu_list':
          result = await line.getRichMenuList();
          break;
        case 'delete_rich_menu':
          result = await line.deleteRichMenu(args.richMenuId as string);
          break;
        case 'set_rich_menu_default':
          result = await line.setRichMenuDefault(args.richMenuId as string);
          break;
        case 'cancel_rich_menu_default':
          result = await line.cancelRichMenuDefault();
          break;
        case 'create_rich_menu':
          result = await line.createRichMenu(
            args.chatBarText as string,
            args.actions as Record<string, unknown>[],
          );
          break;

        default:
          return {
            content: [{ type: 'text' as const, text: `Unknown tool: ${toolName}` }],
            isError: true,
          };
      }

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        isError: false,
      };
    } catch (error) {
      return {
        content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  },
};
