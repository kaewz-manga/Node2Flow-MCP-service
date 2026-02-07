/**
 * WordPress Plugin Content
 * All WordPress-specific content used by global pages (Landing, Dashboard, Documentation, FAQ).
 */

import { Globe, FileText, Shield } from 'lucide-react';
import type { PluginContent } from '../registry';

export const wordpressContent: PluginContent = {
  // ============================================
  // Landing Page
  // ============================================

  tagline: 'Manage WordPress with AI',
  description:
    'Let your AI assistant create posts, manage pages, moderate comments, and handle media on your WordPress site.',

  features: [
    {
      icon: <Globe className="h-6 w-6" />,
      title: 'Full WordPress REST API',
      description:
        'Posts, pages, media, comments, categories, tags, and users - all accessible through MCP.',
    },
  ],

  setupSteps: [
    {
      title: 'Connect WordPress',
      description:
        "Add your WordPress site URL and Application Password. We'll encrypt and securely store your credentials.",
    },
  ],

  demoCode: `> List all my WordPress posts

I found 8 posts on your WordPress site:

1. Welcome to Node2Flow (published)
2. Getting Started Guide (published)
3. Product Roadmap 2026 (draft)
4. API Documentation (published)
5. Release Notes v2.0 (published)

Would you like me to publish the Product Roadmap draft?`,

  externalDocUrl: 'https://developer.wordpress.org/rest-api/',

  // ============================================
  // Dashboard
  // ============================================

  quickStartSteps: [
    'Add your WordPress site URL and Application Password',
    'Copy the generated Service API key',
    'Configure your MCP client (Claude Desktop, Cursor, etc.)',
    'Start managing WordPress with AI!',
  ],

  emptyConnectionCTA: 'Add your first WordPress connection',

  // ============================================
  // Documentation
  // ============================================

  connectionGuide: (
    <>
      <p className="text-n2f-text-secondary mb-4">
        Go to <strong>Connections</strong> and add your WordPress site:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-n2f-text-secondary mb-4">
        <li>
          <strong className="text-n2f-text">Name:</strong> A friendly name (e.g., "My Blog")
        </li>
        <li>
          <strong className="text-n2f-text">Site URL:</strong> Your WordPress site URL (e.g.,
          https://example.com)
        </li>
        <li>
          <strong className="text-n2f-text">Username:</strong> Your WordPress username
        </li>
        <li>
          <strong className="text-n2f-text">Application Password:</strong> Generated from WordPress
          Users &rarr; Profile &rarr; Application Passwords
        </li>
      </ul>
    </>
  ),

  examplePrompts: [
    'List all my WordPress posts',
    'Create a new draft post about Node2Flow',
    'Show me pending comments on my blog',
  ],

  mcpConfigName: 'wordpress',

  configSections: (
    <>
      <section>
        <h2 className="text-xl font-semibold text-n2f-text mb-4">Multiple WordPress Sites</h2>
        <p className="text-n2f-text-secondary mb-4">
          You can connect multiple WordPress sites. The MCP server will use the first one by default.
          Use the <code className="bg-n2f-elevated px-1 rounded">switch_connection</code> tool to
          switch between sites.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-n2f-text mb-4">Application Password Setup</h2>
        <p className="text-n2f-text-secondary mb-4">
          WordPress Application Passwords provide secure API access:
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-n2f-card border border-n2f-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-green-400" />
              <span className="text-n2f-text font-medium">How to create</span>
            </div>
            <ol className="text-sm text-n2f-text-secondary space-y-1 list-decimal pl-4">
              <li>Go to Users &rarr; Profile</li>
              <li>Scroll to Application Passwords</li>
              <li>Enter a name and click "Add New"</li>
              <li>Copy the password (remove spaces)</li>
            </ol>
          </div>
          <div className="bg-n2f-card border border-n2f-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-yellow-400" />
              <span className="text-n2f-text font-medium">Important</span>
            </div>
            <ul className="text-sm text-n2f-text-secondary space-y-1">
              <li>Remove all spaces from the password</li>
              <li>Use an admin account for full access</li>
              <li>Requires WordPress 5.6 or later</li>
              <li>REST API must be enabled</li>
            </ul>
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
      name: 'WordPress Connection',
      icon: <FileText className="h-5 w-5" />,
      items: [
        {
          question: 'How do I get a WordPress Application Password?',
          answer: (
            <ol className="list-decimal pl-5 space-y-2">
              <li>Log in to your WordPress admin dashboard</li>
              <li>
                Go to <strong>Users &rarr; Profile</strong>
              </li>
              <li>Scroll down to the <strong>Application Passwords</strong> section</li>
              <li>Enter a name (e.g., "Node2Flow") and click <strong>Add New</strong></li>
              <li>Copy the generated password and <strong>remove all spaces</strong></li>
            </ol>
          ),
        },
        {
          question: 'Is my WordPress password secure?',
          answer: (
            <div className="space-y-2">
              <p>Yes, we take security seriously:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Your Application Password is <strong>encrypted with AES-256-GCM</strong> before
                  storage
                </li>
                <li>We only decrypt when proxying requests to your WordPress site</li>
                <li>Application Passwords can be revoked anytime from WordPress</li>
                <li>All communications use HTTPS/TLS encryption</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'What WordPress features can I access via MCP?',
          answer: (
            <div className="space-y-2">
              <p>The WordPress plugin provides 20 tools covering:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Posts</strong> - List, get, create, update, delete
                </li>
                <li>
                  <strong>Pages</strong> - List, get, create, update, delete
                </li>
                <li>
                  <strong>Media</strong> - List and delete media files
                </li>
                <li>
                  <strong>Comments</strong> - List, create, update, delete
                </li>
                <li>
                  <strong>Taxonomy</strong> - Categories and tags
                </li>
                <li>
                  <strong>Users</strong> - List and view user profiles
                </li>
              </ul>
            </div>
          ),
        },
        {
          question: 'Why am I getting 401 errors?',
          answer: (
            <div className="space-y-2">
              <p>Common reasons for authentication errors:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Spaces in password</strong> - WordPress shows passwords with spaces for
                  readability, but you must remove all spaces
                </li>
                <li>
                  <strong>Wrong username</strong> - Use your WordPress login username, not email
                </li>
                <li>
                  <strong>REST API disabled</strong> - Some security plugins disable the REST API
                </li>
                <li>
                  <strong>Password revoked</strong> - Check if the Application Password still exists
                  in your profile
                </li>
              </ul>
            </div>
          ),
        },
      ],
    },
  ],
};
