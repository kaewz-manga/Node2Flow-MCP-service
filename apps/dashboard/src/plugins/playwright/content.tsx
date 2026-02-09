import { Globe, MousePointer, Camera, Code } from 'lucide-react';
import type { PluginContent } from '../registry';

export const playwrightContent: PluginContent = {
  tagline: 'AI-Powered Browser Automation',
  description: 'The official @playwright/mcp server — 22 tools for navigating web pages, clicking elements, filling forms, taking screenshots, and running JavaScript in the browser.',

  features: [
    {
      icon: <Globe className="h-6 w-6" />,
      title: 'Web Navigation',
      description: 'Navigate to URLs, go back/forward, manage tabs, and wait for page elements to appear.',
    },
    {
      icon: <MousePointer className="h-6 w-6" />,
      title: 'Page Interaction',
      description: 'Click elements, fill forms, select options, drag and drop, upload files, and handle dialogs.',
    },
    {
      icon: <Camera className="h-6 w-6" />,
      title: 'Screenshots & Snapshots',
      description: 'Take screenshots, capture accessibility snapshots, monitor console messages and network requests.',
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: 'JavaScript Execution',
      description: 'Run arbitrary JavaScript in the browser, evaluate expressions, and execute automation scripts.',
    },
  ],

  setupSteps: [
    {
      title: 'Deploy Playwright MCP Server',
      description: 'Deploy @playwright/mcp on your server with Chromium installed for headless browser automation.',
    },
  ],

  demoCode: `> Navigate to https://example.com and take a screenshot

Navigated to https://example.com

Page title: "Example Domain"

Screenshot saved (1280x720)

> Click the "More information..." link

Clicked "More information..." link
Navigated to https://www.iana.org/help/example-domains`,

  externalDocUrl: 'https://github.com/niccokunzmann/mcp-playwright',

  quickStartSteps: [
    'Deploy @playwright/mcp on your server with Chromium',
    'Add the server URL as a connection',
    'Copy the generated Service API key',
    'Start automating browsers via AI!',
  ],

  emptyConnectionCTA: 'Add your Playwright MCP server connection',

  connectionGuide: (
    <>
      <p className="text-muted-foreground mb-4">
        Deploy the Playwright MCP server, then add it as a connection:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
        <li><strong className="text-foreground">Name:</strong> A friendly name</li>
        <li><strong className="text-foreground">MCP Server URL:</strong> Your deployed server URL</li>
        <li><strong className="text-foreground">Auth Token:</strong> Optional auth token for your server</li>
      </ul>
    </>
  ),

  examplePrompts: [
    'Navigate to google.com and search for "n8n automation"',
    'Take a screenshot of the current page',
    'Fill in the login form with my credentials',
    'Click the submit button and wait for the page to load',
  ],

  mcpConfigName: 'playwright',

  faqCategories: [
    {
      name: 'Browser Automation',
      icon: <Globe className="h-5 w-5" />,
      items: [
        {
          question: 'What is the Playwright MCP server?',
          answer: (
            <div className="space-y-2">
              <p>The official Playwright MCP server provides 22 browser automation tools:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Navigation</strong> — Navigate, go back, manage tabs, wait for elements</li>
                <li><strong>Interaction</strong> — Click, type, fill forms, select options, hover, drag</li>
                <li><strong>Files & Dialogs</strong> — Upload files, handle browser dialogs</li>
                <li><strong>Capture</strong> — Screenshots, accessibility snapshots, console logs, network requests</li>
                <li><strong>Code</strong> — Run JavaScript, evaluate expressions, execute automation scripts</li>
                <li><strong>Browser</strong> — Resize window, close browser, install browsers</li>
              </ul>
            </div>
          ),
        },
      ],
    },
  ],
};
