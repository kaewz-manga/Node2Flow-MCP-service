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
export function listWorkflows(connectionId: string, limit?: number, cursor?: string) {
  const args: Record<string, unknown> = {};
  if (limit) args.limit = limit;
  if (cursor) args.cursor = cursor;
  return n8nCall(connectionId, 'n8n_list_workflows', args);
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
export function listExecutions(connectionId: string, workflowId?: string, limit?: number, cursor?: string) {
  const args: Record<string, unknown> = {};
  if (workflowId) args.workflowId = workflowId;
  if (limit) args.limit = limit;
  if (cursor) args.cursor = cursor;
  return n8nCall(connectionId, 'n8n_list_executions', args);
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

// ============================================
// LINE Proxy
// ============================================

function lineCall<T>(connectionId: string, tool: string, args: Record<string, unknown> = {}) {
  return toolProxy<T>('line', connectionId, tool, args);
}

// Messages
export function linePushMessage(connectionId: string, to: string, messages: unknown[]) {
  return lineCall(connectionId, 'line_push_message', { to, messages });
}
export function lineBroadcastMessage(connectionId: string, messages: unknown[]) {
  return lineCall(connectionId, 'line_broadcast_message', { messages });
}
export function lineValidateMessage(connectionId: string, messages: unknown[]) {
  return lineCall(connectionId, 'line_validate_message', { messages });
}

// User & Bot
export function lineGetProfile(connectionId: string, userId: string) {
  return lineCall(connectionId, 'line_get_profile', { userId });
}
export function lineGetFollowerIds(connectionId: string, start?: string) {
  const args: Record<string, unknown> = {};
  if (start) args.start = start;
  return lineCall(connectionId, 'line_get_follower_ids', args);
}
export function lineGetBotInfo(connectionId: string) {
  return lineCall(connectionId, 'line_get_bot_info');
}

// Group
export function lineGetGroupSummary(connectionId: string, groupId: string) {
  return lineCall(connectionId, 'line_get_group_summary', { groupId });
}
export function lineGetGroupMembersCount(connectionId: string, groupId: string) {
  return lineCall(connectionId, 'line_get_group_members_count', { groupId });
}
export function lineGetGroupMemberIds(connectionId: string, groupId: string) {
  return lineCall(connectionId, 'line_get_group_member_ids', { groupId });
}

// Rich Menus
export function lineGetRichMenus(connectionId: string) {
  return lineCall(connectionId, 'line_get_rich_menus');
}
export function lineGetRichMenu(connectionId: string, richMenuId: string) {
  return lineCall(connectionId, 'line_get_rich_menu', { richMenuId });
}
export function lineDeleteRichMenu(connectionId: string, richMenuId: string) {
  return lineCall(connectionId, 'line_delete_rich_menu', { richMenuId });
}
export function lineSetDefaultRichMenu(connectionId: string, richMenuId: string) {
  return lineCall(connectionId, 'line_set_default_rich_menu', { richMenuId });
}
export function lineLinkRichMenuToUser(connectionId: string, userId: string, richMenuId: string) {
  return lineCall(connectionId, 'line_link_rich_menu_to_user', { userId, richMenuId });
}

// Quota & Insights
export function lineGetQuota(connectionId: string) {
  return lineCall(connectionId, 'line_get_quota');
}
export function lineGetQuotaConsumption(connectionId: string) {
  return lineCall(connectionId, 'line_get_quota_consumption');
}

// Webhook
export function lineGetWebhookInfo(connectionId: string) {
  return lineCall(connectionId, 'line_get_webhook_info');
}
export function lineSetWebhookUrl(connectionId: string, endpoint: string) {
  return lineCall(connectionId, 'line_set_webhook_url', { endpoint });
}
export function lineTestWebhook(connectionId: string) {
  return lineCall(connectionId, 'line_test_webhook');
}

// ============================================
// Gemini RAG Proxy
// ============================================

function geminiCall<T>(connectionId: string, tool: string, args: Record<string, unknown> = {}) {
  return toolProxy<T>('gemini-rag', connectionId, tool, args);
}

// Stores
export function listStores(connectionId: string, pageSize?: number, pageToken?: string) {
  const args: Record<string, unknown> = {};
  if (pageSize) args.page_size = pageSize;
  if (pageToken) args.page_token = pageToken;
  return geminiCall(connectionId, 'gemini_list_stores', args);
}
export function createStore(connectionId: string, displayName: string) {
  return geminiCall(connectionId, 'gemini_create_store', { display_name: displayName });
}
export function getStore(connectionId: string, storeName: string) {
  return geminiCall(connectionId, 'gemini_get_store', { store_name: storeName });
}
export function deleteStore(connectionId: string, storeName: string, force?: boolean) {
  return geminiCall(connectionId, 'gemini_delete_store', { store_name: storeName, force: force || false });
}

// Documents
export function listDocuments(connectionId: string, storeName: string, pageSize?: number, pageToken?: string) {
  const args: Record<string, unknown> = { store_name: storeName };
  if (pageSize) args.page_size = pageSize;
  if (pageToken) args.page_token = pageToken;
  return geminiCall(connectionId, 'gemini_list_documents', args);
}
export function deleteDocument(connectionId: string, documentName: string, force?: boolean) {
  return geminiCall(connectionId, 'gemini_delete_document', { document_name: documentName, force: force || false });
}
export function uploadToStore(connectionId: string, storeName: string, data: { mimeType: string; content: string; displayName?: string; contentEncoding?: 'base64' | 'text' }, metadata?: unknown[]) {
  const args: Record<string, unknown> = { store_name: storeName, mime_type: data.mimeType, content: data.content, display_name: data.displayName };
  if (data.contentEncoding) args.content_encoding = data.contentEncoding;
  if (metadata && metadata.length > 0) args.custom_metadata = metadata;
  return geminiCall(connectionId, 'gemini_upload_to_store', args);
}

// RAG Query
export function ragQuery(connectionId: string, query: string, storeNames: string[], model?: string) {
  return geminiCall(connectionId, 'gemini_rag_query', { query, store_names: storeNames, model });
}

// ============================================
// Telegram Proxy
// ============================================

function tgCall<T>(connectionId: string, tool: string, args: Record<string, unknown> = {}) {
  return toolProxy<T>('telegram', connectionId, tool, args);
}

// Bot
export function tgGetMe(connectionId: string) {
  return tgCall(connectionId, 'tg_get_me');
}
export function tgSetMyCommands(connectionId: string, commands: { command: string; description: string }[]) {
  return tgCall(connectionId, 'tg_set_my_commands', { commands });
}

// Messages
export function tgSendMessage(connectionId: string, chatId: string, text: string, opts?: Record<string, unknown>) {
  return tgCall(connectionId, 'tg_send_message', { chat_id: chatId, text, ...opts });
}
export function tgSendPhoto(connectionId: string, chatId: string, photo: string, opts?: Record<string, unknown>) {
  return tgCall(connectionId, 'tg_send_photo', { chat_id: chatId, photo, ...opts });
}
export function tgEditMessageText(connectionId: string, chatId: string, messageId: number, text: string) {
  return tgCall(connectionId, 'tg_edit_message_text', { chat_id: chatId, message_id: messageId, text });
}
export function tgDeleteMessage(connectionId: string, chatId: string, messageId: number) {
  return tgCall(connectionId, 'tg_delete_message', { chat_id: chatId, message_id: messageId });
}

// Chat
export function tgGetChat(connectionId: string, chatId: string) {
  return tgCall(connectionId, 'tg_get_chat', { chat_id: chatId });
}
export function tgGetChatMemberCount(connectionId: string, chatId: string) {
  return tgCall(connectionId, 'tg_get_chat_member_count', { chat_id: chatId });
}
export function tgGetChatMember(connectionId: string, chatId: string, userId: number) {
  return tgCall(connectionId, 'tg_get_chat_member', { chat_id: chatId, user_id: userId });
}
export function tgBanChatMember(connectionId: string, chatId: string, userId: number) {
  return tgCall(connectionId, 'tg_ban_chat_member', { chat_id: chatId, user_id: userId });
}
export function tgUnbanChatMember(connectionId: string, chatId: string, userId: number) {
  return tgCall(connectionId, 'tg_unban_chat_member', { chat_id: chatId, user_id: userId });
}
export function tgCreateChatInviteLink(connectionId: string, chatId: string, opts?: Record<string, unknown>) {
  return tgCall(connectionId, 'tg_create_chat_invite_link', { chat_id: chatId, ...opts });
}

// Webhooks
export function tgGetWebhookInfo(connectionId: string) {
  return tgCall(connectionId, 'tg_get_webhook_info');
}
export function tgSetWebhook(connectionId: string, url: string, opts?: Record<string, unknown>) {
  return tgCall(connectionId, 'tg_set_webhook', { url, ...opts });
}
export function tgDeleteWebhook(connectionId: string, dropPending?: boolean) {
  return tgCall(connectionId, 'tg_delete_webhook', { drop_pending_updates: dropPending || false });
}

// ============================================
// Notion Proxy
// ============================================

function notionCall<T>(connectionId: string, tool: string, args: Record<string, unknown> = {}) {
  return toolProxy<T>('notion', connectionId, tool, args);
}

// Search
export function notionSearch(connectionId: string, query?: string, filterObject?: string, startCursor?: string, pageSize?: number) {
  const args: Record<string, unknown> = { query, filter_object: filterObject };
  if (startCursor) args.start_cursor = startCursor;
  if (pageSize) args.page_size = pageSize;
  return notionCall(connectionId, 'notion_search', args);
}

// Pages
export function notionGetPage(connectionId: string, pageId: string) {
  return notionCall(connectionId, 'notion_get_page', { page_id: pageId });
}
export function notionCreatePage(connectionId: string, parent: Record<string, unknown>, properties: Record<string, unknown>) {
  return notionCall(connectionId, 'notion_create_page', { parent, properties });
}
export function notionUpdatePage(connectionId: string, pageId: string, properties: Record<string, unknown>) {
  return notionCall(connectionId, 'notion_update_page', { page_id: pageId, properties });
}

// Databases
export function notionGetDatabase(connectionId: string, databaseId: string) {
  return notionCall(connectionId, 'notion_get_database', { database_id: databaseId });
}
export function notionQueryDatabase(connectionId: string, databaseId: string, filter?: Record<string, unknown>) {
  return notionCall(connectionId, 'notion_query_database', { database_id: databaseId, filter });
}
export function notionCreateDatabase(connectionId: string, parentPageId: string, title: string, properties: Record<string, unknown>) {
  return notionCall(connectionId, 'notion_create_database', {
    parent: { type: 'page_id', page_id: parentPageId },
    title: [{ type: 'text', text: { content: title } }],
    properties,
  });
}

// Blocks
export function notionGetBlockChildren(connectionId: string, blockId: string, startCursor?: string, pageSize?: number) {
  const args: Record<string, unknown> = { block_id: blockId };
  if (startCursor) args.start_cursor = startCursor;
  if (pageSize) args.page_size = pageSize;
  return notionCall(connectionId, 'notion_get_block_children', args);
}
export function notionAppendBlocks(connectionId: string, blockId: string, children: unknown[]) {
  return notionCall(connectionId, 'notion_append_blocks', { block_id: blockId, children });
}
export function notionDeleteBlock(connectionId: string, blockId: string) {
  return notionCall(connectionId, 'notion_delete_block', { block_id: blockId });
}

// Comments
export function notionGetComments(connectionId: string, blockId: string) {
  return notionCall(connectionId, 'notion_get_comments', { block_id: blockId });
}
export function notionCreateComment(connectionId: string, pageId: string, richText: unknown[]) {
  return notionCall(connectionId, 'notion_create_comment', { parent: { page_id: pageId }, rich_text: richText });
}

// Users
export function notionListUsers(connectionId: string) {
  return notionCall(connectionId, 'notion_list_users');
}

// ============================================
// Slack Proxy
// ============================================

function slackCall<T>(connectionId: string, tool: string, args: Record<string, unknown> = {}) {
  return toolProxy<T>('slack', connectionId, tool, args);
}

// Messages
export function slackSendMessage(connectionId: string, channel: string, text: string, opts?: Record<string, unknown>) {
  return slackCall(connectionId, 'slack_send_message', { channel, text, ...opts });
}
export function slackUpdateMessage(connectionId: string, channel: string, ts: string, opts?: Record<string, unknown>) {
  return slackCall(connectionId, 'slack_update_message', { channel, ts, ...opts });
}
export function slackDeleteMessage(connectionId: string, channel: string, ts: string) {
  return slackCall(connectionId, 'slack_delete_message', { channel, ts });
}
export function slackScheduleMessage(connectionId: string, channel: string, postAt: number, text: string) {
  return slackCall(connectionId, 'slack_schedule_message', { channel, post_at: postAt, text });
}
export function slackDeleteScheduledMessage(connectionId: string, channel: string, scheduledMessageId: string) {
  return slackCall(connectionId, 'slack_delete_scheduled_message', { channel, scheduled_message_id: scheduledMessageId });
}
export function slackListScheduledMessages(connectionId: string, opts?: Record<string, unknown>) {
  return slackCall(connectionId, 'slack_list_scheduled_messages', opts || {});
}
export function slackGetPermalink(connectionId: string, channel: string, messageTs: string) {
  return slackCall(connectionId, 'slack_get_permalink', { channel, message_ts: messageTs });
}

// Conversations
export function slackListChannels(connectionId: string, opts?: Record<string, unknown>) {
  return slackCall(connectionId, 'slack_list_channels', opts || {});
}
export function slackGetChannelInfo(connectionId: string, channel: string) {
  return slackCall(connectionId, 'slack_get_channel_info', { channel });
}
export function slackGetChannelHistory(connectionId: string, channel: string, opts?: Record<string, unknown>) {
  return slackCall(connectionId, 'slack_get_channel_history', { channel, ...opts });
}
export function slackGetThreadReplies(connectionId: string, channel: string, ts: string) {
  return slackCall(connectionId, 'slack_get_thread_replies', { channel, ts });
}
export function slackGetChannelMembers(connectionId: string, channel: string) {
  return slackCall(connectionId, 'slack_get_channel_members', { channel });
}
export function slackCreateChannel(connectionId: string, name: string, isPrivate?: boolean) {
  const args: Record<string, unknown> = { name };
  if (isPrivate) args.is_private = true;
  return slackCall(connectionId, 'slack_create_channel', args);
}
export function slackArchiveChannel(connectionId: string, channel: string) {
  return slackCall(connectionId, 'slack_archive_channel', { channel });
}
export function slackInviteToChannel(connectionId: string, channel: string, users: string) {
  return slackCall(connectionId, 'slack_invite_to_channel', { channel, users });
}
export function slackKickFromChannel(connectionId: string, channel: string, user: string) {
  return slackCall(connectionId, 'slack_kick_from_channel', { channel, user });
}
export function slackJoinChannel(connectionId: string, channel: string) {
  return slackCall(connectionId, 'slack_join_channel', { channel });
}
export function slackSetChannelTopic(connectionId: string, channel: string, topic: string) {
  return slackCall(connectionId, 'slack_set_channel_topic', { channel, topic });
}
export function slackOpenConversation(connectionId: string, users: string) {
  return slackCall(connectionId, 'slack_open_conversation', { users });
}

// Users
export function slackListUsers(connectionId: string) {
  return slackCall(connectionId, 'slack_list_users');
}
export function slackGetUserInfo(connectionId: string, user: string) {
  return slackCall(connectionId, 'slack_get_user_info', { user });
}

// Reactions
export function slackAddReaction(connectionId: string, channel: string, timestamp: string, name: string) {
  return slackCall(connectionId, 'slack_add_reaction', { channel, timestamp, name });
}
export function slackRemoveReaction(connectionId: string, channel: string, timestamp: string, name: string) {
  return slackCall(connectionId, 'slack_remove_reaction', { channel, timestamp, name });
}
export function slackGetReactions(connectionId: string, channel: string, timestamp: string) {
  return slackCall(connectionId, 'slack_get_reactions', { channel, timestamp });
}

// Search
export function slackSearchMessages(connectionId: string, query: string, opts?: Record<string, unknown>) {
  return slackCall(connectionId, 'slack_search_messages', { query, ...opts });
}
export function slackSearchFiles(connectionId: string, query: string, opts?: Record<string, unknown>) {
  return slackCall(connectionId, 'slack_search_files', { query, ...opts });
}

// Files
export function slackUploadFile(connectionId: string, content: string, filename: string, opts?: Record<string, unknown>) {
  return slackCall(connectionId, 'slack_upload_file', { content, filename, ...opts });
}
export function slackListFiles(connectionId: string, opts?: Record<string, unknown>) {
  return slackCall(connectionId, 'slack_list_files', opts || {});
}
export function slackDeleteFile(connectionId: string, file: string) {
  return slackCall(connectionId, 'slack_delete_file', { file });
}

// Pins
export function slackPinMessage(connectionId: string, channel: string, timestamp: string) {
  return slackCall(connectionId, 'slack_pin_message', { channel, timestamp });
}
export function slackUnpinMessage(connectionId: string, channel: string, timestamp: string) {
  return slackCall(connectionId, 'slack_unpin_message', { channel, timestamp });
}
export function slackListPins(connectionId: string, channel: string) {
  return slackCall(connectionId, 'slack_list_pins', { channel });
}

// Bookmarks
export function slackAddBookmark(connectionId: string, channelId: string, title: string, link: string) {
  return slackCall(connectionId, 'slack_add_bookmark', { channel_id: channelId, title, link });
}
export function slackEditBookmark(connectionId: string, bookmarkId: string, channelId: string, opts?: Record<string, unknown>) {
  return slackCall(connectionId, 'slack_edit_bookmark', { bookmark_id: bookmarkId, channel_id: channelId, ...opts });
}
export function slackRemoveBookmark(connectionId: string, bookmarkId: string, channelId: string) {
  return slackCall(connectionId, 'slack_remove_bookmark', { bookmark_id: bookmarkId, channel_id: channelId });
}
export function slackListBookmarks(connectionId: string, channelId: string) {
  return slackCall(connectionId, 'slack_list_bookmarks', { channel_id: channelId });
}

// Team & Emoji
export function slackGetTeamInfo(connectionId: string) {
  return slackCall(connectionId, 'slack_get_team_info');
}
export function slackListEmoji(connectionId: string) {
  return slackCall(connectionId, 'slack_list_emoji');
}

// ============================================
// Airtable Proxy
// ============================================

function atCall<T>(connectionId: string, tool: string, args: Record<string, unknown> = {}) {
  return toolProxy<T>('airtable', connectionId, tool, args);
}

// Records
export function atListRecords(connectionId: string, baseId: string, tableIdOrName: string, opts?: Record<string, unknown>) {
  return atCall(connectionId, 'airtable_list_records', { base_id: baseId, table_id_or_name: tableIdOrName, ...opts });
}
export function atGetRecord(connectionId: string, baseId: string, tableIdOrName: string, recordId: string) {
  return atCall(connectionId, 'airtable_get_record', { base_id: baseId, table_id_or_name: tableIdOrName, record_id: recordId });
}
export function atCreateRecords(connectionId: string, baseId: string, tableIdOrName: string, records: unknown[], typecast?: boolean) {
  const args: Record<string, unknown> = { base_id: baseId, table_id_or_name: tableIdOrName, records };
  if (typecast) args.typecast = true;
  return atCall(connectionId, 'airtable_create_records', args);
}
export function atUpdateRecords(connectionId: string, baseId: string, tableIdOrName: string, records: unknown[], typecast?: boolean) {
  const args: Record<string, unknown> = { base_id: baseId, table_id_or_name: tableIdOrName, records };
  if (typecast) args.typecast = true;
  return atCall(connectionId, 'airtable_update_records', args);
}
export function atDeleteRecords(connectionId: string, baseId: string, tableIdOrName: string, recordIds: string[]) {
  return atCall(connectionId, 'airtable_delete_records', { base_id: baseId, table_id_or_name: tableIdOrName, record_ids: recordIds });
}
export function atUpsertRecords(connectionId: string, baseId: string, tableIdOrName: string, records: unknown[], fieldsToMergeOn: string[]) {
  return atCall(connectionId, 'airtable_upsert_records', { base_id: baseId, table_id_or_name: tableIdOrName, records, fields_to_merge_on: fieldsToMergeOn });
}

// Bases & Schema
export function atListBases(connectionId: string) {
  return atCall(connectionId, 'airtable_list_bases');
}
export function atGetBaseSchema(connectionId: string, baseId: string) {
  return atCall(connectionId, 'airtable_get_base_schema', { base_id: baseId });
}
export function atCreateTable(connectionId: string, baseId: string, name: string, fields: unknown[], description?: string) {
  const args: Record<string, unknown> = { base_id: baseId, name, fields };
  if (description) args.description = description;
  return atCall(connectionId, 'airtable_create_table', args);
}

// Webhooks
export function atListWebhooks(connectionId: string, baseId: string) {
  return atCall(connectionId, 'airtable_list_webhooks', { base_id: baseId });
}
export function atCreateWebhook(connectionId: string, baseId: string, notificationUrl: string, specification?: Record<string, unknown>) {
  const args: Record<string, unknown> = { base_id: baseId, notification_url: notificationUrl };
  if (specification) args.specification = specification;
  return atCall(connectionId, 'airtable_create_webhook', args);
}
export function atDeleteWebhook(connectionId: string, baseId: string, webhookId: string) {
  return atCall(connectionId, 'airtable_delete_webhook', { base_id: baseId, webhook_id: webhookId });
}

// ============================================
// YouTube Proxy
// ============================================

function ytCall<T>(connectionId: string, tool: string, args: Record<string, unknown> = {}) {
  return toolProxy<T>('youtube', connectionId, tool, args);
}

// Search & Discovery
export function ytSearch(connectionId: string, q?: string, opts?: Record<string, unknown>) {
  const args: Record<string, unknown> = { ...opts };
  if (q) args.q = q;
  return ytCall(connectionId, 'youtube_search', args);
}
export function ytGetVideo(connectionId: string, id: string, part?: string) {
  const args: Record<string, unknown> = { id };
  if (part) args.part = part;
  return ytCall(connectionId, 'youtube_get_video', args);
}
export function ytGetChannel(connectionId: string, id?: string, forUsername?: string) {
  const args: Record<string, unknown> = {};
  if (id) args.id = id;
  if (forUsername) args.for_username = forUsername;
  return ytCall(connectionId, 'youtube_get_channel', args);
}
export function ytGetPopularVideos(connectionId: string, opts?: Record<string, unknown>) {
  return ytCall(connectionId, 'youtube_get_popular_videos', opts || {});
}

// Playlists
export function ytListPlaylists(connectionId: string, opts?: Record<string, unknown>) {
  return ytCall(connectionId, 'youtube_list_playlists', opts || {});
}
export function ytListPlaylistItems(connectionId: string, playlistId: string, opts?: Record<string, unknown>) {
  return ytCall(connectionId, 'youtube_list_playlist_items', { playlist_id: playlistId, ...opts });
}
export function ytCreatePlaylist(connectionId: string, title: string, description?: string, privacyStatus?: string) {
  const args: Record<string, unknown> = { title };
  if (description) args.description = description;
  if (privacyStatus) args.privacy_status = privacyStatus;
  return ytCall(connectionId, 'youtube_create_playlist', args);
}
export function ytDeletePlaylist(connectionId: string, playlistId: string) {
  return ytCall(connectionId, 'youtube_delete_playlist', { playlist_id: playlistId });
}
export function ytAddPlaylistItem(connectionId: string, playlistId: string, videoId: string, position?: number) {
  const args: Record<string, unknown> = { playlist_id: playlistId, video_id: videoId };
  if (position !== undefined) args.position = position;
  return ytCall(connectionId, 'youtube_add_playlist_item', args);
}
export function ytRemovePlaylistItem(connectionId: string, playlistItemId: string) {
  return ytCall(connectionId, 'youtube_remove_playlist_item', { playlist_item_id: playlistItemId });
}

// Comments
export function ytListComments(connectionId: string, opts?: Record<string, unknown>) {
  return ytCall(connectionId, 'youtube_list_comments', opts || {});
}
export function ytPostComment(connectionId: string, videoId: string, text: string) {
  return ytCall(connectionId, 'youtube_post_comment', { video_id: videoId, text });
}
export function ytReplyComment(connectionId: string, parentId: string, text: string) {
  return ytCall(connectionId, 'youtube_reply_comment', { parent_id: parentId, text });
}
export function ytDeleteComment(connectionId: string, commentId: string) {
  return ytCall(connectionId, 'youtube_delete_comment', { comment_id: commentId });
}

// Engagement
export function ytRateVideo(connectionId: string, videoId: string, rating: string) {
  return ytCall(connectionId, 'youtube_rate_video', { video_id: videoId, rating });
}

// ============================================
// PostgREST Proxy
// ============================================

function pgCall<T>(connectionId: string, tool: string, args: Record<string, unknown> = {}) {
  return toolProxy<T>('postgrest', connectionId, tool, args);
}

// Schema
export function pgGetSchema(connectionId: string) {
  return pgCall(connectionId, 'pg_get_schema');
}
export function pgDescribeTable(connectionId: string, table: string) {
  return pgCall(connectionId, 'pg_describe_table', { table });
}

// Read
export function pgListRecords(connectionId: string, table: string, opts?: Record<string, unknown>) {
  return pgCall(connectionId, 'pg_list_records', { table, ...opts });
}
export function pgCountRecords(connectionId: string, table: string, opts?: Record<string, unknown>) {
  return pgCall(connectionId, 'pg_count_records', { table, ...opts });
}
export function pgCallFunction(connectionId: string, functionName: string, params?: Record<string, unknown>, method?: string) {
  const args: Record<string, unknown> = { function_name: functionName };
  if (params) args.params = params;
  if (method) args.method = method;
  return pgCall(connectionId, 'pg_call_function', args);
}

// Write
export function pgInsertRecords(connectionId: string, table: string, records: unknown, opts?: Record<string, unknown>) {
  return pgCall(connectionId, 'pg_insert_records', { table, records, ...opts });
}
export function pgUpdateRecords(connectionId: string, table: string, filter: string, data: Record<string, unknown>, opts?: Record<string, unknown>) {
  return pgCall(connectionId, 'pg_update_records', { table, filter, data, ...opts });
}
export function pgUpsertRecords(connectionId: string, table: string, records: unknown, opts?: Record<string, unknown>) {
  return pgCall(connectionId, 'pg_upsert_records', { table, records, ...opts });
}
export function pgDeleteRecords(connectionId: string, table: string, filter: string, opts?: Record<string, unknown>) {
  return pgCall(connectionId, 'pg_delete_records', { table, filter, ...opts });
}

// ============================================
// Google Workspace OAuth
// ============================================

export async function startGoogleWorkspaceOAuth(
  connectionId: string
): Promise<ApiResponse<{ authorize_url: string }>> {
  return gatewayRequest('/api/oauth/google-workspace/start', {
    method: 'POST',
    body: JSON.stringify({ connection_id: connectionId }),
  });
}

export async function getGoogleWorkspaceOAuthStatus(
  connectionId: string
): Promise<ApiResponse<{ connected: boolean; email: string | null; expired: boolean }>> {
  return gatewayRequest(`/api/oauth/google-workspace/status/${connectionId}`);
}

export async function disconnectGoogleWorkspace(
  connectionId: string
): Promise<ApiResponse<{ disconnected: boolean }>> {
  return gatewayRequest(`/api/oauth/google-workspace/disconnect/${connectionId}`, {
    method: 'POST',
  });
}

// ============================================
// Bitkub Proxy
// ============================================

function btkCall<T>(connectionId: string, tool: string, args: Record<string, unknown> = {}) {
  return toolProxy<T>('bitkub', connectionId, tool, args);
}

export function btkGetTicker(connectionId: string, symbol?: string) {
  const args: Record<string, unknown> = {};
  if (symbol) args.symbol = symbol;
  return btkCall(connectionId, 'btk_ticker', args);
}
export function btkGetBalances(connectionId: string) {
  return btkCall(connectionId, 'btk_wallet_balances', {});
}
export function btkGetOpenOrders(connectionId: string, symbol: string) {
  return btkCall(connectionId, 'btk_open_orders', { symbol });
}

// ============================================
// Binance Proxy
// ============================================

function bnCall<T>(connectionId: string, tool: string, args: Record<string, unknown> = {}) {
  return toolProxy<T>('binance', connectionId, tool, args);
}

export function bnGetTicker24hr(connectionId: string, symbol?: string) {
  const args: Record<string, unknown> = {};
  if (symbol) args.symbol = symbol;
  return bnCall(connectionId, 'bn_ticker_24hr', args);
}
export function bnGetAccount(connectionId: string) {
  return bnCall(connectionId, 'bn_account_info', {});
}
export function bnGetOpenOrders(connectionId: string, symbol?: string) {
  const args: Record<string, unknown> = {};
  if (symbol) args.symbol = symbol;
  return bnCall(connectionId, 'bn_open_orders', args);
}

// ============================================
// Binance TH Proxy
// ============================================

function bthCall<T>(connectionId: string, tool: string, args: Record<string, unknown> = {}) {
  return toolProxy<T>('binance-th', connectionId, tool, args);
}

export function bthGetTicker24hr(connectionId: string, symbol?: string) {
  const args: Record<string, unknown> = {};
  if (symbol) args.symbol = symbol;
  return bthCall(connectionId, 'bth_ticker_24hr', args);
}
export function bthGetAccount(connectionId: string) {
  return bthCall(connectionId, 'bth_account_info', {});
}
export function bthGetOpenOrders(connectionId: string, symbol?: string) {
  const args: Record<string, unknown> = {};
  if (symbol) args.symbol = symbol;
  return bthCall(connectionId, 'bth_open_orders', args);
}
