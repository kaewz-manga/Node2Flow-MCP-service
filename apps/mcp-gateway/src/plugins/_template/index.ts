// Plugin Template
// Copy this folder to create a new product plugin
//
// Steps:
// 1. Copy _template/ to plugins/your-product/
// 2. Define tools in tools.ts
// 3. Create HTTP client in client.ts
// 4. Implement handler in this file
// 5. Register in plugin-registry.ts

import type { MCPPlugin } from '../../types';
// import { TOOLS } from './tools';
// import { YourClient } from './client';

export const templatePlugin: MCPPlugin = {
  id: 'your-product',
  name: 'Your Product Name',
  version: '1.0.0',
  tools: [], // Import from ./tools.ts

  createClient(config: Record<string, unknown>) {
    // Create client from decrypted connection config
    // const { api_url, api_key } = config;
    // return new YourClient({ apiUrl: api_url, apiKey: api_key });
    return null;
  },

  async handleToolCall(toolName, args, client) {
    // Dispatch tool calls to client methods
    // switch (toolName) {
    //   case 'your_product_list_items':
    //     return { content: [{ type: 'text', text: JSON.stringify(await client.listItems()) }] };
    //   default:
    //     return { content: [{ type: 'text', text: `Unknown tool: ${toolName}` }], isError: true };
    // }
    return {
      content: [{ type: 'text' as const, text: 'Not implemented' }],
      isError: true,
    };
  },
};
