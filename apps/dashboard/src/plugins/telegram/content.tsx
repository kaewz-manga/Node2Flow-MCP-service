/**
 * Telegram Bot API Plugin Content
 * All Telegram-specific content used by global pages (Landing, Dashboard, Documentation, FAQ).
 */

import { Send, Users, Globe } from 'lucide-react';
import type { PluginContent } from '../registry';

export const telegramContent: PluginContent = {
  // ============================================
  // Landing Page
  // ============================================

  tagline: 'Manage Telegram Bots with AI',
  description:
    'Send messages, manage chats, set webhooks, and control your Telegram bot through natural language.',

  features: [
    {
      icon: <Send className="h-6 w-6" />,
      title: 'Messaging',
      description:
        'Send text, photos, videos, documents, audio, locations, polls, and contacts to any chat.',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Chat Management',
      description:
        'Get chat info, manage members, ban/unban users, pin messages, and create invite links.',
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: 'Webhooks',
      description:
        'Set up and manage webhook endpoints for receiving real-time bot updates.',
    },
  ],

  setupSteps: [
    {
      title: 'Connect Telegram Bot',
      description:
        'Add your Bot Token from @BotFather. Your token is encrypted and securely stored.',
    },
  ],

  demoCode: `> Send "Hello from Node2Flow!" to chat -1001234567890

Message sent successfully!
Message ID: 1234

> Get info about this chat

Chat: My Test Group
Type: supergroup
Members: 42
Description: A test group for bot development

> Set webhook to https://example.com/webhook

Webhook set successfully!
URL: https://example.com/webhook
Pending updates: 0`,

  externalDocUrl: 'https://core.telegram.org/bots/api',

  // ============================================
  // Dashboard
  // ============================================

  quickStartSteps: [
    'Create a bot with @BotFather on Telegram',
    'Copy the Bot Token provided by BotFather',
    'Add a connection with your token',
    'Copy the generated Service API key',
    'Start managing your Telegram bot with AI!',
  ],

  emptyConnectionCTA: 'Add your first Telegram Bot connection',

  // ============================================
  // Documentation
  // ============================================

  connectionGuide: (
    <>
      <p className="text-muted-foreground mb-4">
        Go to <strong>Connections</strong> and add your Telegram Bot:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
        <li>
          <strong className="text-foreground">Name:</strong> A friendly name (e.g., "My Telegram Bot")
        </li>
        <li>
          <strong className="text-foreground">Bot Token:</strong> From{' '}
          <a
            href="https://t.me/botfather"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            @BotFather
          </a>
          {' '}&mdash; send <code className="bg-muted px-1 rounded">/newbot</code> and follow the prompts
        </li>
      </ul>
    </>
  ),

  examplePrompts: [
    'Send "Hello!" to chat 123456789',
    'Get info about my chat group',
    'Set webhook to https://myserver.com/webhook',
    'Pin message 42 in chat -100123',
  ],

  mcpConfigName: 'telegram',

  configSections: (
    <>
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">Message Formatting</h2>
        <p className="text-muted-foreground mb-3">
          Use <code className="bg-muted px-1 rounded">parse_mode</code> to format messages:
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-lg p-3">
            <span className="text-foreground font-medium">HTML</span>
            <p className="text-sm text-muted-foreground mt-1">
              {'<b>bold</b>, <i>italic</i>, <code>code</code>, <a href="...">link</a>'}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3">
            <span className="text-foreground font-medium">MarkdownV2</span>
            <p className="text-sm text-muted-foreground mt-1">
              *bold*, _italic_, `code`, [link](url), ||spoiler||
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">Chat ID Types</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Send className="h-4 w-4 text-primary" />
              <span className="text-foreground font-medium">Private / Group</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Numeric ID (e.g., <code className="bg-muted px-1 rounded">123456789</code> for private,{' '}
              <code className="bg-muted px-1 rounded">-100123456789</code> for supergroup)
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-foreground font-medium">Channel</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Username format: <code className="bg-muted px-1 rounded">@channelname</code> or numeric ID
            </p>
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
      name: 'Telegram Bot Connection',
      icon: <Send className="h-5 w-5" />,
      items: [
        {
          question: 'How do I get a Bot Token?',
          answer: (
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Open Telegram and search for{' '}
                <a
                  href="https://t.me/botfather"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  @BotFather
                </a>
              </li>
              <li>Send <code className="bg-muted px-1 rounded">/newbot</code> command</li>
              <li>Follow the prompts to choose a name and username</li>
              <li>Copy the Bot Token provided (format: <code className="bg-muted px-1 rounded">123456:ABC-DEF...</code>)</li>
            </ol>
          ),
        },
        {
          question: 'Is my Bot Token secure?',
          answer: (
            <div className="space-y-2">
              <p>Yes, we take security seriously:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Your token is <strong>encrypted with AES-256-GCM</strong> before storage
                </li>
                <li>We only decrypt when proxying requests to the Telegram API</li>
                <li>Tokens can be revoked anytime via @BotFather</li>
                <li>All communications use HTTPS/TLS encryption</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'What Telegram features can I access via MCP?',
          answer: (
            <div className="space-y-2">
              <p>The Telegram plugin provides 25 tools covering:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Bot Info</strong> - Get bot details, set command menu</li>
                <li><strong>Messages</strong> - Send text, photo, video, document, audio, location, poll, contact</li>
                <li><strong>Edit/Delete</strong> - Edit message text/caption, delete messages</li>
                <li><strong>Chat Management</strong> - Chat info, member count, ban/unban</li>
                <li><strong>Webhooks</strong> - Set, delete, get webhook info</li>
                <li><strong>Files & Callbacks</strong> - Get file download URLs, answer callback queries</li>
                <li><strong>Pins & Invites</strong> - Pin/unpin messages, create invite links</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'How do I find my chat_id?',
          answer: (
            <div className="space-y-2">
              <p>Several ways to find your chat ID:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Send a message to your bot, then use <code className="bg-muted px-1 rounded">tg_get_webhook_info</code> to check pending updates</li>
                <li>For channels, use <code className="bg-muted px-1 rounded">@channelname</code> as the chat_id</li>
                <li>Forward a message from the chat to <code className="bg-muted px-1 rounded">@userinfobot</code> on Telegram</li>
                <li>Private chat IDs are positive numbers, group IDs are negative</li>
              </ul>
            </div>
          ),
        },
      ],
    },
  ],
};
