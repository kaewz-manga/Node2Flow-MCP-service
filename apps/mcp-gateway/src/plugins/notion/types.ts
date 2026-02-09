/**
 * Notion MCP Plugin - Type Definitions
 * Matches official @notionhq/notion-mcp-server v2.1.0
 * API Version: 2025-09-03
 */

export interface NotionConfig {
  apiKey: string;
}

// --- Parent ---

export interface NotionParent {
  type: string;
  database_id?: string;
  data_source_id?: string;
  page_id?: string;
  workspace?: boolean;
  block_id?: string;
}

// --- Page ---

export interface NotionPage {
  object: 'page';
  id: string;
  created_time: string;
  last_edited_time: string;
  archived: boolean;
  in_trash: boolean;
  parent: NotionParent;
  properties: Record<string, unknown>;
  icon?: unknown;
  cover?: unknown;
  url: string;
}

// --- Block ---

export interface NotionBlock {
  object: 'block';
  id: string;
  type: string;
  created_time: string;
  last_edited_time: string;
  archived: boolean;
  in_trash: boolean;
  has_children: boolean;
  parent: NotionParent;
  [key: string]: unknown;
}

// --- Data Source (2025-09-03) ---

export interface NotionDataSource {
  object: 'data_source';
  id: string;
  title: unknown[];
  properties: Record<string, unknown>;
  created_time: string;
  last_edited_time: string;
  parent: { type: 'database'; database_id: string };
}

// --- Database ---

export interface NotionDatabase {
  object: 'database';
  id: string;
  title: unknown[];
  properties: Record<string, unknown>;
  created_time: string;
  last_edited_time: string;
  archived: boolean;
  url: string;
}

// --- Comment ---

export interface NotionComment {
  object: 'comment';
  id: string;
  parent: NotionParent;
  discussion_id: string;
  rich_text: unknown[];
  created_time: string;
  created_by: { object: string; id: string };
}

// --- User ---

export interface NotionUser {
  object: 'user';
  id: string;
  type: 'person' | 'bot';
  name: string;
  avatar_url: string | null;
}

// --- Paginated List ---

export interface NotionList<T> {
  object: 'list';
  results: T[];
  next_cursor: string | null;
  has_more: boolean;
  type: string;
}
