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

    try {
      let result: unknown;

      switch (toolName) {
        // ========== Workflow Operations ==========
        case 'n8n_list_workflows':
          result = await n8n.listWorkflows(args as { active?: boolean; tags?: string } | undefined);
          break;
        case 'n8n_get_workflow':
          result = await n8n.getWorkflow(args.id as string);
          break;
        case 'n8n_create_workflow':
          result = await n8n.createWorkflow(args);
          break;
        case 'n8n_update_workflow':
          result = await n8n.updateWorkflow(args.id as string, args);
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
        case 'n8n_execute_workflow':
          result = await n8n.executeWorkflow(args.id as string, args.data as Record<string, unknown> | undefined);
          break;
        case 'n8n_get_workflow_tags':
          result = await n8n.getWorkflowTags(args.id as string);
          break;
        case 'n8n_update_workflow_tags':
          result = await n8n.updateWorkflowTags(args.id as string, args.tags as string[]);
          break;

        // ========== Execution Operations ==========
        case 'n8n_list_executions':
          result = await n8n.listExecutions(args.workflowId as string | undefined);
          break;
        case 'n8n_get_execution':
          result = await n8n.getExecution(args.id as string);
          break;
        case 'n8n_delete_execution':
          result = await n8n.deleteExecution(args.id as string);
          break;
        case 'n8n_retry_execution':
          result = await n8n.retryExecution(args.id as string);
          break;

        // ========== Credential Operations ==========
        case 'n8n_create_credential':
          result = await n8n.createCredential(args);
          break;
        case 'n8n_update_credential':
          result = await n8n.updateCredential(args.id as string, args);
          break;
        case 'n8n_delete_credential':
          result = await n8n.deleteCredential(args.id as string);
          break;
        case 'n8n_get_credential_schema':
          result = await n8n.getCredentialSchema(args.credentialType as string);
          break;

        // ========== Tag Operations ==========
        case 'n8n_list_tags':
          result = await n8n.listTags();
          break;
        case 'n8n_get_tag':
          result = await n8n.getTag(args.id as string);
          break;
        case 'n8n_create_tag':
          result = await n8n.createTag(args.name as string);
          break;
        case 'n8n_update_tag':
          result = await n8n.updateTag(args.id as string, args.name as string);
          break;
        case 'n8n_delete_tag':
          result = await n8n.deleteTag(args.id as string);
          break;

        // ========== User Operations ==========
        case 'n8n_list_users':
          result = await n8n.listUsers();
          break;
        case 'n8n_get_user':
          result = await n8n.getUser(args.identifier as string);
          break;
        case 'n8n_delete_user':
          result = await n8n.deleteUser(args.id as string);
          break;
        case 'n8n_update_user_role':
          result = await n8n.updateUserRole(args.id as string, args.role as 'admin' | 'member');
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
