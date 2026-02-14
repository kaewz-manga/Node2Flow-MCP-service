/**
 * Slack Plugin - Content Metadata
 * Landing, Dashboard, Documentation, FAQ content
 */

import {
  MessageSquare,
  Hash,
  Search,
  Upload,
  Users,
  Clock,
  Pin,
  Bookmark,
  Smile,
  Shield,
  Zap,
  Settings,
  HelpCircle,
  Code,
  Key,
} from 'lucide-react';
import type { PluginContent } from '../registry';

export const slackContent: PluginContent = {
  // ======== Landing Page ========
  tagline: 'Manage your Slack workspace with AI',
  description:
    'Send messages, manage channels, search conversations, and automate Slack operations through a unified MCP interface. 38 tools covering messages, channels, files, reactions, pins, bookmarks, and more.',
  features: [
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: 'Messages',
      description: 'Send, schedule, update, and delete messages. Search across your entire workspace.',
    },
    {
      icon: <Hash className="h-5 w-5" />,
      title: 'Channels',
      description: 'List, create, archive channels. Manage members, topics, and conversation history.',
    },
    {
      icon: <Upload className="h-5 w-5" />,
      title: 'Files',
      description: 'Upload, list, search, and delete files. Share content across channels and conversations.',
    },
    {
      icon: <Smile className="h-5 w-5" />,
      title: 'Reactions & Pins',
      description: 'Add and remove reactions, pin important messages, and manage bookmarks.',
    },
  ],
  setupSteps: [
    {
      title: 'Create a Slack App',
      description: 'Go to api.slack.com/apps and create a new app for your workspace.',
    },
    {
      title: 'Configure Bot Scopes',
      description:
        'Add required OAuth scopes: channels:read, channels:write, chat:write, files:read, files:write, users:read, search:read, pins:write, reactions:write, bookmarks:write.',
    },
    {
      title: 'Install to Workspace',
      description: 'Install the app to your workspace and copy the Bot User OAuth Token (xoxb-...).',
    },
    {
      title: 'Add Connection',
      description: 'Paste the Bot Token in the Connections page to start using Slack tools.',
    },
  ],
  demoCode: `// Send a message
await slack_send_message({
  channel: "C01234567",
  text: "Hello from MCP! :wave:"
});

// Search messages
await slack_search_messages({
  query: "from:@user project update"
});

// List channels
await slack_list_channels({ limit: 50 });`,
  externalDocUrl: 'https://api.slack.com/docs',

  // ======== Dashboard ========
  quickStartSteps: [
    'Add a Slack connection with your Bot Token',
    'Send a test message to verify the connection',
    'List channels to explore your workspace',
    'Try searching messages or managing files',
  ],
  emptyConnectionCTA: 'Add a Slack Bot Token to start managing your workspace.',

  // ======== Documentation ========
  connectionGuide: (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold mb-1">1. Create a Slack App</h4>
        <p className="text-sm text-muted-foreground">
          Visit <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">api.slack.com/apps</a> and
          click "Create New App". Choose "From scratch" and select your workspace.
        </p>
      </div>
      <div>
        <h4 className="font-semibold mb-1">2. Add Bot Token Scopes</h4>
        <p className="text-sm text-muted-foreground">
          Go to "OAuth & Permissions" and add these Bot Token Scopes:
        </p>
        <code className="block text-xs bg-muted p-2 rounded mt-1">
          channels:history, channels:read, channels:write, channels:manage,
          chat:write, files:read, files:write, groups:read, groups:write,
          im:read, im:write, mpim:read, pins:read, pins:write,
          reactions:read, reactions:write, search:read, team:read,
          users:read, bookmarks:read, bookmarks:write, emoji:read
        </code>
      </div>
      <div>
        <h4 className="font-semibold mb-1">3. Install & Get Token</h4>
        <p className="text-sm text-muted-foreground">
          Install the app to your workspace. Copy the "Bot User OAuth Token" (starts with <code>xoxb-</code>).
          Paste it in the Connections page.
        </p>
      </div>
    </div>
  ),
  examplePrompts: [
    'Send a message to #general saying "Hello team!"',
    'Search for messages containing "project deadline"',
    'List all public channels in the workspace',
    'Create a new channel called #weekly-updates',
    'Upload a text file to #reports channel',
    'Get the last 20 messages from #engineering',
    'Add a thumbsup reaction to the latest message',
    'List all pinned items in #announcements',
  ],
  mcpConfigName: 'slack',
  configSections: (
    <div className="space-y-3">
      <div>
        <h4 className="font-semibold text-sm flex items-center gap-2"><Key className="h-4 w-4" /> Authentication</h4>
        <p className="text-sm text-muted-foreground mt-1">
          Uses Bot User OAuth Token (<code>xoxb-...</code>). Each connection stores one bot token.
          The token determines which workspace and permissions are available.
        </p>
      </div>
      <div>
        <h4 className="font-semibold text-sm flex items-center gap-2"><Shield className="h-4 w-4" /> Permissions</h4>
        <p className="text-sm text-muted-foreground mt-1">
          Tools require specific OAuth scopes. If a tool returns "missing_scope" error,
          add the required scope in your Slack App settings and reinstall.
        </p>
      </div>
    </div>
  ),

  // ======== FAQ ========
  faqCategories: [
    {
      name: 'Setup',
      icon: <Settings className="h-4 w-4" />,
      items: [
        {
          question: 'Where do I get a Bot Token?',
          answer: (
            <span>
              Go to <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">api.slack.com/apps</a>,
              select your app, then "OAuth & Permissions". The Bot User OAuth Token starts with <code>xoxb-</code>.
            </span>
          ),
        },
        {
          question: 'What scopes does my bot need?',
          answer:
            'At minimum: channels:read, chat:write, users:read. For full functionality, add all 27 recommended scopes listed in the documentation section.',
        },
        {
          question: 'Can I use a User Token instead?',
          answer:
            'No. This plugin only supports Bot Tokens (xoxb-). User tokens (xoxp-) have different permission models and are not supported.',
        },
      ],
    },
    {
      name: 'Usage',
      icon: <HelpCircle className="h-4 w-4" />,
      items: [
        {
          question: 'How do I find a channel ID?',
          answer:
            'Use the slack_list_channels tool or right-click a channel in Slack Desktop → "View channel details" → the channel ID is at the bottom.',
        },
        {
          question: 'Why does my message show as "bot"?',
          answer:
            'Messages sent via Bot Token always show the app name as the sender. This is by Slack design. You can customize the display name and icon in your app settings.',
        },
        {
          question: 'Can I send messages to DMs?',
          answer:
            'Yes! Use slack_open_conversation with the user ID to get a DM channel ID, then use slack_send_message with that channel ID.',
        },
      ],
    },
    {
      name: 'Troubleshooting',
      icon: <Code className="h-4 w-4" />,
      items: [
        {
          question: 'Getting "not_in_channel" error?',
          answer:
            'The bot must be a member of the channel. Invite it by mentioning @YourBotName in the channel, or use slack_join_channel.',
        },
        {
          question: 'Getting "missing_scope" error?',
          answer:
            'Your bot is missing a required OAuth scope. Add the scope in your Slack App settings under "OAuth & Permissions", then reinstall the app to your workspace.',
        },
        {
          question: 'Search returns empty results?',
          answer:
            'Search requires the search:read scope (which uses a User Token). If your bot token doesn\'t have search access, you may need to add a User Token scope.',
        },
      ],
    },
  ],
};
