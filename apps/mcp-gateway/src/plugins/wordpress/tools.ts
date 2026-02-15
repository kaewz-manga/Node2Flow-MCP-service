/**
 * WordPress MCP Tool Definitions (20 tools)
 * Source: @node2flow/wordpress-mcp community package
 */

import type { MCPToolDefinition } from '../../types';

export const TOOLS: MCPToolDefinition[] = [
  // ========== Post Tools (5) ==========
  {
    name: 'wp_list_posts',
    description: 'List WordPress posts with optional filters. Returns post ID, title, status, date, and categories. Use to browse existing content or find posts by keyword.',
    annotations: {
      title: 'List Posts',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        per_page: { type: 'number', description: 'Number of posts to return (default 10, max 100)' },
        status: { type: 'string', description: 'Filter by status: publish, draft, pending, private, trash' },
        search: { type: 'string', description: 'Search posts by keyword' },
      },
    },
  },
  {
    name: 'wp_get_post',
    description: 'Get a single WordPress post with full content, metadata, categories, and tags. Use to inspect post content before editing.',
    annotations: {
      title: 'Get Post',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Post ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'wp_create_post',
    description: 'Create a new WordPress post. Provide title and content (HTML). Optionally set status (draft/publish), categories, and tags.',
    annotations: {
      title: 'Create Post',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Post title' },
        content: { type: 'string', description: 'Post content (HTML)' },
        status: { type: 'string', description: 'Post status: draft (default), publish, pending, private' },
        categories: { type: 'array', items: { type: 'number' }, description: 'Category IDs' },
        tags: { type: 'array', items: { type: 'number' }, description: 'Tag IDs' },
      },
      required: ['title', 'content'],
    },
  },
  {
    name: 'wp_update_post',
    description: 'Update an existing WordPress post. Change title, content, status, categories, or tags.',
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
        id: { type: 'number', description: 'Post ID to update' },
        title: { type: 'string', description: 'New title (optional)' },
        content: { type: 'string', description: 'New content HTML (optional)' },
        status: { type: 'string', description: 'New status (optional)' },
        categories: { type: 'array', items: { type: 'number' }, description: 'New category IDs (optional)' },
        tags: { type: 'array', items: { type: 'number' }, description: 'New tag IDs (optional)' },
      },
      required: ['id'],
    },
  },
  {
    name: 'wp_delete_post',
    description: 'Delete a WordPress post. Moves to trash by default.',
    annotations: {
      title: 'Delete Post',
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Post ID to delete' },
      },
      required: ['id'],
    },
  },

  // ========== Page Tools (5) ==========
  {
    name: 'wp_list_pages',
    description: 'List WordPress pages. Returns page ID, title, status, and parent page. Use to browse site page structure.',
    annotations: {
      title: 'List Pages',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        per_page: { type: 'number', description: 'Number of pages to return (default 10, max 100)' },
        status: { type: 'string', description: 'Filter by status: publish, draft, pending, private' },
      },
    },
  },
  {
    name: 'wp_get_page',
    description: 'Get a single WordPress page with full content and metadata.',
    annotations: {
      title: 'Get Page',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Page ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'wp_create_page',
    description: 'Create a new WordPress page. Provide title and content (HTML). Optionally set parent page for hierarchy.',
    annotations: {
      title: 'Create Page',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Page title' },
        content: { type: 'string', description: 'Page content (HTML)' },
        status: { type: 'string', description: 'Page status: draft (default), publish' },
        parent: { type: 'number', description: 'Parent page ID for hierarchical pages' },
      },
      required: ['title', 'content'],
    },
  },
  {
    name: 'wp_update_page',
    description: 'Update an existing WordPress page.',
    annotations: {
      title: 'Update Page',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Page ID to update' },
        title: { type: 'string', description: 'New title (optional)' },
        content: { type: 'string', description: 'New content HTML (optional)' },
        status: { type: 'string', description: 'New status (optional)' },
      },
      required: ['id'],
    },
  },
  {
    name: 'wp_delete_page',
    description: 'Delete a WordPress page.',
    annotations: {
      title: 'Delete Page',
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Page ID to delete' },
      },
      required: ['id'],
    },
  },

  // ========== Media Tools (2) ==========
  {
    name: 'wp_list_media',
    description: 'List media files in the WordPress library. Returns file URLs, types, and metadata.',
    annotations: {
      title: 'List Media',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        per_page: { type: 'number', description: 'Number of items to return (default 10)' },
        media_type: { type: 'string', description: 'Filter by type: image, video, audio, application' },
      },
    },
  },
  {
    name: 'wp_delete_media',
    description: 'Permanently delete a media file from WordPress.',
    annotations: {
      title: 'Delete Media',
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Media ID to delete' },
      },
      required: ['id'],
    },
  },

  // ========== Comment Tools (4) ==========
  {
    name: 'wp_list_comments',
    description: 'List comments on WordPress posts. Filter by post ID.',
    annotations: {
      title: 'List Comments',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        post: { type: 'number', description: 'Filter by post ID' },
        per_page: { type: 'number', description: 'Number of comments to return' },
      },
    },
  },
  {
    name: 'wp_create_comment',
    description: 'Create a new comment on a WordPress post.',
    annotations: {
      title: 'Create Comment',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        post: { type: 'number', description: 'Post ID to comment on' },
        content: { type: 'string', description: 'Comment content' },
        author_name: { type: 'string', description: 'Comment author name' },
        author_email: { type: 'string', description: 'Comment author email' },
      },
      required: ['post', 'content'],
    },
  },
  {
    name: 'wp_update_comment',
    description: 'Update or moderate a comment. Change content or approval status.',
    annotations: {
      title: 'Update Comment',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Comment ID' },
        content: { type: 'string', description: 'New comment content (optional)' },
        status: { type: 'string', description: 'New status: approved, hold, spam, trash' },
      },
      required: ['id'],
    },
  },
  {
    name: 'wp_delete_comment',
    description: 'Permanently delete a comment.',
    annotations: {
      title: 'Delete Comment',
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Comment ID to delete' },
      },
      required: ['id'],
    },
  },

  // ========== Taxonomy Tools (2) ==========
  {
    name: 'wp_list_categories',
    description: 'List all WordPress categories with post counts.',
    annotations: {
      title: 'List Categories',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        per_page: { type: 'number', description: 'Number of categories to return (default 100)' },
        search: { type: 'string', description: 'Filter categories by search term' },
      },
    },
  },
  {
    name: 'wp_list_tags',
    description: 'List all WordPress tags with post counts.',
    annotations: {
      title: 'List Tags',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        per_page: { type: 'number', description: 'Number of tags to return (default 100)' },
        search: { type: 'string', description: 'Filter tags by search term' },
      },
    },
  },

  // ========== User & Site Tools (2) ==========
  {
    name: 'wp_list_users',
    description: 'List WordPress users with their roles.',
    annotations: {
      title: 'List Users',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        per_page: { type: 'number', description: 'Number of users to return (default 10)' },
        search: { type: 'string', description: 'Filter users by search term' },
      },
    },
  },
  {
    name: 'wp_get_site_info',
    description: 'Get WordPress site information: name, description, URL, timezone, and available features.',
    annotations: {
      title: 'Get Site Info',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response (e.g. "name,description,url")' },
      },
    },
  },
];
