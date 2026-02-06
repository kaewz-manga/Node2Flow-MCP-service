/**
 * Agent Routes: HMAC-authenticated endpoints for Vercel agent
 */

import type { Env } from '../types';
import { apiResponse } from '../helpers';
import {
  getAiConnectionById,
  getBotConnectionByUserAndPlatform,
  decrypt,
} from '@node2flow/platform-core';

export async function handleAgentRoutes(
  request: Request,
  env: Env,
  path: string
): Promise<Response | null> {
  const method = request.method;

  if (!env.AGENT_SECRET) {
    return apiResponse({ success: false, error: { code: 'NOT_CONFIGURED', message: 'Agent not configured' } }, 503);
  }

  // POST /api/agent/config
  if (path === '/api/agent/config' && method === 'POST') {
    const body = await request.json() as any;
    const { user_id, ai_connection_id, signature } = body;
    if (!user_id || !ai_connection_id || !signature) {
      return apiResponse({ success: false, error: { code: 'MISSING_FIELDS', message: 'user_id, ai_connection_id, and signature required' } }, 400);
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(env.AGENT_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const data = encoder.encode(`${user_id}:${ai_connection_id}`);
    const sig = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, sig, data);
    if (!valid) {
      return apiResponse({ success: false, error: { code: 'INVALID_SIGNATURE', message: 'Invalid signature' } }, 403);
    }

    const conn = await getAiConnectionById(env.DB, ai_connection_id);
    if (!conn || conn.user_id !== user_id || conn.status !== 'active') {
      return apiResponse({ success: false, error: { code: 'NOT_FOUND', message: 'AI connection not found' } }, 404);
    }

    const apiKey = await decrypt(conn.api_key_encrypted, env.ENCRYPTION_KEY);
    return apiResponse({ success: true, data: { provider_url: conn.provider_url, api_key: apiKey, model_name: conn.model_name } });
  }

  // POST /api/agent/bot-config
  if (path === '/api/agent/bot-config' && method === 'POST') {
    const body = await request.json() as any;
    const { user_id, platform, signature } = body;
    if (!user_id || !platform || !signature) {
      return apiResponse({ success: false, error: { code: 'MISSING_FIELDS', message: 'user_id, platform, and signature required' } }, 400);
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(env.AGENT_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const data = encoder.encode(`bot:${user_id}:${platform}`);
    const sig = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, sig, data);
    if (!valid) {
      return apiResponse({ success: false, error: { code: 'INVALID_SIGNATURE', message: 'Invalid signature' } }, 403);
    }

    const botConn = await getBotConnectionByUserAndPlatform(env.DB, user_id, platform);
    if (!botConn || botConn.status !== 'active') {
      return apiResponse({ success: false, error: { code: 'NOT_FOUND', message: 'Bot connection not found' } }, 404);
    }

    const botToken = await decrypt(botConn.bot_token_encrypted, env.ENCRYPTION_KEY);
    const channelSecret = botConn.channel_secret_encrypted ? await decrypt(botConn.channel_secret_encrypted, env.ENCRYPTION_KEY) : null;
    const mcpApiKey = await decrypt(botConn.mcp_api_key_encrypted, env.ENCRYPTION_KEY);
    const aiConn = await getAiConnectionById(env.DB, botConn.ai_connection_id);
    if (!aiConn || aiConn.status !== 'active') {
      return apiResponse({ success: false, error: { code: 'AI_NOT_FOUND', message: 'Linked AI connection not found' } }, 404);
    }

    const aiApiKey = await decrypt(aiConn.api_key_encrypted, env.ENCRYPTION_KEY);
    return apiResponse({
      success: true,
      data: {
        bot_token: botToken,
        channel_secret: channelSecret,
        ai_config: { provider_url: aiConn.provider_url, api_key: aiApiKey, model_name: aiConn.model_name },
        mcp_api_key: mcpApiKey,
      },
    });
  }

  return null;
}
