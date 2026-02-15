/**
 * Google Drive Plugin - MCP Gateway
 * Manages files, permissions, comments, replies, shared drives, and revisions
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { DriveClient } from './client';

export const googleDrivePlugin: MCPPlugin = {
  id: 'google-drive',
  name: 'Google Drive',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    return new DriveClient({
      clientId: config.client_id as string,
      clientSecret: config.client_secret as string,
      refreshToken: config.refresh_token as string,
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const gd = client as DriveClient;

    try {
      let result: unknown;

      switch (toolName) {
        case 'gd_search_files':
          result = await gd.searchFiles({ q: args.q as string | undefined, pageSize: args.page_size as number | undefined, pageToken: args.page_token as string | undefined, orderBy: args.order_by as string | undefined, spaces: args.spaces as string | undefined, corpora: args.corpora as string | undefined, driveId: args.drive_id as string | undefined, includeItemsFromAllDrives: args.include_items_from_all_drives as boolean | undefined, fields: (args.fields || args._fields) as string | undefined });
          break;
        case 'gd_get_file':
          result = await gd.getFile({ fileId: args.file_id as string, fields: (args.fields || args._fields) as string | undefined });
          break;
        case 'gd_read_file':
          result = await gd.readFile({ fileId: args.file_id as string });
          break;
        case 'gd_create_file':
          result = await gd.createFile({ name: args.name as string, mimeType: args.mime_type as string | undefined, parents: args.parents as string[] | undefined, description: args.description as string | undefined, starred: args.starred as boolean | undefined, properties: args.properties as Record<string, string> | undefined });
          break;
        case 'gd_update_file':
          result = await gd.updateFile({ fileId: args.file_id as string, name: args.name as string | undefined, description: args.description as string | undefined, starred: args.starred as boolean | undefined, trashed: args.trashed as boolean | undefined, addParents: args.add_parents as string | undefined, removeParents: args.remove_parents as string | undefined, properties: args.properties as Record<string, string> | undefined });
          break;
        case 'gd_copy_file':
          result = await gd.copyFile({ fileId: args.file_id as string, name: args.name as string | undefined, parents: args.parents as string[] | undefined, description: args.description as string | undefined });
          break;
        case 'gd_delete_file':
          result = await gd.deleteFile({ fileId: args.file_id as string });
          break;
        case 'gd_export_file':
          result = await gd.exportFile({ fileId: args.file_id as string, mimeType: args.mime_type as string });
          break;
        case 'gd_create_folder':
          result = await gd.createFolder({ name: args.name as string, parents: args.parents as string[] | undefined, description: args.description as string | undefined });
          break;
        case 'gd_empty_trash':
          if (!args.confirm) throw new Error('Set confirm=true to permanently delete all trashed files');
          result = await gd.emptyTrash();
          break;
        case 'gd_list_permissions':
          result = await gd.listPermissions({ fileId: args.file_id as string, pageSize: args.page_size as number | undefined, pageToken: args.page_token as string | undefined, fields: (args.fields || args._fields) as string | undefined });
          break;
        case 'gd_share_file':
          result = await gd.shareFile({ fileId: args.file_id as string, type: args.type as string, role: args.role as string, emailAddress: args.email_address as string | undefined, domain: args.domain as string | undefined, sendNotificationEmail: args.send_notification_email as boolean | undefined, emailMessage: args.email_message as string | undefined, transferOwnership: args.transfer_ownership as boolean | undefined });
          break;
        case 'gd_unshare_file':
          result = await gd.unshareFile({ fileId: args.file_id as string, permissionId: args.permission_id as string });
          break;
        case 'gd_list_comments':
          result = await gd.listComments({ fileId: args.file_id as string, pageSize: args.page_size as number | undefined, pageToken: args.page_token as string | undefined, startModifiedTime: args.start_modified_time as string | undefined, includeDeleted: args.include_deleted as boolean | undefined, fields: (args.fields || args._fields) as string | undefined });
          break;
        case 'gd_create_comment':
          result = await gd.createComment({ fileId: args.file_id as string, content: args.content as string });
          break;
        case 'gd_delete_comment':
          result = await gd.deleteComment({ fileId: args.file_id as string, commentId: args.comment_id as string });
          break;
        case 'gd_list_replies':
          result = await gd.listReplies({ fileId: args.file_id as string, commentId: args.comment_id as string, pageSize: args.page_size as number | undefined, pageToken: args.page_token as string | undefined, includeDeleted: args.include_deleted as boolean | undefined, fields: (args.fields || args._fields) as string | undefined });
          break;
        case 'gd_create_reply':
          result = await gd.createReply({ fileId: args.file_id as string, commentId: args.comment_id as string, content: args.content as string, action: args.action as string | undefined });
          break;
        case 'gd_list_drives':
          result = await gd.listDrives({ pageSize: args.page_size as number | undefined, pageToken: args.page_token as string | undefined, q: args.q as string | undefined });
          break;
        case 'gd_create_drive':
          result = await gd.createDrive({ name: args.name as string, themeId: args.theme_id as string | undefined });
          break;
        case 'gd_delete_drive':
          result = await gd.deleteDrive({ driveId: args.drive_id as string });
          break;
        case 'gd_list_revisions':
          result = await gd.listRevisions({ fileId: args.file_id as string, pageSize: args.page_size as number | undefined, pageToken: args.page_token as string | undefined, fields: (args.fields || args._fields) as string | undefined });
          break;
        case 'gd_about':
          result = await gd.about();
          break;
        default:
          return { content: [{ type: 'text' as const, text: `Unknown tool: ${toolName}` }], isError: true };
      }

      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }], isError: false };
    } catch (error) {
      return { content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
    }
  },
};
