/**
 * LINE Bot MCP Plugin - Type Definitions
 * Matches official line-bot-mcp-server
 */

export interface LineConfig {
  channelAccessToken: string;
}

// --- Profile ---

export interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  language?: string;
}

// --- Rich Menu ---

export interface LineRichMenu {
  richMenuId: string;
  size: { width: number; height: number };
  selected: boolean;
  name: string;
  chatBarText: string;
  areas: Array<{
    bounds: { x: number; y: number; width: number; height: number };
    action: Record<string, unknown>;
  }>;
}

export interface LineRichMenuList {
  richmenus: LineRichMenu[];
}

// --- Quota ---

export interface LineQuota {
  type: string;
  value?: number;
}

export interface LineQuotaConsumption {
  totalUsage: number;
}

// --- Send Message Response ---

export interface LineSendMessageResponse {
  sentMessages: Array<{ id: string; quoteToken?: string }>;
}
