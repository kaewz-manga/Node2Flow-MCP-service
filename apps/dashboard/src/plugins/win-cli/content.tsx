/**
 * Windows CLI Plugin Content
 * All win-cli-specific content used by global pages (Landing, Dashboard, Documentation, FAQ).
 */

import { Terminal, Shield, Server } from 'lucide-react';
import type { PluginContent } from '../registry';

export const winCliContent: PluginContent = {
  // ============================================
  // Landing Page
  // ============================================

  tagline: 'Windows CLI & SSH via MCP',
  description:
    'Execute shell commands (PowerShell, CMD, Git Bash) and manage SSH connections on remote hosts — all through your AI assistant.',

  features: [
    {
      icon: <Terminal className="h-6 w-6" />,
      title: 'Shell Execution',
      description:
        'Run commands in PowerShell, CMD, or Git Bash with working directory support and command history.',
    },
    {
      icon: <Server className="h-6 w-6" />,
      title: 'SSH Management',
      description:
        'Create, update, and manage SSH connections. Execute commands on remote hosts via SSH.',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Secure by Design',
      description:
        'Configurable security policies, command blocklists, and path restrictions for safe command execution.',
    },
  ],

  setupSteps: [
    {
      title: 'Connect win-cli-mcp',
      description:
        'Add your win-cli-mcp-server URL and optional authentication token.',
    },
  ],

  demoCode: `> Execute a PowerShell command

cli_execute_command({
  shell: "powershell",
  command: "Get-Process | Sort-Object CPU -Desc | Select -First 5"
})

PID   Name          CPU
---   ----          ---
1234  chrome        45.2
5678  code          32.1
9012  explorer      12.4
...

> List SSH connections

cli_read_ssh_connections()

Connections:
  - production-server (192.168.1.100:22)
  - staging-server (10.0.0.50:22)`,

  externalDocUrl: 'https://github.com/SimonB97/win-cli-mcp-server',

  // ============================================
  // Dashboard
  // ============================================

  quickStartSteps: [
    'Run your win-cli-mcp-server locally or on a remote host',
    'Add the server URL and optional auth token',
    'Copy the generated Service API key',
    'Start executing commands with AI!',
  ],

  emptyConnectionCTA: 'Add your first Windows CLI connection',

  // ============================================
  // Documentation
  // ============================================

  connectionGuide: (
    <>
      <p className="text-muted-foreground mb-4">
        Go to <strong>Connections</strong> and add your win-cli-mcp server:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
        <li>
          <strong className="text-foreground">Name:</strong> A friendly name (e.g., "My Dev Machine")
        </li>
        <li>
          <strong className="text-foreground">MCP URL:</strong> Your win-cli-mcp-server URL (e.g.,
          http://localhost:3000)
        </li>
        <li>
          <strong className="text-foreground">Auth Token (optional):</strong> Authentication token if configured on the server
        </li>
      </ul>
    </>
  ),

  examplePrompts: [
    'List all running processes on the machine',
    'Check disk space using PowerShell',
    'SSH into production-server and check uptime',
    'Show my command history',
  ],

  mcpConfigName: 'win-cli',

  configSections: (
    <>
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">Local vs SSH Commands</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Terminal className="h-4 w-4 text-blue-400" />
              <span className="text-foreground font-medium">Local (3 tools)</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Execute commands in PowerShell, CMD, Git Bash</li>
              <li>Get command history</li>
              <li>Get current working directory</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-2">No extra config required</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Server className="h-4 w-4 text-purple-400" />
              <span className="text-foreground font-medium">SSH (6 tools)</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Create / read / update / delete SSH connections</li>
              <li>Execute remote commands via SSH</li>
              <li>Disconnect SSH sessions</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-2">Requires SSH connection config</p>
          </div>
        </div>
      </section>
    </>
  ),

  // ============================================
  // FAQ
  // ============================================

  faqCategories: [
    {
      name: 'Windows CLI',
      icon: <Terminal className="h-5 w-5" />,
      items: [
        {
          question: 'What is win-cli-mcp-server?',
          answer: (
            <div className="space-y-2">
              <p>
                win-cli-mcp-server is an MCP server for secure command-line interactions on Windows systems. It provides 9 tools:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>3 local tools</strong> — Execute commands (PowerShell/CMD/Git Bash), command history, current directory</li>
                <li><strong>6 SSH tools</strong> — Create/read/update/delete SSH connections, execute remote commands, disconnect</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'Which shells are supported?',
          answer: (
            <div className="space-y-2">
              <p>Three shell environments are supported:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>PowerShell</strong> — Full PowerShell scripting support</li>
                <li><strong>CMD</strong> — Windows Command Prompt</li>
                <li><strong>Git Bash</strong> — Unix-like shell on Windows</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'How does SSH work?',
          answer: (
            <div className="space-y-2">
              <p>Create an SSH connection with host, port, username, and authentication (password or private key). Then use <code className="bg-muted px-1 rounded">cli_ssh_execute</code> to run commands on the remote host.</p>
              <p>Connections persist until you disconnect or delete them.</p>
            </div>
          ),
        },
        {
          question: 'Is it secure?',
          answer: (
            <div className="space-y-2">
              <p>The server supports configurable security:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Command blocklists (block dangerous commands)</li>
                <li>Working directory restrictions</li>
                <li>Max command length limits</li>
                <li>All credentials encrypted at rest via Node2Flow</li>
              </ul>
            </div>
          ),
        },
      ],
    },
  ],
};
