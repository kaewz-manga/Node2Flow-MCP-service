/**
 * n8n Plugin - MCP Gateway
 * Source: @node2flow/n8n-management-mcp (community)
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { N8nClient } from './client';

function ok(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data ?? { success: true }, null, 2) }], isError: false };
}

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
      switch (toolName) {
        // Workflows
        case 'n8n_list_workflows':     return ok(await n8n.listWorkflows(args as any));
        case 'n8n_get_workflow':        return ok(await n8n.getWorkflow(args.id as string));
        case 'n8n_create_workflow':     return ok(await n8n.createWorkflow(args));
        case 'n8n_update_workflow':     return ok(await n8n.updateWorkflow(args.id as string, args));
        case 'n8n_delete_workflow':     return ok(await n8n.deleteWorkflow(args.id as string));
        case 'n8n_activate_workflow':   return ok(await n8n.activateWorkflow(args.id as string));
        case 'n8n_deactivate_workflow': return ok(await n8n.deactivateWorkflow(args.id as string));
        case 'n8n_execute_workflow':    return ok(await n8n.executeWorkflow(args.id as string, args.data as Record<string, unknown> | undefined));
        case 'n8n_get_workflow_tags':   return ok(await n8n.getWorkflowTags(args.id as string));
        case 'n8n_update_workflow_tags': return ok(await n8n.updateWorkflowTags(args.id as string, args.tags as string[]));

        // Executions
        case 'n8n_list_executions':  return ok(await n8n.listExecutions(args.workflowId as string | undefined));
        case 'n8n_get_execution':    return ok(await n8n.getExecution(args.id as string));
        case 'n8n_delete_execution': return ok(await n8n.deleteExecution(args.id as string));
        case 'n8n_retry_execution':  return ok(await n8n.retryExecution(args.id as string));

        // Credentials
        case 'n8n_create_credential':     return ok(await n8n.createCredential(args));
        case 'n8n_update_credential':     return ok(await n8n.updateCredential(args.id as string, args));
        case 'n8n_delete_credential':     return ok(await n8n.deleteCredential(args.id as string));
        case 'n8n_get_credential_schema': return ok(await n8n.getCredentialSchema(args.credentialType as string));

        // Tags
        case 'n8n_list_tags':   return ok(await n8n.listTags());
        case 'n8n_get_tag':     return ok(await n8n.getTag(args.id as string));
        case 'n8n_create_tag':  return ok(await n8n.createTag(args.name as string));
        case 'n8n_update_tag':  return ok(await n8n.updateTag(args.id as string, args.name as string));
        case 'n8n_delete_tag':  return ok(await n8n.deleteTag(args.id as string));

        // Users
        case 'n8n_list_users':       return ok(await n8n.listUsers());
        case 'n8n_get_user':         return ok(await n8n.getUser(args.identifier as string));
        case 'n8n_delete_user':      return ok(await n8n.deleteUser(args.id as string));
        case 'n8n_update_user_role': return ok(await n8n.updateUserRole(args.id as string, args.role as 'admin' | 'member'));

        default:
          return { content: [{ type: 'text' as const, text: `Unknown tool: ${toolName}` }], isError: true };
      }
    } catch (error) {
      return { content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
    }
  },
};
