/**
 * Windows CLI MCP - Tool Definitions (9 tools)
 * Proxied to win-cli-mcp-server via JSON-RPC
 * All tool names prefixed with cli_ to avoid conflicts
 */

import type { MCPToolDefinition } from '../../types';

export const TOOLS: MCPToolDefinition[] = [
  // ========== Local Command Execution (3) ==========
  {
    name: 'cli_execute_command',
    description:
      'Execute a command in the specified shell (powershell, cmd, or gitbash). Returns command output as text.',
    inputSchema: {
      type: 'object',
      properties: {
        shell: {
          type: 'string',
          enum: ['powershell', 'cmd', 'gitbash'],
          description: 'Shell to use for command execution',
        },
        command: {
          type: 'string',
          description: 'Command to execute',
        },
        workingDir: {
          type: 'string',
          description: 'Working directory for command execution (optional)',
        },
      },
      required: ['shell', 'command'],
    },
  },
  {
    name: 'cli_get_command_history',
    description:
      'Get the history of executed commands with timestamps and results.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of history entries to return (default: 10)',
        },
      },
    },
  },
  {
    name: 'cli_get_current_directory',
    description:
      'Get the current working directory of the server.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // ========== SSH Connection Management (4) ==========
  {
    name: 'cli_create_ssh_connection',
    description:
      'Create a new SSH connection configuration. Provide host, port, username, and password or private key path.',
    inputSchema: {
      type: 'object',
      properties: {
        connectionId: {
          type: 'string',
          description: 'Unique identifier for this SSH connection',
        },
        connectionConfig: {
          type: 'object',
          description: 'SSH connection configuration: host, port, username, password, privateKeyPath',
          properties: {
            host: { type: 'string', description: 'Remote host address' },
            port: { type: 'number', description: 'SSH port (default: 22)' },
            username: { type: 'string', description: 'SSH username' },
            password: { type: 'string', description: 'SSH password (if not using key)' },
            privateKeyPath: { type: 'string', description: 'Path to private key file (if not using password)' },
          },
        },
      },
      required: ['connectionId', 'connectionConfig'],
    },
  },
  {
    name: 'cli_read_ssh_connections',
    description:
      'List all configured SSH connections.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'cli_update_ssh_connection',
    description:
      'Update an existing SSH connection configuration.',
    inputSchema: {
      type: 'object',
      properties: {
        connectionId: {
          type: 'string',
          description: 'ID of the SSH connection to update',
        },
        connectionConfig: {
          type: 'object',
          description: 'Updated SSH connection configuration',
        },
      },
      required: ['connectionId', 'connectionConfig'],
    },
  },
  {
    name: 'cli_delete_ssh_connection',
    description:
      'Delete an existing SSH connection configuration.',
    inputSchema: {
      type: 'object',
      properties: {
        connectionId: {
          type: 'string',
          description: 'ID of the SSH connection to delete',
        },
      },
      required: ['connectionId'],
    },
  },

  // ========== SSH Command Execution (2) ==========
  {
    name: 'cli_ssh_execute',
    description:
      'Execute a command on a remote host via SSH using a configured connection.',
    inputSchema: {
      type: 'object',
      properties: {
        connectionId: {
          type: 'string',
          description: 'ID of the SSH connection to use',
        },
        command: {
          type: 'string',
          description: 'Command to execute on the remote host',
        },
      },
      required: ['connectionId', 'command'],
    },
  },
  {
    name: 'cli_ssh_disconnect',
    description:
      'Disconnect from an SSH server.',
    inputSchema: {
      type: 'object',
      properties: {
        connectionId: {
          type: 'string',
          description: 'ID of the SSH connection to disconnect',
        },
      },
      required: ['connectionId'],
    },
  },
];
