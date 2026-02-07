/**
 * Notion Plugin - MCP Gateway
 * Manages Notion workspaces via REST API (version 2025-09-03)
 * 25 tools: Search, Pages, Blocks, Data Sources, Databases, Comments, Users
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { NotionClient } from './client';

export const notionPlugin: MCPPlugin = {
  id: 'notion',
  name: 'Notion Manager',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    return new NotionClient({
      apiKey: config.api_key as string,
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const notion = client as NotionClient;

    try {
      let result: unknown;

      switch (toolName) {
        // ========== Search ==========
        case 'notion_search':
          result = await notion.search(args as any);
          break;

        // ========== Pages ==========
        case 'notion_create_page':
          result = await notion.createPage(args as any);
          break;
        case 'notion_get_page':
          result = await notion.getPage(args.page_id as string);
          break;
        case 'notion_update_page':
          result = await notion.updatePage(args.page_id as string, args as any);
          break;
        case 'notion_move_page':
          result = await notion.movePage(args.page_id as string, args.new_parent as Record<string, unknown>);
          break;
        case 'notion_get_page_property':
          result = await notion.getPageProperty(args.page_id as string, args.property_id as string, args as any);
          break;

        // ========== Blocks ==========
        case 'notion_get_block':
          result = await notion.getBlock(args.block_id as string);
          break;
        case 'notion_get_block_children':
          result = await notion.getBlockChildren(args.block_id as string, args as any);
          break;
        case 'notion_append_blocks':
          result = await notion.appendBlocks(args.block_id as string, args.children as unknown[]);
          break;
        case 'notion_update_block':
          result = await notion.updateBlock(args.block_id as string, args.data as Record<string, unknown>);
          break;
        case 'notion_delete_block':
          result = await notion.deleteBlock(args.block_id as string);
          break;

        // ========== Data Sources ==========
        case 'notion_create_data_source':
          result = await notion.createDataSource(args.database_id as string, {
            title: args.title as any,
            properties: args.properties as Record<string, unknown> | undefined,
          });
          break;
        case 'notion_get_data_source':
          result = await notion.getDataSource(args.data_source_id as string);
          break;
        case 'notion_update_data_source':
          result = await notion.updateDataSource(args.data_source_id as string, {
            title: args.title as any,
            properties: args.properties as Record<string, unknown> | undefined,
          });
          break;
        case 'notion_query_data_source':
          result = await notion.queryDataSource(args.data_source_id as string, args as any);
          break;
        case 'notion_list_data_source_templates':
          result = await notion.listDataSourceTemplates(args.data_source_id as string, args as any);
          break;

        // ========== Databases (legacy) ==========
        case 'notion_get_database':
          result = await notion.getDatabase(args.database_id as string);
          break;
        case 'notion_query_database':
          result = await notion.queryDatabase(args.database_id as string, args as any);
          break;
        case 'notion_create_database':
          result = await notion.createDatabase(args as any);
          break;

        // ========== Comments ==========
        case 'notion_create_comment': {
          const commentParams: any = { rich_text: args.rich_text };
          if (args.parent_page_id) commentParams.parent = { page_id: args.parent_page_id };
          if (args.discussion_id) commentParams.discussion_id = args.discussion_id;
          result = await notion.createComment(commentParams);
          break;
        }
        case 'notion_get_comments':
          result = await notion.getComments(args.block_id as string, args as any);
          break;
        case 'notion_get_comment':
          result = await notion.getComment(args.comment_id as string);
          break;

        // ========== Users ==========
        case 'notion_list_users':
          result = await notion.listUsers(args as any);
          break;
        case 'notion_get_user':
          result = await notion.getUser(args.user_id as string);
          break;
        case 'notion_get_bot_user':
          result = await notion.getBotUser();
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
