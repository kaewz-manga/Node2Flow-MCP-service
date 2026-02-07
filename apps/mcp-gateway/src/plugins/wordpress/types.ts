/**
 * WordPress MCP Plugin - Type Definitions
 */

export interface WordPressConfig {
  siteUrl: string;
  username: string;
  applicationPassword: string;
}

export interface WPPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  status: string;
  slug: string;
  date: string;
  modified: string;
  author: number;
  categories: number[];
  tags: number[];
}

export interface WPPage {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  status: string;
  slug: string;
  date: string;
  modified: string;
  parent: number;
}

export interface WPMedia {
  id: number;
  title: { rendered: string };
  source_url: string;
  mime_type: string;
  media_type: string;
  date: string;
}

export interface WPComment {
  id: number;
  post: number;
  author_name: string;
  content: { rendered: string };
  status: string;
  date: string;
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
  parent: number;
}

export interface WPTag {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface WPUser {
  id: number;
  name: string;
  slug: string;
  email?: string;
  roles: string[];
}
