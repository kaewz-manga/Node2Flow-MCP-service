/**
 * LINE Extended Plugin Content
 * Full LINE Messaging API with 25 tools
 */

import { MessageCircle, Send, Menu } from 'lucide-react';
import type { PluginContent } from '../registry';

export const lineExtendedContent: PluginContent = {
  tagline: 'Full LINE Messaging API via MCP',
  description:
    'Extended LINE plugin with 25 tools covering messages, user profiles, group chat, rich menus, quota insights, and webhooks.',

  features: [
    {
      icon: <Send className="h-6 w-6" />,
      title: 'Full Messaging',
      description:
        'Push, reply, multicast, broadcast, and validate messages. Supports all LINE message types.',
    },
    {
      icon: <Menu className="h-6 w-6" />,
      title: 'Rich Menus & Groups',
      description:
        'Create and manage rich menus. Get group summaries, member counts, and member profiles.',
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: 'Webhooks & Insights',
      description:
        'Configure webhook URLs, test webhooks, and track message quota consumption and follower counts.',
    },
  ],

  setupSteps: [
    {
      title: 'Connect LINE Bot',
      description:
        'Add your Channel Access Token from the LINE Developers Console. Your token is encrypted and securely stored.',
    },
  ],

  demoCode: `> Push a flex message to user U1234abcd

Message sent successfully!
Sent message ID: 473846583...

> Get group summary for C5678xyz

Group: "Dev Team Chat"
Members: 12
Picture: https://profile.line-scdn.net/...

> Set webhook URL to https://example.com/webhook

Webhook URL updated successfully.
Testing... Success (200 OK)`,

  externalDocUrl: 'https://developers.line.biz/en/docs/messaging-api/',

  quickStartSteps: [
    'Get your Channel Access Token from LINE Developers Console',
    'Add a connection with your token',
    'Copy the generated Service API key',
    'Start managing your LINE bot with extended tools!',
  ],

  emptyConnectionCTA: 'Add your first LINE Extended connection',

  connectionGuide: (
    <>
      <p className="text-muted-foreground mb-4">
        Go to <strong>Connections</strong> and add your LINE Bot channel:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
        <li>
          <strong className="text-foreground">Name:</strong> A friendly name (e.g., "My LINE Bot")
        </li>
        <li>
          <strong className="text-foreground">Channel Access Token:</strong> From{' '}
          <a
            href="https://developers.line.biz/console/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            LINE Developers Console
          </a>
          {' '}&rarr; Your Channel &rarr; Messaging API &rarr; Channel access token
        </li>
      </ul>
    </>
  ),

  examplePrompts: [
    'Push a message to user U1234',
    'Get group member list for C5678',
    'Create a rich menu with 3 areas',
    'Check my webhook endpoint',
    'Get follower count for today',
    'Broadcast a flex message to all followers',
  ],

  mcpConfigName: 'line-extended',

  faqCategories: [
    {
      name: 'LINE Extended',
      icon: <MessageCircle className="h-5 w-5" />,
      items: [
        {
          question: 'What is the difference between LINE and LINE Extended?',
          answer: (
            <div className="space-y-2">
              <p>LINE Extended provides 25 tools with the full LINE Messaging API:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Messages</strong> — Push, reply, multicast, broadcast, validate</li>
                <li><strong>Groups</strong> — Summary, member count, member IDs, member profiles</li>
                <li><strong>Rich Menus</strong> — Create, list, delete, set default, link to user</li>
                <li><strong>Webhooks</strong> — Set URL, get info, test webhook</li>
                <li><strong>Insights</strong> — Quota, consumption, follower counts</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'Is my Channel Access Token secure?',
          answer: (
            <div className="space-y-2">
              <p>Yes, we take security seriously:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your token is <strong>encrypted with AES-256-GCM</strong> before storage</li>
                <li>We only decrypt when proxying requests to the LINE API</li>
                <li>Tokens can be reissued anytime from LINE Developers Console</li>
                <li>All communications use HTTPS/TLS encryption</li>
              </ul>
            </div>
          ),
        },
      ],
    },
  ],
};
