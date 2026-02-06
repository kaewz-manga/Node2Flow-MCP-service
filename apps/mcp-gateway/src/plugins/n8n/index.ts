// n8n Plugin
// จะย้ายมาจาก n8n-management-mcp ใน Phase 3
//
// Files to migrate:
// - src/tools.ts → ./tools.ts (31 MCP tool definitions)
// - src/n8n-client.ts → ./client.ts (HTTP client for n8n API)
// - src/index.ts handleToolCall → ./handler.ts (tool dispatch)

import type { MCPPlugin } from '../../types';

export const n8nPlugin: MCPPlugin = {
  id: 'n8n',
  name: 'n8n Workflow Manager',
  version: '1.0.0',
  tools: [], // TODO: Phase 3 - Import from ./tools.ts

  createClient(config: Record<string, unknown>) {
    // TODO: Phase 3 - Create N8nClient from decrypted config
    // config = { api_url: string, api_key: string }
    return null;
  },

  async handleToolCall(toolName, args, client) {
    // TODO: Phase 3 - Dispatch tool calls to N8nClient methods
    return {
      content: [{ type: 'text' as const, text: 'Not implemented yet' }],
      isError: true,
    };
  },
};
