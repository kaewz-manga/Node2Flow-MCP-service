/**
 * GitHub API Client
 * Wrapper for GitHub REST API v3 calls with error handling and timeout
 * Auth: Personal Access Token (PAT) with Bearer auth
 */

import { GitHubConfig } from './types';

export class GitHubClient {
  private token: string;
  private apiUrl: string;
  private timeout: number;

  constructor(config: GitHubConfig) {
    this.token = config.token;
    this.apiUrl = (config.apiUrl || 'https://api.github.com').replace(/\/+$/, '');
    this.timeout = 30000;
  }

  /**
   * Make authenticated request to GitHub API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(this.timeout),
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API Error (${response.status}): ${error}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  // ========== Repository Methods (7) ==========

  async searchRepositories(query: string, page?: number, perPage?: number) {
    const params = new URLSearchParams({ q: query });
    if (page) params.set('page', String(page));
    if (perPage) params.set('per_page', String(perPage));
    return this.request(`/search/repositories?${params.toString()}`, { method: 'GET' });
  }

  async createRepository(name: string, description?: string, isPrivate?: boolean) {
    return this.request('/user/repos', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description: description || '',
        private: isPrivate || false,
      }),
    });
  }

  async forkRepository(owner: string, repo: string, organization?: string) {
    const body: Record<string, unknown> = {};
    if (organization) body.organization = organization;
    return this.request(`/repos/${owner}/${repo}/forks`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getFileContents(owner: string, repo: string, path: string, ref?: string) {
    const params = new URLSearchParams();
    if (ref) params.set('ref', ref);
    const qs = params.toString();
    return this.request(`/repos/${owner}/${repo}/contents/${path}${qs ? `?${qs}` : ''}`, { method: 'GET' });
  }

  async createOrUpdateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    sha?: string,
    branch?: string
  ) {
    const body: Record<string, unknown> = {
      message,
      content: btoa(content),
    };
    if (sha) body.sha = sha;
    if (branch) body.branch = branch;
    return this.request(`/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async pushFiles(
    owner: string,
    repo: string,
    branch: string,
    files: Array<{ path: string; content: string }>,
    message: string
  ) {
    // 1. Get current ref
    const ref = await this.request<any>(`/repos/${owner}/${repo}/git/ref/heads/${branch}`, { method: 'GET' });
    const latestSha = ref.object.sha;

    // 2. Get current commit to find tree sha
    const commit = await this.request<any>(`/repos/${owner}/${repo}/git/commits/${latestSha}`, { method: 'GET' });
    const treeSha = commit.tree.sha;

    // 3. Create blobs for each file
    const tree = [];
    for (const file of files) {
      const blob = await this.request<any>(`/repos/${owner}/${repo}/git/blobs`, {
        method: 'POST',
        body: JSON.stringify({
          content: file.content,
          encoding: 'utf-8',
        }),
      });
      tree.push({
        path: file.path,
        mode: '100644' as const,
        type: 'blob' as const,
        sha: blob.sha,
      });
    }

    // 4. Create new tree
    const newTree = await this.request<any>(`/repos/${owner}/${repo}/git/trees`, {
      method: 'POST',
      body: JSON.stringify({
        base_tree: treeSha,
        tree,
      }),
    });

    // 5. Create new commit
    const newCommit = await this.request<any>(`/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      body: JSON.stringify({
        message,
        tree: newTree.sha,
        parents: [latestSha],
      }),
    });

    // 6. Update ref
    return this.request(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: newCommit.sha }),
    });
  }

  async listCommits(owner: string, repo: string, sha?: string, page?: number, perPage?: number) {
    const params = new URLSearchParams();
    if (sha) params.set('sha', sha);
    if (page) params.set('page', String(page));
    if (perPage) params.set('per_page', String(perPage));
    const qs = params.toString();
    return this.request(`/repos/${owner}/${repo}/commits${qs ? `?${qs}` : ''}`, { method: 'GET' });
  }

  // ========== Branch Methods (1) ==========

  async createBranch(owner: string, repo: string, branch: string, fromBranch?: string) {
    // 1. Get sha of source branch
    const source = fromBranch || 'main';
    const ref = await this.request<any>(`/repos/${owner}/${repo}/git/ref/heads/${source}`, { method: 'GET' });

    // 2. Create new branch ref
    return this.request(`/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      body: JSON.stringify({
        ref: `refs/heads/${branch}`,
        sha: ref.object.sha,
      }),
    });
  }

  // ========== Pull Request Methods (8) ==========

  async listPullRequests(owner: string, repo: string, state?: string, page?: number, perPage?: number) {
    const params = new URLSearchParams();
    if (state) params.set('state', state);
    if (page) params.set('page', String(page));
    if (perPage) params.set('per_page', String(perPage));
    const qs = params.toString();
    return this.request(`/repos/${owner}/${repo}/pulls${qs ? `?${qs}` : ''}`, { method: 'GET' });
  }

  async createPullRequest(owner: string, repo: string, title: string, body: string, head: string, base: string) {
    return this.request(`/repos/${owner}/${repo}/pulls`, {
      method: 'POST',
      body: JSON.stringify({ title, body, head, base }),
    });
  }

  async getPullRequest(owner: string, repo: string, pullNumber: number) {
    return this.request(`/repos/${owner}/${repo}/pulls/${pullNumber}`, { method: 'GET' });
  }

  async getPullRequestComments(owner: string, repo: string, pullNumber: number) {
    return this.request(`/repos/${owner}/${repo}/issues/${pullNumber}/comments`, { method: 'GET' });
  }

  async getPullRequestFiles(owner: string, repo: string, pullNumber: number) {
    return this.request(`/repos/${owner}/${repo}/pulls/${pullNumber}/files`, { method: 'GET' });
  }

  async getPullRequestReviews(owner: string, repo: string, pullNumber: number) {
    return this.request(`/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`, { method: 'GET' });
  }

  async getPullRequestStatus(owner: string, repo: string, pullNumber: number) {
    // Get combined status from the PR's head commit
    const pr = await this.request<any>(`/repos/${owner}/${repo}/pulls/${pullNumber}`, { method: 'GET' });
    const sha = pr.head.sha;
    const status = await this.request(`/repos/${owner}/${repo}/commits/${sha}/status`, { method: 'GET' });
    const checks = await this.request(`/repos/${owner}/${repo}/commits/${sha}/check-runs`, { method: 'GET' });
    return { status, checks };
  }

  async mergePullRequest(owner: string, repo: string, pullNumber: number, mergeMethod?: string) {
    return this.request(`/repos/${owner}/${repo}/pulls/${pullNumber}/merge`, {
      method: 'PUT',
      body: JSON.stringify({
        merge_method: mergeMethod || 'merge',
      }),
    });
  }

  async updatePullRequestBranch(owner: string, repo: string, pullNumber: number) {
    return this.request(`/repos/${owner}/${repo}/pulls/${pullNumber}/update-branch`, {
      method: 'PUT',
      body: JSON.stringify({}),
    });
  }

  async createPullRequestReview(owner: string, repo: string, pullNumber: number, body: string, event: string) {
    return this.request(`/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ body, event }),
    });
  }

  // ========== Issue Methods (5) ==========

  async listIssues(owner: string, repo: string, state?: string, labels?: string, page?: number, perPage?: number) {
    const params = new URLSearchParams();
    if (state) params.set('state', state);
    if (labels) params.set('labels', labels);
    if (page) params.set('page', String(page));
    if (perPage) params.set('per_page', String(perPage));
    const qs = params.toString();
    return this.request(`/repos/${owner}/${repo}/issues${qs ? `?${qs}` : ''}`, { method: 'GET' });
  }

  async getIssue(owner: string, repo: string, issueNumber: number) {
    return this.request(`/repos/${owner}/${repo}/issues/${issueNumber}`, { method: 'GET' });
  }

  async createIssue(
    owner: string,
    repo: string,
    title: string,
    body?: string,
    labels?: string[],
    assignees?: string[]
  ) {
    const payload: Record<string, unknown> = { title };
    if (body) payload.body = body;
    if (labels) payload.labels = labels;
    if (assignees) payload.assignees = assignees;
    return this.request(`/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateIssue(owner: string, repo: string, issueNumber: number, updates: Record<string, unknown>) {
    return this.request(`/repos/${owner}/${repo}/issues/${issueNumber}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async addIssueComment(owner: string, repo: string, issueNumber: number, body: string) {
    return this.request(`/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
  }

  // ========== Search Methods (3) ==========

  async searchCode(query: string, page?: number, perPage?: number) {
    const params = new URLSearchParams({ q: query });
    if (page) params.set('page', String(page));
    if (perPage) params.set('per_page', String(perPage));
    return this.request(`/search/code?${params.toString()}`, { method: 'GET' });
  }

  async searchIssues(query: string, page?: number, perPage?: number) {
    const params = new URLSearchParams({ q: query });
    if (page) params.set('page', String(page));
    if (perPage) params.set('per_page', String(perPage));
    return this.request(`/search/issues?${params.toString()}`, { method: 'GET' });
  }

  async searchUsers(query: string, page?: number, perPage?: number) {
    const params = new URLSearchParams({ q: query });
    if (page) params.set('page', String(page));
    if (perPage) params.set('per_page', String(perPage));
    return this.request(`/search/users?${params.toString()}`, { method: 'GET' });
  }
}
