import type { MCPToolDefinition } from '../../types';

/**
 * Tool definitions from @browserbasehq/mcp-server-browserbase
 * Prefixed with bb_ to namespace within the gateway
 */
export const TOOLS: MCPToolDefinition[] = [
  {
    name: 'bb_session_create',
    description: 'Create a new Browserbase cloud browser session or connect to an existing one. Must be called before any other browser actions.',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          description: 'Optional existing session ID to reconnect to',
        },
      },
    },
    annotations: {
      title: 'Create Browser Session',
      readOnlyHint: false,
      idempotentHint: false,
    },
  },
  {
    name: 'bb_session_close',
    description: 'Close the current Browserbase browser session and release resources.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    annotations: {
      title: 'Close Browser Session',
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
    },
  },
  {
    name: 'bb_navigate',
    description: 'Navigate the cloud browser to a specific URL.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The URL to navigate to',
        },
      },
      required: ['url'],
    },
    annotations: {
      title: 'Navigate to URL',
      readOnlyHint: false,
      idempotentHint: true,
    },
  },
  {
    name: 'bb_act',
    description: 'Perform a browser action described in natural language (click, type, scroll, etc.) using Stagehand AI.',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          description: 'Natural language description of the action to perform (e.g., "Click the login button")',
        },
        variables: {
          type: 'object',
          description: 'Optional variables to use in the action template',
        },
      },
      required: ['action'],
    },
    annotations: {
      title: 'Perform Action',
      readOnlyHint: false,
      idempotentHint: false,
    },
  },
  {
    name: 'bb_extract',
    description: 'Extract structured data from the current page using Stagehand AI. Returns data based on the instruction provided.',
    inputSchema: {
      type: 'object',
      properties: {
        instruction: {
          type: 'string',
          description: 'Natural language instruction describing what data to extract from the page',
        },
      },
      required: ['instruction'],
    },
    annotations: {
      title: 'Extract Data',
      readOnlyHint: true,
      idempotentHint: true,
    },
  },
  {
    name: 'bb_observe',
    description: 'Observe and identify interactive elements on the current page using Stagehand AI. Returns a list of actionable elements.',
    inputSchema: {
      type: 'object',
      properties: {
        instruction: {
          type: 'string',
          description: 'Natural language instruction describing what to observe on the page',
        },
      },
      required: ['instruction'],
    },
    annotations: {
      title: 'Observe Page',
      readOnlyHint: true,
      idempotentHint: true,
    },
  },
  {
    name: 'bb_screenshot',
    description: 'Take a screenshot of the current page in the cloud browser.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Optional name/label for the screenshot',
        },
      },
    },
    annotations: {
      title: 'Take Screenshot',
      readOnlyHint: true,
      idempotentHint: true,
    },
  },
  {
    name: 'bb_get_url',
    description: 'Get the current URL of the cloud browser page.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    annotations: {
      title: 'Get Current URL',
      readOnlyHint: true,
      idempotentHint: true,
    },
  },
  {
    name: 'bb_agent',
    description: 'Run an autonomous AI agent that performs complex multi-step tasks in the cloud browser. Requires GEMINI_API_KEY.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Natural language prompt describing the task for the AI agent to complete',
        },
      },
      required: ['prompt'],
    },
    annotations: {
      title: 'Run AI Agent',
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
];
