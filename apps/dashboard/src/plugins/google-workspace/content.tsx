import { FileText, HardDrive, Calendar, Mail } from 'lucide-react';
import type { PluginContent } from '../registry';

export const googleWorkspaceContent: PluginContent = {
  tagline: 'AI-Powered Google Workspace Automation',
  description: 'Access 54 tools across 9 Google services — Docs, Drive, Calendar, Gmail, Sheets, Slides, Chat, People, and Time — all through a single MCP connection.',

  features: [
    {
      icon: <FileText className="h-6 w-6" />,
      title: 'Docs & Sheets',
      description: 'Create, read, and edit Google Docs and Sheets. Insert text, manage formatting, and work with spreadsheet data.',
    },
    {
      icon: <HardDrive className="h-6 w-6" />,
      title: 'Drive & Files',
      description: 'Search files, list contents, read file metadata, and manage your Google Drive storage.',
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: 'Calendar & Time',
      description: 'List, create, update, and delete calendar events. Check free/busy time and track work hours.',
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Gmail & Chat',
      description: 'Search and read emails, send messages, manage drafts, and interact with Google Chat spaces.',
    },
  ],

  setupSteps: [
    {
      title: 'Deploy Google Workspace MCP Server',
      description: 'Deploy the google-workspace-server with your Google OAuth credentials configured.',
    },
  ],

  demoCode: `> List my upcoming calendar events for this week

Found 5 events:
1. Team Standup — Mon 9:00 AM
2. Design Review — Tue 2:00 PM
3. Sprint Planning — Wed 10:00 AM
4. 1:1 with Manager — Thu 3:00 PM
5. Friday Demo — Fri 4:00 PM

> Create a new Google Doc titled "Meeting Notes"

Created document: "Meeting Notes"
Document ID: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms`,

  externalDocUrl: 'https://github.com/gemini-cli-extensions/workspace',

  quickStartSteps: [
    'Deploy google-workspace-server with Google OAuth',
    'Add the server URL as a connection',
    'Copy the generated Service API key',
    'Start managing Google Workspace via AI!',
  ],

  emptyConnectionCTA: 'Add your Google Workspace MCP server connection',

  connectionGuide: (
    <>
      <p className="text-muted-foreground mb-4">
        Deploy the Google Workspace MCP server, then add it as a connection:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
        <li><strong className="text-foreground">Name:</strong> A friendly name</li>
        <li><strong className="text-foreground">MCP Server URL:</strong> Your deployed server URL</li>
        <li><strong className="text-foreground">Auth Token:</strong> Optional auth token for your server</li>
      </ul>
    </>
  ),

  examplePrompts: [
    'List my Google Drive files from the last week',
    'Create a new Google Doc with meeting notes',
    'Show my calendar events for tomorrow',
    'Search my Gmail for messages from the marketing team',
    'Create a new spreadsheet with project data',
    'Send a message in our team Chat space',
  ],

  mcpConfigName: 'google-workspace',

  faqCategories: [
    {
      name: 'Google Workspace',
      icon: <HardDrive className="h-5 w-5" />,
      items: [
        {
          question: 'What Google services are supported?',
          answer: (
            <div className="space-y-2">
              <p>The Google Workspace MCP server provides 54 tools across 9 services:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Google Docs</strong> (8 tools) — Create, get, insert text, search/replace, manage formatting</li>
                <li><strong>Google Drive</strong> (4 tools) — Search, list, get file metadata, read contents</li>
                <li><strong>Google Calendar</strong> (7 tools) — List, get, create, update, delete events, free/busy</li>
                <li><strong>Gmail</strong> (9 tools) — Search, read, send, reply, manage drafts and labels</li>
                <li><strong>Google Chat</strong> (8 tools) — Spaces, members, messages, reactions</li>
                <li><strong>Google Sheets</strong> (4 tools) — Create, get, read values, update cells</li>
                <li><strong>Google Slides</strong> (5 tools) — Create, get, add slides, insert text/images</li>
                <li><strong>Google People</strong> (3 tools) — List contacts, search, get profiles</li>
                <li><strong>Time</strong> (3 tools) — Get current time, convert timezones, list timezones</li>
              </ul>
            </div>
          ),
        },
      ],
    },
  ],
};
