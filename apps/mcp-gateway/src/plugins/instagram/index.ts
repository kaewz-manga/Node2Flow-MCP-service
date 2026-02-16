/**
 * Instagram API Plugin - MCP Gateway
 * Manages Instagram Business/Creator accounts via Graph API v21.0
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { InstagramClient } from './client';

export const instagramPlugin: MCPPlugin = {
  id: 'instagram',
  name: 'Instagram',
  version: '1.0.1',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    return new InstagramClient({
      accessToken: config.access_token as string,
      accountId: config.account_id as string | undefined,
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const ig = client as InstagramClient;

    try {
      let result: unknown;

      switch (toolName) {
        // ========== Account ==========
        case 'ig_get_account':
          result = await ig.getAccount(
            args.account_id as string | undefined,
            args.fields as string | undefined
          );
          break;
        case 'ig_get_account_insights':
          result = await ig.getAccountInsights(
            args.account_id as string | undefined,
            args.metric as string | undefined,
            args.period as string | undefined,
            args.since as string | undefined,
            args.until as string | undefined
          );
          break;
        case 'ig_list_media':
          result = await ig.listMedia(
            args.account_id as string | undefined,
            args.limit as number | undefined,
            args.fields as string | undefined
          );
          break;

        // ========== Publishing ==========
        case 'ig_publish_photo':
          result = await ig.publishPhoto(
            args.account_id as string | undefined,
            args.image_url as string,
            args.caption as string | undefined,
            args.location_id as string | undefined,
            args.user_tags as string | undefined
          );
          break;
        case 'ig_publish_carousel':
          result = await ig.publishCarousel(
            args.account_id as string | undefined,
            args.children as string[],
            args.caption as string | undefined,
            args.location_id as string | undefined
          );
          break;
        case 'ig_publish_reel':
          result = await ig.publishReel(
            args.account_id as string | undefined,
            args.video_url as string,
            args.caption as string | undefined,
            args.cover_url as string | undefined,
            args.share_to_feed as boolean | undefined,
            args.location_id as string | undefined
          );
          break;
        case 'ig_publish_story':
          result = await ig.publishStory(
            args.account_id as string | undefined,
            args.media_url as string,
            args.media_type as string
          );
          break;

        // ========== Media ==========
        case 'ig_get_media':
          result = await ig.getMedia(
            args.media_id as string,
            args.fields as string | undefined
          );
          break;
        case 'ig_get_media_insights':
          result = await ig.getMediaInsights(
            args.media_id as string,
            args.metric as string | undefined
          );
          break;
        case 'ig_get_children':
          result = await ig.getChildren(
            args.media_id as string,
            args.fields as string | undefined
          );
          break;

        // ========== Comments ==========
        case 'ig_list_comments':
          result = await ig.listComments(
            args.media_id as string,
            args.limit as number | undefined
          );
          break;
        case 'ig_get_comment':
          result = await ig.getComment(
            args.comment_id as string,
            args.fields as string | undefined
          );
          break;
        case 'ig_reply_comment':
          result = await ig.replyComment(
            args.comment_id as string,
            args.message as string
          );
          break;
        case 'ig_delete_comment':
          result = await ig.deleteComment(args.comment_id as string);
          break;
        case 'ig_hide_comment':
          result = await ig.hideComment(
            args.comment_id as string,
            args.hide as boolean
          );
          break;
        case 'ig_list_replies':
          result = await ig.listReplies(
            args.comment_id as string,
            args.limit as number | undefined
          );
          break;

        // ========== Stories ==========
        case 'ig_list_stories':
          result = await ig.listStories(args.account_id as string | undefined);
          break;
        case 'ig_get_story_insights':
          result = await ig.getStoryInsights(
            args.story_id as string,
            args.metric as string | undefined
          );
          break;

        // ========== Hashtags ==========
        case 'ig_search_hashtag':
          result = await ig.searchHashtag(
            args.account_id as string | undefined,
            args.query as string
          );
          break;
        case 'ig_get_hashtag_recent':
          result = await ig.getHashtagRecent(
            args.hashtag_id as string,
            args.account_id as string | undefined,
            args.fields as string | undefined
          );
          break;
        case 'ig_get_hashtag_top':
          result = await ig.getHashtagTop(
            args.hashtag_id as string,
            args.account_id as string | undefined,
            args.fields as string | undefined
          );
          break;

        // ========== Discovery ==========
        case 'ig_discover_user':
          result = await ig.discoverUser(
            args.account_id as string | undefined,
            args.username as string,
            args.fields as string | undefined
          );
          break;

        // ========== Content Publishing Limit ==========
        case 'ig_get_content_publishing_limit':
          result = await ig.getContentPublishingLimit(
            args.account_id as string | undefined,
            args.fields as string | undefined
          );
          break;

        // ========== Mentions ==========
        case 'ig_list_tags':
          result = await ig.listTags(
            args.account_id as string | undefined,
            args.fields as string | undefined
          );
          break;
        case 'ig_get_mentioned_media':
          result = await ig.getMentionedMedia(
            args.media_id as string,
            args.fields as string | undefined
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
