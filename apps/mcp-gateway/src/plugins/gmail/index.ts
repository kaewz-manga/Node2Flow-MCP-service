/**
 * Gmail Plugin - MCP Gateway
 * OAuth 2.0 refresh token pattern — same as YouTube, Google Drive, Google Sheets
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { GmailClient } from './gmail-client';

function ok(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data ?? { success: true }, null, 2) }], isError: false };
}

export const gmailPlugin: MCPPlugin = {
  id: 'gmail',
  name: 'Gmail',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    const clientId = config.client_id as string | undefined;
    const clientSecret = config.client_secret as string | undefined;
    const refreshToken = config.refresh_token as string | undefined;

    if (!clientId || !clientSecret || !refreshToken) return null;

    return new GmailClient({ clientId, clientSecret, refreshToken });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const gmail = client as GmailClient;

    switch (toolName) {
      // ========== Messages (10) ==========
      case 'gmail_list_messages':
        return ok(await gmail.listMessages({
          q: args.q as string | undefined,
          labelIds: args.label_ids as string[] | undefined,
          maxResults: args.max_results as number | undefined,
          pageToken: args.page_token as string | undefined,
          includeSpamTrash: args.include_spam_trash as boolean | undefined,
        }));
      case 'gmail_get_message':
        return ok(await gmail.getMessage({
          id: args.id as string,
          format: args.format as string | undefined,
          metadataHeaders: args.metadata_headers as string[] | undefined,
        }));
      case 'gmail_send_message':
        return ok(await gmail.sendMessage({
          to: args.to as string,
          subject: args.subject as string,
          body: args.body as string,
          cc: args.cc as string | undefined,
          bcc: args.bcc as string | undefined,
          html: args.html as string | undefined,
          in_reply_to: args.in_reply_to as string | undefined,
          references: args.references as string | undefined,
          thread_id: args.thread_id as string | undefined,
        }));
      case 'gmail_delete_message':
        await gmail.deleteMessage({ id: args.id as string });
        return ok({ success: true, id: args.id });
      case 'gmail_trash_message':
        return ok(await gmail.trashMessage({ id: args.id as string }));
      case 'gmail_untrash_message':
        return ok(await gmail.untrashMessage({ id: args.id as string }));
      case 'gmail_modify_message':
        return ok(await gmail.modifyMessage({
          id: args.id as string,
          addLabelIds: args.add_label_ids as string[] | undefined,
          removeLabelIds: args.remove_label_ids as string[] | undefined,
        }));
      case 'gmail_batch_delete':
        await gmail.batchDeleteMessages({ ids: args.ids as string[] });
        return ok({ success: true, deleted: (args.ids as string[]).length });
      case 'gmail_batch_modify':
        await gmail.batchModifyMessages({
          ids: args.ids as string[],
          addLabelIds: args.add_label_ids as string[] | undefined,
          removeLabelIds: args.remove_label_ids as string[] | undefined,
        });
        return ok({ success: true, modified: (args.ids as string[]).length });
      case 'gmail_get_attachment':
        return ok(await gmail.getAttachment({
          messageId: args.message_id as string,
          attachmentId: args.attachment_id as string,
        }));

      // ========== Drafts (6) ==========
      case 'gmail_list_drafts':
        return ok(await gmail.listDrafts({
          maxResults: args.max_results as number | undefined,
          pageToken: args.page_token as string | undefined,
          q: args.q as string | undefined,
        }));
      case 'gmail_get_draft':
        return ok(await gmail.getDraft({
          id: args.id as string,
          format: args.format as string | undefined,
        }));
      case 'gmail_create_draft':
        return ok(await gmail.createDraft({
          to: args.to as string,
          subject: args.subject as string,
          body: args.body as string,
          cc: args.cc as string | undefined,
          bcc: args.bcc as string | undefined,
          html: args.html as string | undefined,
          thread_id: args.thread_id as string | undefined,
        }));
      case 'gmail_update_draft':
        return ok(await gmail.updateDraft({
          id: args.id as string,
          to: args.to as string,
          subject: args.subject as string,
          body: args.body as string,
          cc: args.cc as string | undefined,
          bcc: args.bcc as string | undefined,
          html: args.html as string | undefined,
          thread_id: args.thread_id as string | undefined,
        }));
      case 'gmail_delete_draft':
        await gmail.deleteDraft({ id: args.id as string });
        return ok({ success: true, id: args.id });
      case 'gmail_send_draft':
        return ok(await gmail.sendDraft({ id: args.id as string }));

      // ========== Labels (5) ==========
      case 'gmail_list_labels':
        return ok(await gmail.listLabels());
      case 'gmail_get_label':
        return ok(await gmail.getLabel({ id: args.id as string }));
      case 'gmail_create_label':
        return ok(await gmail.createLabel({
          name: args.name as string,
          messageListVisibility: args.message_list_visibility as string | undefined,
          labelListVisibility: args.label_list_visibility as string | undefined,
          backgroundColor: args.background_color as string | undefined,
          textColor: args.text_color as string | undefined,
        }));
      case 'gmail_update_label':
        return ok(await gmail.updateLabel({
          id: args.id as string,
          name: args.name as string | undefined,
          messageListVisibility: args.message_list_visibility as string | undefined,
          labelListVisibility: args.label_list_visibility as string | undefined,
          backgroundColor: args.background_color as string | undefined,
          textColor: args.text_color as string | undefined,
        }));
      case 'gmail_delete_label':
        await gmail.deleteLabel({ id: args.id as string });
        return ok({ success: true, id: args.id });

      // ========== Threads (5) ==========
      case 'gmail_list_threads':
        return ok(await gmail.listThreads({
          q: args.q as string | undefined,
          labelIds: args.label_ids as string[] | undefined,
          maxResults: args.max_results as number | undefined,
          pageToken: args.page_token as string | undefined,
          includeSpamTrash: args.include_spam_trash as boolean | undefined,
        }));
      case 'gmail_get_thread':
        return ok(await gmail.getThread({
          id: args.id as string,
          format: args.format as string | undefined,
        }));
      case 'gmail_modify_thread':
        return ok(await gmail.modifyThread({
          id: args.id as string,
          addLabelIds: args.add_label_ids as string[] | undefined,
          removeLabelIds: args.remove_label_ids as string[] | undefined,
        }));
      case 'gmail_trash_thread':
        return ok(await gmail.trashThread({ id: args.id as string }));
      case 'gmail_untrash_thread':
        return ok(await gmail.untrashThread({ id: args.id as string }));

      // ========== Settings (2) ==========
      case 'gmail_get_profile':
        return ok(await gmail.getProfile());
      case 'gmail_update_vacation':
        return ok(await gmail.updateVacation({
          enableAutoReply: args.enable_auto_reply as boolean,
          responseSubject: args.response_subject as string | undefined,
          responseBodyPlainText: args.response_body_plain_text as string | undefined,
          responseBodyHtml: args.response_body_html as string | undefined,
          restrictToContacts: args.restrict_to_contacts as boolean | undefined,
          restrictToDomain: args.restrict_to_domain as boolean | undefined,
          startTime: args.start_time as string | undefined,
          endTime: args.end_time as string | undefined,
        }));

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  },
};
