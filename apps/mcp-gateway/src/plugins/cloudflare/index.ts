/**
 * Cloudflare Plugin - MCP Gateway
 * Cloudflare REST API v4 management (Workers, D1, KV, R2, Hyperdrive)
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { CloudflareClient } from './client';

function ok(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data ?? { success: true }, null, 2) }], isError: false };
}

export const cloudflarePlugin: MCPPlugin = {
  id: 'cloudflare',
  name: 'Cloudflare Developer Platform',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    return new CloudflareClient({
      apiToken: config.api_token as string,
      accountId: config.account_id as string | undefined,
      apiUrl: config.api_url as string | undefined,
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const cf = client as CloudflareClient;

    try {
      switch (toolName) {
        // Accounts
        case 'cf_list_accounts':       return ok(await cf.listAccounts());
        case 'cf_set_active_account':  return ok(cf.setActiveAccount(args.account_id as string));

        // Workers
        case 'cf_list_workers':        return ok(await cf.listWorkers());
        case 'cf_get_worker':          return ok(await cf.getWorker(args.script_name as string));
        case 'cf_get_worker_code':     return ok(await cf.getWorkerCode(args.script_name as string));

        // D1 Databases
        case 'cf_list_d1_databases':   return ok(await cf.listD1Databases());
        case 'cf_create_d1_database':  return ok(await cf.createD1Database(args.name as string));
        case 'cf_get_d1_database':     return ok(await cf.getD1Database(args.database_id as string));
        case 'cf_delete_d1_database':  return ok(await cf.deleteD1Database(args.database_id as string));
        case 'cf_query_d1_database':   return ok(await cf.queryD1Database(args.database_id as string, args.sql as string, args.params as unknown[] | undefined));

        // KV Namespaces
        case 'cf_list_kv_namespaces':  return ok(await cf.listKVNamespaces());
        case 'cf_create_kv_namespace': return ok(await cf.createKVNamespace(args.title as string));
        case 'cf_get_kv_namespace':    return ok(await cf.getKVNamespace(args.namespace_id as string));
        case 'cf_update_kv_namespace': return ok(await cf.updateKVNamespace(args.namespace_id as string, args.title as string));
        case 'cf_delete_kv_namespace': return ok(await cf.deleteKVNamespace(args.namespace_id as string));

        // R2 Buckets
        case 'cf_list_r2_buckets':     return ok(await cf.listR2Buckets());
        case 'cf_create_r2_bucket':    return ok(await cf.createR2Bucket(args.name as string));
        case 'cf_get_r2_bucket':       return ok(await cf.getR2Bucket(args.bucket_name as string));
        case 'cf_delete_r2_bucket':    return ok(await cf.deleteR2Bucket(args.bucket_name as string));

        // Hyperdrive
        case 'cf_list_hyperdrive_configs':  return ok(await cf.listHyperdriveConfigs());
        case 'cf_get_hyperdrive_config':    return ok(await cf.getHyperdriveConfig(args.config_id as string));
        case 'cf_edit_hyperdrive_config':   return ok(await cf.editHyperdriveConfig(args.config_id as string, args as Record<string, unknown>));
        case 'cf_delete_hyperdrive_config': return ok(await cf.deleteHyperdriveConfig(args.config_id as string));

        // Documentation
        case 'cf_search_documentation':           return ok(await cf.searchDocumentation(args.query as string));
        case 'cf_migrate_pages_to_workers_guide':  return ok(cf.migratePageToWorkersGuide());

        default:
          return { content: [{ type: 'text' as const, text: `Unknown tool: ${toolName}` }], isError: true };
      }
    } catch (error) {
      return { content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
    }
  },
};
