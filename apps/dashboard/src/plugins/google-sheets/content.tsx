/**
 * Google Sheets Plugin Content
 * All Google Sheets-specific content used by global pages (Landing, Dashboard, Documentation, FAQ).
 */

import { Table2, FileSpreadsheet, BarChart3 } from 'lucide-react';
import type { PluginContent } from '../registry';

export const googleSheetsContent: PluginContent = {
  // ============================================
  // Landing Page
  // ============================================

  tagline: 'Manage Google Sheets with AI',
  description:
    'Read, write, format cells, manage sheets, and interact with your Google Sheets spreadsheets through natural language.',

  features: [
    {
      icon: <Table2 className="h-6 w-6" />,
      title: 'Cell Operations',
      description:
        'Read, write, append, and batch-update cell values across any spreadsheet with flexible range syntax.',
    },
    {
      icon: <FileSpreadsheet className="h-6 w-6" />,
      title: 'Sheet Management',
      description:
        'Create spreadsheets, add or delete sheets, copy sheets between spreadsheets, and manage protected ranges.',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Formatting & Filters',
      description:
        'Apply cell formatting (bold, colors, borders), manage conditional formatting, and set up basic filters.',
    },
  ],

  setupSteps: [
    {
      title: 'Connect Google Sheets',
      description:
        'Add your OAuth 2.0 credentials from Google Cloud Console. Your credentials are encrypted and securely stored.',
    },
  ],

  demoCode: `> Get values from "Budget" sheet A1:D10

Found 10 rows:
| Category  | Budget  | Actual  | Diff   |
| Rent      | $2,000  | $2,000  | $0     |
| Food      | $500    | $423    | +$77   |
...

> Append a new row to Sheet1 with ["Product X", 150, "2026-02-15"]

Row appended successfully to Sheet1!
Updated range: Sheet1!A11:C11

> Format cells A1:D1 as bold with blue background

Formatting applied to 4 cells.`,

  externalDocUrl: 'https://developers.google.com/sheets/api/reference/rest',

  // ============================================
  // Dashboard
  // ============================================

  quickStartSteps: [
    'Go to Google Cloud Console and create OAuth 2.0 credentials',
    'Enable the Google Sheets API for your project',
    'Generate a refresh token using the OAuth 2.0 Playground or your app',
    'Add a connection with Client ID, Client Secret, and Refresh Token',
    'Copy the generated API key',
    'Start managing your Google Sheets with AI!',
  ],

  emptyConnectionCTA: 'Add your first Google Sheets connection',

  // ============================================
  // Documentation
  // ============================================

  connectionGuide: (
    <>
      <p className="text-muted-foreground mb-4">
        Go to <strong>Connections</strong> and add your Google Sheets account:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
        <li>
          <strong className="text-foreground">Name:</strong> A friendly name (e.g., "My Google Sheets")
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
    'Get values from Sheet1 A1:Z100',
    'Create a new spreadsheet called "Budget 2026"',
    'Append a row with sales data to my spreadsheet',
    'Format the header row as bold with a blue background',
  ],

  mcpConfigName: 'google-sheets',

  // ============================================
  // FAQ
  // ============================================

  faqCategories: [
    {
      name: 'Google Sheets Connection',
      icon: <FileSpreadsheet className="h-5 w-5" />,
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
              <li>Enable the Google Sheets API in your project</li>
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
                <li>We only decrypt when proxying requests to Google Sheets API</li>
                <li>Refresh tokens can be revoked anytime from Google Account settings</li>
                <li>All communications use HTTPS/TLS encryption</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'What Google Sheets features can I access via MCP?',
          answer: (
            <div className="space-y-2">
              <p>The Google Sheets plugin provides 23 tools covering:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Spreadsheets</strong> - Create, get metadata</li>
                <li><strong>Sheets</strong> - Add, delete, copy sheets</li>
                <li><strong>Values</strong> - Read, write, append, batch read/write, clear</li>
                <li><strong>Formatting</strong> - Cell format, conditional format, merge cells</li>
                <li><strong>Filters & Protection</strong> - Basic filters, protected ranges</li>
              </ul>
            </div>
          ),
        },
      ],
    },
  ],
};
