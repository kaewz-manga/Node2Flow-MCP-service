/**
 * Gemini RAG File Search API Client
 * Uses API key authentication via query parameter
 */

import type {
  GeminiRagConfig,
  FileSearchStore,
  FileSearchStoreList,
  FileSearchDocument,
  FileSearchDocumentList,
  GeminiOperation,
  GenerateContentResponse,
  CustomMetadata,
  ChunkingConfig,
} from './types';

export class GeminiRagClient {
  private config: GeminiRagConfig;
  private fetcher: Fetcher | undefined;
  // Service binding uses origin URL (ignored by CF, but required for valid Request)
  private baseUrl = 'https://gemini-proxy/v1beta';
  private uploadUrl = 'https://gemini-proxy/upload/v1beta';
  // Fallback for when service binding is not available
  private httpBaseUrl = 'https://node2flow-gemini-proxy.suphakitm99.workers.dev/v1beta';
  private httpUploadUrl = 'https://node2flow-gemini-proxy.suphakitm99.workers.dev/upload/v1beta';

  constructor(config: GeminiRagConfig) {
    this.config = config;
    this.fetcher = config.fetcher;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const separator = path.includes('?') ? '&' : '?';
    const base = this.fetcher ? this.baseUrl : this.httpBaseUrl;
    const url = `${base}${path}${separator}key=${this.config.apiKey}`;

    const doFetch = this.fetcher
      ? (u: string, o: RequestInit) => this.fetcher!.fetch(u, o as Parameters<Fetcher['fetch']>[1])
      : fetch;
    const response = await doFetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${error}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  }

  // ========== Store Operations ==========

  async createStore(displayName: string): Promise<FileSearchStore> {
    return this.request('/fileSearchStores', {
      method: 'POST',
      body: JSON.stringify({ displayName }),
    });
  }

  async listStores(pageSize?: number, pageToken?: string): Promise<FileSearchStoreList> {
    const query = new URLSearchParams();
    if (pageSize) query.set('pageSize', String(pageSize));
    if (pageToken) query.set('pageToken', pageToken);
    const qs = query.toString();
    return this.request(`/fileSearchStores${qs ? `?${qs}` : ''}`);
  }

  async getStore(storeName: string): Promise<FileSearchStore> {
    return this.request(`/${storeName}`);
  }

  async deleteStore(storeName: string, force?: boolean): Promise<Record<string, unknown>> {
    const query = force ? '?force=true' : '';
    return this.request(`/${storeName}${query}`, { method: 'DELETE' });
  }

  // ========== Upload & Import ==========

  async uploadToStore(
    storeName: string,
    opts: {
      mimeType: string;
      content: string;
      displayName?: string;
      contentEncoding?: 'base64' | 'text';
      customMetadata?: CustomMetadata[];
      chunkingConfig?: ChunkingConfig;
    }
  ): Promise<GeminiOperation> {
    const boundary = '---n2f-boundary-' + Date.now();

    // Build metadata part
    const metadata: Record<string, unknown> = { mimeType: opts.mimeType };
    if (opts.displayName) metadata.displayName = opts.displayName;
    if (opts.customMetadata) metadata.customMetadata = opts.customMetadata;
    if (opts.chunkingConfig) metadata.chunkingConfig = opts.chunkingConfig;

    // Decode content
    let contentBytes: Uint8Array;
    if (opts.contentEncoding === 'base64') {
      const binaryStr = atob(opts.content);
      contentBytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        contentBytes[i] = binaryStr.charCodeAt(i);
      }
    } else {
      contentBytes = new TextEncoder().encode(opts.content);
    }

    // Build multipart body
    const metadataJson = JSON.stringify(metadata);
    const parts = [
      `--${boundary}\r\n`,
      'Content-Type: application/json\r\n\r\n',
      metadataJson,
      `\r\n--${boundary}\r\n`,
      `Content-Type: ${opts.mimeType}\r\n\r\n`,
    ];

    const prefix = new TextEncoder().encode(parts.join(''));
    const suffix = new TextEncoder().encode(`\r\n--${boundary}--`);

    const body = new Uint8Array(prefix.length + contentBytes.length + suffix.length);
    body.set(prefix, 0);
    body.set(contentBytes, prefix.length);
    body.set(suffix, prefix.length + contentBytes.length);

    const uploadBase = this.fetcher ? this.uploadUrl : this.httpUploadUrl;
    const url = `${uploadBase}/${storeName}:uploadToFileSearchStore?key=${this.config.apiKey}`;
    const doFetch = this.fetcher
      ? (u: string, o: RequestInit) => this.fetcher!.fetch(u, o as Parameters<Fetcher['fetch']>[1])
      : fetch;
    const response = await doFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: body,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini Upload Error (${response.status}): ${error}`);
    }

    return response.json();
  }

  async importFileToStore(
    storeName: string,
    opts: {
      fileName: string;
      customMetadata?: CustomMetadata[];
      chunkingConfig?: ChunkingConfig;
    }
  ): Promise<GeminiOperation> {
    const body: Record<string, unknown> = { fileName: opts.fileName };
    if (opts.customMetadata) body.customMetadata = opts.customMetadata;
    if (opts.chunkingConfig) body.chunkingConfig = opts.chunkingConfig;

    return this.request(`/${storeName}:importFile`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // ========== Operations ==========

  async getOperation(operationName: string): Promise<GeminiOperation> {
    return this.request(`/${operationName}`);
  }

  async getUploadOperation(operationName: string): Promise<GeminiOperation> {
    return this.request(`/${operationName}`);
  }

  // ========== Document Operations ==========

  async listDocuments(
    storeName: string,
    pageSize?: number,
    pageToken?: string
  ): Promise<FileSearchDocumentList> {
    const query = new URLSearchParams();
    if (pageSize) query.set('pageSize', String(pageSize));
    if (pageToken) query.set('pageToken', pageToken);
    const qs = query.toString();
    return this.request(`/${storeName}/documents${qs ? `?${qs}` : ''}`);
  }

  async getDocument(documentName: string): Promise<FileSearchDocument> {
    return this.request(`/${documentName}`);
  }

  async deleteDocument(
    documentName: string,
    force?: boolean
  ): Promise<Record<string, unknown>> {
    const query = force ? '?force=true' : '';
    return this.request(`/${documentName}${query}`, { method: 'DELETE' });
  }

  // ========== RAG Query ==========

  async ragQuery(opts: {
    query: string;
    storeNames: string[];
    model?: string;
    metadataFilter?: string;
  }): Promise<GenerateContentResponse> {
    const model = opts.model || 'gemini-2.5-flash-lite';
    const fileSearch: Record<string, unknown> = {
      fileSearchStoreNames: opts.storeNames,
    };
    if (opts.metadataFilter) {
      fileSearch.metadataFilter = opts.metadataFilter;
    }

    return this.request(`/models/${model}:generateContent`, {
      method: 'POST',
      body: JSON.stringify({
        contents: [{ parts: [{ text: opts.query }] }],
        tools: [{ fileSearch }],
      }),
    });
  }
}
