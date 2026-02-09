/**
 * LINE Messaging API Plugin - Type Definitions
 */

export interface LineConfig {
  channelAccessToken: string;
}

// --- Message Types ---

export interface LineMessage {
  type: string;
  [key: string]: unknown;
}

// --- Profile Types ---

export interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  language?: string;
}

export interface LineBotInfo {
  userId: string;
  basicId: string;
  premiumId?: string;
  displayName: string;
  pictureUrl?: string;
  chatMode: string;
  markAsReadMode: string;
}

// --- Group Types ---

export interface LineGroupSummary {
  groupId: string;
  groupName: string;
  pictureUrl?: string;
}

export interface LineGroupMembersCount {
  count: number;
}

export interface LineMemberIds {
  memberIds: string[];
  next?: string;
}

// --- Rich Menu Types ---

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

// --- Quota Types ---

export interface LineQuota {
  type: string;
  value?: number;
}

export interface LineQuotaConsumption {
  totalUsage: number;
}

export interface LineFollowersCount {
  status: string;
  followers?: number;
  targetedReaches?: number;
  blocks?: number;
}

// --- Webhook Types ---

export interface LineWebhookInfo {
  endpoint: string;
  active: boolean;
}

export interface LineWebhookTestResult {
  success: boolean;
  timestamp: string;
  statusCode: number;
  reason: string;
  detail: string;
}

// --- Send Message Response ---

export interface LineSendMessageResponse {
  sentMessages: Array<{ id: string; quoteToken?: string }>;
}

// --- Follower IDs ---

export interface LineFollowerIds {
  userIds: string[];
  next?: string;
}
