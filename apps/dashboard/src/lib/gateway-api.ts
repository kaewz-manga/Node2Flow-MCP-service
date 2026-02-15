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

// ============================================
// Google Sheets Proxy (23 tools)
// ============================================

function gsCall<T>(connectionId: string, tool: string, args: Record<string, unknown> = {}) {
  return toolProxy<T>('google-sheets', connectionId, tool, args);
}

export function gsCreateSpreadsheet(connectionId: string, title: string, sheetTitles?: string[]) {
  const args: Record<string, unknown> = { title };
  if (sheetTitles) args.sheet_titles = sheetTitles;
  return gsCall(connectionId, 'gs_create_spreadsheet', args);
}
export function gsGetSpreadsheet(connectionId: string, spreadsheetId: string) {
  return gsCall(connectionId, 'gs_get_spreadsheet', { spreadsheet_id: spreadsheetId });
}
export function gsReadValues(connectionId: string, spreadsheetId: string, range: string) {
  return gsCall(connectionId, 'gs_read_values', { spreadsheet_id: spreadsheetId, range });
}
export function gsBatchRead(connectionId: string, spreadsheetId: string, ranges: string[]) {
  return gsCall(connectionId, 'gs_batch_read', { spreadsheet_id: spreadsheetId, ranges });
}
export function gsWriteValues(connectionId: string, spreadsheetId: string, range: string, values: unknown[][]) {
  return gsCall(connectionId, 'gs_write_values', { spreadsheet_id: spreadsheetId, range, values });
}
export function gsAppendValues(connectionId: string, spreadsheetId: string, range: string, values: unknown[][]) {
  return gsCall(connectionId, 'gs_append_values', { spreadsheet_id: spreadsheetId, range, values });
}
export function gsClearValues(connectionId: string, spreadsheetId: string, range: string) {
  return gsCall(connectionId, 'gs_clear_values', { spreadsheet_id: spreadsheetId, range });
}
export function gsBatchWrite(connectionId: string, spreadsheetId: string, data: Array<{ range: string; values: unknown[][] }>) {
  return gsCall(connectionId, 'gs_batch_write', { spreadsheet_id: spreadsheetId, data });
}
export function gsAddSheet(connectionId: string, spreadsheetId: string, title: string) {
  return gsCall(connectionId, 'gs_add_sheet', { spreadsheet_id: spreadsheetId, title });
}
export function gsDeleteSheet(connectionId: string, spreadsheetId: string, sheetId: number) {
  return gsCall(connectionId, 'gs_delete_sheet', { spreadsheet_id: spreadsheetId, sheet_id: sheetId });
}
export function gsRenameSheet(connectionId: string, spreadsheetId: string, sheetId: number, title: string) {
  return gsCall(connectionId, 'gs_rename_sheet', { spreadsheet_id: spreadsheetId, sheet_id: sheetId, title });
}
export function gsCopySheet(connectionId: string, spreadsheetId: string, sheetId: number, destId: string) {
  return gsCall(connectionId, 'gs_copy_sheet', { spreadsheet_id: spreadsheetId, sheet_id: sheetId, destination_spreadsheet_id: destId });
}
export function gsDuplicateSheet(connectionId: string, spreadsheetId: string, sheetId: number) {
  return gsCall(connectionId, 'gs_duplicate_sheet', { spreadsheet_id: spreadsheetId, sheet_id: sheetId });
}
export function gsFormatCells(connectionId: string, spreadsheetId: string, args: Record<string, unknown>) {
  return gsCall(connectionId, 'gs_format_cells', { spreadsheet_id: spreadsheetId, ...args });
}
export function gsMergeCells(connectionId: string, spreadsheetId: string, args: Record<string, unknown>) {
  return gsCall(connectionId, 'gs_merge_cells', { spreadsheet_id: spreadsheetId, ...args });
}
export function gsUnmergeCells(connectionId: string, spreadsheetId: string, args: Record<string, unknown>) {
  return gsCall(connectionId, 'gs_unmerge_cells', { spreadsheet_id: spreadsheetId, ...args });
}
export function gsAutoResize(connectionId: string, spreadsheetId: string, args: Record<string, unknown>) {
  return gsCall(connectionId, 'gs_auto_resize', { spreadsheet_id: spreadsheetId, ...args });
}
export function gsSortRange(connectionId: string, spreadsheetId: string, args: Record<string, unknown>) {
  return gsCall(connectionId, 'gs_sort_range', { spreadsheet_id: spreadsheetId, ...args });
}
export function gsFindReplace(connectionId: string, spreadsheetId: string, find: string, replacement: string) {
  return gsCall(connectionId, 'gs_find_replace', { spreadsheet_id: spreadsheetId, find, replacement });
}
export function gsSetBasicFilter(connectionId: string, spreadsheetId: string, args: Record<string, unknown>) {
  return gsCall(connectionId, 'gs_set_basic_filter', { spreadsheet_id: spreadsheetId, ...args });
}
export function gsAddProtectedRange(connectionId: string, spreadsheetId: string, args: Record<string, unknown>) {
  return gsCall(connectionId, 'gs_add_protected_range', { spreadsheet_id: spreadsheetId, ...args });
}
export function gsAddChart(connectionId: string, spreadsheetId: string, args: Record<string, unknown>) {
  return gsCall(connectionId, 'gs_add_chart', { spreadsheet_id: spreadsheetId, ...args });
}
export function gsBatchUpdate(connectionId: string, spreadsheetId: string, requests: Record<string, unknown>[]) {
  return gsCall(connectionId, 'gs_batch_update', { spreadsheet_id: spreadsheetId, requests });
}

// ============================================
// Google Drive Proxy (23 tools)
// ============================================

function gdCall<T>(connectionId: string, tool: string, args: Record<string, unknown> = {}) {
  return toolProxy<T>('google-drive', connectionId, tool, args);
}

export function gdListFiles(connectionId: string, query?: string, pageSize?: number) {
  const args: Record<string, unknown> = {};
  if (query) args.query = query;
  if (pageSize) args.page_size = pageSize;
  return gdCall(connectionId, 'gd_list_files', args);
}
export function gdSearchFiles(connectionId: string, query: string) {
  return gdCall(connectionId, 'gd_search_files', { query });
}
export function gdGetFile(connectionId: string, fileId: string) {
  return gdCall(connectionId, 'gd_get_file', { file_id: fileId });
}
export function gdCreateFile(connectionId: string, name: string, mimeType?: string, parents?: string[]) {
  const args: Record<string, unknown> = { name };
  if (mimeType) args.mime_type = mimeType;
  if (parents) args.parents = parents;
  return gdCall(connectionId, 'gd_create_file', args);
}
export function gdCopyFile(connectionId: string, fileId: string, name?: string) {
  const args: Record<string, unknown> = { file_id: fileId };
  if (name) args.name = name;
  return gdCall(connectionId, 'gd_copy_file', args);
}
export function gdMoveFile(connectionId: string, fileId: string, newParentId: string) {
  return gdCall(connectionId, 'gd_move_file', { file_id: fileId, new_parent_id: newParentId });
}
export function gdRenameFile(connectionId: string, fileId: string, newName: string) {
  return gdCall(connectionId, 'gd_rename_file', { file_id: fileId, new_name: newName });
}
export function gdTrashFile(connectionId: string, fileId: string) {
  return gdCall(connectionId, 'gd_trash_file', { file_id: fileId });
}
export function gdUploadFile(connectionId: string, name: string, content: string) {
  return gdCall(connectionId, 'gd_upload_file', { name, content });
}
export function gdExportFile(connectionId: string, fileId: string, mimeType: string) {
  return gdCall(connectionId, 'gd_export_file', { file_id: fileId, mime_type: mimeType });
}
export function gdCreatePermission(connectionId: string, fileId: string, role: string, type: string, emailAddress?: string) {
  const args: Record<string, unknown> = { file_id: fileId, role, type };
  if (emailAddress) args.email_address = emailAddress;
  return gdCall(connectionId, 'gd_create_permission', args);
}
export function gdListPermissions(connectionId: string, fileId: string) {
  return gdCall(connectionId, 'gd_list_permissions', { file_id: fileId });
}
export function gdDeletePermission(connectionId: string, fileId: string, permissionId: string) {
  return gdCall(connectionId, 'gd_delete_permission', { file_id: fileId, permission_id: permissionId });
}
export function gdCreateComment(connectionId: string, fileId: string, content: string) {
  return gdCall(connectionId, 'gd_create_comment', { file_id: fileId, content });
}
export function gdListComments(connectionId: string, fileId: string) {
  return gdCall(connectionId, 'gd_list_comments', { file_id: fileId });
}
export function gdResolveComment(connectionId: string, fileId: string, commentId: string) {
  return gdCall(connectionId, 'gd_resolve_comment', { file_id: fileId, comment_id: commentId });
}
export function gdCreateReply(connectionId: string, fileId: string, commentId: string, content: string) {
  return gdCall(connectionId, 'gd_create_reply', { file_id: fileId, comment_id: commentId, content });
}
export function gdListReplies(connectionId: string, fileId: string, commentId: string) {
  return gdCall(connectionId, 'gd_list_replies', { file_id: fileId, comment_id: commentId });
}
export function gdListSharedDrives(connectionId: string) {
  return gdCall(connectionId, 'gd_list_shared_drives', {});
}
export function gdGetSharedDrive(connectionId: string, driveId: string) {
  return gdCall(connectionId, 'gd_get_shared_drive', { drive_id: driveId });
}
export function gdCreateSharedDrive(connectionId: string, name: string) {
  return gdCall(connectionId, 'gd_create_shared_drive', { name });
}
export function gdListRevisions(connectionId: string, fileId: string) {
  return gdCall(connectionId, 'gd_list_revisions', { file_id: fileId });
}
export function gdGetAbout(connectionId: string) {
  return gdCall(connectionId, 'gd_get_about', {});
}

// ============================================
// Google Docs Proxy (26 tools)
// ============================================

function gdocCall<T>(connectionId: string, tool: string, args: Record<string, unknown> = {}) {
  return toolProxy<T>('google-docs', connectionId, tool, args);
}

export function gdocCreateDocument(connectionId: string, title: string) {
  return gdocCall(connectionId, 'gdoc_create_document', { title });
}
export function gdocGetDocument(connectionId: string, documentId: string) {
  return gdocCall(connectionId, 'gdoc_get_document', { document_id: documentId });
}
export function gdocBatchUpdate(connectionId: string, documentId: string, requests: Record<string, unknown>[]) {
  return gdocCall(connectionId, 'gdoc_batch_update', { document_id: documentId, requests });
}
export function gdocInsertText(connectionId: string, documentId: string, text: string, index: number) {
  return gdocCall(connectionId, 'gdoc_insert_text', { document_id: documentId, text, index });
}
export function gdocDeleteContent(connectionId: string, documentId: string, startIndex: number, endIndex: number) {
  return gdocCall(connectionId, 'gdoc_delete_content', { document_id: documentId, start_index: startIndex, end_index: endIndex });
}
export function gdocReplaceText(connectionId: string, documentId: string, searchText: string, replaceText: string) {
  return gdocCall(connectionId, 'gdoc_replace_text', { document_id: documentId, search_text: searchText, replace_text: replaceText });
}
export function gdocInsertImage(connectionId: string, documentId: string, imageUri: string, index: number) {
  return gdocCall(connectionId, 'gdoc_insert_image', { document_id: documentId, image_uri: imageUri, index });
}
export function gdocInsertPageBreak(connectionId: string, documentId: string, index: number) {
  return gdocCall(connectionId, 'gdoc_insert_page_break', { document_id: documentId, index });
}
export function gdocSetParagraphStyle(connectionId: string, documentId: string, args: Record<string, unknown>) {
  return gdocCall(connectionId, 'gdoc_set_paragraph_style', { document_id: documentId, ...args });
}
export function gdocSetTextStyle(connectionId: string, documentId: string, args: Record<string, unknown>) {
  return gdocCall(connectionId, 'gdoc_set_text_style', { document_id: documentId, ...args });
}
export function gdocCreateTable(connectionId: string, documentId: string, rows: number, columns: number, index: number) {
  return gdocCall(connectionId, 'gdoc_create_table', { document_id: documentId, rows, columns, index });
}
export function gdocInsertTableRow(connectionId: string, documentId: string, tableIndex: number, rowIndex: number) {
  return gdocCall(connectionId, 'gdoc_insert_table_row', { document_id: documentId, table_index: tableIndex, row_index: rowIndex });
}
export function gdocInsertTableColumn(connectionId: string, documentId: string, tableIndex: number, columnIndex: number) {
  return gdocCall(connectionId, 'gdoc_insert_table_column', { document_id: documentId, table_index: tableIndex, column_index: columnIndex });
}
export function gdocDeleteTableRow(connectionId: string, documentId: string, tableStartIndex: number, rowIndex: number) {
  return gdocCall(connectionId, 'gdoc_delete_table_row', { document_id: documentId, table_start_index: tableStartIndex, row_index: rowIndex });
}
export function gdocDeleteTableColumn(connectionId: string, documentId: string, tableStartIndex: number, columnIndex: number) {
  return gdocCall(connectionId, 'gdoc_delete_table_column', { document_id: documentId, table_start_index: tableStartIndex, column_index: columnIndex });
}
export function gdocMergeTableCells(connectionId: string, documentId: string, args: Record<string, unknown>) {
  return gdocCall(connectionId, 'gdoc_merge_table_cells', { document_id: documentId, ...args });
}
export function gdocCreateList(connectionId: string, documentId: string, startIndex: number, endIndex: number, bulletPreset?: string) {
  const args: Record<string, unknown> = { document_id: documentId, start_index: startIndex, end_index: endIndex };
  if (bulletPreset) args.bullet_preset = bulletPreset;
  return gdocCall(connectionId, 'gdoc_create_list', args);
}
export function gdocDeleteList(connectionId: string, documentId: string, startIndex: number, endIndex: number) {
  return gdocCall(connectionId, 'gdoc_delete_list', { document_id: documentId, start_index: startIndex, end_index: endIndex });
}
export function gdocUpdateHeader(connectionId: string, documentId: string, headerId: string, text: string) {
  return gdocCall(connectionId, 'gdoc_update_header', { document_id: documentId, header_id: headerId, text });
}
export function gdocUpdateFooter(connectionId: string, documentId: string, footerId: string, text: string) {
  return gdocCall(connectionId, 'gdoc_update_footer', { document_id: documentId, footer_id: footerId, text });
}
export function gdocCreateHeader(connectionId: string, documentId: string, sectionType?: string) {
  const args: Record<string, unknown> = { document_id: documentId };
  if (sectionType) args.section_type = sectionType;
  return gdocCall(connectionId, 'gdoc_create_header', args);
}
export function gdocCreateFooter(connectionId: string, documentId: string, sectionType?: string) {
  const args: Record<string, unknown> = { document_id: documentId };
  if (sectionType) args.section_type = sectionType;
  return gdocCall(connectionId, 'gdoc_create_footer', args);
}
export function gdocSetPageSize(connectionId: string, documentId: string, width: number, height: number) {
  return gdocCall(connectionId, 'gdoc_set_page_size', { document_id: documentId, width, height });
}
export function gdocSetMargins(connectionId: string, documentId: string, top: number, bottom: number, left: number, right: number) {
  return gdocCall(connectionId, 'gdoc_set_margins', { document_id: documentId, top, bottom, left, right });
}
export function gdocSetColumnsStyle(connectionId: string, documentId: string, startIndex: number, endIndex: number, columnCount: number) {
  return gdocCall(connectionId, 'gdoc_set_columns_style', { document_id: documentId, start_index: startIndex, end_index: endIndex, column_count: columnCount });
}
export function gdocSetPageOrientation(connectionId: string, documentId: string, orientation: string) {
  return gdocCall(connectionId, 'gdoc_set_page_orientation', { document_id: documentId, orientation });
}

// ============================================
// Supabase Proxy (31 tools)
// ============================================

function sbCall<T>(connectionId: string, tool: string, args: Record<string, unknown> = {}) {
  return toolProxy<T>('supabase', connectionId, tool, args);
}

// Database REST
export function sbListRecords(connectionId: string, table: string, opts?: Record<string, unknown>) {
  return sbCall(connectionId, 'sb_list_records', { table, ...opts });
}
export function sbInsertRecords(connectionId: string, table: string, records: unknown, opts?: Record<string, unknown>) {
  return sbCall(connectionId, 'sb_insert_records', { table, records, ...opts });
}
export function sbUpdateRecords(connectionId: string, table: string, filter: Record<string, unknown>, data: Record<string, unknown>) {
  return sbCall(connectionId, 'sb_update_records', { table, filter, data });
}
export function sbUpsertRecords(connectionId: string, table: string, records: unknown, opts?: Record<string, unknown>) {
  return sbCall(connectionId, 'sb_upsert_records', { table, records, ...opts });
}
export function sbDeleteRecords(connectionId: string, table: string, filter: Record<string, unknown>) {
  return sbCall(connectionId, 'sb_delete_records', { table, filter });
}
export function sbCallFunction(connectionId: string, functionName: string, params?: Record<string, unknown>) {
  const args: Record<string, unknown> = { function_name: functionName };
  if (params) args.params = params;
  return sbCall(connectionId, 'sb_call_function', args);
}

// Storage
export function sbListBuckets(connectionId: string) {
  return sbCall(connectionId, 'sb_list_buckets');
}
export function sbCreateBucket(connectionId: string, name: string, opts?: Record<string, unknown>) {
  return sbCall(connectionId, 'sb_create_bucket', { name, ...opts });
}
export function sbDeleteBucket(connectionId: string, id: string) {
  return sbCall(connectionId, 'sb_delete_bucket', { id });
}
export function sbListObjects(connectionId: string, bucket: string, opts?: Record<string, unknown>) {
  return sbCall(connectionId, 'sb_list_objects', { bucket, ...opts });
}
export function sbDeleteObjects(connectionId: string, bucket: string, paths: string[]) {
  return sbCall(connectionId, 'sb_delete_objects', { bucket, paths });
}
export function sbCreateSignedUrl(connectionId: string, bucket: string, path: string, expiresIn?: number) {
  const args: Record<string, unknown> = { bucket, path };
  if (expiresIn) args.expires_in = expiresIn;
  return sbCall(connectionId, 'sb_create_signed_url', args);
}

// Auth Admin
export function sbListUsers(connectionId: string, opts?: Record<string, unknown>) {
  return sbCall(connectionId, 'sb_list_users', opts || {});
}
export function sbGetUser(connectionId: string, userId: string) {
  return sbCall(connectionId, 'sb_get_user', { user_id: userId });
}
export function sbCreateUser(connectionId: string, email: string, password: string, opts?: Record<string, unknown>) {
  return sbCall(connectionId, 'sb_create_user', { email, password, ...opts });
}
export function sbUpdateUser(connectionId: string, userId: string, data: Record<string, unknown>) {
  return sbCall(connectionId, 'sb_update_user', { user_id: userId, ...data });
}
export function sbDeleteUser(connectionId: string, userId: string) {
  return sbCall(connectionId, 'sb_delete_user', { user_id: userId });
}

// Projects (Management API)
export function sbListProjects(connectionId: string) {
  return sbCall(connectionId, 'sb_list_projects');
}
export function sbGetProject(connectionId: string, projectRef: string) {
  return sbCall(connectionId, 'sb_get_project', { project_ref: projectRef });
}
export function sbCreateProject(connectionId: string, data: Record<string, unknown>) {
  return sbCall(connectionId, 'sb_create_project', data);
}
export function sbPauseProject(connectionId: string, projectRef: string) {
  return sbCall(connectionId, 'sb_pause_project', { project_ref: projectRef });
}
export function sbRestoreProject(connectionId: string, projectRef: string) {
  return sbCall(connectionId, 'sb_restore_project', { project_ref: projectRef });
}

// Database Management
export function sbRunQuery(connectionId: string, projectRef: string, query: string) {
  return sbCall(connectionId, 'sb_run_query', { project_ref: projectRef, query });
}
export function sbListMigrations(connectionId: string, projectRef: string) {
  return sbCall(connectionId, 'sb_list_migrations', { project_ref: projectRef });
}
export function sbGetTypescriptTypes(connectionId: string, projectRef: string) {
  return sbCall(connectionId, 'sb_get_typescript_types', { project_ref: projectRef });
}

// Edge Functions
export function sbListFunctions(connectionId: string, projectRef: string) {
  return sbCall(connectionId, 'sb_list_functions', { project_ref: projectRef });
}
export function sbGetFunction(connectionId: string, projectRef: string, slug: string) {
  return sbCall(connectionId, 'sb_get_function', { project_ref: projectRef, slug });
}

// Secrets & Keys
export function sbListSecrets(connectionId: string, projectRef: string) {
  return sbCall(connectionId, 'sb_list_secrets', { project_ref: projectRef });
}
export function sbCreateSecrets(connectionId: string, projectRef: string, secrets: Array<{ name: string; value: string }>) {
  return sbCall(connectionId, 'sb_create_secrets', { project_ref: projectRef, secrets });
}
export function sbDeleteSecrets(connectionId: string, projectRef: string, names: string[]) {
  return sbCall(connectionId, 'sb_delete_secrets', { project_ref: projectRef, names });
}
export function sbListApiKeys(connectionId: string, projectRef: string) {
  return sbCall(connectionId, 'sb_list_api_keys', { project_ref: projectRef });
}

// ============================================================
// SQLite Proxy (15 tools)
// ============================================================

function sqCall<T = unknown>(connectionId: string, tool: string, args: Record<string, unknown> = {}) {
  return toolProxy<T>('sqlite', connectionId, tool, args);
}

// Query & Execute (3)
export function sqQuery(connectionId: string, sql: string, params?: unknown[]) {
  return sqCall(connectionId, 'sqlite_query', { sql, ...(params ? { params } : {}) });
}
export function sqExecute(connectionId: string, sql: string, params?: unknown[]) {
  return sqCall(connectionId, 'sqlite_execute', { sql, ...(params ? { params } : {}) });
}
export function sqRunScript(connectionId: string, sql: string) {
  return sqCall(connectionId, 'sqlite_run_script', { sql });
}

// Schema Inspection (4)
export function sqListTables(connectionId: string) {
  return sqCall(connectionId, 'sqlite_list_tables');
}
export function sqDescribeTable(connectionId: string, table: string) {
  return sqCall(connectionId, 'sqlite_describe_table', { table });
}
export function sqListIndexes(connectionId: string, table: string) {
  return sqCall(connectionId, 'sqlite_list_indexes', { table });
}
export function sqListForeignKeys(connectionId: string, table: string) {
  return sqCall(connectionId, 'sqlite_list_foreign_keys', { table });
}

// Schema Management (3)
export function sqCreateTable(connectionId: string, table: string, columns: Array<Record<string, unknown>>, ifNotExists?: boolean) {
  return sqCall(connectionId, 'sqlite_create_table', { table, columns, ...(ifNotExists ? { ifNotExists } : {}) });
}
export function sqAlterTable(connectionId: string, table: string, action: string, params: Record<string, unknown> = {}) {
  return sqCall(connectionId, 'sqlite_alter_table', { table, action, ...params });
}
export function sqDropTable(connectionId: string, table: string, ifExists?: boolean) {
  return sqCall(connectionId, 'sqlite_drop_table', { table, ...(ifExists ? { ifExists } : {}) });
}

// Index Management (2)
export function sqCreateIndex(connectionId: string, table: string, columns: string[], opts: { indexName?: string; unique?: boolean; ifNotExists?: boolean } = {}) {
  return sqCall(connectionId, 'sqlite_create_index', { table, columns, ...opts });
}
export function sqDropIndex(connectionId: string, indexName: string, ifExists?: boolean) {
  return sqCall(connectionId, 'sqlite_drop_index', { indexName, ...(ifExists ? { ifExists } : {}) });
}

// Database Management (3)
export function sqGetInfo(connectionId: string) {
  return sqCall(connectionId, 'sqlite_get_info');
}
export function sqVacuum(connectionId: string) {
  return sqCall(connectionId, 'sqlite_vacuum');
}
export function sqIntegrityCheck(connectionId: string) {
  return sqCall(connectionId, 'sqlite_integrity_check');
}

// ============================================================
// Gmail Proxy (28 tools)
// ============================================================

function gmCall<T = unknown>(connectionId: string, tool: string, args: Record<string, unknown> = {}) {
  return toolProxy<T>('gmail', connectionId, tool, args);
}

// Messages (10)
export function gmListMessages(connectionId: string, opts: { q?: string; label_ids?: string[]; max_results?: number; page_token?: string; include_spam_trash?: boolean } = {}) {
  return gmCall(connectionId, 'gmail_list_messages', opts);
}
export function gmGetMessage(connectionId: string, id: string, opts: { format?: string; metadata_headers?: string[] } = {}) {
  return gmCall(connectionId, 'gmail_get_message', { id, ...opts });
}
export function gmSendMessage(connectionId: string, to: string, subject: string, body: string, opts: { cc?: string; bcc?: string; html?: string; in_reply_to?: string; references?: string; thread_id?: string } = {}) {
  return gmCall(connectionId, 'gmail_send_message', { to, subject, body, ...opts });
}
export function gmDeleteMessage(connectionId: string, id: string) {
  return gmCall(connectionId, 'gmail_delete_message', { id });
}
export function gmTrashMessage(connectionId: string, id: string) {
  return gmCall(connectionId, 'gmail_trash_message', { id });
}
export function gmUntrashMessage(connectionId: string, id: string) {
  return gmCall(connectionId, 'gmail_untrash_message', { id });
}
export function gmModifyMessage(connectionId: string, id: string, opts: { add_label_ids?: string[]; remove_label_ids?: string[] } = {}) {
  return gmCall(connectionId, 'gmail_modify_message', { id, ...opts });
}
export function gmBatchDelete(connectionId: string, ids: string[]) {
  return gmCall(connectionId, 'gmail_batch_delete', { ids });
}
export function gmBatchModify(connectionId: string, ids: string[], opts: { add_label_ids?: string[]; remove_label_ids?: string[] } = {}) {
  return gmCall(connectionId, 'gmail_batch_modify', { ids, ...opts });
}
export function gmGetAttachment(connectionId: string, messageId: string, attachmentId: string) {
  return gmCall(connectionId, 'gmail_get_attachment', { message_id: messageId, attachment_id: attachmentId });
}

// Drafts (6)
export function gmListDrafts(connectionId: string, opts: { max_results?: number; page_token?: string; q?: string } = {}) {
  return gmCall(connectionId, 'gmail_list_drafts', opts);
}
export function gmGetDraft(connectionId: string, id: string, format?: string) {
  return gmCall(connectionId, 'gmail_get_draft', { id, ...(format ? { format } : {}) });
}
export function gmCreateDraft(connectionId: string, to: string, subject: string, body: string, opts: { cc?: string; bcc?: string; html?: string; thread_id?: string } = {}) {
  return gmCall(connectionId, 'gmail_create_draft', { to, subject, body, ...opts });
}
export function gmUpdateDraft(connectionId: string, id: string, to: string, subject: string, body: string, opts: { cc?: string; bcc?: string; html?: string; thread_id?: string } = {}) {
  return gmCall(connectionId, 'gmail_update_draft', { id, to, subject, body, ...opts });
}
export function gmDeleteDraft(connectionId: string, id: string) {
  return gmCall(connectionId, 'gmail_delete_draft', { id });
}
export function gmSendDraft(connectionId: string, id: string) {
  return gmCall(connectionId, 'gmail_send_draft', { id });
}

// Labels (5)
export function gmListLabels(connectionId: string) {
  return gmCall(connectionId, 'gmail_list_labels');
}
export function gmGetLabel(connectionId: string, id: string) {
  return gmCall(connectionId, 'gmail_get_label', { id });
}
export function gmCreateLabel(connectionId: string, name: string, opts: { message_list_visibility?: string; label_list_visibility?: string; background_color?: string; text_color?: string } = {}) {
  return gmCall(connectionId, 'gmail_create_label', { name, ...opts });
}
export function gmUpdateLabel(connectionId: string, id: string, opts: { name?: string; message_list_visibility?: string; label_list_visibility?: string; background_color?: string; text_color?: string } = {}) {
  return gmCall(connectionId, 'gmail_update_label', { id, ...opts });
}
export function gmDeleteLabel(connectionId: string, id: string) {
  return gmCall(connectionId, 'gmail_delete_label', { id });
}

// Threads (5)
export function gmListThreads(connectionId: string, opts: { q?: string; label_ids?: string[]; max_results?: number; page_token?: string; include_spam_trash?: boolean } = {}) {
  return gmCall(connectionId, 'gmail_list_threads', opts);
}
export function gmGetThread(connectionId: string, id: string, format?: string) {
  return gmCall(connectionId, 'gmail_get_thread', { id, ...(format ? { format } : {}) });
}
export function gmModifyThread(connectionId: string, id: string, opts: { add_label_ids?: string[]; remove_label_ids?: string[] } = {}) {
  return gmCall(connectionId, 'gmail_modify_thread', { id, ...opts });
}
export function gmTrashThread(connectionId: string, id: string) {
  return gmCall(connectionId, 'gmail_trash_thread', { id });
}
export function gmUntrashThread(connectionId: string, id: string) {
  return gmCall(connectionId, 'gmail_untrash_thread', { id });
}

// Settings (2)
export function gmGetProfile(connectionId: string) {
  return gmCall(connectionId, 'gmail_get_profile');
}
export function gmUpdateVacation(connectionId: string, opts: { enable_auto_reply: boolean; response_subject?: string; response_body_plain_text?: string; response_body_html?: string; restrict_to_contacts?: boolean; restrict_to_domain?: boolean; start_time?: string; end_time?: string }) {
  return gmCall(connectionId, 'gmail_update_vacation', opts);
}

// ============================================================
// Google Calendar Proxy (28 tools)
// ============================================================

function gcalCall<T = unknown>(connectionId: string, tool: string, args: Record<string, unknown> = {}) {
  return toolProxy<T>('google-calendar', connectionId, tool, args);
}

// Events (10)
export function gcalListEvents(connectionId: string, opts: { calendar_id: string; time_min?: string; time_max?: string; q?: string; max_results?: number; page_token?: string; single_events?: boolean; order_by?: string; time_zone?: string; show_deleted?: boolean }) {
  return gcalCall(connectionId, 'gcal_list_events', opts);
}
export function gcalGetEvent(connectionId: string, calendarId: string, eventId: string, opts: { time_zone?: string } = {}) {
  return gcalCall(connectionId, 'gcal_get_event', { calendar_id: calendarId, event_id: eventId, ...opts });
}
export function gcalCreateEvent(connectionId: string, calendarId: string, opts: { summary?: string; description?: string; location?: string; start_date_time?: string; start_date?: string; start_time_zone?: string; end_date_time?: string; end_date?: string; end_time_zone?: string; attendees?: string[]; recurrence?: string[]; color_id?: string; visibility?: string; transparency?: string; send_updates?: string } = {}) {
  return gcalCall(connectionId, 'gcal_create_event', { calendar_id: calendarId, ...opts });
}
export function gcalUpdateEvent(connectionId: string, calendarId: string, eventId: string, opts: { summary?: string; description?: string; location?: string; start_date_time?: string; start_date?: string; start_time_zone?: string; end_date_time?: string; end_date?: string; end_time_zone?: string; attendees?: string[]; recurrence?: string[]; color_id?: string; visibility?: string; transparency?: string; send_updates?: string } = {}) {
  return gcalCall(connectionId, 'gcal_update_event', { calendar_id: calendarId, event_id: eventId, ...opts });
}
export function gcalPatchEvent(connectionId: string, calendarId: string, eventId: string, opts: { summary?: string; description?: string; location?: string; start_date_time?: string; start_date?: string; start_time_zone?: string; end_date_time?: string; end_date?: string; end_time_zone?: string; attendees?: string[]; color_id?: string; visibility?: string; transparency?: string; send_updates?: string } = {}) {
  return gcalCall(connectionId, 'gcal_patch_event', { calendar_id: calendarId, event_id: eventId, ...opts });
}
export function gcalDeleteEvent(connectionId: string, calendarId: string, eventId: string, opts: { send_updates?: string } = {}) {
  return gcalCall(connectionId, 'gcal_delete_event', { calendar_id: calendarId, event_id: eventId, ...opts });
}
export function gcalQuickAdd(connectionId: string, calendarId: string, text: string, opts: { send_updates?: string } = {}) {
  return gcalCall(connectionId, 'gcal_quick_add', { calendar_id: calendarId, text, ...opts });
}
export function gcalMoveEvent(connectionId: string, calendarId: string, eventId: string, destination: string, opts: { send_updates?: string } = {}) {
  return gcalCall(connectionId, 'gcal_move_event', { calendar_id: calendarId, event_id: eventId, destination, ...opts });
}
export function gcalListInstances(connectionId: string, calendarId: string, eventId: string, opts: { time_min?: string; time_max?: string; max_results?: number; page_token?: string; time_zone?: string } = {}) {
  return gcalCall(connectionId, 'gcal_list_instances', { calendar_id: calendarId, event_id: eventId, ...opts });
}
export function gcalImportEvent(connectionId: string, calendarId: string, icalUid: string, opts: { summary?: string; description?: string; location?: string; start_date_time?: string; start_date?: string; start_time_zone?: string; end_date_time?: string; end_date?: string; end_time_zone?: string } = {}) {
  return gcalCall(connectionId, 'gcal_import_event', { calendar_id: calendarId, ical_uid: icalUid, ...opts });
}

// CalendarList (5)
export function gcalListCalendars(connectionId: string, opts: { max_results?: number; page_token?: string; show_deleted?: boolean; show_hidden?: boolean } = {}) {
  return gcalCall(connectionId, 'gcal_list_calendars', opts);
}
export function gcalGetCalendarEntry(connectionId: string, calendarId: string) {
  return gcalCall(connectionId, 'gcal_get_calendar_entry', { calendar_id: calendarId });
}
export function gcalAddCalendar(connectionId: string, id: string, opts: { color_id?: string; summary_override?: string; hidden?: boolean; selected?: boolean } = {}) {
  return gcalCall(connectionId, 'gcal_add_calendar', { id, ...opts });
}
export function gcalUpdateCalendarEntry(connectionId: string, calendarId: string, opts: { color_id?: string; summary_override?: string; hidden?: boolean; selected?: boolean; default_reminders?: { method: string; minutes: number }[] } = {}) {
  return gcalCall(connectionId, 'gcal_update_calendar_entry', { calendar_id: calendarId, ...opts });
}
export function gcalRemoveCalendar(connectionId: string, calendarId: string) {
  return gcalCall(connectionId, 'gcal_remove_calendar', { calendar_id: calendarId });
}

// Calendars (5)
export function gcalGetCalendar(connectionId: string, calendarId: string) {
  return gcalCall(connectionId, 'gcal_get_calendar', { calendar_id: calendarId });
}
export function gcalCreateCalendar(connectionId: string, summary: string, opts: { description?: string; location?: string; time_zone?: string } = {}) {
  return gcalCall(connectionId, 'gcal_create_calendar', { summary, ...opts });
}
export function gcalUpdateCalendar(connectionId: string, calendarId: string, opts: { summary?: string; description?: string; location?: string; time_zone?: string } = {}) {
  return gcalCall(connectionId, 'gcal_update_calendar', { calendar_id: calendarId, ...opts });
}
export function gcalDeleteCalendar(connectionId: string, calendarId: string) {
  return gcalCall(connectionId, 'gcal_delete_calendar', { calendar_id: calendarId });
}
export function gcalClearCalendar(connectionId: string, calendarId: string) {
  return gcalCall(connectionId, 'gcal_clear_calendar', { calendar_id: calendarId });
}

// ACL (5)
export function gcalListAcl(connectionId: string, calendarId: string, opts: { max_results?: number; page_token?: string; show_deleted?: boolean } = {}) {
  return gcalCall(connectionId, 'gcal_list_acl', { calendar_id: calendarId, ...opts });
}
export function gcalGetAcl(connectionId: string, calendarId: string, ruleId: string) {
  return gcalCall(connectionId, 'gcal_get_acl', { calendar_id: calendarId, rule_id: ruleId });
}
export function gcalCreateAcl(connectionId: string, calendarId: string, role: string, scopeType: string, opts: { scope_value?: string; send_notifications?: boolean } = {}) {
  return gcalCall(connectionId, 'gcal_create_acl', { calendar_id: calendarId, role, scope_type: scopeType, ...opts });
}
export function gcalUpdateAcl(connectionId: string, calendarId: string, ruleId: string, role: string, opts: { send_notifications?: boolean } = {}) {
  return gcalCall(connectionId, 'gcal_update_acl', { calendar_id: calendarId, rule_id: ruleId, role, ...opts });
}
export function gcalDeleteAcl(connectionId: string, calendarId: string, ruleId: string) {
  return gcalCall(connectionId, 'gcal_delete_acl', { calendar_id: calendarId, rule_id: ruleId });
}

// Utility (3)
export function gcalQueryFreeBusy(connectionId: string, timeMin: string, timeMax: string, calendarIds: string[], opts: { time_zone?: string } = {}) {
  return gcalCall(connectionId, 'gcal_query_freebusy', { time_min: timeMin, time_max: timeMax, calendar_ids: calendarIds, ...opts });
}
export function gcalGetColors(connectionId: string) {
  return gcalCall(connectionId, 'gcal_get_colors');
}
export function gcalListSettings(connectionId: string, opts: { max_results?: number; page_token?: string } = {}) {
  return gcalCall(connectionId, 'gcal_list_settings', opts);
}
