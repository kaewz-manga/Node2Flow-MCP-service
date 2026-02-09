import type { MCPToolDefinition } from '../../types';

/**
 * Tool definitions from @playwright/mcp
 * Prefixed with pw_ to namespace within the gateway
 */
export const TOOLS: MCPToolDefinition[] = [
  {
    name: 'pw_browser_navigate',
    description: 'Navigate to a URL in the browser.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'The URL to navigate to' },
      },
      required: ['url'],
    },
  },
  {
    name: 'pw_browser_navigate_back',
    description: 'Go back to the previous page in the browser history.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'pw_browser_click',
    description: 'Click an element on the page using a CSS selector or text.',
    inputSchema: {
      type: 'object',
      properties: {
        element: { type: 'string', description: 'Human-readable element description' },
        ref: { type: 'string', description: 'Exact target element reference from the page snapshot' },
      },
      required: ['element', 'ref'],
    },
  },
  {
    name: 'pw_browser_hover',
    description: 'Hover over an element on the page.',
    inputSchema: {
      type: 'object',
      properties: {
        element: { type: 'string', description: 'Human-readable element description' },
        ref: { type: 'string', description: 'Exact target element reference from the page snapshot' },
      },
      required: ['element', 'ref'],
    },
  },
  {
    name: 'pw_browser_drag',
    description: 'Drag an element to another element on the page.',
    inputSchema: {
      type: 'object',
      properties: {
        startElement: { type: 'string', description: 'Human-readable source element description' },
        startRef: { type: 'string', description: 'Source element reference from the page snapshot' },
        endElement: { type: 'string', description: 'Human-readable target element description' },
        endRef: { type: 'string', description: 'Target element reference from the page snapshot' },
      },
      required: ['startElement', 'startRef', 'endElement', 'endRef'],
    },
  },
  {
    name: 'pw_browser_type',
    description: 'Type text into an input field on the page.',
    inputSchema: {
      type: 'object',
      properties: {
        element: { type: 'string', description: 'Human-readable element description' },
        ref: { type: 'string', description: 'Exact target element reference from the page snapshot' },
        text: { type: 'string', description: 'Text to type into the element' },
        submit: { type: 'boolean', description: 'Whether to press Enter after typing' },
      },
      required: ['element', 'ref', 'text'],
    },
  },
  {
    name: 'pw_browser_select_option',
    description: 'Select an option from a dropdown element.',
    inputSchema: {
      type: 'object',
      properties: {
        element: { type: 'string', description: 'Human-readable element description' },
        ref: { type: 'string', description: 'Exact target element reference from the page snapshot' },
        values: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of values to select',
        },
      },
      required: ['element', 'ref', 'values'],
    },
  },
  {
    name: 'pw_browser_fill_form',
    description: 'Fill out a form field with a value.',
    inputSchema: {
      type: 'object',
      properties: {
        description: { type: 'string', description: 'Human-readable description of the form field' },
        ref: { type: 'string', description: 'Exact target element reference from the page snapshot' },
        value: { type: 'string', description: 'Value to fill into the form field' },
      },
      required: ['description', 'ref', 'value'],
    },
  },
  {
    name: 'pw_browser_press_key',
    description: 'Press a keyboard key or key combination.',
    inputSchema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'Key to press (e.g., "Enter", "Escape", "Control+c")' },
      },
      required: ['key'],
    },
  },
  {
    name: 'pw_browser_snapshot',
    description: 'Capture accessibility snapshot of the current page for understanding page structure.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'pw_browser_take_screenshot',
    description: 'Take a screenshot of the current page or a specific element.',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['png', 'jpeg'],
          description: 'Image format (default: png)',
        },
        element: { type: 'string', description: 'Element description for element screenshot' },
        ref: { type: 'string', description: 'Element reference for element screenshot' },
        fullPage: { type: 'boolean', description: 'Take full page screenshot' },
      },
      required: ['type'],
    },
  },
  {
    name: 'pw_browser_file_upload',
    description: 'Upload files to a file input element.',
    inputSchema: {
      type: 'object',
      properties: {
        paths: {
          type: 'array',
          items: { type: 'string' },
          description: 'File paths to upload',
        },
      },
      required: ['paths'],
    },
  },
  {
    name: 'pw_browser_handle_dialog',
    description: 'Handle a JavaScript dialog (alert, confirm, prompt).',
    inputSchema: {
      type: 'object',
      properties: {
        accept: { type: 'boolean', description: 'Whether to accept or dismiss the dialog' },
        promptText: { type: 'string', description: 'Text to enter in a prompt dialog' },
      },
      required: ['accept'],
    },
  },
  {
    name: 'pw_browser_evaluate',
    description: 'Execute JavaScript in the browser console and return the result.',
    inputSchema: {
      type: 'object',
      properties: {
        expression: { type: 'string', description: 'JavaScript expression to evaluate' },
      },
      required: ['expression'],
    },
  },
  {
    name: 'pw_browser_run_code',
    description: 'Run a Playwright code snippet against the current page.',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'JavaScript function containing Playwright code to execute' },
      },
      required: ['code'],
    },
  },
  {
    name: 'pw_browser_tabs',
    description: 'List all open browser tabs with their titles and URLs.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'pw_browser_close',
    description: 'Close the current browser tab or the entire browser.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'pw_browser_resize',
    description: 'Resize the browser window.',
    inputSchema: {
      type: 'object',
      properties: {
        width: { type: 'number', description: 'Width of the browser window' },
        height: { type: 'number', description: 'Height of the browser window' },
      },
      required: ['width', 'height'],
    },
  },
  {
    name: 'pw_browser_console_messages',
    description: 'Get console messages from the browser.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'pw_browser_network_requests',
    description: 'Get network requests made by the page.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'pw_browser_wait_for',
    description: 'Wait for text to appear or disappear on the page.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text to wait for' },
        state: {
          type: 'string',
          enum: ['attached', 'detached', 'visible', 'hidden'],
          description: 'State to wait for',
        },
        timeout: { type: 'number', description: 'Maximum wait time in milliseconds' },
      },
      required: ['text'],
    },
  },
  {
    name: 'pw_browser_install',
    description: 'Install the browser specified in the config (call if browser not found).',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];
