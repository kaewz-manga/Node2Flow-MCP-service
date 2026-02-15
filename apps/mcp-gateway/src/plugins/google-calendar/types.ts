/**
 * Google Calendar API v3 Types
 */

// ========== DateTime ==========

export interface EventDateTime {
  date?: string;
  dateTime?: string;
  timeZone?: string;
}

// ========== Event ==========

export interface Event {
  kind?: string;
  etag?: string;
  id?: string;
  status?: string;
  htmlLink?: string;
  created?: string;
  updated?: string;
  summary?: string;
  description?: string;
  location?: string;
  colorId?: string;
  creator?: EventPerson;
  organizer?: EventPerson;
  start?: EventDateTime;
  end?: EventDateTime;
  endTimeUnspecified?: boolean;
  recurrence?: string[];
  recurringEventId?: string;
  originalStartTime?: EventDateTime;
  transparency?: string;
  visibility?: string;
  iCalUID?: string;
  sequence?: number;
  attendees?: EventAttendee[];
  attendeesOmitted?: boolean;
  hangoutLink?: string;
  conferenceData?: ConferenceData;
  reminders?: EventReminders;
  source?: EventSource;
  attachments?: EventAttachment[];
  eventType?: string;
}

export interface EventPerson {
  id?: string;
  email?: string;
  displayName?: string;
  self?: boolean;
}

export interface EventAttendee {
  id?: string;
  email?: string;
  displayName?: string;
  organizer?: boolean;
  self?: boolean;
  resource?: boolean;
  optional?: boolean;
  responseStatus?: string;
  comment?: string;
  additionalGuests?: number;
}

export interface ConferenceData {
  createRequest?: ConferenceRequest;
  entryPoints?: EntryPoint[];
  conferenceSolution?: ConferenceSolution;
  conferenceId?: string;
  notes?: string;
}

export interface ConferenceRequest {
  requestId?: string;
  conferenceSolutionKey?: ConferenceSolutionKey;
  status?: ConferenceRequestStatus;
}

export interface ConferenceSolutionKey {
  type?: string;
}

export interface ConferenceRequestStatus {
  statusCode?: string;
}

export interface EntryPoint {
  entryPointType?: string;
  uri?: string;
  label?: string;
  pin?: string;
  accessCode?: string;
  meetingCode?: string;
  passcode?: string;
  password?: string;
}

export interface ConferenceSolution {
  key?: ConferenceSolutionKey;
  name?: string;
  iconUri?: string;
}

export interface EventReminders {
  useDefault?: boolean;
  overrides?: ReminderOverride[];
}

export interface ReminderOverride {
  method?: string;
  minutes?: number;
}

export interface EventSource {
  url?: string;
  title?: string;
}

export interface EventAttachment {
  fileUrl?: string;
  title?: string;
  mimeType?: string;
  iconLink?: string;
  fileId?: string;
}

export interface EventList {
  kind?: string;
  etag?: string;
  summary?: string;
  description?: string;
  updated?: string;
  timeZone?: string;
  accessRole?: string;
  defaultReminders?: ReminderOverride[];
  nextPageToken?: string;
  nextSyncToken?: string;
  items?: Event[];
}

// ========== CalendarList ==========

export interface CalendarListEntry {
  kind?: string;
  etag?: string;
  id?: string;
  summary?: string;
  description?: string;
  location?: string;
  timeZone?: string;
  summaryOverride?: string;
  colorId?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  hidden?: boolean;
  selected?: boolean;
  accessRole?: string;
  defaultReminders?: ReminderOverride[];
  notificationSettings?: NotificationSettings;
  primary?: boolean;
  deleted?: boolean;
  conferenceProperties?: ConferenceProperties;
}

export interface NotificationSettings {
  notifications?: NotificationSetting[];
}

export interface NotificationSetting {
  type?: string;
  method?: string;
}

export interface ConferenceProperties {
  allowedConferenceSolutionTypes?: string[];
}

export interface CalendarListList {
  kind?: string;
  etag?: string;
  nextPageToken?: string;
  nextSyncToken?: string;
  items?: CalendarListEntry[];
}

// ========== Calendar ==========

export interface Calendar {
  kind?: string;
  etag?: string;
  id?: string;
  summary?: string;
  description?: string;
  location?: string;
  timeZone?: string;
  conferenceProperties?: ConferenceProperties;
}

// ========== ACL ==========

export interface AclRule {
  kind?: string;
  etag?: string;
  id?: string;
  scope?: AclScope;
  role?: string;
}

export interface AclScope {
  type?: string;
  value?: string;
}

export interface AclList {
  kind?: string;
  etag?: string;
  nextPageToken?: string;
  nextSyncToken?: string;
  items?: AclRule[];
}

// ========== FreeBusy ==========

export interface FreeBusyRequest {
  timeMin: string;
  timeMax: string;
  timeZone?: string;
  groupExpansionMax?: number;
  calendarExpansionMax?: number;
  items: FreeBusyRequestItem[];
}

export interface FreeBusyRequestItem {
  id: string;
}

export interface FreeBusyResponse {
  kind?: string;
  timeMin?: string;
  timeMax?: string;
  groups?: Record<string, FreeBusyGroup>;
  calendars?: Record<string, FreeBusyCalendar>;
}

export interface FreeBusyGroup {
  errors?: ErrorEntry[];
  calendars?: string[];
}

export interface FreeBusyCalendar {
  errors?: ErrorEntry[];
  busy?: TimePeriod[];
}

export interface ErrorEntry {
  domain?: string;
  reason?: string;
}

export interface TimePeriod {
  start?: string;
  end?: string;
}

// ========== Colors ==========

export interface Colors {
  kind?: string;
  updated?: string;
  calendar?: Record<string, ColorDefinition>;
  event?: Record<string, ColorDefinition>;
}

export interface ColorDefinition {
  background?: string;
  foreground?: string;
}

// ========== Settings ==========

export interface Setting {
  kind?: string;
  etag?: string;
  id?: string;
  value?: string;
}

export interface SettingsList {
  kind?: string;
  etag?: string;
  nextPageToken?: string;
  nextSyncToken?: string;
  items?: Setting[];
}

// ========== Client Config ==========

export interface CalendarClientConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}
