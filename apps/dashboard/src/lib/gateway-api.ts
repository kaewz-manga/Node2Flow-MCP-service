/**
 * Gateway Worker API Client
 * Connections CRUD, plugins, n8n proxy
 */

import { gatewayRequest, type ApiResponse, type Connection } from '@node2flow/dashboard-core';

// ============================================
// Connection CRUD (unified format)
// ============================================

export async function createConnection(
  productType: string,
  name: string,
  config: Record<string, unknown>
): Promise<ApiResponse<Connection>> {
  return gatewayRequest('/api/connections', {
    method: 'POST',
    body: JSON.stringify({ product_type: productType, name, config }),
  });
}

export async function updateConnection(
  id: string,
  data: { name?: string; config?: Record<string, unknown>; status?: string }
): Promise<ApiResponse<{ updated: boolean }>> {
  return gatewayRequest(`/api/connections/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteConnection(
  id: string
): Promise<ApiResponse<{ deleted: boolean }>> {
  return gatewayRequest(`/api/connections/${id}`, { method: 'DELETE' });
}

// ============================================
// Plugins
// ============================================

export interface PluginInfo {
  id: string;
  name: string;
  version: string;
  tools_count: number;
}

export async function getPlugins(): Promise<ApiResponse<{ plugins: PluginInfo[] }>> {
  return gatewayRequest('/api/plugins');
}

export interface PluginTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export async function getPluginTools(
  pluginId: string
): Promise<ApiResponse<{ plugin_id: string; plugin_name: string; tools: PluginTool[] }>> {
  return gatewayRequest(`/api/plugins/${pluginId}/tools`);
}

// ============================================
// Tool Proxy (explicit tool name + args)
// ============================================

async function toolProxy<T>(
  productType: string,
  connectionId: string,
  tool: string,
  args: Record<string, unknown> = {}
): Promise<ApiResponse<T>> {
  return gatewayRequest(`/api/proxy/${productType}/${connectionId}/tool`, {
    method: 'POST',
    body: JSON.stringify({ tool, args }),
  });
}

// ============================================
// n8n Proxy (explicit tool calls)
// ============================================

function n8nCall<T>(connectionId: string, tool: string, args: Record<string, unknown> = {}) {
  return toolProxy<T>('n8n', connectionId, tool, args);
}

// Workflows
export function listWorkflows(connectionId: string) {
  return n8nCall(connectionId, 'n8n_list_workflows');
}
export function getWorkflow(connectionId: string, id: string) {
  return n8nCall(connectionId, 'n8n_get_workflow', { id });
}
export function createWorkflow(connectionId: string, data: any) {
  return n8nCall(connectionId, 'n8n_create_workflow', data);
}
export function updateWorkflow(connectionId: string, id: string, data: any) {
  return n8nCall(connectionId, 'n8n_update_workflow', { id, ...data });
}
export function deleteWorkflow(connectionId: string, id: string) {
  return n8nCall(connectionId, 'n8n_delete_workflow', { id });
}
export function activateWorkflow(connectionId: string, id: string) {
  return n8nCall(connectionId, 'n8n_activate_workflow', { id });
}
export function deactivateWorkflow(connectionId: string, id: string) {
  return n8nCall(connectionId, 'n8n_deactivate_workflow', { id });
}
export function executeWorkflow(connectionId: string, id: string, data?: any) {
  return n8nCall(connectionId, 'n8n_execute_workflow', { id, data });
}
export function getWorkflowTags(connectionId: string, id: string) {
  return n8nCall(connectionId, 'n8n_get_workflow_tags', { id });
}
export function updateWorkflowTags(connectionId: string, id: string, tags: string[]) {
  return n8nCall(connectionId, 'n8n_update_workflow_tags', { id, tags });
}

// Executions
export function listExecutions(connectionId: string, workflowId?: string) {
  return n8nCall(connectionId, 'n8n_list_executions', workflowId ? { workflowId } : {});
}
export function getExecution(connectionId: string, id: string) {
  return n8nCall(connectionId, 'n8n_get_execution', { id });
}
export function deleteExecution(connectionId: string, id: string) {
  return n8nCall(connectionId, 'n8n_delete_execution', { id });
}
export function retryExecution(connectionId: string, id: string) {
  return n8nCall(connectionId, 'n8n_retry_execution', { id });
}

// Credentials
export function createCredential(connectionId: string, data: any) {
  return n8nCall(connectionId, 'n8n_create_credential', data);
}
export function updateCredential(connectionId: string, id: string, data: any) {
  return n8nCall(connectionId, 'n8n_update_credential', { id, ...data });
}
export function deleteCredential(connectionId: string, id: string) {
  return n8nCall(connectionId, 'n8n_delete_credential', { id });
}
export function getCredentialSchema(connectionId: string, type: string) {
  return n8nCall(connectionId, 'n8n_get_credential_schema', { credentialType: type });
}

// Tags
export function listTags(connectionId: string) {
  return n8nCall(connectionId, 'n8n_list_tags');
}
export function getTag(connectionId: string, id: string) {
  return n8nCall(connectionId, 'n8n_get_tag', { id });
}
export function createTag(connectionId: string, name: string) {
  return n8nCall(connectionId, 'n8n_create_tag', { name });
}
export function updateTag(connectionId: string, id: string, name: string) {
  return n8nCall(connectionId, 'n8n_update_tag', { id, name });
}
export function deleteTag(connectionId: string, id: string) {
  return n8nCall(connectionId, 'n8n_delete_tag', { id });
}

// Users
export function listN8nUsers(connectionId: string) {
  return n8nCall(connectionId, 'n8n_list_users');
}
export function getN8nUser(connectionId: string, id: string) {
  return n8nCall(connectionId, 'n8n_get_user', { identifier: id });
}
export function deleteN8nUser(connectionId: string, id: string) {
  return n8nCall(connectionId, 'n8n_delete_user', { id });
}
export function updateN8nUserRole(connectionId: string, id: string, role: string) {
  return n8nCall(connectionId, 'n8n_update_user_role', { id, role });
}

// ============================================
// WordPress Proxy
// ============================================

function wpCall<T>(connectionId: string, tool: string, args: Record<string, unknown> = {}) {
  return toolProxy<T>('wordpress', connectionId, tool, args);
}

// Posts
export function listPosts(connectionId: string, params?: { per_page?: number; status?: string; search?: string }) {
  return wpCall(connectionId, 'wp_list_posts', params || {});
}
export function getPost(connectionId: string, id: number) {
  return wpCall(connectionId, 'wp_get_post', { id });
}
export function createPost(connectionId: string, data: { title: string; content: string; status?: string }) {
  return wpCall(connectionId, 'wp_create_post', data);
}
export function updatePost(connectionId: string, id: number, data: { title?: string; content?: string; status?: string }) {
  return wpCall(connectionId, 'wp_update_post', { id, ...data });
}
export function deletePost(connectionId: string, id: number) {
  return wpCall(connectionId, 'wp_delete_post', { id });
}

// Pages
export function listPages(connectionId: string, params?: { per_page?: number; status?: string }) {
  return wpCall(connectionId, 'wp_list_pages', params || {});
}
export function getPage(connectionId: string, id: number) {
  return wpCall(connectionId, 'wp_get_page', { id });
}
export function createPage(connectionId: string, data: { title: string; content: string; status?: string; parent?: number }) {
  return wpCall(connectionId, 'wp_create_page', data);
}
export function updatePage(connectionId: string, id: number, data: { title?: string; content?: string; status?: string }) {
  return wpCall(connectionId, 'wp_update_page', { id, ...data });
}
export function deletePage(connectionId: string, id: number) {
  return wpCall(connectionId, 'wp_delete_page', { id });
}

// Media
export function listMedia(connectionId: string, params?: { per_page?: number; media_type?: string }) {
  return wpCall(connectionId, 'wp_list_media', params || {});
}
export function deleteMedia(connectionId: string, id: number) {
  return wpCall(connectionId, 'wp_delete_media', { id });
}

// Comments
export function listComments(connectionId: string, params?: { post?: number; per_page?: number }) {
  return wpCall(connectionId, 'wp_list_comments', params || {});
}
export function createComment(connectionId: string, data: { post: number; content: string; author_name?: string; author_email?: string }) {
  return wpCall(connectionId, 'wp_create_comment', data);
}
export function updateComment(connectionId: string, id: number, data: { content?: string; status?: string }) {
  return wpCall(connectionId, 'wp_update_comment', { id, ...data });
}
export function deleteComment(connectionId: string, id: number) {
  return wpCall(connectionId, 'wp_delete_comment', { id });
}

// Taxonomy & Site
export function listWpCategories(connectionId: string) {
  return wpCall(connectionId, 'wp_list_categories');
}
export function listWpTags(connectionId: string) {
  return wpCall(connectionId, 'wp_list_tags');
}
export function listWpUsers(connectionId: string) {
  return wpCall(connectionId, 'wp_list_users');
}
export function getWpSiteInfo(connectionId: string) {
  return wpCall(connectionId, 'wp_get_site_info');
}

// ============================================
// cl-n8n-mcp Proxy
// ============================================

function mcpCall<T>(connectionId: string, tool: string, args: Record<string, unknown> = {}) {
  return toolProxy<T>('cl-n8n-mcp', connectionId, tool, args);
}

// Node Documentation
export function searchMcpNodes(connectionId: string, query: string, limit?: number) {
  return mcpCall(connectionId, 'mcp_search_nodes', { query, limit: limit || 20 });
}
export function getMcpNode(connectionId: string, nodeType: string, detail?: string) {
  return mcpCall(connectionId, 'mcp_get_node', { nodeType, detail: detail || 'standard' });
}
export function validateMcpNode(connectionId: string, nodeType: string, config: Record<string, unknown>) {
  return mcpCall(connectionId, 'mcp_validate_node', { nodeType, config });
}

// Templates
export function searchMcpTemplates(connectionId: string, query: string, limit?: number) {
  return mcpCall(connectionId, 'mcp_search_templates', { query, limit: limit || 20, searchMode: 'keyword' });
}
export function getMcpTemplate(connectionId: string, templateId: number) {
  return mcpCall(connectionId, 'mcp_get_template', { templateId });
}
export function deployMcpTemplate(connectionId: string, templateId: number, name?: string) {
  return mcpCall(connectionId, 'mcp_n8n_deploy_template', { templateId, name });
}

// Workflow Tools
export function validateMcpWorkflow(connectionId: string, workflow: Record<string, unknown>) {
  return mcpCall(connectionId, 'mcp_validate_workflow', { workflow });
}
export function autofixMcpWorkflow(connectionId: string, id: string, applyFixes?: boolean) {
  return mcpCall(connectionId, 'mcp_n8n_autofix_workflow', { id, applyFixes: applyFixes || false });
}
export function testMcpWorkflow(connectionId: string, workflowId: string, data?: Record<string, unknown>) {
  return mcpCall(connectionId, 'mcp_n8n_test_workflow', { workflowId, data });
}
