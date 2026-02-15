/**
 * GitHub Plugin - MCP Gateway
 * Auth: Personal Access Token (PAT) via Bearer auth
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { GitHubClient } from './client';

function ok(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data ?? { success: true }, null, 2) }], isError: false };
}

export const githubPlugin: MCPPlugin = {
  id: 'github',
  name: 'GitHub',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    return new GitHubClient({
      token: config.token as string,
      apiUrl: config.api_url as string | undefined,
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const gh = client as GitHubClient;

    try {
      switch (toolName) {
        // Repositories
        case 'github_search_repositories': return ok(await gh.searchRepositories(args.query as string, args.page as number | undefined, args.per_page as number | undefined));
        case 'github_create_repository':   return ok(await gh.createRepository(args.name as string, args.description as string | undefined, args.private as boolean | undefined));
        case 'github_fork_repository':     return ok(await gh.forkRepository(args.owner as string, args.repo as string, args.organization as string | undefined));
        case 'github_get_file_contents':   return ok(await gh.getFileContents(args.owner as string, args.repo as string, args.path as string, args.ref as string | undefined));
        case 'github_create_or_update_file': return ok(await gh.createOrUpdateFile(args.owner as string, args.repo as string, args.path as string, args.content as string, args.message as string, args.sha as string | undefined, args.branch as string | undefined));
        case 'github_push_files':          return ok(await gh.pushFiles(args.owner as string, args.repo as string, args.branch as string, args.files as Array<{ path: string; content: string }>, args.message as string));
        case 'github_list_commits':        return ok(await gh.listCommits(args.owner as string, args.repo as string, args.sha as string | undefined, args.page as number | undefined, args.per_page as number | undefined));

        // Branches
        case 'github_create_branch': return ok(await gh.createBranch(args.owner as string, args.repo as string, args.branch as string, args.from_branch as string | undefined));

        // Pull Requests
        case 'github_list_pull_requests':        return ok(await gh.listPullRequests(args.owner as string, args.repo as string, args.state as string | undefined, args.page as number | undefined, args.per_page as number | undefined));
        case 'github_create_pull_request':       return ok(await gh.createPullRequest(args.owner as string, args.repo as string, args.title as string, args.body as string, args.head as string, args.base as string));
        case 'github_get_pull_request':          return ok(await gh.getPullRequest(args.owner as string, args.repo as string, args.pull_number as number));
        case 'github_get_pull_request_comments': return ok(await gh.getPullRequestComments(args.owner as string, args.repo as string, args.pull_number as number));
        case 'github_get_pull_request_files':    return ok(await gh.getPullRequestFiles(args.owner as string, args.repo as string, args.pull_number as number));
        case 'github_get_pull_request_reviews':  return ok(await gh.getPullRequestReviews(args.owner as string, args.repo as string, args.pull_number as number));
        case 'github_get_pull_request_status':   return ok(await gh.getPullRequestStatus(args.owner as string, args.repo as string, args.pull_number as number));
        case 'github_merge_pull_request':        return ok(await gh.mergePullRequest(args.owner as string, args.repo as string, args.pull_number as number, args.merge_method as string | undefined));
        case 'github_update_pull_request_branch': return ok(await gh.updatePullRequestBranch(args.owner as string, args.repo as string, args.pull_number as number));
        case 'github_create_pull_request_review': return ok(await gh.createPullRequestReview(args.owner as string, args.repo as string, args.pull_number as number, args.body as string, args.event as string));

        // Issues
        case 'github_list_issues':      return ok(await gh.listIssues(args.owner as string, args.repo as string, args.state as string | undefined, args.labels as string | undefined, args.page as number | undefined, args.per_page as number | undefined));
        case 'github_get_issue':        return ok(await gh.getIssue(args.owner as string, args.repo as string, args.issue_number as number));
        case 'github_create_issue':     return ok(await gh.createIssue(args.owner as string, args.repo as string, args.title as string, args.body as string | undefined, args.labels as string[] | undefined, args.assignees as string[] | undefined));
        case 'github_update_issue':     return ok(await gh.updateIssue(args.owner as string, args.repo as string, args.issue_number as number, args));
        case 'github_add_issue_comment': return ok(await gh.addIssueComment(args.owner as string, args.repo as string, args.issue_number as number, args.body as string));

        // Search
        case 'github_search_code':   return ok(await gh.searchCode(args.query as string, args.page as number | undefined, args.per_page as number | undefined));
        case 'github_search_issues': return ok(await gh.searchIssues(args.query as string, args.page as number | undefined, args.per_page as number | undefined));
        case 'github_search_users':  return ok(await gh.searchUsers(args.query as string, args.page as number | undefined, args.per_page as number | undefined));

        default:
          return { content: [{ type: 'text' as const, text: `Unknown tool: ${toolName}` }], isError: true };
      }
    } catch (error) {
      return { content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
    }
  },
};
