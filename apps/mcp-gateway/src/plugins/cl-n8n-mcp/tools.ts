/**
 * cl-n8n-mcp Tool Definitions (20 tools total)
 * Proxied to cl-n8n-mcp server via JSON-RPC
 * All tool names prefixed with mcp_ to avoid conflicts with n8n plugin
 */

import type { MCPToolDefinition } from '../../types';

export const TOOLS: MCPToolDefinition[] = [
  // ========== Documentation Tools (7) ==========
  {
    name: 'mcp_tools_documentation',
    description: 'Get documentation for cl-n8n-mcp tools. Call without parameters for quick start guide. Use topic parameter for specific tools.',
    inputSchema: {
      type: 'object',
      properties: {
        topic: { type: 'string', description: 'Tool name or "overview"' },
        depth: { type: 'string', enum: ['essentials', 'full'], description: 'Detail level', default: 'essentials' },
      },
    },
  },
  {
    name: 'mcp_search_nodes',
    description: 'Search n8n nodes by keyword. Returns max 20 results. Use includeExamples=true to get template configs per node.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search terms' },
        limit: { type: 'number', description: 'Max results (default 20)', default: 20 },
        mode: { type: 'string', enum: ['OR', 'AND', 'FUZZY'], description: 'Search mode', default: 'OR' },
        includeExamples: { type: 'boolean', description: 'Include template config examples', default: false },
        source: { type: 'string', enum: ['all', 'core', 'community', 'verified'], default: 'all' },
      },
      required: ['query'],
    },
  },
  {
    name: 'mcp_get_node',
    description: 'Get n8n node info with progressive detail levels. Modes: info, docs, search_properties, versions, compare, breaking, migrations.',
    inputSchema: {
      type: 'object',
      properties: {
        nodeType: { type: 'string', description: 'Full node type: "nodes-base.httpRequest"' },
        detail: { type: 'string', enum: ['minimal', 'standard', 'full'], default: 'standard' },
        mode: { type: 'string', enum: ['info', 'docs', 'search_properties', 'versions', 'compare', 'breaking', 'migrations'], default: 'info' },
        includeTypeInfo: { type: 'boolean', default: false },
        includeExamples: { type: 'boolean', default: false },
        fromVersion: { type: 'string' },
        toVersion: { type: 'string' },
        propertyQuery: { type: 'string', description: 'For search_properties mode' },
        maxPropertyResults: { type: 'number', default: 20 },
      },
      required: ['nodeType'],
    },
  },
  {
    name: 'mcp_validate_node',
    description: 'Validate n8n node configuration. Use mode=full for comprehensive or mode=minimal for quick check.',
    inputSchema: {
      type: 'object',
      properties: {
        nodeType: { type: 'string', description: 'Node type, e.g. "nodes-base.slack"' },
        config: { type: 'object', description: 'Configuration object' },
        mode: { type: 'string', enum: ['full', 'minimal'], default: 'full' },
        profile: { type: 'string', enum: ['strict', 'runtime', 'ai-friendly', 'minimal'], default: 'ai-friendly' },
      },
      required: ['nodeType', 'config'],
    },
  },
  {
    name: 'mcp_get_template',
    description: 'Get n8n workflow template by ID. Use mode to control response size.',
    inputSchema: {
      type: 'object',
      properties: {
        templateId: { type: 'number', description: 'Template ID from n8n.io' },
        mode: { type: 'string', enum: ['nodes_only', 'structure', 'full'], default: 'full' },
      },
      required: ['templateId'],
    },
  },
  {
    name: 'mcp_search_templates',
    description: 'Search n8n workflow templates. Modes: keyword, by_nodes, by_task, by_metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        searchMode: { type: 'string', enum: ['keyword', 'by_nodes', 'by_task', 'by_metadata'], default: 'keyword' },
        query: { type: 'string', description: 'For keyword mode' },
        nodeTypes: { type: 'array', items: { type: 'string' }, description: 'For by_nodes mode' },
        task: { type: 'string', enum: ['ai_automation', 'data_sync', 'webhook_processing', 'email_automation', 'slack_integration', 'data_transformation', 'file_processing', 'scheduling', 'api_integration', 'database_operations'] },
        category: { type: 'string' },
        complexity: { type: 'string', enum: ['simple', 'medium', 'complex'] },
        limit: { type: 'number', default: 20 },
        offset: { type: 'number', default: 0 },
      },
    },
  },
  {
    name: 'mcp_validate_workflow',
    description: 'Validate a complete n8n workflow JSON. Checks structure, connections, expressions, AI tools.',
    inputSchema: {
      type: 'object',
      properties: {
        workflow: { type: 'object', description: 'Complete workflow JSON with nodes and connections' },
        options: {
          type: 'object',
          properties: {
            validateNodes: { type: 'boolean', default: true },
            validateConnections: { type: 'boolean', default: true },
            validateExpressions: { type: 'boolean', default: true },
            profile: { type: 'string', enum: ['minimal', 'runtime', 'ai-friendly', 'strict'], default: 'runtime' },
          },
        },
      },
      required: ['workflow'],
    },
  },

  // ========== Management Tools (13) ==========
  {
    name: 'mcp_n8n_create_workflow',
    description: 'Create a new n8n workflow. Created inactive by default.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Workflow name' },
        nodes: { type: 'array', description: 'Array of workflow nodes', items: { type: 'object' } },
        connections: { type: 'object', description: 'Workflow connections' },
        settings: { type: 'object', description: 'Optional workflow settings' },
      },
      required: ['name', 'nodes', 'connections'],
    },
  },
  {
    name: 'mcp_n8n_get_workflow',
    description: 'Get workflow by ID with detail levels: full, details, structure, minimal.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Workflow ID' },
        mode: { type: 'string', enum: ['full', 'details', 'structure', 'minimal'], default: 'full' },
      },
      required: ['id'],
    },
  },
  {
    name: 'mcp_n8n_update_full_workflow',
    description: 'Full workflow update. Requires complete nodes and connections.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Workflow ID' },
        name: { type: 'string' },
        nodes: { type: 'array', items: { type: 'object' } },
        connections: { type: 'object' },
        settings: { type: 'object' },
      },
      required: ['id'],
    },
  },
  {
    name: 'mcp_n8n_update_partial_workflow',
    description: 'Incremental workflow update with diff operations (addNode, removeNode, updateNode, etc.).',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Workflow ID' },
        operations: { type: 'array', description: 'Diff operations to apply', items: { type: 'object' } },
        validateOnly: { type: 'boolean' },
        continueOnError: { type: 'boolean' },
      },
      required: ['id', 'operations'],
    },
  },
  {
    name: 'mcp_n8n_delete_workflow',
    description: 'Permanently delete a workflow.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Workflow ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'mcp_n8n_list_workflows',
    description: 'List workflows with pagination and filters.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Max results (1-100)' },
        cursor: { type: 'string' },
        active: { type: 'boolean' },
        tags: { type: 'array', items: { type: 'string' } },
      },
    },
  },
  {
    name: 'mcp_n8n_validate_workflow',
    description: 'Validate workflow by ID on the n8n instance.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Workflow ID' },
        options: { type: 'object' },
      },
      required: ['id'],
    },
  },
  {
    name: 'mcp_n8n_autofix_workflow',
    description: 'Auto-fix common workflow validation errors. Preview or apply fixes.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Workflow ID' },
        applyFixes: { type: 'boolean', default: false },
        fixTypes: { type: 'array', items: { type: 'string' } },
        confidenceThreshold: { type: 'string', enum: ['high', 'medium', 'low'] },
        maxFixes: { type: 'number' },
      },
      required: ['id'],
    },
  },
  {
    name: 'mcp_n8n_test_workflow',
    description: 'Test/trigger workflow execution. Supports webhook, form, chat triggers.',
    inputSchema: {
      type: 'object',
      properties: {
        workflowId: { type: 'string', description: 'Workflow ID' },
        triggerType: { type: 'string', enum: ['webhook', 'form', 'chat'] },
        httpMethod: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE'] },
        message: { type: 'string', description: 'For chat trigger' },
        sessionId: { type: 'string' },
        data: { type: 'object' },
        headers: { type: 'object' },
        timeout: { type: 'number' },
        waitForResponse: { type: 'boolean' },
      },
      required: ['workflowId'],
    },
  },
  {
    name: 'mcp_n8n_executions',
    description: 'Manage workflow executions: get, list, or delete.',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['get', 'list', 'delete'], description: 'Operation' },
        id: { type: 'string', description: 'Execution ID (for get/delete)' },
        mode: { type: 'string', enum: ['preview', 'summary', 'filtered', 'full', 'error'] },
        workflowId: { type: 'string', description: 'Filter by workflow (for list)' },
        status: { type: 'string', enum: ['success', 'error', 'waiting'] },
        limit: { type: 'number' },
        cursor: { type: 'string' },
      },
      required: ['action'],
    },
  },
  {
    name: 'mcp_n8n_health_check',
    description: 'Check n8n instance health and API connectivity.',
    inputSchema: {
      type: 'object',
      properties: {
        mode: { type: 'string', enum: ['status', 'diagnostic'], default: 'status' },
        verbose: { type: 'boolean', default: false },
      },
    },
  },
  {
    name: 'mcp_n8n_workflow_versions',
    description: 'Manage workflow version history: list, get, rollback, delete, prune.',
    inputSchema: {
      type: 'object',
      properties: {
        mode: { type: 'string', enum: ['list', 'get', 'rollback', 'delete', 'prune', 'truncate'] },
        workflowId: { type: 'string' },
        versionId: { type: 'number' },
        limit: { type: 'number', default: 10 },
        validateBefore: { type: 'boolean', default: true },
        deleteAll: { type: 'boolean' },
        maxVersions: { type: 'number', default: 10 },
        confirmTruncate: { type: 'boolean' },
      },
      required: ['mode'],
    },
  },
  {
    name: 'mcp_n8n_deploy_template',
    description: 'Deploy a workflow template from n8n.io to the connected n8n instance.',
    inputSchema: {
      type: 'object',
      properties: {
        templateId: { type: 'number', description: 'Template ID from n8n.io' },
        name: { type: 'string', description: 'Custom workflow name' },
        autoUpgradeVersions: { type: 'boolean', default: true },
        autoFix: { type: 'boolean', default: true },
        stripCredentials: { type: 'boolean', default: true },
      },
      required: ['templateId'],
    },
  },
];
