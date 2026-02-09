import type { MCPToolDefinition } from '../../types';

/**
 * Tool definitions from @notionhq/notion-mcp-server v2.1.0
 * Prefixed with noff_ to avoid conflicts with custom notion plugin
 * Remote names use hyphens (e.g., get-user), mapped back in index.ts
 */
export const TOOLS: MCPToolDefinition[] = [
  // ===== Users =====
  {
    name: 'noff_get_user',
    description: 'Retrieve a Notion user by user ID',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'string', description: 'User ID (UUID)' },
      },
      required: ['user_id'],
    },
  },
  {
    name: 'noff_get_users',
    description: 'List all users in the Notion workspace',
    inputSchema: {
      type: 'object',
      properties: {
        start_cursor: { type: 'string', description: 'Pagination cursor' },
        page_size: { type: 'number', description: 'Results per page (max 100)' },
      },
    },
  },
  {
    name: 'noff_get_self',
    description: "Retrieve the bot user's own information",
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  // ===== Search =====
  {
    name: 'noff_post_search',
    description: 'Search all pages and databases accessible to the integration',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query text' },
        filter: { type: 'object', description: 'Filter by object type (page/database)' },
        sort: { type: 'object', description: 'Sort order' },
        start_cursor: { type: 'string', description: 'Pagination cursor' },
        page_size: { type: 'number', description: 'Results per page (max 100)' },
      },
    },
  },
  // ===== Pages =====
  {
    name: 'noff_retrieve_a_page',
    description: 'Retrieve a Notion page by page ID',
    inputSchema: {
      type: 'object',
      properties: {
        page_id: { type: 'string', description: 'Page ID' },
        filter_properties: { type: 'string', description: 'Comma-separated property IDs to filter' },
      },
      required: ['page_id'],
    },
  },
  {
    name: 'noff_patch_page',
    description: 'Update page properties (title, icon, cover, archived status)',
    inputSchema: {
      type: 'object',
      properties: {
        page_id: { type: 'string', description: 'Page ID to update' },
        properties: { type: 'object', description: 'Property values to update' },
        in_trash: { type: 'boolean', description: 'Set to true to delete, false to restore' },
        archived: { type: 'boolean', description: 'Archive status' },
        icon: { type: 'object', description: 'Page icon (emoji or external file)' },
        cover: { type: 'object', description: 'Page cover image (external file)' },
      },
      required: ['page_id'],
    },
  },
  {
    name: 'noff_post_page',
    description: 'Create a new page in a database, page, or workspace',
    inputSchema: {
      type: 'object',
      properties: {
        parent: { type: 'object', description: 'Parent location (page_id, database_id, or workspace)' },
        properties: { type: 'object', description: 'Page properties' },
        children: { type: 'array', description: 'Page content blocks' },
        icon: { type: 'object', description: 'Page icon' },
        cover: { type: 'object', description: 'Page cover' },
      },
      required: ['parent', 'properties'],
    },
  },
  {
    name: 'noff_move_page',
    description: 'Move a page to a different parent (page, database, or workspace)',
    inputSchema: {
      type: 'object',
      properties: {
        page_id: { type: 'string', description: 'Page ID to move' },
        parent: { type: 'object', description: 'New parent (page_id, database_id, or workspace)' },
      },
      required: ['page_id', 'parent'],
    },
  },
  {
    name: 'noff_retrieve_a_page_property',
    description: 'Retrieve a specific page property value',
    inputSchema: {
      type: 'object',
      properties: {
        page_id: { type: 'string', description: 'Page ID' },
        property_id: { type: 'string', description: 'Property ID' },
        page_size: { type: 'number', description: 'For paginated properties' },
        start_cursor: { type: 'string', description: 'Pagination cursor' },
      },
      required: ['page_id', 'property_id'],
    },
  },
  // ===== Blocks =====
  {
    name: 'noff_retrieve_a_block',
    description: 'Retrieve block content by block ID',
    inputSchema: {
      type: 'object',
      properties: {
        block_id: { type: 'string', description: 'Block ID' },
      },
      required: ['block_id'],
    },
  },
  {
    name: 'noff_get_block_children',
    description: 'Retrieve all child blocks of a block or page',
    inputSchema: {
      type: 'object',
      properties: {
        block_id: { type: 'string', description: 'Block or page ID' },
        start_cursor: { type: 'string', description: 'Pagination cursor' },
        page_size: { type: 'number', description: 'Results per page (max 100)' },
      },
      required: ['block_id'],
    },
  },
  {
    name: 'noff_patch_block_children',
    description: 'Append blocks as children to a parent block or page',
    inputSchema: {
      type: 'object',
      properties: {
        block_id: { type: 'string', description: 'Parent block or page ID' },
        children: { type: 'array', description: 'Block objects to append' },
        after: { type: 'string', description: 'Block ID to insert after' },
      },
      required: ['block_id', 'children'],
    },
  },
  {
    name: 'noff_update_a_block',
    description: 'Update block content',
    inputSchema: {
      type: 'object',
      properties: {
        block_id: { type: 'string', description: 'Block ID' },
        archived: { type: 'boolean', description: 'Archive status' },
      },
      required: ['block_id'],
    },
  },
  {
    name: 'noff_delete_a_block',
    description: 'Delete (archive) a block',
    inputSchema: {
      type: 'object',
      properties: {
        block_id: { type: 'string', description: 'Block ID to delete' },
      },
      required: ['block_id'],
    },
  },
  // ===== Data Sources (2025-09-03) =====
  {
    name: 'noff_retrieve_a_data_source',
    description: 'Retrieve data source (database) metadata and schema',
    inputSchema: {
      type: 'object',
      properties: {
        data_source_id: { type: 'string', description: 'Data source ID' },
      },
      required: ['data_source_id'],
    },
  },
  {
    name: 'noff_query_data_source',
    description: 'Query a data source (database) with filters and sorting',
    inputSchema: {
      type: 'object',
      properties: {
        data_source_id: { type: 'string', description: 'Data source ID' },
        filter: { type: 'object', description: 'Filter conditions' },
        sorts: { type: 'array', description: 'Sort criteria' },
        start_cursor: { type: 'string', description: 'Pagination cursor' },
        page_size: { type: 'number', description: 'Results per page (max 100)' },
        filter_properties: { type: 'array', description: 'Property IDs to include' },
      },
      required: ['data_source_id'],
    },
  },
  {
    name: 'noff_create_a_data_source',
    description: 'Create a new data source (database)',
    inputSchema: {
      type: 'object',
      properties: {
        parent: { type: 'object', description: 'Parent page or workspace' },
        title: { type: 'array', description: 'Database title (rich text)' },
        properties: { type: 'object', description: 'Database schema properties' },
        is_inline: { type: 'boolean', description: 'Whether database is inline' },
      },
      required: ['parent', 'properties'],
    },
  },
  {
    name: 'noff_update_a_data_source',
    description: 'Update data source title or properties schema',
    inputSchema: {
      type: 'object',
      properties: {
        data_source_id: { type: 'string', description: 'Data source ID' },
        title: { type: 'array', description: 'New title (rich text)' },
        properties: { type: 'object', description: 'Schema properties to update' },
      },
      required: ['data_source_id'],
    },
  },
  {
    name: 'noff_list_data_source_templates',
    description: 'List available data source templates',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  // ===== Database (legacy) =====
  {
    name: 'noff_retrieve_a_database',
    description: 'Retrieve database metadata (legacy endpoint)',
    inputSchema: {
      type: 'object',
      properties: {
        database_id: { type: 'string', description: 'Database ID' },
      },
      required: ['database_id'],
    },
  },
  // ===== Comments =====
  {
    name: 'noff_retrieve_a_comment',
    description: 'Retrieve comments from a page or block',
    inputSchema: {
      type: 'object',
      properties: {
        block_id: { type: 'string', description: 'Block or page ID' },
        start_cursor: { type: 'string', description: 'Pagination cursor' },
        page_size: { type: 'number', description: 'Results per page' },
      },
      required: ['block_id'],
    },
  },
  {
    name: 'noff_create_a_comment',
    description: 'Create a comment on a page or block',
    inputSchema: {
      type: 'object',
      properties: {
        parent: { type: 'object', description: 'Parent page or block' },
        rich_text: { type: 'array', description: 'Comment text (rich text)' },
        discussion_id: { type: 'string', description: 'Discussion thread ID' },
      },
      required: ['parent', 'rich_text'],
    },
  },
];
