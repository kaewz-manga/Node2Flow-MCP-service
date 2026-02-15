/**
 * MCP Tool Definitions (26 tools)
 * GitHub repository, pull request, issue, branch, and search management
 * Auth: Personal Access Token (PAT) via Bearer auth
 */

import type { MCPToolDefinition } from '../../types';

export const TOOLS: MCPToolDefinition[] = [
  // ========== Repository Tools (7) ==========
  {
    name: 'github_search_repositories',
    description: 'Search GitHub repositories by keyword, language, topic, or owner. Returns repository name, description, stars, language, and URL. Use GitHub search syntax like "language:typescript stars:>1000" for advanced filtering.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query using GitHub search syntax (e.g. "n8n language:typescript", "org:facebook react")' },
        page: { type: 'number', description: 'Page number for pagination (default: 1)' },
        per_page: { type: 'number', description: 'Results per page, max 100 (default: 30)' },
      },
      required: ['query'],
    },
    annotations: {
      title: 'Search Repositories',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'github_create_repository',
    description: 'Create a new GitHub repository under the authenticated user account. Optionally set description and visibility. Returns the created repository with clone URL and default branch.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Repository name (e.g. "my-project")' },
        description: { type: 'string', description: 'Short description of the repository (optional)' },
        private: { type: 'boolean', description: 'Create as private repository (default: false)' },
      },
      required: ['name'],
    },
    annotations: {
      title: 'Create Repository',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'github_fork_repository',
    description: 'Fork a repository to your account or a specified organization. Creates an independent copy for contribution or customization. Returns the forked repository details.',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner (user or org)' },
        repo: { type: 'string', description: 'Repository name' },
        organization: { type: 'string', description: 'Fork to this organization instead of your account (optional)' },
      },
      required: ['owner', 'repo'],
    },
    annotations: {
      title: 'Fork Repository',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'github_get_file_contents',
    description: 'Get file or directory contents from a repository. Returns file content (base64-encoded for files), size, and SHA. For directories, returns array of entries. Use ref parameter to read from specific branch or commit.',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner (user or org)' },
        repo: { type: 'string', description: 'Repository name' },
        path: { type: 'string', description: 'File or directory path (e.g. "src/index.ts", "docs/")' },
        ref: { type: 'string', description: 'Branch name, tag, or commit SHA (default: default branch)' },
      },
      required: ['owner', 'repo', 'path'],
    },
    annotations: {
      title: 'Get File Contents',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'github_create_or_update_file',
    description: 'Create a new file or update an existing file in a repository. Content is provided as plain text (automatically base64-encoded). For updates, provide the current file SHA to prevent conflicts. Returns commit details.',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner (user or org)' },
        repo: { type: 'string', description: 'Repository name' },
        path: { type: 'string', description: 'File path to create or update (e.g. "src/config.ts")' },
        content: { type: 'string', description: 'File content as plain text' },
        message: { type: 'string', description: 'Commit message describing the change' },
        sha: { type: 'string', description: 'Current file SHA (required for updates, get from get_file_contents)' },
        branch: { type: 'string', description: 'Target branch (default: default branch)' },
      },
      required: ['owner', 'repo', 'path', 'content', 'message'],
    },
    annotations: {
      title: 'Create or Update File',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'github_push_files',
    description: 'Push multiple files to a repository in a single commit using the Git tree API. Efficient for batch file operations. Each file needs a path and content. Creates a new commit on the specified branch.',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner (user or org)' },
        repo: { type: 'string', description: 'Repository name' },
        branch: { type: 'string', description: 'Target branch name (e.g. "main", "feature/update")' },
        files: {
          type: 'array',
          description: 'Array of files to push',
          items: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'File path relative to repo root' },
              content: { type: 'string', description: 'File content as plain text' },
            },
            required: ['path', 'content'],
          },
        },
        message: { type: 'string', description: 'Commit message for all files' },
      },
      required: ['owner', 'repo', 'branch', 'files', 'message'],
    },
    annotations: {
      title: 'Push Files',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'github_list_commits',
    description: 'List commits on a repository branch. Returns commit SHA, message, author, and date. Use sha parameter to list commits on a specific branch. Supports pagination for large histories.',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner (user or org)' },
        repo: { type: 'string', description: 'Repository name' },
        sha: { type: 'string', description: 'Branch name or commit SHA to list from (default: default branch)' },
        page: { type: 'number', description: 'Page number for pagination (default: 1)' },
        per_page: { type: 'number', description: 'Results per page, max 100 (default: 30)' },
      },
      required: ['owner', 'repo'],
    },
    annotations: {
      title: 'List Commits',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },

  // ========== Branch Tools (1) ==========
  {
    name: 'github_create_branch',
    description: 'Create a new branch from an existing branch. Uses the Git refs API to create a branch pointing to the same commit as the source branch. Defaults to creating from "main" if from_branch is not specified.',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner (user or org)' },
        repo: { type: 'string', description: 'Repository name' },
        branch: { type: 'string', description: 'New branch name (e.g. "feature/my-feature")' },
        from_branch: { type: 'string', description: 'Source branch to create from (default: "main")' },
      },
      required: ['owner', 'repo', 'branch'],
    },
    annotations: {
      title: 'Create Branch',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },

  // ========== Pull Request Tools (8) ==========
  {
    name: 'github_list_pull_requests',
    description: 'List pull requests on a repository filtered by state. Returns PR number, title, author, base/head branches, and status. Use state parameter to filter open, closed, or all PRs.',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner (user or org)' },
        repo: { type: 'string', description: 'Repository name' },
        state: { type: 'string', enum: ['open', 'closed', 'all'], description: 'Filter by PR state (default: "open")' },
        page: { type: 'number', description: 'Page number for pagination (default: 1)' },
        per_page: { type: 'number', description: 'Results per page, max 100 (default: 30)' },
      },
      required: ['owner', 'repo'],
    },
    annotations: {
      title: 'List Pull Requests',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'github_create_pull_request',
    description: 'Create a new pull request to merge changes from head branch into base branch. Provide title, description body, and branch names. Returns PR number and URL for review.',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner (user or org)' },
        repo: { type: 'string', description: 'Repository name' },
        title: { type: 'string', description: 'Pull request title' },
        body: { type: 'string', description: 'Pull request description (supports Markdown)' },
        head: { type: 'string', description: 'Branch containing changes (e.g. "feature/my-feature")' },
        base: { type: 'string', description: 'Branch to merge into (e.g. "main")' },
      },
      required: ['owner', 'repo', 'title', 'body', 'head', 'base'],
    },
    annotations: {
      title: 'Create Pull Request',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'github_get_pull_request',
    description: 'Get detailed information about a specific pull request including title, body, diff stats, mergeable status, and review state. Returns complete PR metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner (user or org)' },
        repo: { type: 'string', description: 'Repository name' },
        pull_number: { type: 'number', description: 'Pull request number' },
      },
      required: ['owner', 'repo', 'pull_number'],
    },
    annotations: {
      title: 'Get Pull Request',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'github_get_pull_request_comments',
    description: 'Get all comments on a pull request (issue comments, not review comments). Returns comment body, author, and timestamps. Use this to read discussion history on a PR.',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner (user or org)' },
        repo: { type: 'string', description: 'Repository name' },
        pull_number: { type: 'number', description: 'Pull request number' },
      },
      required: ['owner', 'repo', 'pull_number'],
    },
    annotations: {
      title: 'Get PR Comments',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'github_get_pull_request_files',
    description: 'List files changed in a pull request with additions, deletions, and patch data. Returns filename, status (added/modified/removed), and diff statistics. Use this to review scope of changes.',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner (user or org)' },
        repo: { type: 'string', description: 'Repository name' },
        pull_number: { type: 'number', description: 'Pull request number' },
      },
      required: ['owner', 'repo', 'pull_number'],
    },
    annotations: {
      title: 'Get PR Files',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'github_get_pull_request_reviews',
    description: 'Get all reviews submitted on a pull request. Returns reviewer, review state (approved/changes_requested/commented), and review body. Use this to check approval status before merging.',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner (user or org)' },
        repo: { type: 'string', description: 'Repository name' },
        pull_number: { type: 'number', description: 'Pull request number' },
      },
      required: ['owner', 'repo', 'pull_number'],
    },
    annotations: {
      title: 'Get PR Reviews',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'github_get_pull_request_status',
    description: 'Get CI/CD check status for a pull request. Returns combined commit status and check run results. Use this to verify all checks pass before merging.',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner (user or org)' },
        repo: { type: 'string', description: 'Repository name' },
        pull_number: { type: 'number', description: 'Pull request number' },
      },
      required: ['owner', 'repo', 'pull_number'],
    },
    annotations: {
      title: 'Get PR Status',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'github_merge_pull_request',
    description: 'Merge an approved pull request into the base branch. Supports merge commit, squash, or rebase strategies. Fails if PR has conflicts or required checks are not passing.',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner (user or org)' },
        repo: { type: 'string', description: 'Repository name' },
        pull_number: { type: 'number', description: 'Pull request number to merge' },
        merge_method: { type: 'string', enum: ['merge', 'squash', 'rebase'], description: 'Merge strategy (default: "merge")' },
      },
      required: ['owner', 'repo', 'pull_number'],
    },
    annotations: {
      title: 'Merge Pull Request',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'github_update_pull_request_branch',
    description: 'Update a pull request branch with the latest changes from the base branch. Equivalent to clicking "Update branch" button on GitHub. Use this to resolve conflicts or bring PR up to date.',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner (user or org)' },
        repo: { type: 'string', description: 'Repository name' },
        pull_number: { type: 'number', description: 'Pull request number' },
      },
      required: ['owner', 'repo', 'pull_number'],
    },
    annotations: {
      title: 'Update PR Branch',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'github_create_pull_request_review',
    description: 'Submit a review on a pull request. Provide review body and event type: APPROVE to approve, REQUEST_CHANGES to request changes, or COMMENT for general feedback.',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner (user or org)' },
        repo: { type: 'string', description: 'Repository name' },
        pull_number: { type: 'number', description: 'Pull request number' },
        body: { type: 'string', description: 'Review comment body (supports Markdown)' },
        event: { type: 'string', enum: ['APPROVE', 'REQUEST_CHANGES', 'COMMENT'], description: 'Review action: APPROVE, REQUEST_CHANGES, or COMMENT' },
      },
      required: ['owner', 'repo', 'pull_number', 'body', 'event'],
    },
    annotations: {
      title: 'Create PR Review',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },

  // ========== Issue Tools (5) ==========
  {
    name: 'github_list_issues',
    description: 'List issues on a repository filtered by state and labels. Returns issue number, title, author, labels, and assignees. Note: pull requests are also returned as issues by the GitHub API.',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner (user or org)' },
        repo: { type: 'string', description: 'Repository name' },
        state: { type: 'string', enum: ['open', 'closed', 'all'], description: 'Filter by issue state (default: "open")' },
        labels: { type: 'string', description: 'Filter by label names (comma-separated, e.g. "bug,priority")' },
        page: { type: 'number', description: 'Page number for pagination (default: 1)' },
        per_page: { type: 'number', description: 'Results per page, max 100 (default: 30)' },
      },
      required: ['owner', 'repo'],
    },
    annotations: {
      title: 'List Issues',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'github_get_issue',
    description: 'Get detailed information about a specific issue including title, body, labels, assignees, milestone, and timeline. Returns complete issue metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner (user or org)' },
        repo: { type: 'string', description: 'Repository name' },
        issue_number: { type: 'number', description: 'Issue number' },
      },
      required: ['owner', 'repo', 'issue_number'],
    },
    annotations: {
      title: 'Get Issue',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'github_create_issue',
    description: 'Create a new issue on a repository with title, body, labels, and assignees. Returns the created issue number and URL. Use labels for categorization and assignees for task assignment.',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner (user or org)' },
        repo: { type: 'string', description: 'Repository name' },
        title: { type: 'string', description: 'Issue title' },
        body: { type: 'string', description: 'Issue description (supports Markdown, optional)' },
        labels: { type: 'array', items: { type: 'string' }, description: 'Array of label names to apply (optional)' },
        assignees: { type: 'array', items: { type: 'string' }, description: 'Array of GitHub usernames to assign (optional)' },
      },
      required: ['owner', 'repo', 'title'],
    },
    annotations: {
      title: 'Create Issue',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'github_update_issue',
    description: 'Update an existing issue. Modify title, body, state, labels, assignees, or milestone. Use state "closed" to close an issue. Only provided fields are updated.',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner (user or org)' },
        repo: { type: 'string', description: 'Repository name' },
        issue_number: { type: 'number', description: 'Issue number to update' },
        title: { type: 'string', description: 'New title (optional)' },
        body: { type: 'string', description: 'New description (optional)' },
        state: { type: 'string', enum: ['open', 'closed'], description: 'Issue state (optional)' },
        labels: { type: 'array', items: { type: 'string' }, description: 'Replace all labels (optional)' },
        assignees: { type: 'array', items: { type: 'string' }, description: 'Replace all assignees (optional)' },
      },
      required: ['owner', 'repo', 'issue_number'],
    },
    annotations: {
      title: 'Update Issue',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'github_add_issue_comment',
    description: 'Add a comment to an existing issue or pull request. Supports Markdown formatting. Returns the created comment with ID and URL.',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner (user or org)' },
        repo: { type: 'string', description: 'Repository name' },
        issue_number: { type: 'number', description: 'Issue or pull request number' },
        body: { type: 'string', description: 'Comment body (supports Markdown)' },
      },
      required: ['owner', 'repo', 'issue_number', 'body'],
    },
    annotations: {
      title: 'Add Issue Comment',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },

  // ========== Search Tools (3) ==========
  {
    name: 'github_search_code',
    description: 'Search code across GitHub repositories. Returns file path, repository, and matching line highlights. Use qualifiers like "repo:owner/name", "language:python", "filename:config" for precise results.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query with optional qualifiers (e.g. "addClass repo:jquery/jquery", "filename:package.json express")' },
        page: { type: 'number', description: 'Page number for pagination (default: 1)' },
        per_page: { type: 'number', description: 'Results per page, max 100 (default: 30)' },
      },
      required: ['query'],
    },
    annotations: {
      title: 'Search Code',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'github_search_issues',
    description: 'Search issues and pull requests across GitHub. Returns issue/PR number, title, state, and repository. Use qualifiers like "repo:owner/name", "is:open", "label:bug" for filtering.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query with optional qualifiers (e.g. "memory leak repo:node/node is:open", "label:bug is:closed")' },
        page: { type: 'number', description: 'Page number for pagination (default: 1)' },
        per_page: { type: 'number', description: 'Results per page, max 100 (default: 30)' },
      },
      required: ['query'],
    },
    annotations: {
      title: 'Search Issues',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'github_search_users',
    description: 'Search GitHub users and organizations by username, name, or bio. Returns login, name, avatar URL, and profile info. Use qualifiers like "type:org", "location:tokyo", "followers:>1000".',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query with optional qualifiers (e.g. "tom type:user location:san+francisco", "anthropic type:org")' },
        page: { type: 'number', description: 'Page number for pagination (default: 1)' },
        per_page: { type: 'number', description: 'Results per page, max 100 (default: 30)' },
      },
      required: ['query'],
    },
    annotations: {
      title: 'Search Users',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
];
