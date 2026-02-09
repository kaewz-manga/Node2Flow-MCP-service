/**
 * Notion MCP Tool Definitions (22 tools)
 * Matches official @notionhq/notion-mcp-server v2.1.0
 * API Version: 2025-09-03
 */

import type { MCPToolDefinition } from '../../types';

export const TOOLS: MCPToolDefinition[] = [
  // ========== Search (1) ==========
  {
    name: 'post-search',
    description: 'Search by title. The text that the API compares page and database titles against.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The text that the API compares page and database titles against.' },
        sort: {
          type: 'object',
          description: 'A set of criteria, direction and timestamp keys, that orders the results.',
          properties: {
            direction: { type: 'string', description: 'The direction to sort. Possible values: ascending, descending' },
            timestamp: { type: 'string', description: 'The name of the timestamp to sort against. Possible values: last_edited_time' },
          },
        },
        filter: {
          type: 'object',
          description: 'Filter criteria limiting results to pages or data sources',
          properties: {
            value: { type: 'string', enum: ['page', 'data_source'], description: 'The value of the property to filter by' },
            property: { type: 'string', description: "The name of the property to filter by (currently only 'object')" },
          },
        },
        start_cursor: { type: 'string', description: 'Cursor value for pagination' },
        page_size: { type: 'integer', description: 'The number of items to include in the response. Maximum: 100' },
      },
    },
  },

  // ========== Pages (5) ==========
  {
    name: 'post-page',
    description: 'Create a page. Creates a new page that is a child of an existing page or database.',
    inputSchema: {
      type: 'object',
      properties: {
        parent: { type: 'object', description: 'The parent page or database: { "page_id": "..." } or { "database_id": "..." }' },
        properties: { type: 'object', description: 'The property values for the new page' },
        children: { type: 'array', description: 'The content to be rendered on the new page as block objects' },
        icon: { type: 'object', description: 'The icon of the new page: { "emoji": "..." }' },
        cover: { type: 'object', description: 'The cover image of the new page' },
      },
      required: ['parent', 'properties'],
    },
  },
  {
    name: 'retrieve-a-page',
    description: 'Retrieve a page. Retrieves a Page object using the ID specified.',
    inputSchema: {
      type: 'object',
      properties: {
        page_id: { type: 'string', description: 'Identifier for a Notion page' },
        filter_properties: { type: 'string', description: 'A list of page property value IDs to limit the response' },
      },
      required: ['page_id'],
    },
  },
  {
    name: 'patch-page',
    description: 'Update page properties. Updates the properties of a page in a database or updates the title of a child page.',
    inputSchema: {
      type: 'object',
      properties: {
        page_id: { type: 'string', description: 'The identifier for the Notion page to be updated' },
        properties: { type: 'object', description: 'The property values to update for the page' },
        in_trash: { type: 'boolean', description: 'Set to true to delete a page. Set to false to restore a page.' },
        archived: { type: 'boolean', description: 'Set to true to archive the page' },
        icon: { type: 'object', description: 'A page icon: { "emoji": "..." }' },
        cover: { type: 'object', description: 'A cover image' },
      },
      required: ['page_id'],
    },
  },
  {
    name: 'retrieve-a-page-property',
    description: 'Retrieve a page property item. Retrieves a property_item object for a given page_id and property_id.',
    inputSchema: {
      type: 'object',
      properties: {
        page_id: { type: 'string', description: 'Identifier for a Notion page' },
        property_id: { type: 'string', description: 'Identifier for a page property' },
        page_size: { type: 'integer', description: 'For paginated properties. The max number of property item objects on a page.' },
        start_cursor: { type: 'string', description: 'For paginated properties' },
      },
      required: ['page_id', 'property_id'],
    },
  },
  {
    name: 'move-page',
    description: 'Move a page to a different parent location.',
    inputSchema: {
      type: 'object',
      properties: {
        page_id: { type: 'string', description: 'Identifier for a Notion page' },
        parent: { type: 'object', description: 'The new parent: { "type": "page_id", "page_id": "..." } or { "type": "database_id", "database_id": "..." }' },
      },
      required: ['page_id', 'parent'],
    },
  },

  // ========== Blocks (5) ==========
  {
    name: 'retrieve-a-block',
    description: 'Retrieve a block. Retrieves a Block object using the ID specified.',
    inputSchema: {
      type: 'object',
      properties: {
        block_id: { type: 'string', description: 'Identifier for a Notion block' },
      },
      required: ['block_id'],
    },
  },
  {
    name: 'get-block-children',
    description: 'Retrieve block children. Returns a paginated array of child block objects.',
    inputSchema: {
      type: 'object',
      properties: {
        block_id: { type: 'string', description: 'Identifier for a block' },
        start_cursor: { type: 'string', description: 'Pagination cursor' },
        page_size: { type: 'integer', description: 'The number of items from the full list desired in the response. Maximum: 100' },
      },
      required: ['block_id'],
    },
  },
  {
    name: 'patch-block-children',
    description: 'Append block children. Creates and appends new children blocks to the parent block_id specified.',
    inputSchema: {
      type: 'object',
      properties: {
        block_id: { type: 'string', description: 'Identifier for a block or page to append children to' },
        children: { type: 'array', description: 'Child content to append as an array of block objects' },
        after: { type: 'string', description: 'The ID of the existing block that the new block should be appended after' },
      },
      required: ['block_id', 'children'],
    },
  },
  {
    name: 'update-a-block',
    description: 'Update a block. Updates the content for the specified block_id based on the block type.',
    inputSchema: {
      type: 'object',
      properties: {
        block_id: { type: 'string', description: 'Identifier for a Notion block' },
        type: { type: 'object', description: 'The block object type value with properties to be updated' },
        archived: { type: 'boolean', description: 'Set to true to archive (delete) a block. Set to false to un-archive (restore) a block.' },
      },
      required: ['block_id'],
    },
  },
  {
    name: 'delete-a-block',
    description: 'Delete a block. Sets a Block object, including page blocks, to archived: true.',
    inputSchema: {
      type: 'object',
      properties: {
        block_id: { type: 'string', description: 'Identifier for a Notion block' },
      },
      required: ['block_id'],
    },
  },

  // ========== Data Sources (5) ==========
  {
    name: 'create-a-data-source',
    description: 'Create a new data source (database). Creates a data source as a subitem of an existing Notion page.',
    inputSchema: {
      type: 'object',
      properties: {
        parent: { type: 'object', description: 'The parent page: { "page_id": "..." }' },
        properties: { type: 'object', description: 'Property schema of data source' },
        title: { type: 'array', description: 'The title as rich text: [{ "text": { "content": "..." }, "type": "text" }]' },
      },
      required: ['parent', 'properties'],
    },
  },
  {
    name: 'retrieve-a-data-source',
    description: 'Retrieve metadata and schema for a data source.',
    inputSchema: {
      type: 'object',
      properties: {
        data_source_id: { type: 'string', description: 'Identifier for a Notion data source' },
      },
      required: ['data_source_id'],
    },
  },
  {
    name: 'update-a-data-source',
    description: 'Update properties of a data source.',
    inputSchema: {
      type: 'object',
      properties: {
        data_source_id: { type: 'string', description: 'Identifier for a Notion data source' },
        title: { type: 'array', description: 'The title as rich text' },
        description: { type: 'array', description: 'The description as rich text' },
        properties: { type: 'object', description: 'Property schema updates' },
      },
      required: ['data_source_id'],
    },
  },
  {
    name: 'query-data-source',
    description: 'Query a data source (database) using filters and sorts.',
    inputSchema: {
      type: 'object',
      properties: {
        data_source_id: { type: 'string', description: 'Identifier for a Notion data source (database)' },
        filter: { type: 'object', description: 'Filter conditions for querying the data source' },
        sorts: { type: 'array', description: 'Sort configuration: [{ "property": "...", "direction": "ascending" | "descending" }]' },
        start_cursor: { type: 'string', description: 'Pagination cursor' },
        page_size: { type: 'integer', description: 'Number of items to return. Maximum: 100' },
        filter_properties: { type: 'array', description: 'A list of page property value IDs to limit the response' },
        archived: { type: 'boolean', description: 'Include archived items' },
        in_trash: { type: 'boolean', description: 'Include items in trash' },
      },
      required: ['data_source_id'],
    },
  },
  {
    name: 'list-data-source-templates',
    description: 'List available templates for a data source.',
    inputSchema: {
      type: 'object',
      properties: {
        data_source_id: { type: 'string', description: 'Identifier for a Notion data source' },
        start_cursor: { type: 'string', description: 'Pagination cursor' },
        page_size: { type: 'integer', description: 'Number of items to return. Maximum: 100' },
      },
      required: ['data_source_id'],
    },
  },

  // ========== Database (1) ==========
  {
    name: 'retrieve-a-database',
    description: 'Retrieve a database. Returns database metadata including list of data source IDs.',
    inputSchema: {
      type: 'object',
      properties: {
        database_id: { type: 'string', description: 'Identifier for a Notion database' },
      },
      required: ['database_id'],
    },
  },

  // ========== Comments (2) ==========
  {
    name: 'retrieve-a-comment',
    description: 'Retrieve comments from a page or block.',
    inputSchema: {
      type: 'object',
      properties: {
        block_id: { type: 'string', description: 'Identifier for a Notion block or page' },
        start_cursor: { type: 'string', description: 'Pagination cursor' },
        page_size: { type: 'integer', description: 'The number of items from the full list desired in the response. Maximum: 100' },
      },
      required: ['block_id'],
    },
  },
  {
    name: 'create-a-comment',
    description: 'Create a comment in a page or existing discussion thread.',
    inputSchema: {
      type: 'object',
      properties: {
        parent: { type: 'object', description: 'The page that contains the comment: { "page_id": "..." }' },
        rich_text: { type: 'array', description: 'The comment text as rich text: [{ "text": { "content": "..." } }]' },
      },
      required: ['parent', 'rich_text'],
    },
  },

  // ========== Users (3) ==========
  {
    name: 'get-users',
    description: 'List all users. Returns a paginated list of Users for the workspace.',
    inputSchema: {
      type: 'object',
      properties: {
        start_cursor: { type: 'string', description: 'Pagination cursor' },
        page_size: { type: 'integer', description: 'The number of items from the full list desired in the response. Maximum: 100' },
      },
    },
  },
  {
    name: 'get-user',
    description: 'Retrieve a user. Retrieves a User using the ID specified.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'string', description: 'Identifier for a user' },
      },
      required: ['user_id'],
    },
  },
  {
    name: 'get-self',
    description: "Retrieve your token's bot user. Retrieves the bot User associated with the API token.",
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];
