/**
 * n8n Plugin - MCP Gateway
 * Extracted from n8n-management-mcp
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { N8nClient } from './client';

export const n8nPlugin: MCPPlugin = {
  id: 'n8n',
  name: 'n8n Workflow Manager',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    return new N8nClient({
      apiUrl: config.api_url as string,
      apiKey: config.api_key as string,
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const n8n = client as N8nClient;

    // TODO: Phase 3 - Full tool dispatch (extracted from index.ts handleToolCall)
    // For now, delegate to client methods based on tool name
    try {
      let result: unknown;

      switch (toolName) {
        case 'n8n_list_workflows':
          result = await n8n.listWorkflows();
          break;
        case 'n8n_get_workflow':
          result = await n8n.getWorkflow(args.id as string);
          break;
        case 'n8n_create_workflow':
          result = await n8n.createWorkflow(args as Record<string, unknown>);
          break;
        case 'n8n_update_workflow':
          result = await n8n.updateWorkflow(args.id as string, args as Record<string, unknown>);
          break;
        case 'n8n_delete_workflow':
          result = await n8n.deleteWorkflow(args.id as string);
          break;
        case 'n8n_activate_workflow':
          result = await n8n.activateWorkflow(args.id as string);
          break;
        case 'n8n_deactivate_workflow':
          result = await n8n.deactivateWorkflow(args.id as string);
          break;
        case 'n8n_list_executions':
          result = await n8n.listExecutions(args as Record<string, unknown>);
          break;
        case 'n8n_get_execution':
          result = await n8n.getExecution(args.id as string);
          break;
        case 'n8n_run_workflow':
          result = await n8n.runWorkflow(args.id as string, args.data as Record<string, unknown>);
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
