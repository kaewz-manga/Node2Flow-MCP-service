/**
 * PostgREST MCP Plugin - 10 Tool Definitions
 * Ported from @node2flow/postgrest-mcp (community)
 */

import type { MCPToolDefinition } from '../../types';

export const TOOLS: MCPToolDefinition[] = [
  // ========== Schema (2) ==========
  {
    name: 'pg_get_schema',
    description: 'Get the PostgREST OpenAPI schema — lists all available tables, views, functions, and their columns/types. Use this first to discover the database structure.',
    inputSchema: {
      type: 'object',
      properties: {
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
    },
    annotations: {
      title: 'Get OpenAPI Schema',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'pg_describe_table',
    description: 'Get detailed column information for a table/view — column names, types, formats, required fields, defaults, and constraints. Parsed from the OpenAPI schema.',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table or view name to describe' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
      required: ['table'],
    },
    annotations: {
      title: 'Describe Table',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },

  // ========== Read (3) ==========
  {
    name: 'pg_list_records',
    description: [
      'List records from a table/view with filtering, column selection, ordering, and pagination.',
      '',
      'Filter syntax (PostgREST operators):',
      '  age=gt.18              — greater than',
      '  status=eq.active       — equals',
      '  name=ilike.*john*      — case-insensitive LIKE',
      '  id=in.(1,2,3)          — IN list',
      '  deleted_at=is.null     — NULL check',
      '  or=(age.lt.18,age.gt.65) — OR conditions',
      '',
      'Select syntax (column selection + resource embedding):',
      '  id,name,email          — specific columns',
      '  *,orders(*)            — embed related table (JOIN)',
      '  id,user:user_id(name)  — renamed embed with column selection',
      '',
      'Order syntax:',
      '  created_at.desc        — descending',
      '  status.asc,name.desc   — multiple columns',
    ].join('\n'),
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table or view name' },
        select: { type: 'string', description: 'Column selection + resource embedding, e.g. "id,name,orders(*)"' },
        filter: { type: 'string', description: 'PostgREST filter string, e.g. "age=gt.18&status=eq.active"' },
        order: { type: 'string', description: 'Sort order, e.g. "created_at.desc" or "status.asc,name.desc"' },
        limit: { type: 'integer', description: 'Maximum number of records to return' },
        offset: { type: 'integer', description: 'Number of records to skip (for pagination)' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
      required: ['table'],
    },
    annotations: {
      title: 'List Records',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: 'pg_count_records',
    description: 'Count records in a table/view matching optional filters. Returns count using exact (precise but slower), planned (fast estimate from query planner), or estimated method.',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table or view name' },
        filter: { type: 'string', description: 'PostgREST filter string, e.g. "status=eq.active"' },
        count: { type: 'string', description: 'Count method: "exact" (default, precise), "planned" (fast, uses query planner stats), or "estimated"' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
      required: ['table'],
    },
    annotations: {
      title: 'Count Records',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: 'pg_call_function',
    description: 'Call a PostgreSQL function/procedure via RPC. Use POST (default) for volatile functions, GET for immutable/stable functions. Parameters are passed as JSON body (POST) or query string (GET).',
    inputSchema: {
      type: 'object',
      properties: {
        function_name: { type: 'string', description: 'Function name to call (maps to /rpc/{function_name})' },
        params: {
          type: 'object',
          description: 'Function parameters as key-value pairs, e.g. {"user_id": 1, "status": "active"}',
        },
        method: { type: 'string', description: 'HTTP method: "POST" (default, volatile functions) or "GET" (immutable/stable functions)' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
      required: ['function_name'],
    },
    annotations: {
      title: 'Call Function (RPC)',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
  },

  // ========== Write (5) ==========
  {
    name: 'pg_insert_records',
    description: 'Insert one or more records into a table. Pass a single object or array of objects. Use return="representation" to get the created records back.',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name' },
        records: {
          description: 'Single record object or array of record objects to insert',
        },
        return: { type: 'string', description: 'Return preference: "representation" (return created records), "minimal" (no body), "headers-only"' },
        select: { type: 'string', description: 'Columns to return when return=representation, e.g. "id,name"' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
      required: ['table', 'records'],
    },
    annotations: {
      title: 'Insert Records',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
  },
  {
    name: 'pg_update_records',
    description: 'Update records matching a filter. IMPORTANT: filter is required to prevent accidental full-table updates. Use return="representation" to see updated records.',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name' },
        filter: { type: 'string', description: 'PostgREST filter string (REQUIRED for safety), e.g. "id=eq.1" or "status=eq.inactive"' },
        data: {
          type: 'object',
          description: 'Fields to update as key-value pairs, e.g. {"name": "New Name", "status": "active"}',
        },
        return: { type: 'string', description: 'Return preference: "representation" (return updated records), "minimal", "headers-only"' },
        select: { type: 'string', description: 'Columns to return when return=representation' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
      required: ['table', 'filter', 'data'],
    },
    annotations: {
      title: 'Update Records',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: 'pg_upsert_records',
    description: 'Insert or update records (upsert). Uses "merge-duplicates" (update existing) or "ignore-duplicates" (skip existing) resolution. Conflict detection uses primary key by default, or specify on_conflict column.',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name' },
        records: {
          description: 'Single record object or array of record objects to upsert',
        },
        resolution: { type: 'string', description: 'Conflict resolution: "merge-duplicates" (default, update existing) or "ignore-duplicates" (skip existing)' },
        on_conflict: { type: 'string', description: 'Column(s) to detect conflicts on, e.g. "email" or "sku,region". Defaults to primary key.' },
        return: { type: 'string', description: 'Return preference: "representation", "minimal", "headers-only"' },
        select: { type: 'string', description: 'Columns to return when return=representation' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
      required: ['table', 'records'],
    },
    annotations: {
      title: 'Upsert Records',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: 'pg_delete_records',
    description: 'Delete records matching a filter. IMPORTANT: filter is required to prevent accidental full-table deletion. Use return="representation" to see deleted records.',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name' },
        filter: { type: 'string', description: 'PostgREST filter string (REQUIRED for safety), e.g. "id=eq.1" or "status=eq.inactive"' },
        return: { type: 'string', description: 'Return preference: "representation" (return deleted records), "minimal", "headers-only"' },
        select: { type: 'string', description: 'Columns to return when return=representation' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
      required: ['table', 'filter'],
    },
    annotations: {
      title: 'Delete Records',
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: 'pg_replace_record',
    description: 'Full replace (PUT) a single record matching a filter. All columns must be specified including the primary key. Creates the record if it does not exist.',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name' },
        filter: { type: 'string', description: 'PostgREST filter to identify the record, e.g. "id=eq.1"' },
        data: {
          type: 'object',
          description: 'Complete record data (all columns including primary key)',
        },
        return: { type: 'string', description: 'Return preference: "representation", "minimal", "headers-only"' },
        select: { type: 'string', description: 'Columns to return when return=representation' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
      required: ['table', 'filter', 'data'],
    },
    annotations: {
      title: 'Replace Record (PUT)',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
];
