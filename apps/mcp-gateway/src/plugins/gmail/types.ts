/**
 * Gmail API v1 Types
 */

// ========== Message ==========

export interface Message {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  historyId?: string;
  internalDate?: string;
  payload?: MessagePart;
  sizeEstimate?: number;
  raw?: string;
}

export interface MessagePart {
  partId?: string;
  mimeType?: string;
  filename?: string;
  headers?: MessagePartHeader[];
  body?: MessagePartBody;
  parts?: MessagePart[];
}

export interface MessagePartHeader {
  name: string;
  value: string;
}

export interface MessagePartBody {
  attachmentId?: string;
  size?: number;
  data?: string;
}

export interface MessageList {
  messages?: MessageRef[];
  nextPageToken?: string;
  resultSizeEstimate?: number;
}

export interface MessageRef {
  id: string;
  threadId: string;
}

// ========== Thread ==========

export interface Thread {
  id: string;
  historyId?: string;
  messages?: Message[];
  snippet?: string;
}

export interface ThreadList {
  threads?: ThreadRef[];
  nextPageToken?: string;
  resultSizeEstimate?: number;
}

export interface ThreadRef {
  id: string;
  historyId?: string;
  snippet?: string;
}

// ========== Label ==========

export interface Label {
  id: string;
  name: string;
  messageListVisibility?: 'show' | 'hide';
  labelListVisibility?: 'labelShow' | 'labelShowIfUnread' | 'labelHide';
  type?: 'system' | 'user';
  messagesTotal?: number;
  messagesUnread?: number;
  threadsTotal?: number;
  threadsUnread?: number;
  color?: LabelColor;
}

export interface LabelColor {
  textColor?: string;
  backgroundColor?: string;
}

export interface LabelList {
  labels: Label[];
}

// ========== Draft ==========

export interface Draft {
  id: string;
  message?: Message;
}

export interface DraftList {
  drafts?: DraftRef[];
  nextPageToken?: string;
  resultSizeEstimate?: number;
}

export interface DraftRef {
  id: string;
  message?: MessageRef;
}

// ========== Profile ==========

export interface Profile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

// ========== Vacation Settings ==========

export interface VacationSettings {
  enableAutoReply: boolean;
  responseSubject?: string;
  responseBodyPlainText?: string;
  responseBodyHtml?: string;
  restrictToContacts?: boolean;
  restrictToDomain?: boolean;
  startTime?: string;
  endTime?: string;
}

// ========== Attachment ==========

export interface Attachment {
  size: number;
  data: string;
}

// ========== Client Config ==========

export interface GmailClientConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}
