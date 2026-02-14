/**
 * Slack Web API Plugin - MCP Gateway
 * Manages Slack workspaces via Bot Token (38 tools)
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { SlackClient } from './client';

export const slackPlugin: MCPPlugin = {
  id: 'slack',
  name: 'Slack',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    return new SlackClient({
      botToken: config.bot_token as string,
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const slack = client as SlackClient;

    // Strip _fields param (Smithery quality — not a Slack API param)
    const { _fields, ...params } = args;

    try {
      let result: unknown;

      switch (toolName) {
        // ========== Messages (7) ==========
        case 'slack_send_message': {
          const { channel, text, ...opts } = params;
          result = await slack.postMessage(channel as string, text as string, opts);
          break;
        }
        case 'slack_update_message': {
          const { channel, ts, ...opts } = params;
          result = await slack.updateMessage(channel as string, ts as string, opts);
          break;
        }
        case 'slack_delete_message':
          result = await slack.deleteMessage(params.channel as string, params.ts as string);
          break;
        case 'slack_schedule_message': {
          const { channel, post_at, text, ...opts } = params;
          result = await slack.scheduleMessage(channel as string, post_at as number, text as string, opts);
          break;
        }
        case 'slack_delete_scheduled_message':
          result = await slack.deleteScheduledMessage(
            params.channel as string,
            params.scheduled_message_id as string
          );
          break;
        case 'slack_list_scheduled_messages': {
          const { ...opts } = params;
          result = await slack.listScheduledMessages(Object.keys(opts).length ? opts : undefined);
          break;
        }
        case 'slack_get_permalink':
          result = await slack.getPermalink(params.channel as string, params.message_ts as string);
          break;

        // ========== Conversations (12) ==========
        case 'slack_list_channels': {
          const { ...opts } = params;
          result = await slack.listChannels(Object.keys(opts).length ? opts : undefined);
          break;
        }
        case 'slack_get_channel_info': {
          const { channel, ...opts } = params;
          result = await slack.getChannelInfo(channel as string, Object.keys(opts).length ? opts : undefined);
          break;
        }
        case 'slack_get_channel_history': {
          const { channel, ...opts } = params;
          result = await slack.getChannelHistory(channel as string, Object.keys(opts).length ? opts : undefined);
          break;
        }
        case 'slack_get_thread_replies': {
          const { channel, ts, ...opts } = params;
          result = await slack.getThreadReplies(channel as string, ts as string, Object.keys(opts).length ? opts : undefined);
          break;
        }
        case 'slack_get_channel_members': {
          const { channel, ...opts } = params;
          result = await slack.getChannelMembers(channel as string, Object.keys(opts).length ? opts : undefined);
          break;
        }
        case 'slack_create_channel': {
          const { name, ...opts } = params;
          result = await slack.createChannel(name as string, Object.keys(opts).length ? opts : undefined);
          break;
        }
        case 'slack_archive_channel':
          result = await slack.archiveChannel(params.channel as string);
          break;
        case 'slack_invite_to_channel':
          result = await slack.inviteToChannel(params.channel as string, params.users as string);
          break;
        case 'slack_kick_from_channel':
          result = await slack.kickFromChannel(params.channel as string, params.user as string);
          break;
        case 'slack_join_channel':
          result = await slack.joinChannel(params.channel as string);
          break;
        case 'slack_set_channel_topic':
          result = await slack.setChannelTopic(params.channel as string, params.topic as string);
          break;
        case 'slack_open_conversation': {
          const { users, ...opts } = params;
          result = await slack.openConversation(users as string, Object.keys(opts).length ? opts : undefined);
          break;
        }

        // ========== Users (2) ==========
        case 'slack_list_users': {
          const { ...opts } = params;
          result = await slack.listUsers(Object.keys(opts).length ? opts : undefined);
          break;
        }
        case 'slack_get_user_info': {
          const { user, ...opts } = params;
          result = await slack.getUserInfo(user as string, Object.keys(opts).length ? opts : undefined);
          break;
        }

        // ========== Reactions (3) ==========
        case 'slack_add_reaction':
          result = await slack.addReaction(
            params.channel as string,
            params.timestamp as string,
            params.name as string
          );
          break;
        case 'slack_remove_reaction':
          result = await slack.removeReaction(
            params.channel as string,
            params.timestamp as string,
            params.name as string
          );
          break;
        case 'slack_get_reactions':
          result = await slack.getReactions(params.channel as string, params.timestamp as string);
          break;

        // ========== Search (2) ==========
        case 'slack_search_messages': {
          const { query, ...opts } = params;
          result = await slack.searchMessages(query as string, Object.keys(opts).length ? opts : undefined);
          break;
        }
        case 'slack_search_files': {
          const { query, ...opts } = params;
          result = await slack.searchFiles(query as string, Object.keys(opts).length ? opts : undefined);
          break;
        }

        // ========== Files (3) ==========
        case 'slack_upload_file': {
          const { content, filename, channel_id, initial_comment, thread_ts } = params;
          result = await slack.uploadFile(content as string, filename as string, {
            channel_id: channel_id as string | undefined,
            initial_comment: initial_comment as string | undefined,
            thread_ts: thread_ts as string | undefined,
          });
          break;
        }
        case 'slack_list_files': {
          const { ...opts } = params;
          result = await slack.listFiles(Object.keys(opts).length ? opts : undefined);
          break;
        }
        case 'slack_delete_file':
          result = await slack.deleteFile(params.file as string);
          break;

        // ========== Pins (3) ==========
        case 'slack_pin_message':
          result = await slack.pinMessage(params.channel as string, params.timestamp as string);
          break;
        case 'slack_unpin_message':
          result = await slack.unpinMessage(params.channel as string, params.timestamp as string);
          break;
        case 'slack_list_pins':
          result = await slack.listPins(params.channel as string);
          break;

        // ========== Bookmarks (4) ==========
        case 'slack_add_bookmark': {
          const { channel_id, title, link, ...opts } = params;
          result = await slack.addBookmark(
            channel_id as string,
            title as string,
            link as string,
            Object.keys(opts).length ? opts : undefined
          );
          break;
        }
        case 'slack_edit_bookmark': {
          const { bookmark_id, channel_id, ...opts } = params;
          result = await slack.editBookmark(
            bookmark_id as string,
            channel_id as string,
            Object.keys(opts).length ? opts : undefined
          );
          break;
        }
        case 'slack_remove_bookmark':
          result = await slack.removeBookmark(params.bookmark_id as string, params.channel_id as string);
          break;
        case 'slack_list_bookmarks':
          result = await slack.listBookmarks(params.channel_id as string);
          break;

        // ========== Team (1) ==========
        case 'slack_get_team_info': {
          const { ...opts } = params;
          result = await slack.getTeamInfo(Object.keys(opts).length ? opts : undefined);
          break;
        }

        // ========== Emoji (1) ==========
        case 'slack_list_emoji': {
          const { ...opts } = params;
          result = await slack.listEmoji(Object.keys(opts).length ? opts : undefined);
          break;
        }

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
