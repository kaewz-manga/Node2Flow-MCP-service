/**
 * Telegram Bot API Plugin - MCP Gateway
 * Manages Telegram bots via Bot API
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { TelegramClient } from './client';

export const telegramPlugin: MCPPlugin = {
  id: 'telegram',
  name: 'Telegram Bot',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    return new TelegramClient({
      botToken: config.bot_token as string,
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const tg = client as TelegramClient;

    try {
      let result: unknown;

      switch (toolName) {
        // ========== Bot Info ==========
        case 'tg_get_me':
          result = await tg.getMe();
          break;
        case 'tg_set_my_commands':
          result = await tg.setMyCommands(
            args.commands as Array<{ command: string; description: string }>,
            args.scope as Record<string, unknown> | undefined,
            args.language_code as string | undefined
          );
          break;

        // ========== Send Messages ==========
        case 'tg_send_message': {
          const { chat_id, text, ...opts } = args;
          result = await tg.sendMessage(chat_id as string, text as string, opts);
          break;
        }
        case 'tg_send_photo': {
          const { chat_id, photo, ...opts } = args;
          result = await tg.sendPhoto(chat_id as string, photo as string, opts);
          break;
        }
        case 'tg_send_document': {
          const { chat_id, document, ...opts } = args;
          result = await tg.sendDocument(chat_id as string, document as string, opts);
          break;
        }
        case 'tg_send_video': {
          const { chat_id, video, ...opts } = args;
          result = await tg.sendVideo(chat_id as string, video as string, opts);
          break;
        }
        case 'tg_send_audio': {
          const { chat_id, audio, ...opts } = args;
          result = await tg.sendAudio(chat_id as string, audio as string, opts);
          break;
        }
        case 'tg_send_location': {
          const { chat_id, latitude, longitude, ...opts } = args;
          result = await tg.sendLocation(
            chat_id as string,
            latitude as number,
            longitude as number,
            opts
          );
          break;
        }
        case 'tg_send_poll': {
          const { chat_id, question, options, ...opts } = args;
          result = await tg.sendPoll(
            chat_id as string,
            question as string,
            options as string[],
            opts
          );
          break;
        }
        case 'tg_send_contact': {
          const { chat_id, phone_number, first_name, ...opts } = args;
          result = await tg.sendContact(
            chat_id as string,
            phone_number as string,
            first_name as string,
            opts
          );
          break;
        }

        // ========== Edit/Delete Messages ==========
        case 'tg_edit_message_text': {
          const { chat_id, message_id, text, ...opts } = args;
          result = await tg.editMessageText(
            chat_id as string,
            message_id as number,
            text as string,
            opts
          );
          break;
        }
        case 'tg_edit_message_caption': {
          const { chat_id, message_id, ...opts } = args;
          result = await tg.editMessageCaption(
            chat_id as string,
            message_id as number,
            opts
          );
          break;
        }
        case 'tg_delete_message':
          result = await tg.deleteMessage(args.chat_id as string, args.message_id as number);
          break;

        // ========== Chat Management ==========
        case 'tg_get_chat':
          result = await tg.getChat(args.chat_id as string);
          break;
        case 'tg_get_chat_member_count':
          result = await tg.getChatMemberCount(args.chat_id as string);
          break;
        case 'tg_get_chat_member':
          result = await tg.getChatMember(args.chat_id as string, args.user_id as number);
          break;
        case 'tg_ban_chat_member': {
          const { chat_id, user_id, ...opts } = args;
          result = await tg.banChatMember(chat_id as string, user_id as number, opts);
          break;
        }
        case 'tg_unban_chat_member': {
          const { chat_id, user_id, ...opts } = args;
          result = await tg.unbanChatMember(chat_id as string, user_id as number, opts);
          break;
        }

        // ========== Webhooks ==========
        case 'tg_set_webhook': {
          const { url, ...opts } = args;
          result = await tg.setWebhook(url as string, opts);
          break;
        }
        case 'tg_delete_webhook':
          result = await tg.deleteWebhook(
            args.drop_pending_updates !== undefined
              ? { drop_pending_updates: args.drop_pending_updates }
              : undefined
          );
          break;
        case 'tg_get_webhook_info':
          result = await tg.getWebhookInfo();
          break;

        // ========== Callbacks & Files ==========
        case 'tg_answer_callback_query': {
          const { callback_query_id, ...opts } = args;
          result = await tg.answerCallbackQuery(callback_query_id as string, opts);
          break;
        }
        case 'tg_get_file':
          result = await tg.getFile(args.file_id as string);
          break;
        case 'tg_get_user_profile_photos': {
          const { user_id, ...opts } = args;
          result = await tg.getUserProfilePhotos(user_id as number, opts);
          break;
        }

        // ========== Pins & Invite Links ==========
        case 'tg_pin_chat_message': {
          const { chat_id, message_id, ...opts } = args;
          result = await tg.pinChatMessage(chat_id as string, message_id as number, opts);
          break;
        }
        case 'tg_unpin_chat_message':
          result = await tg.unpinChatMessage(
            args.chat_id as string,
            args.message_id as number | undefined
          );
          break;
        case 'tg_create_chat_invite_link': {
          const { chat_id, ...opts } = args;
          result = await tg.createChatInviteLink(chat_id as string, opts);
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
