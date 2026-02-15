/**
 * SQLite Plugin - MCP Gateway
 * Uses LibSqlClient for remote SQLite/Turso databases (CF Worker compatible)
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { LibSqlClient } from './libsql-client';
import type { SqliteClientInterface, ColumnDefinition } from './types';

function ok(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }], isError: false };
}

export const sqlitePlugin: MCPPlugin = {
  id: 'sqlite',
  name: 'SQLite',
  version: '2.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    const url = config.db_url as string | undefined;
    const authToken = config.auth_token as string | undefined;

    if (!url) return null;

    return new LibSqlClient({ url, authToken });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const db = client as SqliteClientInterface;

    switch (toolName) {
      // ========== Query & Execute ==========
      case 'sqlite_query':
        return ok(await db.query(
          args.sql as string,
          args.params as unknown[] | undefined
        ));
      case 'sqlite_execute':
        return ok(await db.execute(
          args.sql as string,
          args.params as unknown[] | undefined
        ));
      case 'sqlite_run_script':
        return ok(await db.runScript(args.sql as string));

      // ========== Schema Inspection ==========
      case 'sqlite_list_tables':
        return ok(await db.listTables());
      case 'sqlite_describe_table':
        return ok(await db.describeTable(args.table as string));
      case 'sqlite_list_indexes':
        return ok(await db.listIndexes(args.table as string));
      case 'sqlite_list_foreign_keys':
        return ok(await db.listForeignKeys(args.table as string));

      // ========== Schema Management ==========
      case 'sqlite_create_table': {
        await db.createTable(
          args.table as string,
          args.columns as ColumnDefinition[],
          args.ifNotExists as boolean | undefined
        );
        return ok({ success: true, table: args.table });
      }
      case 'sqlite_alter_table': {
        await db.alterTable(
          args.table as string,
          args.action as string,
          args as Record<string, unknown>
        );
        return ok({ success: true, table: args.table, action: args.action });
      }
      case 'sqlite_drop_table': {
        await db.dropTable(
          args.table as string,
          args.ifExists as boolean | undefined
        );
        return ok({ success: true, table: args.table, dropped: true });
      }

      // ========== Index Management ==========
      case 'sqlite_create_index': {
        await db.createIndex(
          args.table as string,
          args.columns as string[],
          args.indexName as string | undefined,
          args.unique as boolean | undefined,
          args.ifNotExists as boolean | undefined
        );
        return ok({
          success: true,
          table: args.table,
          indexName:
            args.indexName ||
            `idx_${args.table}_${(args.columns as string[]).join('_')}`,
        });
      }
      case 'sqlite_drop_index': {
        await db.dropIndex(
          args.indexName as string,
          args.ifExists as boolean | undefined
        );
        return ok({ success: true, indexName: args.indexName, dropped: true });
      }

      // ========== Database Management ==========
      case 'sqlite_get_info':
        return ok(await db.getInfo());
      case 'sqlite_vacuum':
        return ok(await db.vacuum());
      case 'sqlite_integrity_check':
        return ok(await db.integrityCheck());

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  },
};
