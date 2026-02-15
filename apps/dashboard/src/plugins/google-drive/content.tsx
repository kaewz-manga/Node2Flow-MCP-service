/**
 * Google Drive Plugin Content
 * All Google Drive-specific content used by global pages (Landing, Dashboard, Documentation, FAQ).
 */

import { HardDrive, FolderOpen, Share2 } from 'lucide-react';
import type { PluginContent } from '../registry';

export const googleDriveContent: PluginContent = {
  // ============================================
  // Landing Page
  // ============================================

  tagline: 'Manage Google Drive with AI',
  description:
    'Search files, manage permissions, organize folders, and interact with your Google Drive through natural language.',

  features: [
    {
      icon: <HardDrive className="h-6 w-6" />,
      title: 'File Management',
      description:
        'List, search, get, create, copy, move, rename, and trash files. Upload and export in various formats.',
    },
    {
      icon: <Share2 className="h-6 w-6" />,
      title: 'Sharing & Permissions',
      description:
        'Create, list, update, and delete permissions. Manage shared drives and access control.',
    },
    {
      icon: <FolderOpen className="h-6 w-6" />,
      title: 'Comments & Revisions',
      description:
        'Create and manage comments, replies, and file revisions. Track changes and collaboration activity.',
    },
  ],

  setupSteps: [
    {
      title: 'Connect Google Drive',
      description:
        'Add your OAuth 2.0 credentials from Google Cloud Console. Your credentials are encrypted and securely stored.',
    },
  ],

  demoCode: `> List files in my Drive root folder

Found 12 files:
1. Project Docs (folder)
2. Budget 2026.xlsx (spreadsheet)
3. Meeting Notes.docx (document)
...

> Search for files containing "invoice" modified this month

Found 3 files:
- Invoice-001.pdf (Feb 1, 2026)
- Invoice-002.pdf (Feb 8, 2026)
- Invoice Template.docx (Feb 12, 2026)

> Share "Budget 2026.xlsx" with team@company.com as editor

Permission created! team@company.com can now edit the file.`,

  externalDocUrl: 'https://developers.google.com/drive/api/reference/rest/v3',

  // ============================================
  // Dashboard
  // ============================================

  quickStartSteps: [
    'Go to Google Cloud Console and create OAuth 2.0 credentials',
    'Enable the Google Drive API for your project',
    'Generate a refresh token using the OAuth 2.0 Playground or your app',
    'Add a connection with Client ID, Client Secret, and Refresh Token',
    'Copy the generated API key',
    'Start managing your Google Drive with AI!',
  ],

  emptyConnectionCTA: 'Add your first Google Drive connection',

  // ============================================
  // Documentation
  // ============================================

  connectionGuide: (
    <>
      <p className="text-muted-foreground mb-4">
        Go to <strong>Connections</strong> and add your Google Drive account:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
        <li>
          <strong className="text-foreground">Name:</strong> A friendly name (e.g., "My Google Drive")
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
    'List all files in my Drive',
    'Search for PDF files modified this week',
    'Share a file with my team as editors',
    'Create a new folder called "Project Docs"',
  ],

  mcpConfigName: 'google-drive',

  // ============================================
  // FAQ
  // ============================================

  faqCategories: [
    {
      name: 'Google Drive Connection',
      icon: <HardDrive className="h-5 w-5" />,
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
              <li>Enable the Google Drive API in your project</li>
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
                <li>We only decrypt when proxying requests to Google Drive API</li>
                <li>Refresh tokens can be revoked anytime from Google Account settings</li>
                <li>All communications use HTTPS/TLS encryption</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'What Google Drive features can I access via MCP?',
          answer: (
            <div className="space-y-2">
              <p>The Google Drive plugin provides 23 tools covering:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Files</strong> - List, search, get, create, copy, move, rename, trash, upload, export</li>
                <li><strong>Permissions</strong> - Create, list, delete sharing permissions</li>
                <li><strong>Comments & Replies</strong> - Create, list, manage comments and replies</li>
                <li><strong>Shared Drives</strong> - List, get, manage shared drives</li>
                <li><strong>Revisions & About</strong> - List revisions, get storage info</li>
              </ul>
            </div>
          ),
        },
      ],
    },
  ],
};
