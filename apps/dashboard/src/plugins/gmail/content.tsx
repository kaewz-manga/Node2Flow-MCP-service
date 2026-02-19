/**
 * Gmail Plugin Content
 */

import { Mail, Tag, MessageSquare } from 'lucide-react';
import type { PluginContent } from '../registry';

export const gmailContent: PluginContent = {
  tagline: 'Manage Gmail with AI',
  description:
    'Send, search, read, and organize emails. Manage drafts, labels, threads, and vacation settings through 28 powerful tools.',

  features: [
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Messages & Drafts',
      description:
        'Send emails with HTML support, manage drafts, search with Gmail query syntax, batch operations on up to 1000 messages.',
    },
    {
      icon: <Tag className="h-6 w-6" />,
      title: 'Labels & Organization',
      description:
        'Create and manage labels with colors, mark as read/unread, star messages, organize with batch label modifications.',
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: 'Threads & Settings',
      description:
        'View complete conversation threads, manage thread labels, configure vacation auto-reply settings.',
    },
  ],

  setupSteps: [
    {
      title: 'Connect Gmail',
      description:
        'Add your Google OAuth 2.0 Client ID, Client Secret, and Refresh Token. Enable the Gmail API in Google Cloud Console.',
    },
  ],

  demoCode: `> Search for unread emails from my manager

Found 5 unread messages from manager@company.com:
- "Q1 Report Review" (2 days ago)
- "Meeting Tomorrow" (3 days ago)
...

> Send a reply to the Q1 Report thread

Sent reply to thread abc123:
To: manager@company.com
Subject: Re: Q1 Report Review

> Create a label "Priority/Urgent" with red color

Created label: Priority/Urgent (#d93025)

> Mark all emails older than 30 days as read

Batch modified 142 messages (removed UNREAD label)`,

  externalDocUrl: 'https://developers.google.com/gmail/api',

  quickStartSteps: [
    'Create OAuth 2.0 credentials in Google Cloud Console',
    'Enable the Gmail API for your project',
    'Generate a refresh token with Gmail scopes',
    'Add a connection with your credentials',
    'Copy the generated API key',
    'Start managing your Gmail with AI!',
  ],

  emptyConnectionCTA: 'Add your first Gmail connection',

  connectionGuide: (
    <>
      <p className="text-muted-foreground mb-4">
        Go to <strong>Connections</strong> and add your Gmail account:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
        <li>
          <strong className="text-foreground">Name:</strong> A friendly name (e.g., "Work Gmail")
        </li>
        <li>
          <strong className="text-foreground">Client ID:</strong> From Google Cloud Console &gt; APIs &amp; Services &gt; Credentials
        </li>
        <li>
          <strong className="text-foreground">Client Secret:</strong> The secret paired with your Client ID
        </li>
        <li>
          <strong className="text-foreground">Refresh Token:</strong> Generated via OAuth Playground or a script with Gmail scopes
        </li>
      </ul>
    </>
  ),

  examplePrompts: [
    'Search for unread emails from boss@company.com',
    'Send an email to team@company.com about the project update',
    'List all labels in my mailbox',
    'Create a new draft reply to the latest thread',
    'Get the full conversation thread for message ID abc123',
    'Set up vacation auto-reply for the next week',
  ],

  mcpConfigName: 'gmail',

  faqCategories: [
    {
      name: 'Gmail Connection',
      icon: <Mail className="h-5 w-5" />,
      items: [
        {
          question: 'How do I get Gmail OAuth credentials?',
          answer: (
            <div className="space-y-2">
              <ol className="list-decimal pl-5 space-y-1">
                <li>Go to <strong>Google Cloud Console</strong> &gt; APIs &amp; Services &gt; Credentials</li>
                <li>Create an <strong>OAuth 2.0 Client ID</strong> (Desktop app type)</li>
                <li>Enable the <strong>Gmail API</strong> under Enabled APIs &amp; Services</li>
                <li>Use the <strong>OAuth Playground</strong> or a script to get a refresh token</li>
              </ol>
            </div>
          ),
        },
        {
          question: 'What Gmail scopes are needed?',
          answer: (
            <div className="space-y-2">
              <ul className="list-disc pl-5 space-y-1">
                <li><code className="bg-muted px-1 rounded">https://mail.google.com/</code> — Full access (recommended)</li>
                <li><code className="bg-muted px-1 rounded">https://www.googleapis.com/auth/gmail.readonly</code> — Read-only</li>
                <li><code className="bg-muted px-1 rounded">https://www.googleapis.com/auth/gmail.send</code> — Send only</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'What tools are available?',
          answer: (
            <div className="space-y-2">
              <p>28 tools across 5 categories:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Messages (10)</strong> — Send, search, read, delete, trash, modify labels, batch operations, attachments</li>
                <li><strong>Drafts (6)</strong> — Create, update, delete, send drafts</li>
                <li><strong>Labels (5)</strong> — Create, update, delete custom labels with colors</li>
                <li><strong>Threads (5)</strong> — List, read, modify, trash/untrash conversations</li>
                <li><strong>Settings (2)</strong> — Get profile info, configure vacation auto-reply</li>
              </ul>
            </div>
          ),
        },
      ],
    },
  ],
};

export default gmailContent;
