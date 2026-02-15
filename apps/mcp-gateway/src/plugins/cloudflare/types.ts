/**
 * Cloudflare API Client - Type Definitions
 */

export interface CloudflareConfig {
  apiToken: string;      // Cloudflare API Token
  accountId?: string;    // Default account ID (can be set later)
  apiUrl?: string;       // default: https://api.cloudflare.com/client/v4
}

export interface CloudflareAccount {
  id: string;
  name: string;
  type: string;
  settings: any;
  created_on: string;
}

export interface CloudflareWorker {
  id: string;
  etag: string;
  handlers: string[];
  named_handlers: any[];
  modified_on: string;
  created_on: string;
  usage_model: string;
}

export interface CloudflareD1Database {
  uuid: string;
  name: string;
  version: string;
  num_tables: number;
  file_size: number;
  created_at: string;
}

export interface CloudflareKVNamespace {
  id: string;
  title: string;
  supports_url_encoding: boolean;
}

export interface CloudflareR2Bucket {
  name: string;
  creation_date: string;
  location: string;
}

export interface CloudflareHyperdriveConfig {
  id: string;
  name: string;
  origin: any;
  caching: any;
  created_on: string;
  modified_on: string;
}
