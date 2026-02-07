/**
 * LINE Messaging API Plugin Content
 * All LINE-specific content used by global pages (Landing, Dashboard, Documentation, FAQ).
 */

import { MessageCircle, Send, Menu } from 'lucide-react';
import type { PluginContent } from '../registry';

export const lineContent: PluginContent = {
  // ============================================
  // Landing Page
  // ============================================

  tagline: 'Manage LINE Bots with AI',
  description:
    'Send messages, manage rich menus, track followers, and control your LINE bot through natural language.',

  features: [
    {
      icon: <Send className="h-6 w-6" />,
      title: 'Messaging',
      description:
        'Push, reply, multicast, and broadcast messages. Supports text, flex, template, image, sticker, and more.',
    },
    {
      icon: <Menu className="h-6 w-6" />,
      title: 'Rich Menus',
      description:
        'Create, manage, and link rich menus to users. Customize the menu bar for your LINE bot.',
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: 'Bot Management',
      description:
        'Get user profiles, group info, message quota, webhook settings, and follower insights.',
    },
  ],

  setupSteps: [
    {
      title: 'Connect LINE Bot',
      description:
        'Add your Channel Access Token from the LINE Developers Console. Your token is encrypted and securely stored.',
    },
  ],

  demoCode: `> Send "Hello from Node2Flow!" to user U1234abcd

Message sent successfully!
Sent message ID: 473846583...

> How many messages have I used this month?

Message quota: 500 / month (Free plan)
Used this month: 127 messages (25.4%)
Remaining: 373 messages

> List my rich menus

Found 2 rich menus:
1. Main Menu (richmenu-abc123) - Default
2. Promo Menu (richmenu-def456) - Not linked`,

  externalDocUrl: 'https://developers.line.biz/en/docs/messaging-api/',

  // ============================================
  // Dashboard
  // ============================================

  quickStartSteps: [
    'Get your Channel Access Token from LINE Developers Console',
    'Add a connection with your token',
    'Copy the generated Service API key',
    'Start managing your LINE bot with AI!',
  ],

  emptyConnectionCTA: 'Add your first LINE Bot connection',

  // ============================================
  // Documentation
  // ============================================

  connectionGuide: (
    <>
      <p className="text-n2f-text-secondary mb-4">
        Go to <strong>Connections</strong> and add your LINE Bot channel:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-n2f-text-secondary mb-4">
        <li>
          <strong className="text-n2f-text">Name:</strong> A friendly name (e.g., "My LINE Bot")
        </li>
        <li>
          <strong className="text-n2f-text">Channel Access Token:</strong> From{' '}
          <a
            href="https://developers.line.biz/console/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-n2f-accent hover:underline"
          >
            LINE Developers Console
          </a>
          {' '}&rarr; Your Channel &rarr; Messaging API &rarr; Channel access token
        </li>
      </ul>
    </>
  ),

  examplePrompts: [
    'Send a message to user U1234',
    'Broadcast "Happy New Year!" to all followers',
    'List all my rich menus',
    'Check my message quota usage',
  ],

  mcpConfigName: 'line',

  configSections: (
    <>
      <section>
        <h2 className="text-xl font-semibold text-n2f-text mb-4">Message Types</h2>
        <p className="text-n2f-text-secondary mb-3">
          LINE supports various message formats. Use <code className="bg-n2f-elevated px-1 rounded">line_push_message</code> or{' '}
          <code className="bg-n2f-elevated px-1 rounded">line_broadcast_message</code> to send any type:
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-n2f-card border border-n2f-border rounded-lg p-3">
            <span className="text-n2f-text font-medium">Basic types</span>
            <p className="text-sm text-n2f-text-secondary mt-1">
              text, image, video, audio, file, location, sticker
            </p>
          </div>
          <div className="bg-n2f-card border border-n2f-border rounded-lg p-3">
            <span className="text-n2f-text font-medium">Advanced types</span>
            <p className="text-sm text-n2f-text-secondary mt-1">
              flex message, template (buttons, carousel, confirm), imagemap
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-n2f-text mb-4">Push vs Reply</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-n2f-card border border-n2f-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Send className="h-4 w-4 text-n2f-accent" />
              <span className="text-n2f-text font-medium">Push Message</span>
            </div>
            <p className="text-sm text-n2f-text-secondary">
              Send anytime to any user. Consumes message quota. Use{' '}
              <code className="bg-n2f-elevated px-1 rounded">line_push_message</code>.
            </p>
          </div>
          <div className="bg-n2f-card border border-n2f-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-4 w-4 text-n2f-accent" />
              <span className="text-n2f-text font-medium">Reply Message</span>
            </div>
            <p className="text-sm text-n2f-text-secondary">
              Respond to webhook events. Free (no quota). Token expires quickly. Use{' '}
              <code className="bg-n2f-elevated px-1 rounded">line_reply_message</code>.
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
      name: 'LINE Bot Connection',
      icon: <MessageCircle className="h-5 w-5" />,
      items: [
        {
          question: 'How do I get a Channel Access Token?',
          answer: (
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Go to{' '}
                <a
                  href="https://developers.line.biz/console/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-n2f-accent hover:underline"
                >
                  LINE Developers Console
                </a>
              </li>
              <li>Select your provider and channel (or create new ones)</li>
              <li>Go to the <strong>Messaging API</strong> tab</li>
              <li>Click <strong>Issue</strong> under Channel access token (long-lived)</li>
              <li>Copy the generated token</li>
            </ol>
          ),
        },
        {
          question: 'Is my Channel Access Token secure?',
          answer: (
            <div className="space-y-2">
              <p>Yes, we take security seriously:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Your token is <strong>encrypted with AES-256-GCM</strong> before storage
                </li>
                <li>We only decrypt when proxying requests to the LINE API</li>
                <li>Tokens can be reissued anytime from LINE Developers Console</li>
                <li>All communications use HTTPS/TLS encryption</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'What LINE features can I access via MCP?',
          answer: (
            <div className="space-y-2">
              <p>The LINE plugin provides 25 tools covering:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Messages</strong> - Push, reply, multicast, broadcast, validate</li>
                <li><strong>User & Bot</strong> - Profiles, follower IDs, bot info, loading animation</li>
                <li><strong>Groups</strong> - Summary, member count, member IDs, member profiles</li>
                <li><strong>Rich Menus</strong> - Create, list, get, delete, set default, link to user</li>
                <li><strong>Quota & Insights</strong> - Message quota, consumption, follower stats</li>
                <li><strong>Webhook</strong> - Set URL, get info, test connectivity</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'What is the difference between push and reply messages?',
          answer: (
            <div className="space-y-2">
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Push</strong> - Send anytime to any user who added your bot.
                  Consumes message quota.
                </li>
                <li>
                  <strong>Reply</strong> - Respond to a webhook event using a reply token.
                  Free (does not consume quota) but token expires quickly.
                </li>
              </ul>
            </div>
          ),
        },
      ],
    },
  ],
};
