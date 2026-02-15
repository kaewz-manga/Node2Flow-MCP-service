/**
 * Context7 Plugin Content
 * All Context7-specific content used by global pages (Landing, Dashboard, Documentation, FAQ).
 */

import { BookOpen, Search, Code } from 'lucide-react';
import type { PluginContent } from '../registry';

export const context7Content: PluginContent = {
  // ============================================
  // Landing Page
  // ============================================

  tagline: 'Up-to-Date Library Documentation for AI',
  description:
    'Search and retrieve current documentation and code examples for any programming library or framework through Context7.',

  features: [
    {
      icon: <Search className="h-6 w-6" />,
      title: 'Library Search',
      description:
        'Find any library by name and get the Context7-compatible ID for documentation queries.',
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: 'Live Documentation',
      description:
        'Query up-to-date docs and code examples — no more outdated training data.',
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: 'Code Examples',
      description:
        'Get real code snippets from official documentation, ranked by relevance to your question.',
    },
  ],

  setupSteps: [
    {
      title: 'Create Connection',
      description:
        'Add a Context7 connection — no API key needed, it\'s a free public service.',
    },
  ],

  demoCode: `> Find the Next.js library

Library: /vercel/next.js
- Code Snippets: 1,247
- Source Reputation: High
- Benchmark Score: 95

> How to set up middleware in Next.js?

// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  return NextResponse.redirect(new URL('/home', request.url))
}

export const config = {
  matcher: '/about/:path*',
}`,

  externalDocUrl: 'https://context7.com',

  // ============================================
  // Dashboard
  // ============================================

  quickStartSteps: [
    'Add a Context7 connection (no API key needed)',
    'Copy the generated API key',
    'Use resolve_library_id to find a library',
    'Use query_docs to get documentation and code examples',
  ],

  emptyConnectionCTA: 'Add your first Context7 connection',

  // ============================================
  // Documentation
  // ============================================

  connectionGuide: (
    <>
      <p className="text-muted-foreground mb-4">
        Go to <strong>Connections</strong> and add a Context7 connection:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
        <li>
          <strong className="text-foreground">Name:</strong> A friendly name (e.g., "Context7 Docs")
        </li>
      </ul>
      <p className="text-muted-foreground">
        No API key or URL is needed — Context7 is a free public documentation service.
      </p>
    </>
  ),

  examplePrompts: [
    'Find the React library and show me how to use useEffect',
    'Get Next.js documentation for API routes',
    'How to set up authentication in Express.js',
    'Show me Tailwind CSS flex layout examples',
  ],

  mcpConfigName: 'context7',

  // ============================================
  // FAQ
  // ============================================

  faqCategories: [
    {
      name: 'Context7',
      icon: <BookOpen className="h-5 w-5" />,
      items: [
        {
          question: 'What is Context7?',
          answer: (
            <div className="space-y-2">
              <p>
                <a
                  href="https://context7.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Context7
                </a>{' '}
                provides up-to-date documentation and code examples for programming libraries. Instead of relying on AI training data (which may be outdated), Context7 fetches live documentation.
              </p>
            </div>
          ),
        },
        {
          question: 'Do I need an API key?',
          answer: (
            <div className="space-y-2">
              <p>No. Context7 is a <strong>free public service</strong>. You only need a Node2Flow API key to access it through the MCP Gateway.</p>
            </div>
          ),
        },
        {
          question: 'What tools are available?',
          answer: (
            <div className="space-y-2">
              <p>The Context7 plugin provides 2 tools:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>resolve_library_id</strong> — Search for a library and get its Context7 ID</li>
                <li><strong>query_docs</strong> — Retrieve documentation and code examples for a library</li>
              </ul>
            </div>
          ),
        },
      ],
    },
  ],
};
