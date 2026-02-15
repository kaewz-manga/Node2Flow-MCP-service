/**
 * GitHub Plugin Content
 * All GitHub-specific content used by global pages (Landing, Dashboard, Documentation, FAQ).
 */

import { GitBranch, Search, Code, GitPullRequest } from 'lucide-react';
import type { PluginContent } from '../registry';

export const githubContent: PluginContent = {
  // ============================================
  // Landing Page
  // ============================================

  tagline: 'Manage GitHub Repositories with AI',
  description:
    'Search, create, and manage repositories, pull requests, issues, branches, and code through the GitHub REST API.',

  features: [
    {
      icon: <GitBranch className="h-6 w-6" />,
      title: 'Repository & Branch Management',
      description:
        'Search repos, create new ones, fork existing projects, manage branches, push files, and view commit history.',
    },
    {
      icon: <GitPullRequest className="h-6 w-6" />,
      title: 'Pull Requests & Reviews',
      description:
        'Create, review, merge PRs. View diffs, comments, CI status, and submit approvals or change requests.',
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: 'Issues & Search',
      description:
        'Create and manage issues with labels and assignees. Search code, issues, and users across all of GitHub.',
    },
  ],

  setupSteps: [
    {
      title: 'Create a Personal Access Token',
      description:
        'Go to GitHub Settings > Developer Settings > Personal Access Tokens > Fine-grained tokens. Create a token with the scopes you need (repos, issues, PRs).',
    },
  ],

  demoCode: `> Search for MCP server repositories

Found 142 repositories:
1. anthropics/mcp-servers (★ 12,450)
2. node2flow-th/n8n-management-mcp (★ 89)
...

> Create a new issue on my project

Created issue #42: "Add dark mode support"
Labels: enhancement, ui
Assignee: @kaewz-manga

> List open pull requests

3 open PRs:
- #41 "Fix auth bug" (ready to merge, 2 approvals)
- #40 "Add tests" (changes requested)
- #39 "Update deps" (CI pending)

> Merge PR #41

Merged PR #41 into main (squash merge)`,

  externalDocUrl: 'https://docs.github.com/en/rest',

  // ============================================
  // Dashboard
  // ============================================

  quickStartSteps: [
    'Create a Personal Access Token on GitHub',
    'Add a connection with your token',
    'Copy the generated API key',
    'Search repos, manage PRs, and create issues with AI!',
  ],

  emptyConnectionCTA: 'Add your first GitHub connection',

  // ============================================
  // Documentation
  // ============================================

  connectionGuide: (
    <>
      <p className="text-muted-foreground mb-4">
        Go to <strong>Connections</strong> and add your GitHub credentials:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
        <li>
          <strong className="text-foreground">Name:</strong> A friendly name (e.g., "My GitHub")
        </li>
        <li>
          <strong className="text-foreground">Personal Access Token:</strong> From GitHub Settings &gt; Developer Settings &gt; Personal Access Tokens
        </li>
      </ul>
      <p className="text-muted-foreground">
        Use <strong>fine-grained tokens</strong> for better security — only grant the permissions you need.
      </p>
    </>
  ),

  examplePrompts: [
    'Search for TypeScript MCP server repositories',
    'Create a new issue titled "Add dark mode" on my-repo',
    'List all open pull requests on my project',
    'Get the CI status of PR #42',
    'Merge pull request #41 with squash strategy',
    'Search for code containing "handleToolCall" in my org',
  ],

  mcpConfigName: 'github',

  // ============================================
  // FAQ
  // ============================================

  faqCategories: [
    {
      name: 'GitHub',
      icon: <Code className="h-5 w-5" />,
      items: [
        {
          question: 'What type of token do I need?',
          answer: (
            <div className="space-y-2">
              <p>You need a <strong>Personal Access Token (PAT)</strong>:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Go to <strong>GitHub Settings</strong> &gt; Developer Settings</li>
                <li>Choose <strong>Fine-grained tokens</strong> (recommended) or Classic tokens</li>
                <li>Grant permissions for repositories, issues, and pull requests</li>
              </ol>
            </div>
          ),
        },
        {
          question: 'What tools are available?',
          answer: (
            <div className="space-y-2">
              <p>26 tools across 5 categories:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Repositories (7)</strong> — Search, create, fork, get files, push files, list commits</li>
                <li><strong>Branches (1)</strong> — Create branches from any source</li>
                <li><strong>Pull Requests (8)</strong> — Create, list, review, merge, update, get status</li>
                <li><strong>Issues (5)</strong> — Create, list, update, comment on issues</li>
                <li><strong>Search (3)</strong> — Search code, issues, and users across GitHub</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'Can I use GitHub Enterprise?',
          answer: (
            <div className="space-y-2">
              <p>Yes! The API URL defaults to <code className="bg-muted px-1 rounded">api.github.com</code>, but you can configure a custom URL for GitHub Enterprise in your connection settings.</p>
            </div>
          ),
        },
      ],
    },
  ],
};
