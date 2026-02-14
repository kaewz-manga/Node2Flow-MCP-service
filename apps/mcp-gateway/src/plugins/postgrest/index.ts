/**
 * PostgREST Plugin - MCP Gateway
 * Query any PostgREST server — schema, CRUD, RPC
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { PostgrestClient } from './client';

export const postgrestPlugin: MCPPlugin = {
  id: 'postgrest',
  name: 'PostgREST',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    return new PostgrestClient({
      url: config.base_url as string,
      token: config.api_token as string | undefined,
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const pg = client as PostgrestClient;

    try {
      let result: unknown;

      switch (toolName) {
        // ========== Schema (2) ==========
        case 'pg_get_schema':
          result = await pg.getSchema();
          break;
        case 'pg_describe_table':
          result = await pg.describeTable(args.table as string);
          break;

        // ========== Read (3) ==========
        case 'pg_list_records':
          result = await pg.listRecords(args.table as string, {
            select: args.select as string | undefined,
            filter: args.filter as string | undefined,
            order: args.order as string | undefined,
            limit: args.limit as number | undefined,
            offset: args.offset as number | undefined,
          });
          break;
        case 'pg_count_records':
          result = await pg.countRecords(args.table as string, {
            filter: args.filter as string | undefined,
            count: args.count as 'exact' | 'planned' | 'estimated' | undefined,
          });
          break;
        case 'pg_call_function':
          result = await pg.callFunction(args.function_name as string, {
            params: args.params as Record<string, unknown> | undefined,
            method: args.method as 'GET' | 'POST' | undefined,
          });
          break;

        // ========== Write (5) ==========
        case 'pg_insert_records':
          result = await pg.insertRecords(
            args.table as string,
            args.records,
            {
              return: args.return as 'representation' | 'minimal' | 'headers-only' | undefined,
              select: args.select as string | undefined,
            }
          );
          break;
        case 'pg_update_records':
          result = await pg.updateRecords(
            args.table as string,
            args.filter as string,
            args.data as Record<string, unknown>,
            {
              return: args.return as 'representation' | 'minimal' | 'headers-only' | undefined,
              select: args.select as string | undefined,
            }
          );
          break;
        case 'pg_upsert_records':
          result = await pg.upsertRecords(
            args.table as string,
            args.records,
            {
              resolution: args.resolution as 'merge-duplicates' | 'ignore-duplicates' | undefined,
              return: args.return as 'representation' | 'minimal' | 'headers-only' | undefined,
              select: args.select as string | undefined,
              onConflict: args.on_conflict as string | undefined,
            }
          );
          break;
        case 'pg_delete_records':
          result = await pg.deleteRecords(
            args.table as string,
            args.filter as string,
            {
              return: args.return as 'representation' | 'minimal' | 'headers-only' | undefined,
              select: args.select as string | undefined,
            }
          );
          break;
        case 'pg_replace_record':
          result = await pg.replaceRecord(
            args.table as string,
            args.filter as string,
            args.data as Record<string, unknown>,
            {
              return: args.return as 'representation' | 'minimal' | 'headers-only' | undefined,
              select: args.select as string | undefined,
            }
          );
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
