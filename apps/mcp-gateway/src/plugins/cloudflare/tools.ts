/**
 * Cloudflare MCP Tool Definitions
 * Official Cloudflare MCP servers (https://github.com/cloudflare/mcp-server-cloudflare)
 * All tool names prefixed with cf_ to avoid conflicts.
 *
 * 15 services: docs, workers-bindings, workers-builds, observability, radar,
 * container, browser-rendering, logpush, ai-gateway, autorag, auditlogs,
 * dns-analytics, dex, casb, graphql
 */

import type { MCPToolDefinition } from '../../types';

/**
 * Maps each gateway tool name (cf_ prefixed) to its Cloudflare MCP service key.
 * Used by the client to route calls to the correct endpoint.
 */
export const TOOL_SERVICE_MAP: Record<string, string> = {};

// Helper to register tools and their service mapping
function service(svc: string, tools: MCPToolDefinition[]): MCPToolDefinition[] {
  for (const t of tools) {
    TOOL_SERVICE_MAP[t.name] = svc;
  }
  return tools;
}

// ================================================================
//  1. DOCS - Cloudflare documentation search
// ================================================================
const DOCS_TOOLS: MCPToolDefinition[] = service('docs', [
  {
    name: 'cf_search_cloudflare_documentation',
    description: 'Search Cloudflare documentation for products like Workers, Zero Trust, CDN, R2, D1, and more.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query with relevant keywords and technical terms' },
        scoreThreshold: { type: 'number', description: 'Score threshold 0-1 for match quality' },
        maxNumResults: { type: 'number', description: 'Max results to return (default: 10)' },
      },
      required: ['query'],
    },
  },
]);

// ================================================================
//  2. WORKERS BINDINGS - KV, R2, D1, Workers, Hyperdrive
// ================================================================
const BINDINGS_TOOLS: MCPToolDefinition[] = service('bindings', [
  {
    name: 'cf_accounts_list',
    description: 'List all accounts in your Cloudflare account.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'cf_set_active_account',
    description: 'Set active Cloudflare account to use for subsequent tool calls.',
    inputSchema: {
      type: 'object',
      properties: {
        activeAccountIdParam: { type: 'string', description: 'The Cloudflare account ID to set as active' },
      },
      required: ['activeAccountIdParam'],
    },
  },
  // --- Workers ---
  {
    name: 'cf_workers_list',
    description: 'List all Workers in your Cloudflare account.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'cf_workers_get_worker',
    description: 'Get details of a Cloudflare Worker by script name.',
    inputSchema: {
      type: 'object',
      properties: {
        scriptName: { type: 'string', description: 'The name of the worker script' },
      },
      required: ['scriptName'],
    },
  },
  {
    name: 'cf_workers_get_worker_code',
    description: 'Get the source code of a Cloudflare Worker. May return bundled version.',
    inputSchema: {
      type: 'object',
      properties: {
        scriptName: { type: 'string', description: 'The name of the worker script' },
      },
      required: ['scriptName'],
    },
  },
  // --- KV ---
  {
    name: 'cf_kv_namespaces_list',
    description: 'List all KV namespaces in your Cloudflare account.',
    inputSchema: {
      type: 'object',
      properties: {
        direction: { type: 'string', enum: ['asc', 'desc'], description: 'Sort direction' },
        order: { type: 'string', enum: ['id', 'title'], description: 'Sort field' },
        page: { type: 'number', description: 'Page number' },
        per_page: { type: 'number', description: 'Results per page (1-100)' },
      },
    },
  },
  {
    name: 'cf_kv_namespace_create',
    description: 'Create a new KV namespace.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Human-readable name for the KV namespace' },
      },
      required: ['title'],
    },
  },
  {
    name: 'cf_kv_namespace_delete',
    description: 'Delete a KV namespace.',
    inputSchema: {
      type: 'object',
      properties: {
        namespace_id: { type: 'string', description: 'KV namespace ID' },
      },
      required: ['namespace_id'],
    },
  },
  {
    name: 'cf_kv_namespace_get',
    description: 'Get details of a KV namespace.',
    inputSchema: {
      type: 'object',
      properties: {
        namespace_id: { type: 'string', description: 'KV namespace ID' },
      },
      required: ['namespace_id'],
    },
  },
  {
    name: 'cf_kv_namespace_update',
    description: 'Update the title of a KV namespace.',
    inputSchema: {
      type: 'object',
      properties: {
        namespace_id: { type: 'string', description: 'KV namespace ID' },
        title: { type: 'string', description: 'New title' },
      },
      required: ['namespace_id', 'title'],
    },
  },
  // --- R2 ---
  {
    name: 'cf_r2_buckets_list',
    description: 'List R2 buckets in your Cloudflare account.',
    inputSchema: {
      type: 'object',
      properties: {
        cursor: { type: 'string', description: 'Pagination cursor' },
        direction: { type: 'string', enum: ['asc', 'desc'] },
        name_contains: { type: 'string', description: 'Filter by bucket name' },
        per_page: { type: 'number' },
      },
    },
  },
  {
    name: 'cf_r2_bucket_create',
    description: 'Create a new R2 bucket.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Bucket name' },
      },
      required: ['name'],
    },
  },
  {
    name: 'cf_r2_bucket_get',
    description: 'Get details about a specific R2 bucket.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Bucket name' },
      },
      required: ['name'],
    },
  },
  {
    name: 'cf_r2_bucket_delete',
    description: 'Delete an R2 bucket.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Bucket name' },
      },
      required: ['name'],
    },
  },
  // --- D1 ---
  {
    name: 'cf_d1_databases_list',
    description: 'List all D1 databases in your Cloudflare account.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Filter by database name' },
        page: { type: 'number' },
        per_page: { type: 'number' },
      },
    },
  },
  {
    name: 'cf_d1_database_create',
    description: 'Create a new D1 database.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Database name' },
        primary_location_hint: { type: 'string', enum: ['wnam', 'enam', 'weur', 'eeur', 'apac', 'oc'], description: 'Geographic location hint' },
      },
      required: ['name'],
    },
  },
  {
    name: 'cf_d1_database_delete',
    description: 'Delete a D1 database.',
    inputSchema: {
      type: 'object',
      properties: {
        database_id: { type: 'string', description: 'Database ID' },
      },
      required: ['database_id'],
    },
  },
  {
    name: 'cf_d1_database_get',
    description: 'Get a D1 database details.',
    inputSchema: {
      type: 'object',
      properties: {
        database_id: { type: 'string', description: 'Database ID' },
      },
      required: ['database_id'],
    },
  },
  {
    name: 'cf_d1_database_query',
    description: 'Execute a SQL query against a D1 database.',
    inputSchema: {
      type: 'object',
      properties: {
        database_id: { type: 'string', description: 'Database ID' },
        sql: { type: 'string', description: 'SQL query to execute' },
        params: { type: 'array', items: { type: 'string' }, description: 'Query bind parameters' },
      },
      required: ['database_id', 'sql'],
    },
  },
  // --- Hyperdrive ---
  {
    name: 'cf_hyperdrive_configs_list',
    description: 'List Hyperdrive configurations.',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number' },
        per_page: { type: 'number' },
        order: { type: 'string', enum: ['id', 'name'] },
        direction: { type: 'string', enum: ['asc', 'desc'] },
      },
    },
  },
  {
    name: 'cf_hyperdrive_config_get',
    description: 'Get details of a Hyperdrive configuration.',
    inputSchema: {
      type: 'object',
      properties: {
        hyperdrive_id: { type: 'string', description: 'Hyperdrive configuration ID' },
      },
      required: ['hyperdrive_id'],
    },
  },
  {
    name: 'cf_hyperdrive_config_delete',
    description: 'Delete a Hyperdrive configuration.',
    inputSchema: {
      type: 'object',
      properties: {
        hyperdrive_id: { type: 'string', description: 'Hyperdrive configuration ID' },
      },
      required: ['hyperdrive_id'],
    },
  },
]);

// ================================================================
//  3. WORKERS BUILDS
// ================================================================
const BUILDS_TOOLS: MCPToolDefinition[] = service('builds', [
  {
    name: 'cf_workers_builds_set_active_worker',
    description: 'Set the active Worker ID for subsequent build-related calls.',
    inputSchema: {
      type: 'object',
      properties: {
        workerId: { type: 'string', description: 'The Worker ID to set as active' },
      },
      required: ['workerId'],
    },
  },
  {
    name: 'cf_workers_builds_list_builds',
    description: 'List builds for a Cloudflare Worker.',
    inputSchema: {
      type: 'object',
      properties: {
        workerId: { type: 'string', description: 'Worker ID' },
        page: { type: 'number', description: 'Page number (default: 1)' },
        perPage: { type: 'number', description: 'Builds per page (default: 10)' },
      },
    },
  },
  {
    name: 'cf_workers_builds_get_build',
    description: 'Get details for a specific Worker build by UUID.',
    inputSchema: {
      type: 'object',
      properties: {
        buildUUID: { type: 'string', description: 'Build UUID' },
      },
      required: ['buildUUID'],
    },
  },
  {
    name: 'cf_workers_builds_get_build_logs',
    description: 'Get logs for a Cloudflare Workers build.',
    inputSchema: {
      type: 'object',
      properties: {
        buildUUID: { type: 'string', description: 'Build UUID' },
      },
      required: ['buildUUID'],
    },
  },
]);

// ================================================================
//  4. OBSERVABILITY - Workers logs & metrics
// ================================================================
const OBSERVABILITY_TOOLS: MCPToolDefinition[] = service('observability', [
  {
    name: 'cf_query_worker_observability',
    description: 'Query Workers Observability API to analyze logs and metrics. Supports events, calculations, and invocations views.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'object',
          description: 'Query object with queryId, view (events/calculations/invocations), parameters (filters, calculations, groupBys), timeframe, and limit',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'cf_observability_keys',
    description: 'Find available keys in Workers Observability data. Set high limit (1000+) to see all keys.',
    inputSchema: {
      type: 'object',
      properties: {
        keysQuery: {
          type: 'object',
          description: 'Keys query with timeframe, datasets, filters, limit, and needle',
        },
      },
      required: ['keysQuery'],
    },
  },
  {
    name: 'cf_observability_values',
    description: 'Find values for a specific key in Workers Observability data.',
    inputSchema: {
      type: 'object',
      properties: {
        valuesQuery: {
          type: 'object',
          description: 'Values query with timeframe, key, type (string/boolean/number), datasets, filters, limit',
        },
      },
      required: ['valuesQuery'],
    },
  },
]);

// ================================================================
//  5. RADAR - Internet insights, traffic, attacks, URL scanning
// ================================================================
const RADAR_TOOLS: MCPToolDefinition[] = service('radar', [
  {
    name: 'cf_list_autonomous_systems',
    description: 'List Autonomous Systems with optional location and ordering filters.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number' },
        offset: { type: 'number' },
        location: { type: 'string', description: 'Alpha-2 country code' },
        orderBy: { type: 'string', enum: ['ASN', 'POPULATION'] },
      },
    },
  },
  {
    name: 'cf_get_as_details',
    description: 'Get Autonomous System details by ASN.',
    inputSchema: {
      type: 'object',
      properties: {
        asn: { type: 'number', description: 'Autonomous System Number (positive)' },
      },
      required: ['asn'],
    },
  },
  {
    name: 'cf_get_ip_details',
    description: 'Get IP address information including ASN details.',
    inputSchema: {
      type: 'object',
      properties: {
        ip: { type: 'string', description: 'IPv4 or IPv6 address' },
      },
      required: ['ip'],
    },
  },
  {
    name: 'cf_get_traffic_anomalies',
    description: 'Get traffic anomalies and outages.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number' },
        offset: { type: 'number' },
        asn: { type: 'number', description: 'ASN filter' },
        location: { type: 'string', description: 'Alpha-2 country code' },
        dateRange: { type: 'string', description: 'e.g. 7d, 7dcontrol' },
        dateStart: { type: 'string', description: 'ISO-8601 datetime' },
        dateEnd: { type: 'string', description: 'ISO-8601 datetime' },
      },
    },
  },
  {
    name: 'cf_get_internet_services_ranking',
    description: 'Get top Internet services ranking.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number' },
        serviceCategory: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by category: Generative AI, E-commerce, Social Media, News, etc.',
        },
      },
    },
  },
  {
    name: 'cf_get_domains_ranking',
    description: 'Get top or trending domains.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number' },
        location: { type: 'array', items: { type: 'string' }, description: 'Alpha-2 codes' },
        rankingType: { type: 'string', enum: ['POPULAR', 'TRENDING_RISE', 'TRENDING_STEADY'] },
      },
    },
  },
  {
    name: 'cf_get_domain_rank_details',
    description: 'Get domain rank details for a specific domain.',
    inputSchema: {
      type: 'object',
      properties: {
        domain: { type: 'string', description: 'Domain name, e.g. example.com' },
      },
      required: ['domain'],
    },
  },
  {
    name: 'cf_get_http_data',
    description: 'Retrieve HTTP traffic trends with support for timeseries, summaries, and top locations/ASes.',
    inputSchema: {
      type: 'object',
      properties: {
        dimension: { type: 'string', description: 'e.g. timeseries, summary/device_type, top/locations' },
        dateRange: { type: 'array', items: { type: 'string' } },
        dateStart: { type: 'array', items: { type: 'string' } },
        dateEnd: { type: 'array', items: { type: 'string' } },
        location: { type: 'array', items: { type: 'string' } },
        asn: { type: 'array', items: { type: 'string' } },
      },
      required: ['dimension'],
    },
  },
  {
    name: 'cf_get_dns_queries_data',
    description: 'Retrieve DNS query trends to the 1.1.1.1 resolver.',
    inputSchema: {
      type: 'object',
      properties: {
        dimension: { type: 'string', description: 'e.g. timeseries, summary/query_type, top/locations' },
        dateRange: { type: 'array', items: { type: 'string' } },
        location: { type: 'array', items: { type: 'string' } },
      },
      required: ['dimension'],
    },
  },
  {
    name: 'cf_get_l7_attack_data',
    description: 'Retrieve application layer (L7) attack trends.',
    inputSchema: {
      type: 'object',
      properties: {
        dimension: { type: 'string', description: 'e.g. timeseries, summary/httpMethod, top/locations/origin' },
        dateRange: { type: 'array', items: { type: 'string' } },
        location: { type: 'array', items: { type: 'string' } },
      },
      required: ['dimension'],
    },
  },
  {
    name: 'cf_get_l3_attack_data',
    description: 'Retrieve network layer (L3/DDoS) attack trends.',
    inputSchema: {
      type: 'object',
      properties: {
        dimension: { type: 'string', description: 'e.g. timeseries, summary/protocol, top/locations/origin' },
        dateRange: { type: 'array', items: { type: 'string' } },
        location: { type: 'array', items: { type: 'string' } },
      },
      required: ['dimension'],
    },
  },
  {
    name: 'cf_get_internet_quality_data',
    description: 'Get bandwidth, latency, or DNS response time percentiles from Radar IQI.',
    inputSchema: {
      type: 'object',
      properties: {
        format: { type: 'string', enum: ['summary', 'timeseriesGroups'] },
        metric: { type: 'string', enum: ['BANDWIDTH', 'DNS', 'LATENCY'] },
        location: { type: 'array', items: { type: 'string' } },
        asn: { type: 'array', items: { type: 'string' } },
        dateRange: { type: 'array', items: { type: 'string' } },
      },
      required: ['format', 'metric'],
    },
  },
  {
    name: 'cf_get_bgp_hijacks',
    description: 'Retrieve BGP hijack events.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number' },
        dateRange: { type: 'string' },
        hijackerAsn: { type: 'number' },
        victimAsn: { type: 'number' },
        involvedAsn: { type: 'number' },
        prefix: { type: 'string', description: 'IP prefix, e.g. 1.1.1.0/24' },
        minConfidence: { type: 'number', description: '1-10' },
      },
    },
  },
  {
    name: 'cf_get_outages',
    description: 'Retrieve Internet outages and anomalies.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number' },
        dateRange: { type: 'string' },
        asn: { type: 'number' },
        location: { type: 'string' },
      },
    },
  },
  {
    name: 'cf_get_annotations',
    description: 'Retrieve annotations including Internet events, outages, and anomalies.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number' },
        dateRange: { type: 'string' },
        dataSource: { type: 'string', description: 'e.g. ALL, BGP, DNS, HTTP, DOS' },
        eventType: { type: 'string', description: 'e.g. EVENT, OUTAGE, TRAFFIC_ANOMALY' },
        asn: { type: 'number' },
        location: { type: 'string' },
      },
    },
  },
  // --- URL Scanner ---
  {
    name: 'cf_search_url_scans',
    description: 'Search URL scans. Use ElasticSearch-like query syntax, e.g. page.domain:example.com.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'ElasticSearch-style query filter' },
        size: { type: 'number', description: 'Results count (1-100, default: 10)' },
      },
    },
  },
  {
    name: 'cf_create_url_scan',
    description: 'Submit a URL to scan. Returns scan UUID for result retrieval.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to scan' },
        visibility: { type: 'string', enum: ['Public', 'Unlisted'] },
        screenshotResolution: { type: 'string', enum: ['desktop', 'mobile', 'tablet'] },
      },
      required: ['url'],
    },
  },
  {
    name: 'cf_get_url_scan',
    description: 'Get URL scan results by UUID including verdicts, page info, and certificates.',
    inputSchema: {
      type: 'object',
      properties: {
        scanId: { type: 'string', description: 'Scan UUID' },
      },
      required: ['scanId'],
    },
  },
  {
    name: 'cf_get_url_scan_screenshot',
    description: 'Get the screenshot URL for a completed URL scan.',
    inputSchema: {
      type: 'object',
      properties: {
        scanId: { type: 'string', description: 'Scan UUID' },
        resolution: { type: 'string', enum: ['desktop', 'mobile', 'tablet'] },
      },
      required: ['scanId'],
    },
  },
]);

// ================================================================
//  6. CONTAINER - Sandbox development environment
// ================================================================
const CONTAINER_TOOLS: MCPToolDefinition[] = service('containers', [
  {
    name: 'cf_container_initialize',
    description: 'Start or restart a sandbox container for running code.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'cf_container_ping',
    description: 'Check if the sandbox container is running.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'cf_container_exec',
    description: 'Run a command in the sandbox container. Use python3/pip3 for Python.',
    inputSchema: {
      type: 'object',
      properties: {
        args: { type: 'string', description: 'Command to execute' },
        timeout: { type: 'number', description: 'Timeout in milliseconds' },
        streamStderr: { type: 'boolean', description: 'Stream stderr (default: true)' },
      },
      required: ['args'],
    },
  },
  {
    name: 'cf_container_file_write',
    description: 'Create or overwrite a file in the sandbox container.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path' },
        text: { type: 'string', description: 'File content' },
      },
      required: ['path', 'text'],
    },
  },
  {
    name: 'cf_container_file_read',
    description: 'Read a file from the sandbox container.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path' },
      },
      required: ['path'],
    },
  },
  {
    name: 'cf_container_file_delete',
    description: 'Delete a file in the sandbox container.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path' },
      },
      required: ['path'],
    },
  },
  {
    name: 'cf_container_files_list',
    description: 'List files in the sandbox container working directory.',
    inputSchema: { type: 'object', properties: {} },
  },
]);

// ================================================================
//  7. BROWSER RENDERING - Web content fetching
// ================================================================
const BROWSER_TOOLS: MCPToolDefinition[] = service('browser', [
  {
    name: 'cf_get_url_html_content',
    description: 'Get page HTML content via Cloudflare Browser Rendering.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to fetch' },
      },
      required: ['url'],
    },
  },
  {
    name: 'cf_get_url_markdown',
    description: 'Get page content converted to Markdown via Cloudflare Browser Rendering.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to convert' },
      },
      required: ['url'],
    },
  },
  {
    name: 'cf_get_url_screenshot',
    description: 'Take a screenshot of a page via Cloudflare Browser Rendering.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to screenshot' },
        viewport: {
          type: 'object',
          properties: {
            height: { type: 'number', description: 'Viewport height (default: 600)' },
            width: { type: 'number', description: 'Viewport width (default: 800)' },
          },
        },
      },
      required: ['url'],
    },
  },
]);

// ================================================================
//  8. LOGPUSH - Log job health
// ================================================================
const LOGPUSH_TOOLS: MCPToolDefinition[] = service('logs', [
  {
    name: 'cf_logpush_jobs_by_account_id',
    description: 'Get all Logpush jobs for your account. Returns at most 100 jobs with health status.',
    inputSchema: { type: 'object', properties: {} },
  },
]);

// ================================================================
//  9. AI GATEWAY - AI request logs and analytics
// ================================================================
const AI_GATEWAY_TOOLS: MCPToolDefinition[] = service('ai-gateway', [
  {
    name: 'cf_list_gateways',
    description: 'List AI Gateways.',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        per_page: { type: 'number', description: 'Results per page (1-50, default: 20)' },
      },
    },
  },
  {
    name: 'cf_list_logs',
    description: 'List AI Gateway logs with filtering and sorting.',
    inputSchema: {
      type: 'object',
      properties: {
        gateway_id: { type: 'string', description: 'Gateway ID' },
        page: { type: 'number' },
        per_page: { type: 'number' },
        order_by: { type: 'string', enum: ['created_at', 'provider', 'model', 'success', 'cached', 'cost', 'tokens_in', 'tokens_out', 'duration'] },
        order_by_direction: { type: 'string', enum: ['asc', 'desc'] },
        start_date: { type: 'string', description: 'ISO 8601 datetime' },
        end_date: { type: 'string', description: 'ISO 8601 datetime' },
        success: { type: 'boolean' },
        cached: { type: 'boolean' },
        model: { type: 'string' },
        provider: { type: 'string' },
      },
      required: ['gateway_id'],
    },
  },
  {
    name: 'cf_get_log_details',
    description: 'Get a single AI Gateway log entry details.',
    inputSchema: {
      type: 'object',
      properties: {
        gateway_id: { type: 'string', description: 'Gateway ID' },
        log_id: { type: 'string', description: 'Log ID' },
      },
      required: ['gateway_id', 'log_id'],
    },
  },
  {
    name: 'cf_get_log_request_body',
    description: 'Get the request body of an AI Gateway log entry.',
    inputSchema: {
      type: 'object',
      properties: {
        gateway_id: { type: 'string', description: 'Gateway ID' },
        log_id: { type: 'string', description: 'Log ID' },
      },
      required: ['gateway_id', 'log_id'],
    },
  },
  {
    name: 'cf_get_log_response_body',
    description: 'Get the response body of an AI Gateway log entry.',
    inputSchema: {
      type: 'object',
      properties: {
        gateway_id: { type: 'string', description: 'Gateway ID' },
        log_id: { type: 'string', description: 'Log ID' },
      },
      required: ['gateway_id', 'log_id'],
    },
  },
]);

// ================================================================
//  10. AUTORAG - Vector search
// ================================================================
const AUTORAG_TOOLS: MCPToolDefinition[] = service('autorag', [
  {
    name: 'cf_list_rags',
    description: 'List AutoRAG vector stores.',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number' },
        per_page: { type: 'number' },
      },
    },
  },
  {
    name: 'cf_search',
    description: 'Search documents using AutoRAG vector store.',
    inputSchema: {
      type: 'object',
      properties: {
        rag_id: { type: 'string', description: 'AutoRAG ID' },
        query: { type: 'string', description: 'Search query (URL, title, or snippet)' },
      },
      required: ['rag_id', 'query'],
    },
  },
  {
    name: 'cf_ai_search',
    description: 'AI-powered search on AutoRAG vector store documents.',
    inputSchema: {
      type: 'object',
      properties: {
        rag_id: { type: 'string', description: 'AutoRAG ID' },
        query: { type: 'string', description: 'Search query' },
      },
      required: ['rag_id', 'query'],
    },
  },
]);

// ================================================================
//  11. AUDIT LOGS
// ================================================================
const AUDITLOGS_TOOLS: MCPToolDefinition[] = service('auditlogs', [
  {
    name: 'cf_auditlogs_by_account_id',
    description: 'Query audit logs (who changed what, when) for your Cloudflare account in a time range.',
    inputSchema: {
      type: 'object',
      properties: {
        since: { type: 'string', description: 'Start datetime (YYYY-MM-DD or ISO 8601)' },
        before: { type: 'string', description: 'End datetime (YYYY-MM-DD or ISO 8601)' },
        action_type: { type: 'string', enum: ['create', 'delete', 'view', 'update', 'login'] },
        action_result: { type: 'string', enum: ['success', 'failure'] },
        actor_email: { type: 'string', description: 'Filter by actor email' },
        actor_ip_address: { type: 'string' },
        resource_type: { type: 'string' },
        zone_name: { type: 'string' },
        direction: { type: 'string', enum: ['desc', 'asc'] },
        limit: { type: 'number', description: 'Max 1000' },
        cursor: { type: 'string', description: 'Pagination cursor' },
      },
      required: ['since', 'before'],
    },
  },
]);

// ================================================================
//  12. DNS ANALYTICS
// ================================================================
const DNS_ANALYTICS_TOOLS: MCPToolDefinition[] = service('dns-analytics', [
  {
    name: 'cf_dns_report',
    description: 'Fetch DNS report for a zone over a number of days.',
    inputSchema: {
      type: 'object',
      properties: {
        zone: { type: 'string', description: 'Zone name' },
        days: { type: 'number', description: 'Number of days' },
      },
      required: ['zone', 'days'],
    },
  },
  {
    name: 'cf_show_account_dns_settings',
    description: 'Show DNS settings for your Cloudflare account.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'cf_show_zone_dns_settings',
    description: 'Show DNS settings for a specific zone.',
    inputSchema: {
      type: 'object',
      properties: {
        zone: { type: 'string', description: 'Zone name' },
      },
      required: ['zone'],
    },
  },
]);

// ================================================================
//  13. DEX - Digital Experience Monitoring
// ================================================================
const DEX_TOOLS: MCPToolDefinition[] = service('dex', [
  {
    name: 'cf_dex_list_tests',
    description: 'List all configured DEX tests.',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (min: 1)' },
      },
      required: ['page'],
    },
  },
  {
    name: 'cf_dex_test_statistics',
    description: 'Analyze DEX test results by quartile for a specific test.',
    inputSchema: {
      type: 'object',
      properties: {
        testId: { type: 'string', description: 'DEX Test ID' },
        from: { type: 'string', description: 'Start datetime (ISO 8601 UTC)' },
        to: { type: 'string', description: 'End datetime (ISO 8601 UTC)' },
      },
      required: ['testId', 'from', 'to'],
    },
  },
  {
    name: 'cf_dex_http_test_details',
    description: 'Get detailed time series results for an HTTP DEX test.',
    inputSchema: {
      type: 'object',
      properties: {
        testId: { type: 'string', description: 'HTTP DEX Test ID' },
        from: { type: 'string', description: 'Start datetime (ISO 8601 UTC)' },
        to: { type: 'string', description: 'End datetime (ISO 8601 UTC)' },
        interval: { type: 'string', enum: ['minute', 'hour'] },
        deviceId: { type: 'string', description: 'Filter by device' },
        colo: { type: 'string', description: 'Filter by Cloudflare colo' },
      },
      required: ['testId', 'from', 'to', 'interval'],
    },
  },
  {
    name: 'cf_dex_fleet_status_live',
    description: 'Get real-time fleet status broken down by mode, status, colo, platform, version.',
    inputSchema: {
      type: 'object',
      properties: {
        since_minutes: { type: 'number', description: 'Minutes before now (1-60, default: 10)' },
        colo: { type: 'string', description: 'Filter by Cloudflare colo' },
      },
      required: ['since_minutes'],
    },
  },
  {
    name: 'cf_dex_fleet_status_over_time',
    description: 'Get fleet status or device performance metrics over time.',
    inputSchema: {
      type: 'object',
      properties: {
        from: { type: 'string', description: 'Start datetime (ISO 8601 UTC)' },
        to: { type: 'string', description: 'End datetime (ISO 8601 UTC)' },
        interval: { type: 'string', enum: ['minute', 'hour'] },
        colo: { type: 'string' },
        device_id: { type: 'string' },
      },
      required: ['from', 'to', 'interval'],
    },
  },
  {
    name: 'cf_dex_traceroute_test_details',
    description: 'Get detailed time series for a traceroute DEX test.',
    inputSchema: {
      type: 'object',
      properties: {
        testId: { type: 'string', description: 'Traceroute DEX Test ID' },
        timeStart: { type: 'string', description: 'Start datetime (ISO 8601 UTC)' },
        timeEnd: { type: 'string', description: 'End datetime (ISO 8601 UTC)' },
        interval: { type: 'string', enum: ['minute', 'hour'] },
        deviceId: { type: 'string' },
        colo: { type: 'string' },
      },
      required: ['testId', 'timeStart', 'timeEnd', 'interval'],
    },
  },
  {
    name: 'cf_dex_list_colos',
    description: 'List Cloudflare colos sorted alphabetically or by frequency.',
    inputSchema: {
      type: 'object',
      properties: {
        from: { type: 'string', description: 'Start datetime (ISO 8601 UTC)' },
        to: { type: 'string', description: 'End datetime (ISO 8601 UTC)' },
        sortBy: { type: 'string', enum: ['fleet-status-usage', 'application-tests-usage'] },
      },
      required: ['from', 'to'],
    },
  },
]);

// ================================================================
//  14. CASB - SaaS security
// ================================================================
const CASB_TOOLS: MCPToolDefinition[] = service('casb', [
  {
    name: 'cf_integrations_list',
    description: 'List all Cloudflare One CASB integrations.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'cf_integration_by_id',
    description: 'Analyze a Cloudflare One CASB integration by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        integrationIdParam: { type: 'string', description: 'Integration UUID' },
      },
      required: ['integrationIdParam'],
    },
  },
  {
    name: 'cf_assets_search',
    description: 'Search CASB assets by keyword.',
    inputSchema: {
      type: 'object',
      properties: {
        assetSearchTerm: { type: 'string', description: 'Search keyword' },
      },
      required: ['assetSearchTerm'],
    },
  },
  {
    name: 'cf_asset_by_id',
    description: 'Get a CASB asset by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        assetIdParam: { type: 'string', description: 'Asset UUID' },
      },
      required: ['assetIdParam'],
    },
  },
  {
    name: 'cf_assets_list',
    description: 'Paginated list of all CASB assets.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'cf_asset_categories_list',
    description: 'List CASB asset categories.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'cf_asset_categories_by_vendor',
    description: 'List CASB asset categories filtered by vendor.',
    inputSchema: {
      type: 'object',
      properties: {
        assetCategoryVendorParam: {
          type: 'string',
          enum: ['AWS', 'Bitbucket', 'Box', 'Confluence', 'Dropbox', 'GitHub', 'Google Cloud Platform', 'Google Workspace', 'Jira', 'Microsoft', 'Microsoft Azure', 'Okta', 'Salesforce', 'ServiceNow', 'Slack', 'Workday', 'Zoom'],
          description: 'Vendor name',
        },
      },
      required: ['assetCategoryVendorParam'],
    },
  },
]);

// ================================================================
//  15. GRAPHQL - Cloudflare analytics via GraphQL
// ================================================================
const GRAPHQL_TOOLS: MCPToolDefinition[] = service('graphql', [
  {
    name: 'cf_graphql_schema_search',
    description: 'Search the Cloudflare GraphQL API schema for types, fields, and enum values.',
    inputSchema: {
      type: 'object',
      properties: {
        keyword: { type: 'string', description: 'Keyword to search in schema' },
        maxDetailsToFetch: { type: 'number', description: 'Max types to fetch (1-50, default: 10)' },
        onlyObjectTypes: { type: 'boolean', description: 'Only OBJECT types (default: true)' },
      },
      required: ['keyword'],
    },
  },
  {
    name: 'cf_graphql_schema_overview',
    description: 'Get high-level overview of the Cloudflare GraphQL API schema.',
    inputSchema: {
      type: 'object',
      properties: {
        pageSize: { type: 'number', description: 'Types per page (10-1000, default: 100)' },
        page: { type: 'number', description: 'Page number (default: 1)' },
      },
    },
  },
  {
    name: 'cf_graphql_type_details',
    description: 'Get detailed information about a specific GraphQL type/dataset.',
    inputSchema: {
      type: 'object',
      properties: {
        typeName: { type: 'string', description: 'GraphQL type name' },
        fieldsPageSize: { type: 'number', description: 'Fields per page (5-500, default: 50)' },
        fieldsPage: { type: 'number' },
      },
      required: ['typeName'],
    },
  },
  {
    name: 'cf_graphql_query',
    description: 'Execute a GraphQL query against the Cloudflare API. Always include a LIMIT to prevent oversized responses.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'GraphQL query string' },
        variables: { type: 'object', description: 'Query variables' },
      },
      required: ['query'],
    },
  },
  {
    name: 'cf_graphql_api_explorer',
    description: 'Generate a Cloudflare GraphQL API Explorer link for a query.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'GraphQL query' },
        variables: { type: 'object', description: 'Query variables' },
      },
      required: ['query'],
    },
  },
]);

// ================================================================
//  COMBINED EXPORT
// ================================================================
export const TOOLS: MCPToolDefinition[] = [
  ...DOCS_TOOLS,
  ...BINDINGS_TOOLS,
  ...BUILDS_TOOLS,
  ...OBSERVABILITY_TOOLS,
  ...RADAR_TOOLS,
  ...CONTAINER_TOOLS,
  ...BROWSER_TOOLS,
  ...LOGPUSH_TOOLS,
  ...AI_GATEWAY_TOOLS,
  ...AUTORAG_TOOLS,
  ...AUDITLOGS_TOOLS,
  ...DNS_ANALYTICS_TOOLS,
  ...GRAPHQL_TOOLS,
  ...DEX_TOOLS,
  ...CASB_TOOLS,
];
