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

// ============================================
// n8n Proxy (via Gateway proxy routes)
// ============================================

async function n8nProxy<T>(
  connectionId: string,
  subPath: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  return gatewayRequest(`/api/proxy/n8n/${connectionId}/${subPath}`, options);
}

// Workflows
export function listWorkflows(connectionId: string) {
  return n8nProxy(connectionId, 'workflows');
}
export function getWorkflow(connectionId: string, id: string) {
  return n8nProxy(connectionId, `workflows/${id}`);
}
export function createWorkflow(connectionId: string, data: any) {
  return n8nProxy(connectionId, 'workflows', { method: 'POST', body: JSON.stringify(data) });
}
export function updateWorkflow(connectionId: string, id: string, data: any) {
  return n8nProxy(connectionId, `workflows/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export function deleteWorkflow(connectionId: string, id: string) {
  return n8nProxy(connectionId, `workflows/${id}`, { method: 'DELETE' });
}
export function activateWorkflow(connectionId: string, id: string) {
  return n8nProxy(connectionId, `workflows/${id}/activate`, { method: 'POST' });
}
export function deactivateWorkflow(connectionId: string, id: string) {
  return n8nProxy(connectionId, `workflows/${id}/deactivate`, { method: 'POST' });
}
export function executeWorkflow(connectionId: string, id: string, data?: any) {
  return n8nProxy(connectionId, `workflows/${id}/execute`, { method: 'POST', body: JSON.stringify({ data }) });
}
export function getWorkflowTags(connectionId: string, id: string) {
  return n8nProxy(connectionId, `workflows/${id}/tags`);
}
export function updateWorkflowTags(connectionId: string, id: string, tags: string[]) {
  return n8nProxy(connectionId, `workflows/${id}/tags`, { method: 'PUT', body: JSON.stringify({ tags }) });
}

// Executions
export function listExecutions(connectionId: string, workflowId?: string) {
  return n8nProxy(connectionId, `executions${workflowId ? `?workflowId=${workflowId}` : ''}`);
}
export function getExecution(connectionId: string, id: string) {
  return n8nProxy(connectionId, `executions/${id}`);
}
export function deleteExecution(connectionId: string, id: string) {
  return n8nProxy(connectionId, `executions/${id}`, { method: 'DELETE' });
}
export function retryExecution(connectionId: string, id: string) {
  return n8nProxy(connectionId, `executions/${id}/retry`, { method: 'POST' });
}

// Credentials
export function createCredential(connectionId: string, data: any) {
  return n8nProxy(connectionId, 'credentials', { method: 'POST', body: JSON.stringify(data) });
}
export function updateCredential(connectionId: string, id: string, data: any) {
  return n8nProxy(connectionId, `credentials/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}
export function deleteCredential(connectionId: string, id: string) {
  return n8nProxy(connectionId, `credentials/${id}`, { method: 'DELETE' });
}
export function getCredentialSchema(connectionId: string, type: string) {
  return n8nProxy(connectionId, `credentials/schema/${type}`);
}

// Tags
export function listTags(connectionId: string) {
  return n8nProxy(connectionId, 'tags');
}
export function getTag(connectionId: string, id: string) {
  return n8nProxy(connectionId, `tags/${id}`);
}
export function createTag(connectionId: string, name: string) {
  return n8nProxy(connectionId, 'tags', { method: 'POST', body: JSON.stringify({ name }) });
}
export function updateTag(connectionId: string, id: string, name: string) {
  return n8nProxy(connectionId, `tags/${id}`, { method: 'PUT', body: JSON.stringify({ name }) });
}
export function deleteTag(connectionId: string, id: string) {
  return n8nProxy(connectionId, `tags/${id}`, { method: 'DELETE' });
}

// Variables
export function listVariables(connectionId: string) {
  return n8nProxy(connectionId, 'variables');
}
export function createVariable(connectionId: string, data: { key: string; value: string }) {
  return n8nProxy(connectionId, 'variables', { method: 'POST', body: JSON.stringify(data) });
}
export function updateVariable(connectionId: string, id: string, data: { key?: string; value?: string }) {
  return n8nProxy(connectionId, `variables/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}
export function deleteVariable(connectionId: string, id: string) {
  return n8nProxy(connectionId, `variables/${id}`, { method: 'DELETE' });
}

// Users
export function listN8nUsers(connectionId: string) {
  return n8nProxy(connectionId, 'users');
}
export function getN8nUser(connectionId: string, id: string) {
  return n8nProxy(connectionId, `users/${id}`);
}
export function deleteN8nUser(connectionId: string, id: string) {
  return n8nProxy(connectionId, `users/${id}`, { method: 'DELETE' });
}
export function updateN8nUserRole(connectionId: string, id: string, role: string) {
  return n8nProxy(connectionId, `users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });
}
