/**
 * YouTube Data API v3 - MCP Tool Definitions (20 tools)
 * Ported from @node2flow/youtube-mcp (community)
 */

import type { MCPToolDefinition } from '../../types';

export const TOOLS: MCPToolDefinition[] = [
  // ========== Read Operations (10) ==========
  {
    name: 'youtube_search',
    description:
      'Search YouTube for videos, channels, or playlists. Costs 100 quota units per request. Use filters to narrow results. Returns up to 50 results per page with pagination support.',
    annotations: {
      title: 'Search YouTube',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        q: { type: 'string', description: 'Search query string' },
        type: { type: 'string', description: 'Resource type filter: "video", "channel", "playlist", or comma-separated (default: "video,channel,playlist")' },
        channel_id: { type: 'string', description: 'Filter results to a specific channel ID' },
        max_results: { type: 'number', description: 'Maximum results per page (1-50, default: 5)' },
        page_token: { type: 'string', description: 'Pagination token from previous response' },
        order: { type: 'string', description: 'Sort order: "date", "rating", "relevance", "title", "videoCount", "viewCount" (default: "relevance")' },
        published_after: { type: 'string', description: 'Filter: published after this date (RFC3339, e.g. "2024-01-01T00:00:00Z")' },
        published_before: { type: 'string', description: 'Filter: published before this date (RFC3339)' },
        region_code: { type: 'string', description: 'ISO 3166-1 alpha-2 country code (e.g. "US", "TH")' },
        relevance_language: { type: 'string', description: 'ISO 639-1 language code for relevance (e.g. "en", "th")' },
        video_duration: { type: 'string', description: 'Video duration filter: "any", "long" (>20min), "medium" (4-20min), "short" (<4min)' },
        event_type: { type: 'string', description: 'Event type filter: "completed", "live", "upcoming"' },
        part: { type: 'string', description: 'Resource parts to include (default: "snippet")' },
      },
    },
  },
  {
    name: 'youtube_get_video',
    description:
      'Get detailed information about one or more videos by ID. Returns snippet (title, description, thumbnails), statistics (views, likes, comments), content details (duration, definition), and status. Costs 1 quota unit.',
    annotations: {
      title: 'Get Video',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Video ID or comma-separated IDs (up to 50, e.g. "dQw4w9WgXcQ" or "id1,id2,id3")' },
        part: { type: 'string', description: 'Resource parts: "snippet", "contentDetails", "statistics", "status", "player" (default: "snippet,contentDetails,statistics")' },
      },
      required: ['id'],
    },
  },
  {
    name: 'youtube_get_channel',
    description:
      'Get channel information by ID or username. Returns snippet (name, description, avatar), statistics (subscribers, views, video count), and branding settings. Costs 1 quota unit.',
    annotations: {
      title: 'Get Channel',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Channel ID (e.g. "UC...") or comma-separated IDs (up to 50)' },
        for_username: { type: 'string', description: 'Channel username (alternative to ID)' },
        part: { type: 'string', description: 'Resource parts: "snippet", "contentDetails", "statistics", "brandingSettings" (default: "snippet,contentDetails,statistics")' },
      },
    },
  },
  {
    name: 'youtube_list_playlists',
    description:
      'List playlists by channel ID or playlist IDs. Returns playlist title, description, item count, and privacy status. Costs 1 quota unit.',
    annotations: {
      title: 'List Playlists',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        channel_id: { type: 'string', description: 'Channel ID to list playlists for' },
        id: { type: 'string', description: 'Playlist ID(s), comma-separated (up to 50)' },
        max_results: { type: 'number', description: 'Maximum results per page (1-50, default: 5)' },
        page_token: { type: 'string', description: 'Pagination token from previous response' },
        part: { type: 'string', description: 'Resource parts (default: "snippet,contentDetails,status")' },
      },
    },
  },
  {
    name: 'youtube_list_playlist_items',
    description:
      'List videos in a playlist. Returns video titles, descriptions, positions, and video IDs. Costs 1 quota unit.',
    annotations: {
      title: 'List Playlist Items',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        playlist_id: { type: 'string', description: 'Playlist ID (e.g. "PLxxxxxxx")' },
        max_results: { type: 'number', description: 'Maximum results per page (1-50, default: 5)' },
        page_token: { type: 'string', description: 'Pagination token from previous response' },
        video_id: { type: 'string', description: 'Filter to a specific video in the playlist' },
        part: { type: 'string', description: 'Resource parts (default: "snippet,contentDetails,status")' },
      },
      required: ['playlist_id'],
    },
  },
  {
    name: 'youtube_list_comments',
    description:
      'List top-level comment threads on a video or channel. Returns comment text, author, likes, reply count, and optionally the first few replies. Costs 1 quota unit.',
    annotations: {
      title: 'List Comments',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        video_id: { type: 'string', description: 'Video ID to list comments for' },
        channel_id: { type: 'string', description: 'Channel ID to list all related comments' },
        id: { type: 'string', description: 'Comment thread ID(s), comma-separated' },
        max_results: { type: 'number', description: 'Maximum results per page (1-100, default: 20)' },
        page_token: { type: 'string', description: 'Pagination token from previous response' },
        order: { type: 'string', description: 'Sort order: "time" or "relevance" (default: "time")' },
        text_format: { type: 'string', description: 'Comment text format: "html" or "plainText" (default: "html")' },
        part: { type: 'string', description: 'Resource parts (default: "snippet,replies")' },
      },
    },
  },
  {
    name: 'youtube_list_comment_replies',
    description:
      'List replies to a specific comment. Provide the parent comment ID to get all replies. Costs 1 quota unit.',
    annotations: {
      title: 'List Comment Replies',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        parent_id: { type: 'string', description: 'Parent comment ID to list replies for' },
        max_results: { type: 'number', description: 'Maximum results per page (1-100, default: 20)' },
        page_token: { type: 'string', description: 'Pagination token from previous response' },
        text_format: { type: 'string', description: 'Comment text format: "html" or "plainText" (default: "html")' },
        part: { type: 'string', description: 'Resource parts (default: "snippet")' },
      },
      required: ['parent_id'],
    },
  },
  {
    name: 'youtube_list_video_categories',
    description:
      'List available video categories for a region. Returns category ID, title, and whether it is assignable. Costs 1 quota unit.',
    annotations: {
      title: 'List Video Categories',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        region_code: { type: 'string', description: 'ISO 3166-1 alpha-2 country code (e.g. "US", "TH")' },
        hl: { type: 'string', description: 'UI language (BCP-47, e.g. "en_US", "th")' },
        id: { type: 'string', description: 'Category ID(s), comma-separated' },
        part: { type: 'string', description: 'Resource parts (default: "snippet")' },
      },
    },
  },
  {
    name: 'youtube_list_subscriptions',
    description:
      'List subscriptions for a channel. Returns subscribed channel names, descriptions, and item counts. Costs 1 quota unit.',
    annotations: {
      title: 'List Subscriptions',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        channel_id: { type: 'string', description: 'Channel ID to list subscriptions for' },
        id: { type: 'string', description: 'Subscription ID(s), comma-separated (up to 50)' },
        max_results: { type: 'number', description: 'Maximum results per page (1-50, default: 5)' },
        page_token: { type: 'string', description: 'Pagination token from previous response' },
        order: { type: 'string', description: 'Sort order: "alphabetical", "relevance", "unread" (default: "relevance")' },
        part: { type: 'string', description: 'Resource parts (default: "snippet,contentDetails")' },
      },
    },
  },
  {
    name: 'youtube_get_popular_videos',
    description:
      'Get trending/most popular videos for a region. Optionally filter by video category. Returns video details with statistics. Costs 1 quota unit.',
    annotations: {
      title: 'Get Popular Videos',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        region_code: { type: 'string', description: 'ISO 3166-1 alpha-2 country code (e.g. "US", "TH")' },
        video_category_id: { type: 'string', description: 'Video category ID to filter (use youtube_list_video_categories to find IDs)' },
        max_results: { type: 'number', description: 'Maximum results per page (1-50, default: 5)' },
        page_token: { type: 'string', description: 'Pagination token from previous response' },
        part: { type: 'string', description: 'Resource parts (default: "snippet,contentDetails,statistics")' },
      },
    },
  },

  // ========== Write Operations (10) ==========
  {
    name: 'youtube_post_comment',
    description: 'Post a new top-level comment on a video. Costs 50 quota units.',
    annotations: { title: 'Post Comment', readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        video_id: { type: 'string', description: 'Video ID to comment on' },
        text: { type: 'string', description: 'Comment text' },
        channel_id: { type: 'string', description: 'Channel ID of the comment author (optional)' },
      },
      required: ['video_id', 'text'],
    },
  },
  {
    name: 'youtube_reply_comment',
    description: 'Reply to an existing comment. Costs 50 quota units.',
    annotations: { title: 'Reply to Comment', readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        parent_id: { type: 'string', description: 'Parent comment ID to reply to' },
        text: { type: 'string', description: 'Reply text' },
      },
      required: ['parent_id', 'text'],
    },
  },
  {
    name: 'youtube_update_comment',
    description: 'Edit an existing comment. Costs 50 quota units.',
    annotations: { title: 'Update Comment', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: {
      type: 'object',
      properties: {
        comment_id: { type: 'string', description: 'Comment ID to edit' },
        text: { type: 'string', description: 'New comment text' },
      },
      required: ['comment_id', 'text'],
    },
  },
  {
    name: 'youtube_delete_comment',
    description: 'Delete a comment. This action is irreversible. Costs 50 quota units.',
    annotations: { title: 'Delete Comment', readOnlyHint: false, destructiveHint: true, openWorldHint: false },
    inputSchema: {
      type: 'object',
      properties: {
        comment_id: { type: 'string', description: 'Comment ID to delete' },
      },
      required: ['comment_id'],
    },
  },
  {
    name: 'youtube_create_playlist',
    description: 'Create a new playlist. Costs 50 quota units.',
    annotations: { title: 'Create Playlist', readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Playlist title' },
        description: { type: 'string', description: 'Playlist description' },
        privacy_status: { type: 'string', description: 'Privacy: "public", "unlisted", "private" (default: "private")' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Playlist tags' },
      },
      required: ['title'],
    },
  },
  {
    name: 'youtube_update_playlist',
    description: 'Update a playlist title, description, or privacy status. Costs 50 quota units.',
    annotations: { title: 'Update Playlist', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: {
      type: 'object',
      properties: {
        playlist_id: { type: 'string', description: 'Playlist ID to update' },
        title: { type: 'string', description: 'New playlist title' },
        description: { type: 'string', description: 'New playlist description' },
        privacy_status: { type: 'string', description: 'New privacy: "public", "unlisted", "private"' },
      },
      required: ['playlist_id'],
    },
  },
  {
    name: 'youtube_delete_playlist',
    description: 'Delete a playlist. This action is irreversible. Costs 50 quota units.',
    annotations: { title: 'Delete Playlist', readOnlyHint: false, destructiveHint: true, openWorldHint: false },
    inputSchema: {
      type: 'object',
      properties: {
        playlist_id: { type: 'string', description: 'Playlist ID to delete' },
      },
      required: ['playlist_id'],
    },
  },
  {
    name: 'youtube_add_playlist_item',
    description: 'Add a video to a playlist. Optionally specify position (0-based). Costs 50 quota units.',
    annotations: { title: 'Add to Playlist', readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    inputSchema: {
      type: 'object',
      properties: {
        playlist_id: { type: 'string', description: 'Playlist ID to add the video to' },
        video_id: { type: 'string', description: 'Video ID to add' },
        position: { type: 'number', description: 'Position in the playlist (0-based, optional)' },
      },
      required: ['playlist_id', 'video_id'],
    },
  },
  {
    name: 'youtube_remove_playlist_item',
    description: 'Remove a video from a playlist by playlist item ID (not video ID). Use youtube_list_playlist_items to find the item ID. Costs 50 quota units.',
    annotations: { title: 'Remove from Playlist', readOnlyHint: false, destructiveHint: true, openWorldHint: false },
    inputSchema: {
      type: 'object',
      properties: {
        playlist_item_id: { type: 'string', description: 'Playlist item ID to remove (use youtube_list_playlist_items to find it)' },
      },
      required: ['playlist_item_id'],
    },
  },
  {
    name: 'youtube_rate_video',
    description: 'Like, dislike, or remove rating from a video. Costs 50 quota units.',
    annotations: { title: 'Rate Video', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: {
      type: 'object',
      properties: {
        video_id: { type: 'string', description: 'Video ID to rate' },
        rating: { type: 'string', description: 'Rating: "like", "dislike", or "none" (to remove rating)' },
      },
      required: ['video_id', 'rating'],
    },
  },
];
