/**
 * WordPress Plugin - MCP Gateway
 * Manages WordPress sites via REST API
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { WordPressClient } from './client';

export const wordpressPlugin: MCPPlugin = {
  id: 'wordpress',
  name: 'WordPress Manager',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    return new WordPressClient({
      siteUrl: config.site_url as string,
      username: config.username as string,
      applicationPassword: config.application_password as string,
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const wp = client as WordPressClient;

    try {
      let result: unknown;

      switch (toolName) {
        // ========== Post Operations ==========
        case 'wp_list_posts':
          result = await wp.listPosts(args as any);
          break;
        case 'wp_get_post':
          result = await wp.getPost(args.id as number);
          break;
        case 'wp_create_post':
          result = await wp.createPost(args as any);
          break;
        case 'wp_update_post':
          result = await wp.updatePost(args.id as number, args as any);
          break;
        case 'wp_delete_post':
          result = await wp.deletePost(args.id as number);
          break;

        // ========== Page Operations ==========
        case 'wp_list_pages':
          result = await wp.listPages(args as any);
          break;
        case 'wp_get_page':
          result = await wp.getPage(args.id as number);
          break;
        case 'wp_create_page':
          result = await wp.createPage(args as any);
          break;
        case 'wp_update_page':
          result = await wp.updatePage(args.id as number, args as any);
          break;
        case 'wp_delete_page':
          result = await wp.deletePage(args.id as number);
          break;

        // ========== Media Operations ==========
        case 'wp_list_media':
          result = await wp.listMedia(args as any);
          break;
        case 'wp_delete_media':
          result = await wp.deleteMedia(args.id as number);
          break;

        // ========== Comment Operations ==========
        case 'wp_list_comments':
          result = await wp.listComments(args as any);
          break;
        case 'wp_create_comment':
          result = await wp.createComment(args as any);
          break;
        case 'wp_update_comment':
          result = await wp.updateComment(args.id as number, args as any);
          break;
        case 'wp_delete_comment':
          result = await wp.deleteComment(args.id as number);
          break;

        // ========== Taxonomy Operations ==========
        case 'wp_list_categories':
          result = await wp.listCategories();
          break;
        case 'wp_list_tags':
          result = await wp.listTags();
          break;

        // ========== User & Site Operations ==========
        case 'wp_list_users':
          result = await wp.listUsers();
          break;
        case 'wp_get_site_info':
          result = await wp.getSiteInfo();
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
