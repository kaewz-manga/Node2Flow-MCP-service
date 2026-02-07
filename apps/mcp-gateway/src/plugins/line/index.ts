/**
 * LINE Messaging API Plugin - MCP Gateway
 * Manages LINE bots via Messaging API
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { LineClient } from './client';
import type { LineMessage } from './types';

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

      switch (toolName) {
        // ========== Messages ==========
        case 'line_push_message':
          result = await line.pushMessage(
            args.to as string,
            args.messages as LineMessage[],
            args.notification_disabled as boolean | undefined
          );
          break;
        case 'line_reply_message':
          result = await line.replyMessage(
            args.reply_token as string,
            args.messages as LineMessage[],
            args.notification_disabled as boolean | undefined
          );
          break;
        case 'line_multicast_message':
          result = await line.multicastMessage(
            args.to as string[],
            args.messages as LineMessage[],
            args.notification_disabled as boolean | undefined
          );
          break;
        case 'line_broadcast_message':
          result = await line.broadcastMessage(
            args.messages as LineMessage[],
            args.notification_disabled as boolean | undefined
          );
          break;
        case 'line_validate_message':
          result = await line.validateMessage(args.messages as LineMessage[]);
          break;

        // ========== User & Bot Info ==========
        case 'line_get_profile':
          result = await line.getProfile(args.user_id as string);
          break;
        case 'line_get_follower_ids':
          result = await line.getFollowerIds(
            args.start as string | undefined,
            args.limit as number | undefined
          );
          break;
        case 'line_get_bot_info':
          result = await line.getBotInfo();
          break;
        case 'line_display_loading':
          result = await line.displayLoadingAnimation(
            args.chat_id as string,
            args.loading_seconds as number | undefined
          );
          break;

        // ========== Group Chat ==========
        case 'line_get_group_summary':
          result = await line.getGroupSummary(args.group_id as string);
          break;
        case 'line_get_group_members_count':
          result = await line.getGroupMembersCount(args.group_id as string);
          break;
        case 'line_get_group_member_ids':
          result = await line.getGroupMemberIds(
            args.group_id as string,
            args.start as string | undefined
          );
          break;
        case 'line_get_group_member_profile':
          result = await line.getGroupMemberProfile(
            args.group_id as string,
            args.user_id as string
          );
          break;

        // ========== Rich Menu ==========
        case 'line_create_rich_menu':
          result = await line.createRichMenu({
            size: args.size as { width: number; height: number },
            selected: args.selected as boolean,
            name: args.name as string,
            chatBarText: args.chat_bar_text as string,
            areas: args.areas as any[],
          });
          break;
        case 'line_get_rich_menus':
          result = await line.getRichMenus();
          break;
        case 'line_get_rich_menu':
          result = await line.getRichMenu(args.rich_menu_id as string);
          break;
        case 'line_delete_rich_menu':
          result = await line.deleteRichMenu(args.rich_menu_id as string);
          break;
        case 'line_set_default_rich_menu':
          result = await line.setDefaultRichMenu(args.rich_menu_id as string);
          break;
        case 'line_link_rich_menu_to_user':
          result = await line.linkRichMenuToUser(
            args.user_id as string,
            args.rich_menu_id as string
          );
          break;

        // ========== Quota & Insights ==========
        case 'line_get_quota':
          result = await line.getQuota();
          break;
        case 'line_get_quota_consumption':
          result = await line.getQuotaConsumption();
          break;
        case 'line_get_followers_count':
          result = await line.getFollowersCount(args.date as string);
          break;

        // ========== Webhook ==========
        case 'line_set_webhook_url':
          result = await line.setWebhookUrl(args.endpoint as string);
          break;
        case 'line_get_webhook_info':
          result = await line.getWebhookInfo();
          break;
        case 'line_test_webhook':
          result = await line.testWebhook(args.endpoint as string | undefined);
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
