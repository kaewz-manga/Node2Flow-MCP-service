import { MessageCircle, Send, Menu, BarChart3 } from 'lucide-react';
import type { PluginContent } from '../registry';

export const lineOfficialContent: PluginContent = {
  tagline: 'Official LINE Bot MCP Server',
  description: 'The official @line/line-bot-mcp-server — 11 tools for sending messages, managing rich menus, and monitoring your LINE Official Account.',

  features: [
    {
      icon: <Send className="h-6 w-6" />,
      title: 'Messaging',
      description: 'Push text and flex messages to individual users. Broadcast messages to all followers.',
    },
    {
      icon: <Menu className="h-6 w-6" />,
      title: 'Rich Menu Management',
      description: 'Create rich menus with custom actions, set defaults, list and delete menus.',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Account Info',
      description: 'Get user profiles, check message quota and consumption for your LINE Official Account.',
    },
  ],

  setupSteps: [
    {
      title: 'Deploy LINE Bot MCP Server',
      description: 'Deploy @line/line-bot-mcp-server on your server with CHANNEL_ACCESS_TOKEN configured.',
    },
  ],

  demoCode: `> Send a text message to user U1234

Message sent successfully!
- Type: text
- Recipient: U1234567890abcdef
- Content: "Hello from AI!"`,

  externalDocUrl: 'https://github.com/line/line-bot-mcp-server',

  quickStartSteps: [
    'Deploy @line/line-bot-mcp-server on your server',
    'Add the server URL as a connection',
    'Copy the generated Service API key',
    'Start messaging via AI!',
  ],

  emptyConnectionCTA: 'Add your LINE Bot MCP server connection',

  connectionGuide: (
    <>
      <p className="text-muted-foreground mb-4">
        Deploy the official LINE Bot MCP server, then add it as a connection:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
        <li><strong className="text-foreground">Name:</strong> A friendly name</li>
        <li><strong className="text-foreground">MCP Server URL:</strong> Your deployed server URL</li>
        <li><strong className="text-foreground">Auth Token:</strong> Optional auth token</li>
      </ul>
    </>
  ),

  examplePrompts: [
    'Send a text message to my test user',
    'Broadcast a flex message to all followers',
    'Check my monthly message quota',
    'Create a rich menu with 3 buttons',
  ],

  mcpConfigName: 'line-official',

  faqCategories: [
    {
      name: 'LINE (Official)',
      icon: <MessageCircle className="h-5 w-5" />,
      items: [
        {
          question: 'What is the official LINE Bot MCP server?',
          answer: (
            <div className="space-y-2">
              <p>The official MCP server by LINE (@line/line-bot-mcp-server) provides 11 tools:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>4 messaging tools</strong> — Push/broadcast text and flex messages</li>
                <li><strong>1 profile tool</strong> — Get user profile information</li>
                <li><strong>1 quota tool</strong> — Check message quota and consumption</li>
                <li><strong>5 rich menu tools</strong> — Create, list, delete, set/cancel default menus</li>
              </ul>
            </div>
          ),
        },
      ],
    },
  ],
};
