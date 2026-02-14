/**
 * PostgREST MCP Plugin - Type Definitions
 */

export interface PostgrestConfig {
  url: string;
  token?: string;
}

export interface OpenApiInfo {
  title: string;
  description?: string;
  version: string;
}

export interface OpenApiColumn {
  description?: string;
  format: string;
  type: string;
  default?: unknown;
  enum?: string[];
  maxLength?: number;
}

export interface OpenApiTableSchema {
  required?: string[];
  properties: Record<string, OpenApiColumn>;
  type: string;
}

export interface OpenApiPath {
  get?: Record<string, unknown>;
  post?: Record<string, unknown>;
  patch?: Record<string, unknown>;
  delete?: Record<string, unknown>;
}

export interface OpenApiSchema {
  info: OpenApiInfo;
  paths: Record<string, OpenApiPath>;
  definitions?: Record<string, OpenApiTableSchema>;
  components?: {
    schemas?: Record<string, OpenApiTableSchema>;
  };
}

export interface TableColumn {
  name: string;
  type: string;
  format: string;
  required: boolean;
  description?: string;
  default?: unknown;
  enum?: string[];
  maxLength?: number;
}

export interface TableDescription {
  table: string;
  columns: TableColumn[];
}
