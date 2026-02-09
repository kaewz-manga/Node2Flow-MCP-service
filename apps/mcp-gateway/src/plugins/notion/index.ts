/**
 * Notion Plugin - MCP Gateway
 * Matches official @notionhq/notion-mcp-server v2.1.0
 * 22 tools: Search, Pages, Blocks, Data Sources, Database, Comments, Users
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { NotionClient } from './client';

export const notionPlugin: MCPPlugin = {
  id: 'notion',
  name: 'Notion Manager',
  version: '2.1.0',
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
        case 'post-search':
          result = await notion.search(args);
          break;

        // ========== Pages ==========
        case 'post-page':
          result = await notion.createPage(args as any);
          break;
        case 'retrieve-a-page':
          result = await notion.getPage(args.page_id as string, args.filter_properties as string | undefined);
          break;
        case 'patch-page': {
          const { page_id, ...patchData } = args;
          result = await notion.updatePage(page_id as string, patchData);
          break;
        }
        case 'retrieve-a-page-property':
          result = await notion.getPageProperty(args.page_id as string, args.property_id as string, args as any);
          break;
        case 'move-page':
          result = await notion.movePage(args.page_id as string, args.parent as Record<string, unknown>);
          break;

        // ========== Blocks ==========
        case 'retrieve-a-block':
          result = await notion.getBlock(args.block_id as string);
          break;
        case 'get-block-children':
          result = await notion.getBlockChildren(args.block_id as string, args as any);
          break;
        case 'patch-block-children':
          result = await notion.appendBlocks(args.block_id as string, args.children as unknown[], args.after as string | undefined);
          break;
        case 'update-a-block': {
          const { block_id, ...blockData } = args;
          result = await notion.updateBlock(block_id as string, blockData);
          break;
        }
        case 'delete-a-block':
          result = await notion.deleteBlock(args.block_id as string);
          break;

        // ========== Data Sources ==========
        case 'create-a-data-source':
          result = await notion.createDataSource(args as any);
          break;
        case 'retrieve-a-data-source':
          result = await notion.getDataSource(args.data_source_id as string);
          break;
        case 'update-a-data-source': {
          const { data_source_id, ...dsData } = args;
          result = await notion.updateDataSource(data_source_id as string, dsData);
          break;
        }
        case 'query-data-source': {
          const { data_source_id, ...queryParams } = args;
          result = await notion.queryDataSource(data_source_id as string, queryParams);
          break;
        }
        case 'list-data-source-templates':
          result = await notion.listDataSourceTemplates(args.data_source_id as string, args as any);
          break;

        // ========== Database ==========
        case 'retrieve-a-database':
          result = await notion.getDatabase(args.database_id as string);
          break;

        // ========== Comments ==========
        case 'retrieve-a-comment':
          result = await notion.getComments(args.block_id as string, args as any);
          break;
        case 'create-a-comment':
          result = await notion.createComment(args as any);
          break;

        // ========== Users ==========
        case 'get-users':
          result = await notion.listUsers(args as any);
          break;
        case 'get-user':
          result = await notion.getUser(args.user_id as string);
          break;
        case 'get-self':
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
