/**
 * Facebook Pages API Plugin - MCP Gateway
 * Manages Facebook Pages via Graph API v21.0
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { FacebookClient } from './client';

export const facebookPagesPlugin: MCPPlugin = {
  id: 'facebook-pages',
  name: 'Facebook Pages',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    return new FacebookClient({
      pageAccessToken: config.page_access_token as string,
      pageId: config.page_id as string | undefined,
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const fb = client as FacebookClient;

    try {
      let result: unknown;

      switch (toolName) {
        // ========== Pages ==========
        case 'fb_list_pages':
          result = await fb.listPages();
          break;
        case 'fb_get_page':
          result = await fb.getPage(
            args.page_id as string,
            args.fields as string | undefined
          );
          break;
        case 'fb_get_page_token':
          result = await fb.getPageToken(args.page_id as string);
          break;

        // ========== Posts ==========
        case 'fb_list_posts':
          result = await fb.listPosts(
            args.page_id as string,
            args.limit as number | undefined,
            args.fields as string | undefined
          );
          break;
        case 'fb_get_post':
          result = await fb.getPost(
            args.post_id as string,
            args.fields as string | undefined
          );
          break;
        case 'fb_create_post':
          result = await fb.createPost(
            args.page_id as string,
            args.message as string | undefined,
            args.link as string | undefined,
            args.published as boolean | undefined
          );
          break;
        case 'fb_update_post':
          result = await fb.updatePost(
            args.post_id as string,
            args.message as string
          );
          break;
        case 'fb_delete_post':
          result = await fb.deletePost(args.post_id as string);
          break;
        case 'fb_schedule_post':
          result = await fb.schedulePost(
            args.page_id as string,
            args.message as string,
            args.scheduled_time as number,
            args.link as string | undefined
          );
          break;

        // ========== Comments ==========
        case 'fb_list_comments':
          result = await fb.listComments(
            args.object_id as string,
            args.limit as number | undefined
          );
          break;
        case 'fb_create_comment':
          result = await fb.createComment(
            args.object_id as string,
            args.message as string
          );
          break;
        case 'fb_reply_comment':
          result = await fb.replyComment(
            args.comment_id as string,
            args.message as string
          );
          break;
        case 'fb_delete_comment':
          result = await fb.deleteComment(args.comment_id as string);
          break;
        case 'fb_hide_comment':
          result = await fb.hideComment(
            args.comment_id as string,
            args.is_hidden as boolean
          );
          break;

        // ========== Photos ==========
        case 'fb_upload_photo':
          result = await fb.uploadPhoto(
            args.page_id as string,
            args.url as string,
            args.caption as string | undefined,
            args.published as boolean | undefined
          );
          break;
        case 'fb_list_photos':
          result = await fb.listPhotos(
            args.page_id as string,
            args.limit as number | undefined
          );
          break;
        case 'fb_delete_photo':
          result = await fb.deletePhoto(args.photo_id as string);
          break;

        // ========== Videos ==========
        case 'fb_upload_video':
          result = await fb.uploadVideo(
            args.page_id as string,
            args.file_url as string,
            args.title as string | undefined,
            args.description as string | undefined
          );
          break;
        case 'fb_list_videos':
          result = await fb.listVideos(
            args.page_id as string,
            args.limit as number | undefined
          );
          break;
        case 'fb_delete_video':
          result = await fb.deleteVideo(args.video_id as string);
          break;

        // ========== Insights ==========
        case 'fb_get_page_insights':
          result = await fb.getPageInsights(
            args.page_id as string,
            args.metric as string,
            args.period as string | undefined,
            args.since as string | undefined,
            args.until as string | undefined
          );
          break;
        case 'fb_get_post_insights':
          result = await fb.getPostInsights(
            args.post_id as string,
            args.metric as string
          );
          break;
        case 'fb_get_page_fans':
          result = await fb.getPageFans(args.page_id as string);
          break;
        case 'fb_get_page_views':
          result = await fb.getPageViews(
            args.page_id as string,
            args.period as string | undefined
          );
          break;

        // ========== Conversations ==========
        case 'fb_list_conversations':
          result = await fb.listConversations(
            args.page_id as string,
            args.limit as number | undefined
          );
          break;
        case 'fb_get_messages':
          result = await fb.getMessages(
            args.conversation_id as string,
            args.limit as number | undefined
          );
          break;
        case 'fb_send_message':
          result = await fb.sendMessage(
            args.page_id as string,
            args.recipient_id as string,
            args.text as string
          );
          break;
        case 'fb_send_typing':
          result = await fb.sendTyping(
            args.page_id as string,
            args.recipient_id as string,
            args.action as string | undefined
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
