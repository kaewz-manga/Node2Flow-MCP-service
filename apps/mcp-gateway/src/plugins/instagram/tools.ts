/**
 * Instagram API - MCP Tool Definitions (25 tools)
 * Instagram Graph API v21.0 for account management, publishing, media, comments, stories, hashtags, and more.
 */

import type { MCPToolDefinition } from '../../types';

export const TOOLS: MCPToolDefinition[] = [
  // ========== Account (3) ==========
  {
    name: 'ig_get_account',
    description:
      'Get Instagram Business/Creator account profile information including username, biography, follower/following counts, and media count.',
    annotations: {
      title: 'Get Account',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        account_id: {
          type: 'string',
          description: 'Instagram Business Account ID (uses configured default if omitted)',
        },
        fields: {
          type: 'string',
          description: 'Comma-separated fields (e.g. "id,name,username,biography,followers_count,media_count")',
        },
      },
    },
  },
  {
    name: 'ig_get_account_insights',
    description:
      'Get analytics for an Instagram account. Metrics include impressions, reach, profile_views, follower_count, and more.',
    annotations: {
      title: 'Get Account Insights',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        account_id: {
          type: 'string',
          description: 'Instagram Business Account ID (uses configured default if omitted)',
        },
        metric: {
          type: 'string',
          description: 'Comma-separated metrics (e.g. "impressions,reach,profile_views"). Defaults to impressions,reach,profile_views',
        },
        period: {
          type: 'string',
          description: 'Aggregation period: "day", "week", "days_28", or "lifetime"',
        },
        since: {
          type: 'string',
          description: 'Start date (ISO 8601 or Unix timestamp)',
        },
        until: {
          type: 'string',
          description: 'End date (ISO 8601 or Unix timestamp)',
        },
      },
    },
  },
  {
    name: 'ig_list_media',
    description:
      'List recent media (posts, reels, carousels) from an Instagram account.',
    annotations: {
      title: 'List Media',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        account_id: {
          type: 'string',
          description: 'Instagram Business Account ID (uses configured default if omitted)',
        },
        limit: {
          type: 'number',
          description: 'Number of media items to return (default 25)',
        },
        fields: {
          type: 'string',
          description: 'Comma-separated fields to return for each media item',
        },
      },
    },
  },

  // ========== Publishing (4) ==========
  {
    name: 'ig_publish_photo',
    description:
      'Publish a photo to Instagram. Provide a public image URL and optional caption. Uses the two-step container + publish flow.',
    annotations: {
      title: 'Publish Photo',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        account_id: {
          type: 'string',
          description: 'Instagram Business Account ID (uses configured default if omitted)',
        },
        image_url: {
          type: 'string',
          description: 'Public URL of the image to publish (JPEG recommended)',
        },
        caption: {
          type: 'string',
          description: 'Post caption text (max 2200 characters, 30 hashtags)',
        },
        location_id: {
          type: 'string',
          description: 'Facebook Place ID for location tagging',
        },
        user_tags: {
          type: 'string',
          description: 'JSON array of user tags: [{"username":"user","x":0.5,"y":0.5}]',
        },
      },
      required: ['image_url'],
    },
  },
  {
    name: 'ig_publish_carousel',
    description:
      'Publish a carousel (multi-image/video) post to Instagram. Provide an array of media container IDs.',
    annotations: {
      title: 'Publish Carousel',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        account_id: {
          type: 'string',
          description: 'Instagram Business Account ID (uses configured default if omitted)',
        },
        children: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of media container IDs (2-10 items)',
        },
        caption: {
          type: 'string',
          description: 'Carousel caption text',
        },
        location_id: {
          type: 'string',
          description: 'Facebook Place ID for location tagging',
        },
      },
      required: ['children'],
    },
  },
  {
    name: 'ig_publish_reel',
    description:
      'Publish a Reel (short video) to Instagram. Provide a public video URL.',
    annotations: {
      title: 'Publish Reel',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        account_id: {
          type: 'string',
          description: 'Instagram Business Account ID (uses configured default if omitted)',
        },
        video_url: {
          type: 'string',
          description: 'Public URL of the video (MP4, max 15 minutes)',
        },
        caption: {
          type: 'string',
          description: 'Reel caption text',
        },
        cover_url: {
          type: 'string',
          description: 'Public URL of the cover image',
        },
        share_to_feed: {
          type: 'boolean',
          description: 'Also show in the main feed (default true)',
        },
        location_id: {
          type: 'string',
          description: 'Facebook Place ID for location tagging',
        },
      },
      required: ['video_url'],
    },
  },
  {
    name: 'ig_publish_story',
    description:
      'Publish a Story to Instagram. Provide a public image or video URL.',
    annotations: {
      title: 'Publish Story',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        account_id: {
          type: 'string',
          description: 'Instagram Business Account ID (uses configured default if omitted)',
        },
        media_url: {
          type: 'string',
          description: 'Public URL of the image or video',
        },
        media_type: {
          type: 'string',
          description: 'Media type: "IMAGE" or "VIDEO"',
        },
      },
      required: ['media_url', 'media_type'],
    },
  },

  // ========== Media (3) ==========
  {
    name: 'ig_get_media',
    description:
      'Get details of a single Instagram media item (post, reel, carousel) by ID.',
    annotations: {
      title: 'Get Media',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        media_id: {
          type: 'string',
          description: 'Instagram media ID',
        },
        fields: {
          type: 'string',
          description: 'Comma-separated fields to return',
        },
      },
      required: ['media_id'],
    },
  },
  {
    name: 'ig_get_media_insights',
    description:
      'Get analytics for a specific Instagram media item. Metrics include impressions, reach, engagement, saved.',
    annotations: {
      title: 'Get Media Insights',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        media_id: {
          type: 'string',
          description: 'Instagram media ID',
        },
        metric: {
          type: 'string',
          description: 'Comma-separated metrics (e.g. "impressions,reach,engagement,saved")',
        },
      },
      required: ['media_id'],
    },
  },
  {
    name: 'ig_get_children',
    description:
      'Get child media items of a carousel post. Returns individual images/videos in the carousel.',
    annotations: {
      title: 'Get Carousel Children',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        media_id: {
          type: 'string',
          description: 'Carousel media ID',
        },
        fields: {
          type: 'string',
          description: 'Comma-separated fields to return for each child',
        },
      },
      required: ['media_id'],
    },
  },

  // ========== Comments (6) ==========
  {
    name: 'ig_list_comments',
    description:
      'List comments on an Instagram media item. Returns comment id, text, username, and timestamp.',
    annotations: {
      title: 'List Comments',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        media_id: {
          type: 'string',
          description: 'Instagram media ID',
        },
        limit: {
          type: 'number',
          description: 'Number of comments to return (default 25)',
        },
      },
      required: ['media_id'],
    },
  },
  {
    name: 'ig_get_comment',
    description:
      'Get details of a single Instagram comment by ID.',
    annotations: {
      title: 'Get Comment',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        comment_id: {
          type: 'string',
          description: 'Instagram comment ID',
        },
        fields: {
          type: 'string',
          description: 'Comma-separated fields to return',
        },
      },
      required: ['comment_id'],
    },
  },
  {
    name: 'ig_reply_comment',
    description:
      'Reply to a comment on an Instagram post.',
    annotations: {
      title: 'Reply to Comment',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        comment_id: {
          type: 'string',
          description: 'Comment ID to reply to',
        },
        message: {
          type: 'string',
          description: 'Reply text',
        },
      },
      required: ['comment_id', 'message'],
    },
  },
  {
    name: 'ig_delete_comment',
    description:
      'Permanently delete a comment on an Instagram post. This action cannot be undone.',
    annotations: {
      title: 'Delete Comment',
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        comment_id: {
          type: 'string',
          description: 'Comment ID to delete',
        },
      },
      required: ['comment_id'],
    },
  },
  {
    name: 'ig_hide_comment',
    description:
      'Hide or unhide a comment on an Instagram post. Hidden comments are only visible to the commenter.',
    annotations: {
      title: 'Hide Comment',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        comment_id: {
          type: 'string',
          description: 'Comment ID to hide or unhide',
        },
        hide: {
          type: 'boolean',
          description: 'Set to true to hide, false to unhide',
        },
      },
      required: ['comment_id', 'hide'],
    },
  },
  {
    name: 'ig_list_replies',
    description:
      'List replies to a specific comment on an Instagram post.',
    annotations: {
      title: 'List Replies',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        comment_id: {
          type: 'string',
          description: 'Comment ID to list replies for',
        },
        limit: {
          type: 'number',
          description: 'Number of replies to return (default 25)',
        },
      },
      required: ['comment_id'],
    },
  },

  // ========== Stories (2) ==========
  {
    name: 'ig_list_stories',
    description:
      'List current active Stories for an Instagram account. Stories expire after 24 hours.',
    annotations: {
      title: 'List Stories',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        account_id: {
          type: 'string',
          description: 'Instagram Business Account ID (uses configured default if omitted)',
        },
      },
    },
  },
  {
    name: 'ig_get_story_insights',
    description:
      'Get analytics for a specific Instagram Story. Metrics include impressions, reach, and replies.',
    annotations: {
      title: 'Get Story Insights',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        story_id: {
          type: 'string',
          description: 'Story media ID',
        },
        metric: {
          type: 'string',
          description: 'Comma-separated metrics (e.g. "impressions,reach,replies")',
        },
      },
      required: ['story_id'],
    },
  },

  // ========== Hashtags (3) ==========
  {
    name: 'ig_search_hashtag',
    description:
      'Search for a hashtag ID by name. Returns the hashtag ID needed for other hashtag endpoints.',
    annotations: {
      title: 'Search Hashtag',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        account_id: {
          type: 'string',
          description: 'Instagram Business Account ID (uses configured default if omitted)',
        },
        query: {
          type: 'string',
          description: 'Hashtag name to search for (without # symbol)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'ig_get_hashtag_recent',
    description:
      'Get recent media for a hashtag. Requires the hashtag ID from ig_search_hashtag.',
    annotations: {
      title: 'Get Hashtag Recent Media',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        hashtag_id: {
          type: 'string',
          description: 'Hashtag ID from ig_search_hashtag',
        },
        account_id: {
          type: 'string',
          description: 'Instagram Business Account ID (uses configured default if omitted)',
        },
        fields: {
          type: 'string',
          description: 'Comma-separated fields to return',
        },
      },
      required: ['hashtag_id'],
    },
  },
  {
    name: 'ig_get_hashtag_top',
    description:
      'Get top (most popular) media for a hashtag. Requires the hashtag ID from ig_search_hashtag.',
    annotations: {
      title: 'Get Hashtag Top Media',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        hashtag_id: {
          type: 'string',
          description: 'Hashtag ID from ig_search_hashtag',
        },
        account_id: {
          type: 'string',
          description: 'Instagram Business Account ID (uses configured default if omitted)',
        },
        fields: {
          type: 'string',
          description: 'Comma-separated fields to return',
        },
      },
      required: ['hashtag_id'],
    },
  },

  // ========== Discovery (1) ==========
  {
    name: 'ig_discover_user',
    description:
      'Discover another Instagram Business/Creator account by username. Returns public profile information.',
    annotations: {
      title: 'Discover User',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        account_id: {
          type: 'string',
          description: 'Your Instagram Business Account ID (uses configured default if omitted)',
        },
        username: {
          type: 'string',
          description: 'Instagram username to discover (without @ symbol)',
        },
        fields: {
          type: 'string',
          description: 'Comma-separated fields to return',
        },
      },
      required: ['username'],
    },
  },

  // ========== Content Publishing Limit (1) ==========
  {
    name: 'ig_get_content_publishing_limit',
    description:
      'Get the current content publishing rate limit status for an Instagram account. Shows quota usage and configuration.',
    annotations: {
      title: 'Get Publishing Limit',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        account_id: {
          type: 'string',
          description: 'Instagram Business Account ID (uses configured default if omitted)',
        },
        fields: {
          type: 'string',
          description: 'Comma-separated fields (e.g. "config,quota_usage")',
        },
      },
    },
  },

  // ========== Mentions (2) ==========
  {
    name: 'ig_list_tags',
    description:
      'List media where the Instagram account has been tagged by other users.',
    annotations: {
      title: 'List Tagged Media',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        account_id: {
          type: 'string',
          description: 'Instagram Business Account ID (uses configured default if omitted)',
        },
        fields: {
          type: 'string',
          description: 'Comma-separated fields to return',
        },
      },
    },
  },
  {
    name: 'ig_get_mentioned_media',
    description:
      'Get details of a media item where the account was mentioned or tagged.',
    annotations: {
      title: 'Get Mentioned Media',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        media_id: {
          type: 'string',
          description: 'Media ID of the mentioned/tagged post',
        },
        fields: {
          type: 'string',
          description: 'Comma-separated fields to return',
        },
      },
      required: ['media_id'],
    },
  },
];
