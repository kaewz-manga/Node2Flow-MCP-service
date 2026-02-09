import { BookOpen, Search, Database, FileText } from 'lucide-react';
import type { PluginContent } from '../registry';

export const notionOfficialContent: PluginContent = {
  tagline: 'Official Notion MCP Server',
  description: 'The official @notionhq/notion-mcp-server — 22 tools for managing pages, databases, blocks, comments, and users in your Notion workspace.',

  features: [
    {
      icon: <FileText className="h-6 w-6" />,
      title: 'Page Management',
      description: 'Create, retrieve, update, move, and delete pages. Manage page properties, icons, and cover images.',
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: 'Data Sources & Databases',
      description: 'Query data sources with filters and sorting. Create and update database schemas. Access legacy database APIs.',
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: 'Search & Blocks',
      description: 'Full-text search across pages and databases. Manage block content — append, update, and delete blocks.',
    },
  ],

  setupSteps: [
    {
      title: 'Deploy Notion MCP Server',
      description: 'Deploy @notionhq/notion-mcp-server on your server with NOTION_TOKEN configured.',
    },
  ],

  demoCode: `> Search for "Project Roadmap" in Notion

Found 2 results:

1. **Project Roadmap 2026** (page)
   Last edited: 2 hours ago

2. **Roadmap Database** (database)
   32 entries, 5 views`,

  externalDocUrl: 'https://github.com/makenotion/notion-mcp-server',

  quickStartSteps: [
    'Deploy @notionhq/notion-mcp-server on your server',
    'Add the server URL as a connection',
    'Copy the generated Service API key',
    'Start managing Notion via AI!',
  ],

  emptyConnectionCTA: 'Add your Notion MCP server connection',

  connectionGuide: (
    <>
      <p className="text-muted-foreground mb-4">
        Deploy the official Notion MCP server, then add it as a connection:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
        <li><strong className="text-foreground">Name:</strong> A friendly name</li>
        <li><strong className="text-foreground">MCP Server URL:</strong> Your deployed server URL</li>
        <li><strong className="text-foreground">Auth Token:</strong> Optional auth token</li>
      </ul>
    </>
  ),

  examplePrompts: [
    'Search for pages about project planning',
    'Create a new page in my Tasks database',
    'Get all comments on this page',
    'List all users in my workspace',
  ],

  mcpConfigName: 'notion-official',

  faqCategories: [
    {
      name: 'Notion (Official)',
      icon: <BookOpen className="h-5 w-5" />,
      items: [
        {
          question: 'What is the official Notion MCP server?',
          answer: (
            <div className="space-y-2">
              <p>The official MCP server by Notion (@notionhq/notion-mcp-server) provides 22 tools:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>3 user tools</strong> — Get user, list users, get bot info</li>
                <li><strong>5 page tools</strong> — Create, retrieve, update, move pages, get properties</li>
                <li><strong>5 block tools</strong> — Get, append, update, delete blocks</li>
                <li><strong>5 data source tools</strong> — Query, create, update data sources and templates</li>
                <li><strong>2 comment tools</strong> — Create and retrieve comments</li>
                <li><strong>1 search tool</strong> — Full-text search across workspace</li>
                <li><strong>1 database tool</strong> — Legacy database retrieval</li>
              </ul>
            </div>
          ),
        },
      ],
    },
  ],
};
