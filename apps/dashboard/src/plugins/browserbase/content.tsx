/**
 * Browserbase Plugin Content
 * All Browserbase-specific content used by global pages (Landing, Dashboard, Documentation, FAQ).
 */

import { Globe, Eye, Bot, MousePointer } from 'lucide-react';
import type { PluginContent } from '../registry';

export const browserbaseContent: PluginContent = {
  // ============================================
  // Landing Page
  // ============================================

  tagline: 'Cloud Browser Automation with AI',
  description:
    'Control cloud browsers with AI-powered actions, data extraction, and autonomous agents using Browserbase and Stagehand.',

  features: [
    {
      icon: <MousePointer className="h-6 w-6" />,
      title: 'AI-Powered Actions',
      description:
        'Describe actions in natural language — click buttons, fill forms, navigate pages. Stagehand AI translates intent to browser actions.',
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: 'Extract & Observe',
      description:
        'Extract structured data from any webpage or observe interactive elements. Get clean, structured results from unstructured pages.',
    },
    {
      icon: <Bot className="h-6 w-6" />,
      title: 'Autonomous Agent',
      description:
        'Run an AI agent that completes complex multi-step tasks autonomously in a cloud browser. Powered by Gemini.',
    },
  ],

  setupSteps: [
    {
      title: 'Get Browserbase Credentials',
      description:
        'Sign up at browserbase.com and get your API Key and Project ID from the dashboard. Optionally add a Gemini API Key for the agent tool.',
    },
  ],

  demoCode: `> Create a browser session

Session created: sess_abc123
Browser ready at Browserbase cloud.

> Navigate to https://news.ycombinator.com

Navigated to Hacker News homepage.

> Extract the top 5 story titles and their scores

Extracted 5 items:
1. "Show HN: MCP Server for Cloud Browsers" (342 points)
2. "AI-powered web scraping is changing everything" (287 points)
3. "Stagehand v3: Natural language browser control" (231 points)
4. "The future of browser automation" (198 points)
5. "Cloud browsers vs local Playwright" (156 points)

> Click on the first story

Clicked "Show HN: MCP Server for Cloud Browsers"
Navigated to story page.`,

  externalDocUrl: 'https://docs.browserbase.com',

  // ============================================
  // Dashboard
  // ============================================

  quickStartSteps: [
    'Get your API Key and Project ID from Browserbase',
    'Add a connection with your credentials',
    'Copy the generated API key',
    'Automate cloud browsers with AI!',
  ],

  emptyConnectionCTA: 'Add your first Browserbase connection',

  // ============================================
  // Documentation
  // ============================================

  connectionGuide: (
    <>
      <p className="text-muted-foreground mb-4">
        Go to <strong>Connections</strong> and add your Browserbase credentials:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
        <li>
          <strong className="text-foreground">Name:</strong> A friendly name (e.g., "My Browserbase")
        </li>
        <li>
          <strong className="text-foreground">API Key:</strong> From the Browserbase dashboard
        </li>
        <li>
          <strong className="text-foreground">Project ID:</strong> From the Browserbase dashboard
        </li>
        <li>
          <strong className="text-foreground">Gemini API Key:</strong> (Optional) Required for the autonomous agent tool
        </li>
      </ul>
    </>
  ),

  examplePrompts: [
    'Create a new browser session',
    'Navigate to https://example.com',
    'Click the sign-in button',
    'Extract all product names and prices from the page',
    'Observe the interactive elements on this page',
    'Run an agent to find the cheapest flight from NYC to London',
  ],

  mcpConfigName: 'browserbase',

  // ============================================
  // FAQ
  // ============================================

  faqCategories: [
    {
      name: 'Browserbase',
      icon: <Globe className="h-5 w-5" />,
      items: [
        {
          question: 'What credentials do I need?',
          answer: (
            <div className="space-y-2">
              <p>You need credentials from <strong>browserbase.com</strong>:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li><strong>API Key</strong> — Found in your Browserbase dashboard settings</li>
                <li><strong>Project ID</strong> — Found in your Browserbase project settings</li>
                <li><strong>Gemini API Key</strong> (optional) — Only needed for the autonomous agent tool</li>
              </ol>
            </div>
          ),
        },
        {
          question: 'What tools are available?',
          answer: (
            <div className="space-y-2">
              <p>9 tools across 3 categories:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Session (2)</strong> — Create and close cloud browser sessions</li>
                <li><strong>Browser Actions (5)</strong> — Navigate, act, extract, observe, screenshot</li>
                <li><strong>Advanced (2)</strong> — Get current URL, run autonomous AI agent</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'What is the autonomous agent?',
          answer: (
            <div className="space-y-2">
              <p>The <code className="bg-muted px-1 rounded">bb_agent</code> tool runs an AI agent that autonomously completes complex multi-step browser tasks. It requires a <strong>Gemini API Key</strong> and can handle tasks like:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Filling out multi-page forms</li>
                <li>Searching and comparing products across sites</li>
                <li>Navigating complex workflows</li>
              </ul>
            </div>
          ),
        },
      ],
    },
  ],
};
