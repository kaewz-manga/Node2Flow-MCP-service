/**
 * Slack MCP Plugin - Type Definitions
 */

export interface SlackConfig {
  botToken: string;
}

export interface SlackUser {
  id: string;
  team_id: string;
  name: string;
  real_name?: string;
  profile?: {
    display_name?: string;
    email?: string;
    image_72?: string;
    [key: string]: unknown;
  };
  is_admin?: boolean;
  is_bot?: boolean;
  deleted?: boolean;
  [key: string]: unknown;
}

export interface SlackChannel {
  id: string;
  name: string;
  is_channel?: boolean;
  is_private?: boolean;
  is_archived?: boolean;
  topic?: { value: string; [key: string]: unknown };
  purpose?: { value: string; [key: string]: unknown };
  num_members?: number;
  [key: string]: unknown;
}

export interface SlackMessage {
  type: string;
  ts: string;
  user?: string;
  text?: string;
  blocks?: unknown[];
  thread_ts?: string;
  reply_count?: number;
  [key: string]: unknown;
}

export interface SlackFile {
  id: string;
  name: string;
  title?: string;
  mimetype?: string;
  size?: number;
  url_private?: string;
  permalink?: string;
  [key: string]: unknown;
}

export interface SlackReaction {
  name: string;
  count: number;
  users: string[];
}

export interface SlackTeam {
  id: string;
  name: string;
  domain: string;
  icon?: { image_132?: string; [key: string]: unknown };
  [key: string]: unknown;
}

export interface SlackBookmark {
  id: string;
  channel_id: string;
  title: string;
  link: string;
  emoji?: string;
  [key: string]: unknown;
}

export interface SlackScheduledMessage {
  id: string;
  channel_id: string;
  post_at: number;
  text?: string;
  [key: string]: unknown;
}
