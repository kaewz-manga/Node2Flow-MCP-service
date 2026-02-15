/**
 * MCP Tool Definitions (25 tools)
 * Cloudflare account, Workers, D1, KV, R2, Hyperdrive, and documentation management
 */

import type { MCPToolDefinition } from '../../types';

export const TOOLS: MCPToolDefinition[] = [
  // ========== Account Tools (2) ==========
  {
    name: 'cf_list_accounts',
    description: 'List all Cloudflare accounts accessible with the current API token. Returns account ID, name, and type. Use this first to find your account ID, then set it with cf_set_active_account before using other tools.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    annotations: {
      title: 'List Accounts',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'cf_set_active_account',
    description: 'Set the active Cloudflare account ID for subsequent API calls. Most tools require an account ID. Call cf_list_accounts first to find the correct ID, then set it here. Persists for the session.',
    inputSchema: {
      type: 'object',
      properties: {
        account_id: { type: 'string', description: 'Cloudflare account ID from cf_list_accounts' },
      },
      required: ['account_id'],
    },
    annotations: {
      title: 'Set Active Account',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },

  // ========== Worker Tools (3) ==========
  {
    name: 'cf_list_workers',
    description: 'List all Workers scripts in the active account. Returns script name, handlers, usage model, and modification dates. Requires active account to be set.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    annotations: {
      title: 'List Workers',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'cf_get_worker',
    description: 'Get metadata for a specific Worker script including handlers, compatibility date, and bindings. Use cf_list_workers first to find script names. Does not return source code (use cf_get_worker_code for that).',
    inputSchema: {
      type: 'object',
      properties: {
        script_name: { type: 'string', description: 'Worker script name from cf_list_workers' },
      },
      required: ['script_name'],
    },
    annotations: {
      title: 'Get Worker',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'cf_get_worker_code',
    description: 'Download the source code of a Worker script. Returns the JavaScript/TypeScript source. Useful for reviewing deployed code or debugging production issues.',
    inputSchema: {
      type: 'object',
      properties: {
        script_name: { type: 'string', description: 'Worker script name from cf_list_workers' },
      },
      required: ['script_name'],
    },
    annotations: {
      title: 'Get Worker Code',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },

  // ========== D1 Database Tools (5) ==========
  {
    name: 'cf_list_d1_databases',
    description: 'List all D1 databases in the active account. Returns database UUID, name, version, table count, and file size. Use this to find database IDs for queries.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    annotations: {
      title: 'List D1 Databases',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'cf_create_d1_database',
    description: 'Create a new D1 SQLite database. Provide a descriptive name. Returns the new database UUID needed for queries and bindings. Database starts empty — use cf_query_d1_database to create tables.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Database name (e.g., "my-app-db", "analytics")' },
      },
      required: ['name'],
    },
    annotations: {
      title: 'Create D1 Database',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'cf_get_d1_database',
    description: 'Get details for a specific D1 database including name, version, table count, and file size. Use cf_list_d1_databases to find the database UUID first.',
    inputSchema: {
      type: 'object',
      properties: {
        database_id: { type: 'string', description: 'D1 database UUID from cf_list_d1_databases' },
      },
      required: ['database_id'],
    },
    annotations: {
      title: 'Get D1 Database',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'cf_delete_d1_database',
    description: 'Permanently delete a D1 database and all its data. This cannot be undone. Remove Worker bindings referencing this database first. Use with extreme caution.',
    inputSchema: {
      type: 'object',
      properties: {
        database_id: { type: 'string', description: 'D1 database UUID to permanently delete' },
      },
      required: ['database_id'],
    },
    annotations: {
      title: 'Delete D1 Database',
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'cf_query_d1_database',
    description: 'Execute SQL query against a D1 database. Supports SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, and any valid SQL. Use parameterized queries with ? placeholders for safe value insertion.',
    inputSchema: {
      type: 'object',
      properties: {
        database_id: { type: 'string', description: 'D1 database UUID from cf_list_d1_databases' },
        sql: { type: 'string', description: 'SQL query with ? placeholders (e.g., "SELECT * FROM users WHERE id = ?")' },
        params: { type: 'array', description: 'Parameter values for ? placeholders in order (optional)' },
      },
      required: ['database_id', 'sql'],
    },
    annotations: {
      title: 'Query D1 Database',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },

  // ========== KV Namespace Tools (5) ==========
  {
    name: 'cf_list_kv_namespaces',
    description: 'List all KV namespaces in the active account. Returns namespace ID and title. KV is a key-value store for caching, configuration, and session data.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    annotations: {
      title: 'List KV Namespaces',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'cf_create_kv_namespace',
    description: 'Create a new KV namespace for key-value storage. Provide a descriptive title. Returns the namespace ID needed for Worker bindings and direct API access.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Namespace title (e.g., "RATE_LIMIT", "SESSION_STORE")' },
      },
      required: ['title'],
    },
    annotations: {
      title: 'Create KV Namespace',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'cf_get_kv_namespace',
    description: 'Get details for a specific KV namespace including title and ID. Use cf_list_kv_namespaces to find the namespace ID first.',
    inputSchema: {
      type: 'object',
      properties: {
        namespace_id: { type: 'string', description: 'KV namespace ID from cf_list_kv_namespaces' },
      },
      required: ['namespace_id'],
    },
    annotations: {
      title: 'Get KV Namespace',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'cf_update_kv_namespace',
    description: 'Rename a KV namespace. Does not affect stored data or Worker bindings. Use this to fix typos or improve naming consistency.',
    inputSchema: {
      type: 'object',
      properties: {
        namespace_id: { type: 'string', description: 'KV namespace ID to rename' },
        title: { type: 'string', description: 'New namespace title' },
      },
      required: ['namespace_id', 'title'],
    },
    annotations: {
      title: 'Update KV Namespace',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'cf_delete_kv_namespace',
    description: 'Permanently delete a KV namespace and all its key-value pairs. This cannot be undone. Remove Worker bindings referencing this namespace first. Use with extreme caution.',
    inputSchema: {
      type: 'object',
      properties: {
        namespace_id: { type: 'string', description: 'KV namespace ID to permanently delete' },
      },
      required: ['namespace_id'],
    },
    annotations: {
      title: 'Delete KV Namespace',
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
  },

  // ========== R2 Bucket Tools (4) ==========
  {
    name: 'cf_list_r2_buckets',
    description: 'List all R2 storage buckets in the active account. Returns bucket name, creation date, and location. R2 is S3-compatible object storage with no egress fees.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    annotations: {
      title: 'List R2 Buckets',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'cf_create_r2_bucket',
    description: 'Create a new R2 storage bucket for object storage. Bucket names must be globally unique, 3-63 characters, lowercase letters, numbers, and hyphens only. Returns the new bucket details.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Globally unique bucket name (lowercase, 3-63 chars, e.g., "my-app-assets")' },
      },
      required: ['name'],
    },
    annotations: {
      title: 'Create R2 Bucket',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'cf_get_r2_bucket',
    description: 'Get details for a specific R2 bucket including creation date and location. Use cf_list_r2_buckets to find bucket names first.',
    inputSchema: {
      type: 'object',
      properties: {
        bucket_name: { type: 'string', description: 'R2 bucket name from cf_list_r2_buckets' },
      },
      required: ['bucket_name'],
    },
    annotations: {
      title: 'Get R2 Bucket',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'cf_delete_r2_bucket',
    description: 'Permanently delete an R2 bucket. Bucket must be empty — delete all objects first. This cannot be undone. Remove Worker bindings referencing this bucket first.',
    inputSchema: {
      type: 'object',
      properties: {
        bucket_name: { type: 'string', description: 'R2 bucket name to permanently delete' },
      },
      required: ['bucket_name'],
    },
    annotations: {
      title: 'Delete R2 Bucket',
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
  },

  // ========== Hyperdrive Config Tools (4) ==========
  {
    name: 'cf_list_hyperdrive_configs',
    description: 'List all Hyperdrive configurations in the active account. Hyperdrive accelerates PostgreSQL database connections from Workers by pooling and caching. Returns config ID, name, and connection details.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    annotations: {
      title: 'List Hyperdrive Configs',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'cf_get_hyperdrive_config',
    description: 'Get details for a specific Hyperdrive configuration including origin database connection info and caching settings. Use cf_list_hyperdrive_configs to find config IDs first.',
    inputSchema: {
      type: 'object',
      properties: {
        config_id: { type: 'string', description: 'Hyperdrive config ID from cf_list_hyperdrive_configs' },
      },
      required: ['config_id'],
    },
    annotations: {
      title: 'Get Hyperdrive Config',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'cf_edit_hyperdrive_config',
    description: 'Update a Hyperdrive configuration. Modify origin database connection, caching settings, or name. Changes take effect within seconds. Use this to rotate database credentials or adjust cache TTL.',
    inputSchema: {
      type: 'object',
      properties: {
        config_id: { type: 'string', description: 'Hyperdrive config ID to modify' },
        name: { type: 'string', description: 'New config name (optional)' },
        origin: { type: 'object', description: 'Origin database connection: { scheme, host, port, database, user, password } (optional)' },
        caching: { type: 'object', description: 'Caching settings: { disabled, max_age, stale_while_revalidate } (optional)' },
      },
      required: ['config_id'],
    },
    annotations: {
      title: 'Edit Hyperdrive Config',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'cf_delete_hyperdrive_config',
    description: 'Permanently delete a Hyperdrive configuration. Workers using this config will lose database acceleration. Remove Worker bindings referencing this config first. Cannot be undone.',
    inputSchema: {
      type: 'object',
      properties: {
        config_id: { type: 'string', description: 'Hyperdrive config ID to permanently delete' },
      },
      required: ['config_id'],
    },
    annotations: {
      title: 'Delete Hyperdrive Config',
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
  },

  // ========== Documentation Tools (2) ==========
  {
    name: 'cf_search_documentation',
    description: 'Search Cloudflare developer documentation for guides, API references, and tutorials. Returns matching documentation pages with titles and URLs. Use this to find how-to guides and configuration examples.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query (e.g., "D1 bindings", "Workers cron triggers", "R2 presigned URLs")' },
      },
      required: ['query'],
    },
    annotations: {
      title: 'Search Documentation',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'cf_migrate_pages_to_workers_guide',
    description: 'Get a step-by-step guide for migrating from Cloudflare Pages to Workers. Covers routing, functions, static assets, builds, and bindings differences. No input required.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    annotations: {
      title: 'Pages to Workers Migration Guide',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
];
