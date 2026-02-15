/**
 * WordPress Plugin - MCP Gateway
 * Source: @node2flow/wordpress-mcp community package
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { WordPressClient } from './client';

function ok(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data ?? { success: true }, null, 2) }], isError: false };
}

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
      switch (toolName) {
        // Posts
        case 'wp_list_posts':   return ok(await wp.listPosts(args as any));
        case 'wp_get_post':     return ok(await wp.getPost(args.id as number));
        case 'wp_create_post':  return ok(await wp.createPost(args as any));
        case 'wp_update_post':  return ok(await wp.updatePost(args.id as number, args as any));
        case 'wp_delete_post':  return ok(await wp.deletePost(args.id as number));

        // Pages
        case 'wp_list_pages':   return ok(await wp.listPages(args as any));
        case 'wp_get_page':     return ok(await wp.getPage(args.id as number));
        case 'wp_create_page':  return ok(await wp.createPage(args as any));
        case 'wp_update_page':  return ok(await wp.updatePage(args.id as number, args as any));
        case 'wp_delete_page':  return ok(await wp.deletePage(args.id as number));

        // Media
        case 'wp_list_media':   return ok(await wp.listMedia(args as any));
        case 'wp_delete_media': return ok(await wp.deleteMedia(args.id as number));

        // Comments
        case 'wp_list_comments':   return ok(await wp.listComments(args as any));
        case 'wp_create_comment':  return ok(await wp.createComment(args as any));
        case 'wp_update_comment':  return ok(await wp.updateComment(args.id as number, args as any));
        case 'wp_delete_comment':  return ok(await wp.deleteComment(args.id as number));

        // Taxonomy
        case 'wp_list_categories': return ok(await wp.listCategories(args as any));
        case 'wp_list_tags':       return ok(await wp.listTags(args as any));

        // Users & Site
        case 'wp_list_users':    return ok(await wp.listUsers(args as any));
        case 'wp_get_site_info': return ok(await wp.getSiteInfo());

        default:
          return { content: [{ type: 'text' as const, text: `Unknown tool: ${toolName}` }], isError: true };
      }
    } catch (error) {
      return { content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
    }
  },
};
