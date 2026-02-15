/**
 * Google Docs Plugin Content
 * All Google Docs-specific content used by global pages (Landing, Dashboard, Documentation, FAQ).
 */

import { FileText, Type, Table2 } from 'lucide-react';
import type { PluginContent } from '../registry';

export const googleDocsContent: PluginContent = {
  // ============================================
  // Landing Page
  // ============================================

  tagline: 'Manage Google Docs with AI',
  description:
    'Create documents, insert text, manage formatting, work with tables, and interact with your Google Docs through natural language.',

  features: [
    {
      icon: <FileText className="h-6 w-6" />,
      title: 'Document Management',
      description:
        'Create, get, and batch-update documents. Insert text, images, page breaks, and manage headers and footers.',
    },
    {
      icon: <Type className="h-6 w-6" />,
      title: 'Text & Formatting',
      description:
        'Insert, replace, and delete text. Apply paragraph styles (headings, normal) and text formatting (bold, italic, colors).',
    },
    {
      icon: <Table2 className="h-6 w-6" />,
      title: 'Tables & Lists',
      description:
        'Create and manage tables, insert/delete rows and columns, merge cells, and create numbered or bulleted lists.',
    },
  ],

  setupSteps: [
    {
      title: 'Connect Google Docs',
      description:
        'Add your OAuth 2.0 credentials from Google Cloud Console. Your credentials are encrypted and securely stored.',
    },
  ],

  demoCode: `> Create a new document called "Meeting Notes - Feb 2026"

Document created!
ID: 1abc...xyz

> Insert text "Action Items:" as Heading 2

Text inserted with Heading 2 style.

> Create a table with 3 columns: Task, Owner, Due Date

Table created (3 columns x 2 rows) with headers.

> Add a numbered list with 3 items

Numbered list created:
1. Review budget proposal
2. Update project timeline
3. Schedule follow-up meeting`,

  externalDocUrl: 'https://developers.google.com/docs/api/reference/rest',

  // ============================================
  // Dashboard
  // ============================================

  quickStartSteps: [
    'Go to Google Cloud Console and create OAuth 2.0 credentials',
    'Enable the Google Docs API for your project',
    'Generate a refresh token using the OAuth 2.0 Playground or your app',
    'Add a connection with Client ID, Client Secret, and Refresh Token',
    'Copy the generated API key',
    'Start managing your Google Docs with AI!',
  ],

  emptyConnectionCTA: 'Add your first Google Docs connection',

  // ============================================
  // Documentation
  // ============================================

  connectionGuide: (
    <>
      <p className="text-muted-foreground mb-4">
        Go to <strong>Connections</strong> and add your Google Docs account:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
        <li>
          <strong className="text-foreground">Name:</strong> A friendly name (e.g., "My Google Docs")
        </li>
        <li>
          <strong className="text-foreground">Client ID:</strong> From{' '}
          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Google Cloud Console
          </a>
        </li>
        <li>
          <strong className="text-foreground">Client Secret:</strong> From the same OAuth 2.0 credentials
        </li>
        <li>
          <strong className="text-foreground">Refresh Token:</strong> Generated via OAuth 2.0 flow
        </li>
      </ul>
    </>
  ),

  examplePrompts: [
    'Create a new document called "Weekly Report"',
    'Get the content of my document',
    'Insert a heading "Summary" at the beginning',
    'Create a 3x4 table for project tracking',
  ],

  mcpConfigName: 'google-docs',

  // ============================================
  // FAQ
  // ============================================

  faqCategories: [
    {
      name: 'Google Docs Connection',
      icon: <FileText className="h-5 w-5" />,
      items: [
        {
          question: 'How do I get OAuth 2.0 credentials?',
          answer: (
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Go to{' '}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google Cloud Console &rarr; Credentials
                </a>
              </li>
              <li>Create an OAuth 2.0 Client ID (Web application type)</li>
              <li>Enable the Google Docs API in your project</li>
              <li>Use the OAuth 2.0 Playground or your app to generate a refresh token</li>
              <li>Copy the Client ID, Client Secret, and Refresh Token</li>
            </ol>
          ),
        },
        {
          question: 'Are my credentials secure?',
          answer: (
            <div className="space-y-2">
              <p>Yes, we take security seriously:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your credentials are <strong>encrypted with AES-256-GCM</strong> before storage</li>
                <li>We only decrypt when proxying requests to Google Docs API</li>
                <li>Refresh tokens can be revoked anytime from Google Account settings</li>
                <li>All communications use HTTPS/TLS encryption</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'What Google Docs features can I access via MCP?',
          answer: (
            <div className="space-y-2">
              <p>The Google Docs plugin provides 26 tools covering:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Documents</strong> - Create, get, batch update</li>
                <li><strong>Text</strong> - Insert, replace, delete text</li>
                <li><strong>Formatting</strong> - Paragraph styles, text styles (bold, italic, colors)</li>
                <li><strong>Tables</strong> - Create, insert/delete rows and columns, merge cells</li>
                <li><strong>Content</strong> - Images, page breaks, lists, headers, footers</li>
              </ul>
            </div>
          ),
        },
      ],
    },
  ],
};
