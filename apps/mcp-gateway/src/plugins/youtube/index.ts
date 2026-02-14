/**
 * YouTube Data API v3 Plugin - MCP Gateway
 * Search videos, manage playlists, comments, and more
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { YouTubeClient } from './client';

export const youtubePlugin: MCPPlugin = {
  id: 'youtube',
  name: 'YouTube',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    return new YouTubeClient({
      clientId: config.client_id as string,
      clientSecret: config.client_secret as string,
      refreshToken: config.refresh_token as string,
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const yt = client as YouTubeClient;

    try {
      let result: unknown;

      switch (toolName) {
        // ========== Read Operations (10) ==========
        case 'youtube_search':
          result = await yt.search({
            q: args.q as string | undefined,
            type: args.type as string | undefined,
            channelId: args.channel_id as string | undefined,
            maxResults: args.max_results as number | undefined,
            pageToken: args.page_token as string | undefined,
            order: args.order as string | undefined,
            publishedAfter: args.published_after as string | undefined,
            publishedBefore: args.published_before as string | undefined,
            regionCode: args.region_code as string | undefined,
            relevanceLanguage: args.relevance_language as string | undefined,
            videoDuration: args.video_duration as string | undefined,
            eventType: args.event_type as string | undefined,
            part: args.part as string | undefined,
          });
          break;
        case 'youtube_get_video':
          result = await yt.getVideo({
            id: args.id as string,
            part: args.part as string | undefined,
          });
          break;
        case 'youtube_get_channel':
          result = await yt.getChannel({
            id: args.id as string | undefined,
            forUsername: args.for_username as string | undefined,
            part: args.part as string | undefined,
          });
          break;
        case 'youtube_list_playlists':
          result = await yt.listPlaylists({
            channelId: args.channel_id as string | undefined,
            id: args.id as string | undefined,
            maxResults: args.max_results as number | undefined,
            pageToken: args.page_token as string | undefined,
            part: args.part as string | undefined,
          });
          break;
        case 'youtube_list_playlist_items':
          result = await yt.listPlaylistItems({
            playlistId: args.playlist_id as string,
            maxResults: args.max_results as number | undefined,
            pageToken: args.page_token as string | undefined,
            videoId: args.video_id as string | undefined,
            part: args.part as string | undefined,
          });
          break;
        case 'youtube_list_comments':
          result = await yt.listComments({
            videoId: args.video_id as string | undefined,
            channelId: args.channel_id as string | undefined,
            id: args.id as string | undefined,
            maxResults: args.max_results as number | undefined,
            pageToken: args.page_token as string | undefined,
            order: args.order as string | undefined,
            textFormat: args.text_format as string | undefined,
            part: args.part as string | undefined,
          });
          break;
        case 'youtube_list_comment_replies':
          result = await yt.listCommentReplies({
            parentId: args.parent_id as string,
            maxResults: args.max_results as number | undefined,
            pageToken: args.page_token as string | undefined,
            textFormat: args.text_format as string | undefined,
            part: args.part as string | undefined,
          });
          break;
        case 'youtube_list_video_categories':
          result = await yt.listVideoCategories({
            regionCode: args.region_code as string | undefined,
            hl: args.hl as string | undefined,
            id: args.id as string | undefined,
            part: args.part as string | undefined,
          });
          break;
        case 'youtube_list_subscriptions':
          result = await yt.listSubscriptions({
            channelId: args.channel_id as string | undefined,
            id: args.id as string | undefined,
            maxResults: args.max_results as number | undefined,
            pageToken: args.page_token as string | undefined,
            order: args.order as string | undefined,
            part: args.part as string | undefined,
          });
          break;
        case 'youtube_get_popular_videos':
          result = await yt.getPopularVideos({
            regionCode: args.region_code as string | undefined,
            videoCategoryId: args.video_category_id as string | undefined,
            maxResults: args.max_results as number | undefined,
            pageToken: args.page_token as string | undefined,
            part: args.part as string | undefined,
          });
          break;

        // ========== Write Operations (10) ==========
        case 'youtube_post_comment':
          result = await yt.postComment(
            args.video_id as string,
            args.text as string,
            args.channel_id as string | undefined
          );
          break;
        case 'youtube_reply_comment':
          result = await yt.replyComment(
            args.parent_id as string,
            args.text as string
          );
          break;
        case 'youtube_update_comment':
          result = await yt.updateComment(
            args.comment_id as string,
            args.text as string
          );
          break;
        case 'youtube_delete_comment':
          result = await yt.deleteComment(args.comment_id as string);
          break;
        case 'youtube_create_playlist':
          result = await yt.createPlaylist(
            args.title as string,
            args.description as string | undefined,
            args.privacy_status as string | undefined,
            args.tags as string[] | undefined
          );
          break;
        case 'youtube_update_playlist':
          result = await yt.updatePlaylist(
            args.playlist_id as string,
            args.title as string | undefined,
            args.description as string | undefined,
            args.privacy_status as string | undefined
          );
          break;
        case 'youtube_delete_playlist':
          result = await yt.deletePlaylist(args.playlist_id as string);
          break;
        case 'youtube_add_playlist_item':
          result = await yt.addPlaylistItem(
            args.playlist_id as string,
            args.video_id as string,
            args.position as number | undefined
          );
          break;
        case 'youtube_remove_playlist_item':
          result = await yt.removePlaylistItem(args.playlist_item_id as string);
          break;
        case 'youtube_rate_video':
          result = await yt.rateVideo(
            args.video_id as string,
            args.rating as string
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
