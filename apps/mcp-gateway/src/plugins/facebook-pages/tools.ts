/**
 * Facebook Pages API - MCP Tool Definitions (28 tools)
 * Facebook Graph API v21.0 for Page management, posts, comments, media, insights, and Messenger.
 */

import type { MCPToolDefinition } from '../../types';

export const TOOLS: MCPToolDefinition[] = [
  // ========== Pages (3) ==========
  {
    name: 'fb_list_pages',
    description:
      'List all Facebook Pages the user manages. Returns page id, name, category, and access tokens.',
    annotations: {
      title: 'List Pages',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'fb_get_page',
    description:
      'Get detailed information about a Facebook Page including name, category, fan count, link, and picture.',
    annotations: {
      title: 'Get Page',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: {
          type: 'string',
          description: 'Facebook Page ID',
        },
        fields: {
          type: 'string',
          description: 'Comma-separated list of fields to return (e.g. "id,name,category,fan_count,link,picture")',
        },
      },
      required: ['page_id'],
    },
  },
  {
    name: 'fb_get_page_token',
    description:
      'Get the Page Access Token for a specific page. Requires the user to be an admin of the page.',
    annotations: {
      title: 'Get Page Token',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: {
          type: 'string',
          description: 'Facebook Page ID',
        },
      },
      required: ['page_id'],
    },
  },

  // ========== Posts (6) ==========
  {
    name: 'fb_list_posts',
    description:
      'List posts from a Facebook Page feed. Returns post id, message, created_time, and story.',
    annotations: {
      title: 'List Posts',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: {
          type: 'string',
          description: 'Facebook Page ID',
        },
        limit: {
          type: 'number',
          description: 'Number of posts to return (default 25, max 100)',
        },
        fields: {
          type: 'string',
          description: 'Comma-separated list of fields to return',
        },
      },
      required: ['page_id'],
    },
  },
  {
    name: 'fb_get_post',
    description:
      'Get details of a single Facebook post by ID. Post ID format is pageId_postId.',
    annotations: {
      title: 'Get Post',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        post_id: {
          type: 'string',
          description: 'Post ID in format pageId_postId',
        },
        fields: {
          type: 'string',
          description: 'Comma-separated list of fields to return',
        },
      },
      required: ['post_id'],
    },
  },
  {
    name: 'fb_create_post',
    description:
      'Create a new post on a Facebook Page. Provide a message, a link, or both.',
    annotations: {
      title: 'Create Post',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: {
          type: 'string',
          description: 'Facebook Page ID',
        },
        message: {
          type: 'string',
          description: 'Post text content',
        },
        link: {
          type: 'string',
          description: 'URL to share in the post',
        },
        published: {
          type: 'boolean',
          description: 'Whether to publish immediately (default true)',
        },
      },
      required: ['page_id'],
    },
  },
  {
    name: 'fb_update_post',
    description:
      'Update the text message of an existing Facebook post. Only the message field can be updated.',
    annotations: {
      title: 'Update Post',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        post_id: {
          type: 'string',
          description: 'Post ID to update',
        },
        message: {
          type: 'string',
          description: 'New message text for the post',
        },
      },
      required: ['post_id', 'message'],
    },
  },
  {
    name: 'fb_delete_post',
    description:
      'Permanently delete a Facebook post. This action cannot be undone.',
    annotations: {
      title: 'Delete Post',
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        post_id: {
          type: 'string',
          description: 'Post ID to delete',
        },
      },
      required: ['post_id'],
    },
  },
  {
    name: 'fb_schedule_post',
    description:
      'Schedule a post for future publication on a Facebook Page. Scheduled time must be between 10 minutes and 75 days from now.',
    annotations: {
      title: 'Schedule Post',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: {
          type: 'string',
          description: 'Facebook Page ID',
        },
        message: {
          type: 'string',
          description: 'Post text content',
        },
        scheduled_time: {
          type: 'number',
          description: 'Unix timestamp for publication (must be 10 minutes to 75 days from now)',
        },
        link: {
          type: 'string',
          description: 'URL to share in the post',
        },
      },
      required: ['page_id', 'message', 'scheduled_time'],
    },
  },

  // ========== Comments (5) ==========
  {
    name: 'fb_list_comments',
    description:
      'List comments on a Facebook post or object. Returns comment id, message, from, and created_time.',
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
        object_id: {
          type: 'string',
          description: 'Post or object ID to list comments for',
        },
        limit: {
          type: 'number',
          description: 'Number of comments to return (default 25)',
        },
      },
      required: ['object_id'],
    },
  },
  {
    name: 'fb_create_comment',
    description:
      'Add a comment to a Facebook post or object.',
    annotations: {
      title: 'Create Comment',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        object_id: {
          type: 'string',
          description: 'Post or object ID to comment on',
        },
        message: {
          type: 'string',
          description: 'Comment text',
        },
      },
      required: ['object_id', 'message'],
    },
  },
  {
    name: 'fb_reply_comment',
    description:
      'Reply to an existing comment on a Facebook post.',
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
    name: 'fb_delete_comment',
    description:
      'Permanently delete a comment from a Facebook post. This action cannot be undone.',
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
    name: 'fb_hide_comment',
    description:
      'Hide or unhide a comment on a Facebook post. Hidden comments are only visible to the commenter and the Page.',
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
        is_hidden: {
          type: 'boolean',
          description: 'Set to true to hide, false to unhide',
        },
      },
      required: ['comment_id', 'is_hidden'],
    },
  },

  // ========== Photos (3) ==========
  {
    name: 'fb_upload_photo',
    description:
      'Upload a photo to a Facebook Page from a public URL.',
    annotations: {
      title: 'Upload Photo',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: {
          type: 'string',
          description: 'Facebook Page ID',
        },
        url: {
          type: 'string',
          description: 'Public URL of the photo to upload',
        },
        caption: {
          type: 'string',
          description: 'Photo caption text',
        },
        published: {
          type: 'boolean',
          description: 'Whether to publish immediately (default true)',
        },
      },
      required: ['page_id', 'url'],
    },
  },
  {
    name: 'fb_list_photos',
    description:
      'List photos uploaded to a Facebook Page.',
    annotations: {
      title: 'List Photos',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: {
          type: 'string',
          description: 'Facebook Page ID',
        },
        limit: {
          type: 'number',
          description: 'Number of photos to return (default 25)',
        },
      },
      required: ['page_id'],
    },
  },
  {
    name: 'fb_delete_photo',
    description:
      'Permanently delete a photo from a Facebook Page. This action cannot be undone.',
    annotations: {
      title: 'Delete Photo',
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        photo_id: {
          type: 'string',
          description: 'Photo ID to delete',
        },
      },
      required: ['photo_id'],
    },
  },

  // ========== Videos (3) ==========
  {
    name: 'fb_upload_video',
    description:
      'Upload a video to a Facebook Page from a public URL.',
    annotations: {
      title: 'Upload Video',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: {
          type: 'string',
          description: 'Facebook Page ID',
        },
        file_url: {
          type: 'string',
          description: 'Public URL of the video to upload',
        },
        title: {
          type: 'string',
          description: 'Video title',
        },
        description: {
          type: 'string',
          description: 'Video description',
        },
      },
      required: ['page_id', 'file_url'],
    },
  },
  {
    name: 'fb_list_videos',
    description:
      'List videos uploaded to a Facebook Page.',
    annotations: {
      title: 'List Videos',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: {
          type: 'string',
          description: 'Facebook Page ID',
        },
        limit: {
          type: 'number',
          description: 'Number of videos to return (default 25)',
        },
      },
      required: ['page_id'],
    },
  },
  {
    name: 'fb_delete_video',
    description:
      'Permanently delete a video from a Facebook Page. This action cannot be undone.',
    annotations: {
      title: 'Delete Video',
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        video_id: {
          type: 'string',
          description: 'Video ID to delete',
        },
      },
      required: ['video_id'],
    },
  },

  // ========== Insights (4) ==========
  {
    name: 'fb_get_page_insights',
    description:
      'Get analytics metrics for a Facebook Page. Supports metrics like page_impressions, page_engaged_users, page_views_total, etc.',
    annotations: {
      title: 'Get Page Insights',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: {
          type: 'string',
          description: 'Facebook Page ID',
        },
        metric: {
          type: 'string',
          description: 'Comma-separated metric names (e.g. "page_impressions,page_engaged_users")',
        },
        period: {
          type: 'string',
          description: 'Aggregation period: "day", "week", or "days_28"',
        },
        since: {
          type: 'string',
          description: 'Start date (ISO 8601 or Unix timestamp)',
        },
        until: {
          type: 'string',
          description: 'End date (ISO 8601 or Unix timestamp, max 90 days range)',
        },
      },
      required: ['page_id', 'metric'],
    },
  },
  {
    name: 'fb_get_post_insights',
    description:
      'Get analytics for a specific Facebook post. Supports metrics like post_impressions, post_engaged_users, post_clicks.',
    annotations: {
      title: 'Get Post Insights',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        post_id: {
          type: 'string',
          description: 'Post ID to get insights for',
        },
        metric: {
          type: 'string',
          description: 'Comma-separated metric names (e.g. "post_impressions,post_engaged_users")',
        },
      },
      required: ['post_id', 'metric'],
    },
  },
  {
    name: 'fb_get_page_fans',
    description:
      'Get total fan (follower) count for a Facebook Page over time using the page_fans metric.',
    annotations: {
      title: 'Get Page Fans',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: {
          type: 'string',
          description: 'Facebook Page ID',
        },
      },
      required: ['page_id'],
    },
  },
  {
    name: 'fb_get_page_views',
    description:
      'Get page view count over time using the page_views_total metric.',
    annotations: {
      title: 'Get Page Views',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: {
          type: 'string',
          description: 'Facebook Page ID',
        },
        period: {
          type: 'string',
          description: 'Aggregation period: "day", "week", or "days_28"',
        },
      },
      required: ['page_id'],
    },
  },

  // ========== Conversations (4) ==========
  {
    name: 'fb_list_conversations',
    description:
      'List Messenger conversations for a Facebook Page. Returns conversation id and participants.',
    annotations: {
      title: 'List Conversations',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: {
          type: 'string',
          description: 'Facebook Page ID',
        },
        limit: {
          type: 'number',
          description: 'Number of conversations to return (default 25)',
        },
      },
      required: ['page_id'],
    },
  },
  {
    name: 'fb_get_messages',
    description:
      'Get messages from a specific Messenger conversation. Returns message id, text, from, and created_time.',
    annotations: {
      title: 'Get Messages',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        conversation_id: {
          type: 'string',
          description: 'Conversation ID',
        },
        limit: {
          type: 'number',
          description: 'Number of messages to return (default 25)',
        },
      },
      required: ['conversation_id'],
    },
  },
  {
    name: 'fb_send_message',
    description:
      'Send a Messenger text message to a user on behalf of the Page. Requires the recipient to have an existing conversation.',
    annotations: {
      title: 'Send Message',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: {
          type: 'string',
          description: 'Facebook Page ID',
        },
        recipient_id: {
          type: 'string',
          description: 'Page-Scoped User ID of the recipient',
        },
        text: {
          type: 'string',
          description: 'Message text (max 2000 characters)',
        },
      },
      required: ['page_id', 'recipient_id', 'text'],
    },
  },
  {
    name: 'fb_send_typing',
    description:
      'Show or hide the typing indicator in a Messenger conversation.',
    annotations: {
      title: 'Send Typing Indicator',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: {
          type: 'string',
          description: 'Facebook Page ID',
        },
        recipient_id: {
          type: 'string',
          description: 'Page-Scoped User ID of the recipient',
        },
        action: {
          type: 'string',
          description: 'Sender action: "typing_on", "typing_off", or "mark_seen"',
        },
      },
      required: ['page_id', 'recipient_id'],
    },
  },
];
