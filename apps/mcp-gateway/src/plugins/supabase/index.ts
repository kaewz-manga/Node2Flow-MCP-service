/**
 * Supabase Plugin - MCP Gateway
 * Two clients: SupabaseClient (REST+Storage+Auth) + ManagementClient (api.supabase.com)
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { SupabaseClient } from './supabase-client';
import { ManagementClient } from './management-client';

export const supabasePlugin: MCPPlugin = {
  id: 'supabase',
  name: 'Supabase',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    // Return a wrapper containing both clients
    const url = config.supabase_url as string | undefined;
    const serviceRoleKey = config.service_role_key as string | undefined;
    const accessToken = config.access_token as string | undefined;

    return {
      supabase: url && serviceRoleKey ? new SupabaseClient({ url, serviceRoleKey }) : null,
      management: accessToken ? new ManagementClient({ accessToken }) : null,
    };
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const { supabase, management } = client as {
      supabase: SupabaseClient | null;
      management: ManagementClient | null;
    };

    // Strip _fields param
    const { _fields, ...params } = args;

    try {
      let result: unknown;

      switch (toolName) {
        // ========== Database — REST API (6) ==========
        case 'sb_list_records': {
          if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for database operations');
          result = await supabase.listRecords(params.table as string, {
            select: params.select as string | undefined,
            filter: params.filter as string | undefined,
            order: params.order as string | undefined,
            limit: params.limit as number | undefined,
            offset: params.offset as number | undefined,
          });
          break;
        }
        case 'sb_insert_records': {
          if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
          result = await supabase.insertRecords(params.table as string, params.records, {
            return: params.return as string | undefined,
            select: params.select as string | undefined,
          });
          break;
        }
        case 'sb_update_records': {
          if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
          result = await supabase.updateRecords(params.table as string, params.filter as string, params.data as Record<string, unknown>, {
            return: params.return as string | undefined,
            select: params.select as string | undefined,
          });
          break;
        }
        case 'sb_upsert_records': {
          if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
          result = await supabase.upsertRecords(params.table as string, params.records, {
            resolution: params.resolution as string | undefined,
            return: params.return as string | undefined,
            select: params.select as string | undefined,
            onConflict: params.on_conflict as string | undefined,
          });
          break;
        }
        case 'sb_delete_records': {
          if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
          result = await supabase.deleteRecords(params.table as string, params.filter as string, {
            return: params.return as string | undefined,
            select: params.select as string | undefined,
          });
          break;
        }
        case 'sb_call_function': {
          if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
          result = await supabase.callFunction(params.function_name as string, {
            params: params.params as Record<string, unknown> | undefined,
            method: params.method as string | undefined,
          });
          break;
        }

        // ========== Storage API (6) ==========
        case 'sb_list_buckets': {
          if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for storage');
          result = await supabase.listBuckets();
          break;
        }
        case 'sb_create_bucket': {
          if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
          result = await supabase.createBucket({
            name: params.name as string,
            public: params.public as boolean | undefined,
            fileSizeLimit: params.file_size_limit as number | undefined,
            allowedMimeTypes: params.allowed_mime_types as string[] | undefined,
          });
          break;
        }
        case 'sb_delete_bucket': {
          if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
          result = await supabase.deleteBucket(params.bucket_id as string);
          break;
        }
        case 'sb_list_objects': {
          if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
          result = await supabase.listObjects(params.bucket as string, {
            prefix: params.prefix as string | undefined,
            limit: params.limit as number | undefined,
            offset: params.offset as number | undefined,
            search: params.search as string | undefined,
            sortBy: params.sort_column ? { column: params.sort_column as string, order: (params.sort_order as string) || 'asc' } : undefined,
          });
          break;
        }
        case 'sb_delete_objects': {
          if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
          result = await supabase.deleteObjects(params.bucket as string, params.prefixes as string[]);
          break;
        }
        case 'sb_create_signed_url': {
          if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
          result = await supabase.createSignedUrl(params.bucket as string, params.path as string, params.expires_in as number);
          break;
        }

        // ========== Auth Admin API (5) ==========
        case 'sb_list_users': {
          if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for auth admin');
          result = await supabase.listUsers({ page: params.page as number | undefined, perPage: params.per_page as number | undefined });
          break;
        }
        case 'sb_get_user': {
          if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
          result = await supabase.getUser(params.user_id as string);
          break;
        }
        case 'sb_create_user': {
          if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
          result = await supabase.createUser({
            email: params.email as string | undefined,
            phone: params.phone as string | undefined,
            password: params.password as string | undefined,
            emailConfirm: params.email_confirm as boolean | undefined,
            phoneConfirm: params.phone_confirm as boolean | undefined,
            userMetadata: params.user_metadata as Record<string, unknown> | undefined,
            appMetadata: params.app_metadata as Record<string, unknown> | undefined,
          });
          break;
        }
        case 'sb_update_user': {
          if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
          result = await supabase.updateUser(params.user_id as string, {
            email: params.email as string | undefined,
            phone: params.phone as string | undefined,
            password: params.password as string | undefined,
            emailConfirm: params.email_confirm as boolean | undefined,
            phoneConfirm: params.phone_confirm as boolean | undefined,
            userMetadata: params.user_metadata as Record<string, unknown> | undefined,
            appMetadata: params.app_metadata as Record<string, unknown> | undefined,
            banDuration: params.ban_duration as string | undefined,
          });
          break;
        }
        case 'sb_delete_user': {
          if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
          result = await supabase.deleteUser(params.user_id as string);
          break;
        }

        // ========== Management API — Projects (5) ==========
        case 'sb_list_projects': {
          if (!management) throw new Error('SUPABASE_ACCESS_TOKEN is required for management operations');
          result = await management.listProjects();
          break;
        }
        case 'sb_get_project': {
          if (!management) throw new Error('SUPABASE_ACCESS_TOKEN is required');
          result = await management.getProject(params.project_ref as string);
          break;
        }
        case 'sb_create_project': {
          if (!management) throw new Error('SUPABASE_ACCESS_TOKEN is required');
          result = await management.createProject({
            name: params.name as string,
            organization_id: params.organization_id as string,
            region: params.region as string,
            db_pass: params.db_pass as string,
            plan: params.plan as string | undefined,
          });
          break;
        }
        case 'sb_pause_project': {
          if (!management) throw new Error('SUPABASE_ACCESS_TOKEN is required');
          result = await management.pauseProject(params.project_ref as string);
          break;
        }
        case 'sb_restore_project': {
          if (!management) throw new Error('SUPABASE_ACCESS_TOKEN is required');
          result = await management.restoreProject(params.project_ref as string);
          break;
        }

        // ========== Management API — Database (3) ==========
        case 'sb_run_query': {
          if (!management) throw new Error('SUPABASE_ACCESS_TOKEN is required for database management');
          result = await management.runQuery(params.project_ref as string, params.query as string);
          break;
        }
        case 'sb_list_migrations': {
          if (!management) throw new Error('SUPABASE_ACCESS_TOKEN is required');
          result = await management.listMigrations(params.project_ref as string);
          break;
        }
        case 'sb_get_typescript_types': {
          if (!management) throw new Error('SUPABASE_ACCESS_TOKEN is required');
          result = await management.getTypescriptTypes(params.project_ref as string);
          break;
        }

        // ========== Management API — Edge Functions (2) ==========
        case 'sb_list_functions': {
          if (!management) throw new Error('SUPABASE_ACCESS_TOKEN is required');
          result = await management.listFunctions(params.project_ref as string);
          break;
        }
        case 'sb_get_function': {
          if (!management) throw new Error('SUPABASE_ACCESS_TOKEN is required');
          result = await management.getFunction(params.project_ref as string, params.function_slug as string);
          break;
        }

        // ========== Management API — Secrets & Keys (4) ==========
        case 'sb_list_secrets': {
          if (!management) throw new Error('SUPABASE_ACCESS_TOKEN is required');
          result = await management.listSecrets(params.project_ref as string);
          break;
        }
        case 'sb_create_secrets': {
          if (!management) throw new Error('SUPABASE_ACCESS_TOKEN is required');
          result = await management.createSecrets(params.project_ref as string, params.secrets as Array<{ name: string; value: string }>);
          break;
        }
        case 'sb_delete_secrets': {
          if (!management) throw new Error('SUPABASE_ACCESS_TOKEN is required');
          result = await management.deleteSecrets(params.project_ref as string, params.names as string[]);
          break;
        }
        case 'sb_list_api_keys': {
          if (!management) throw new Error('SUPABASE_ACCESS_TOKEN is required');
          result = await management.listApiKeys(params.project_ref as string);
          break;
        }

        default:
          return { content: [{ type: 'text' as const, text: `Unknown tool: ${toolName}` }], isError: true };
      }

      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }], isError: false };
    } catch (error) {
      return { content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
    }
  },
};
