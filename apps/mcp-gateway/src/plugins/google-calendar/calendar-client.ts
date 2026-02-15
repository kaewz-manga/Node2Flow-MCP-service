/**
 * Google Calendar API v3 Client — OAuth 2.0 refresh token pattern
 */

import type {
  Event,
  EventList,
  CalendarListEntry,
  CalendarListList,
  Calendar,
  AclRule,
  AclList,
  FreeBusyResponse,
  Colors,
  SettingsList,
  CalendarClientConfig,
} from './types';

export class CalendarClient {
  private config: CalendarClientConfig;
  private accessToken: string | null = null;
  private tokenExpiry = 0;

  private static readonly BASE = 'https://www.googleapis.com/calendar/v3';
  private static readonly TOKEN_URL = 'https://oauth2.googleapis.com/token';

  constructor(config: CalendarClientConfig) {
    this.config = config;
  }

  // ========== OAuth ==========

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const res = await fetch(CalendarClient.TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: this.config.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Token refresh failed (${res.status}): ${text}`);
    }

    const data = (await res.json()) as { access_token: string; expires_in: number };
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return this.accessToken;
  }

  private async request(path: string, options: RequestInit = {}): Promise<unknown> {
    const token = await this.getAccessToken();
    const url = `${CalendarClient.BASE}${path}`;

    const res = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Calendar API error (${res.status}): ${text}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return res.json();
    }
    return {};
  }

  // ========== Events (10) ==========

  async listEvents(opts: {
    calendarId: string;
    timeMin?: string;
    timeMax?: string;
    q?: string;
    maxResults?: number;
    pageToken?: string;
    singleEvents?: boolean;
    orderBy?: string;
    timeZone?: string;
    showDeleted?: boolean;
  }): Promise<EventList> {
    const params = new URLSearchParams();
    if (opts.timeMin) params.set('timeMin', opts.timeMin);
    if (opts.timeMax) params.set('timeMax', opts.timeMax);
    if (opts.q) params.set('q', opts.q);
    if (opts.maxResults) params.set('maxResults', String(opts.maxResults));
    if (opts.pageToken) params.set('pageToken', opts.pageToken);
    if (opts.singleEvents !== undefined) params.set('singleEvents', String(opts.singleEvents));
    if (opts.orderBy) params.set('orderBy', opts.orderBy);
    if (opts.timeZone) params.set('timeZone', opts.timeZone);
    if (opts.showDeleted !== undefined) params.set('showDeleted', String(opts.showDeleted));
    const qs = params.toString();
    return this.request(`/calendars/${encodeURIComponent(opts.calendarId)}/events${qs ? `?${qs}` : ''}`) as Promise<EventList>;
  }

  async getEvent(opts: {
    calendarId: string;
    eventId: string;
    timeZone?: string;
  }): Promise<Event> {
    const params = new URLSearchParams();
    if (opts.timeZone) params.set('timeZone', opts.timeZone);
    const qs = params.toString();
    return this.request(`/calendars/${encodeURIComponent(opts.calendarId)}/events/${encodeURIComponent(opts.eventId)}${qs ? `?${qs}` : ''}`) as Promise<Event>;
  }

  async createEvent(opts: {
    calendarId: string;
    summary?: string;
    description?: string;
    location?: string;
    startDateTime?: string;
    startDate?: string;
    startTimeZone?: string;
    endDateTime?: string;
    endDate?: string;
    endTimeZone?: string;
    attendees?: string[];
    recurrence?: string[];
    reminders?: { useDefault: boolean; overrides?: { method: string; minutes: number }[] };
    colorId?: string;
    visibility?: string;
    transparency?: string;
    sendUpdates?: string;
    conferenceDataVersion?: number;
  }): Promise<Event> {
    const payload: Record<string, unknown> = {};
    if (opts.summary) payload.summary = opts.summary;
    if (opts.description) payload.description = opts.description;
    if (opts.location) payload.location = opts.location;
    if (opts.colorId) payload.colorId = opts.colorId;
    if (opts.visibility) payload.visibility = opts.visibility;
    if (opts.transparency) payload.transparency = opts.transparency;
    if (opts.recurrence) payload.recurrence = opts.recurrence;

    // Start time
    if (opts.startDate) {
      payload.start = { date: opts.startDate };
    } else if (opts.startDateTime) {
      const start: Record<string, string> = { dateTime: opts.startDateTime };
      if (opts.startTimeZone) start.timeZone = opts.startTimeZone;
      payload.start = start;
    }

    // End time
    if (opts.endDate) {
      payload.end = { date: opts.endDate };
    } else if (opts.endDateTime) {
      const end: Record<string, string> = { dateTime: opts.endDateTime };
      if (opts.endTimeZone) end.timeZone = opts.endTimeZone;
      payload.end = end;
    }

    if (opts.attendees) {
      payload.attendees = opts.attendees.map(email => ({ email }));
    }

    if (opts.reminders) {
      payload.reminders = opts.reminders;
    }

    const params = new URLSearchParams();
    if (opts.sendUpdates) params.set('sendUpdates', opts.sendUpdates);
    if (opts.conferenceDataVersion !== undefined) params.set('conferenceDataVersion', String(opts.conferenceDataVersion));
    const qs = params.toString();

    return this.request(`/calendars/${encodeURIComponent(opts.calendarId)}/events${qs ? `?${qs}` : ''}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as Promise<Event>;
  }

  async updateEvent(opts: {
    calendarId: string;
    eventId: string;
    summary?: string;
    description?: string;
    location?: string;
    startDateTime?: string;
    startDate?: string;
    startTimeZone?: string;
    endDateTime?: string;
    endDate?: string;
    endTimeZone?: string;
    attendees?: string[];
    recurrence?: string[];
    reminders?: { useDefault: boolean; overrides?: { method: string; minutes: number }[] };
    colorId?: string;
    visibility?: string;
    transparency?: string;
    sendUpdates?: string;
  }): Promise<Event> {
    const payload: Record<string, unknown> = {};
    if (opts.summary !== undefined) payload.summary = opts.summary;
    if (opts.description !== undefined) payload.description = opts.description;
    if (opts.location !== undefined) payload.location = opts.location;
    if (opts.colorId !== undefined) payload.colorId = opts.colorId;
    if (opts.visibility !== undefined) payload.visibility = opts.visibility;
    if (opts.transparency !== undefined) payload.transparency = opts.transparency;
    if (opts.recurrence !== undefined) payload.recurrence = opts.recurrence;

    if (opts.startDate) {
      payload.start = { date: opts.startDate };
    } else if (opts.startDateTime) {
      const start: Record<string, string> = { dateTime: opts.startDateTime };
      if (opts.startTimeZone) start.timeZone = opts.startTimeZone;
      payload.start = start;
    }

    if (opts.endDate) {
      payload.end = { date: opts.endDate };
    } else if (opts.endDateTime) {
      const end: Record<string, string> = { dateTime: opts.endDateTime };
      if (opts.endTimeZone) end.timeZone = opts.endTimeZone;
      payload.end = end;
    }

    if (opts.attendees) {
      payload.attendees = opts.attendees.map(email => ({ email }));
    }

    if (opts.reminders) {
      payload.reminders = opts.reminders;
    }

    const params = new URLSearchParams();
    if (opts.sendUpdates) params.set('sendUpdates', opts.sendUpdates);
    const qs = params.toString();

    return this.request(`/calendars/${encodeURIComponent(opts.calendarId)}/events/${encodeURIComponent(opts.eventId)}${qs ? `?${qs}` : ''}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }) as Promise<Event>;
  }

  async patchEvent(opts: {
    calendarId: string;
    eventId: string;
    summary?: string;
    description?: string;
    location?: string;
    startDateTime?: string;
    startDate?: string;
    startTimeZone?: string;
    endDateTime?: string;
    endDate?: string;
    endTimeZone?: string;
    attendees?: string[];
    colorId?: string;
    visibility?: string;
    transparency?: string;
    sendUpdates?: string;
  }): Promise<Event> {
    const payload: Record<string, unknown> = {};
    if (opts.summary !== undefined) payload.summary = opts.summary;
    if (opts.description !== undefined) payload.description = opts.description;
    if (opts.location !== undefined) payload.location = opts.location;
    if (opts.colorId !== undefined) payload.colorId = opts.colorId;
    if (opts.visibility !== undefined) payload.visibility = opts.visibility;
    if (opts.transparency !== undefined) payload.transparency = opts.transparency;

    if (opts.startDate) {
      payload.start = { date: opts.startDate };
    } else if (opts.startDateTime) {
      const start: Record<string, string> = { dateTime: opts.startDateTime };
      if (opts.startTimeZone) start.timeZone = opts.startTimeZone;
      payload.start = start;
    }

    if (opts.endDate) {
      payload.end = { date: opts.endDate };
    } else if (opts.endDateTime) {
      const end: Record<string, string> = { dateTime: opts.endDateTime };
      if (opts.endTimeZone) end.timeZone = opts.endTimeZone;
      payload.end = end;
    }

    if (opts.attendees) {
      payload.attendees = opts.attendees.map(email => ({ email }));
    }

    const params = new URLSearchParams();
    if (opts.sendUpdates) params.set('sendUpdates', opts.sendUpdates);
    const qs = params.toString();

    return this.request(`/calendars/${encodeURIComponent(opts.calendarId)}/events/${encodeURIComponent(opts.eventId)}${qs ? `?${qs}` : ''}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }) as Promise<Event>;
  }

  async deleteEvent(opts: {
    calendarId: string;
    eventId: string;
    sendUpdates?: string;
  }): Promise<void> {
    const params = new URLSearchParams();
    if (opts.sendUpdates) params.set('sendUpdates', opts.sendUpdates);
    const qs = params.toString();
    await this.request(`/calendars/${encodeURIComponent(opts.calendarId)}/events/${encodeURIComponent(opts.eventId)}${qs ? `?${qs}` : ''}`, {
      method: 'DELETE',
    });
  }

  async quickAdd(opts: {
    calendarId: string;
    text: string;
    sendUpdates?: string;
  }): Promise<Event> {
    const params = new URLSearchParams({ text: opts.text });
    if (opts.sendUpdates) params.set('sendUpdates', opts.sendUpdates);
    return this.request(`/calendars/${encodeURIComponent(opts.calendarId)}/events/quickAdd?${params.toString()}`, {
      method: 'POST',
    }) as Promise<Event>;
  }

  async moveEvent(opts: {
    calendarId: string;
    eventId: string;
    destination: string;
    sendUpdates?: string;
  }): Promise<Event> {
    const params = new URLSearchParams({ destination: opts.destination });
    if (opts.sendUpdates) params.set('sendUpdates', opts.sendUpdates);
    return this.request(`/calendars/${encodeURIComponent(opts.calendarId)}/events/${encodeURIComponent(opts.eventId)}/move?${params.toString()}`, {
      method: 'POST',
    }) as Promise<Event>;
  }

  async listInstances(opts: {
    calendarId: string;
    eventId: string;
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
    pageToken?: string;
    timeZone?: string;
  }): Promise<EventList> {
    const params = new URLSearchParams();
    if (opts.timeMin) params.set('timeMin', opts.timeMin);
    if (opts.timeMax) params.set('timeMax', opts.timeMax);
    if (opts.maxResults) params.set('maxResults', String(opts.maxResults));
    if (opts.pageToken) params.set('pageToken', opts.pageToken);
    if (opts.timeZone) params.set('timeZone', opts.timeZone);
    const qs = params.toString();
    return this.request(`/calendars/${encodeURIComponent(opts.calendarId)}/events/${encodeURIComponent(opts.eventId)}/instances${qs ? `?${qs}` : ''}`) as Promise<EventList>;
  }

  async importEvent(opts: {
    calendarId: string;
    iCalUID: string;
    summary?: string;
    description?: string;
    location?: string;
    startDateTime?: string;
    startDate?: string;
    startTimeZone?: string;
    endDateTime?: string;
    endDate?: string;
    endTimeZone?: string;
  }): Promise<Event> {
    const payload: Record<string, unknown> = {
      iCalUID: opts.iCalUID,
    };
    if (opts.summary) payload.summary = opts.summary;
    if (opts.description) payload.description = opts.description;
    if (opts.location) payload.location = opts.location;

    if (opts.startDate) {
      payload.start = { date: opts.startDate };
    } else if (opts.startDateTime) {
      const start: Record<string, string> = { dateTime: opts.startDateTime };
      if (opts.startTimeZone) start.timeZone = opts.startTimeZone;
      payload.start = start;
    }

    if (opts.endDate) {
      payload.end = { date: opts.endDate };
    } else if (opts.endDateTime) {
      const end: Record<string, string> = { dateTime: opts.endDateTime };
      if (opts.endTimeZone) end.timeZone = opts.endTimeZone;
      payload.end = end;
    }

    return this.request(`/calendars/${encodeURIComponent(opts.calendarId)}/events/import`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as Promise<Event>;
  }

  // ========== CalendarList (5) ==========

  async listCalendars(opts: {
    maxResults?: number;
    pageToken?: string;
    showDeleted?: boolean;
    showHidden?: boolean;
  }): Promise<CalendarListList> {
    const params = new URLSearchParams();
    if (opts.maxResults) params.set('maxResults', String(opts.maxResults));
    if (opts.pageToken) params.set('pageToken', opts.pageToken);
    if (opts.showDeleted !== undefined) params.set('showDeleted', String(opts.showDeleted));
    if (opts.showHidden !== undefined) params.set('showHidden', String(opts.showHidden));
    const qs = params.toString();
    return this.request(`/users/me/calendarList${qs ? `?${qs}` : ''}`) as Promise<CalendarListList>;
  }

  async getCalendarEntry(opts: {
    calendarId: string;
  }): Promise<CalendarListEntry> {
    return this.request(`/users/me/calendarList/${encodeURIComponent(opts.calendarId)}`) as Promise<CalendarListEntry>;
  }

  async addCalendar(opts: {
    id: string;
    colorId?: string;
    summaryOverride?: string;
    hidden?: boolean;
    selected?: boolean;
  }): Promise<CalendarListEntry> {
    const payload: Record<string, unknown> = { id: opts.id };
    if (opts.colorId) payload.colorId = opts.colorId;
    if (opts.summaryOverride) payload.summaryOverride = opts.summaryOverride;
    if (opts.hidden !== undefined) payload.hidden = opts.hidden;
    if (opts.selected !== undefined) payload.selected = opts.selected;
    return this.request('/users/me/calendarList', {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as Promise<CalendarListEntry>;
  }

  async updateCalendarEntry(opts: {
    calendarId: string;
    colorId?: string;
    summaryOverride?: string;
    hidden?: boolean;
    selected?: boolean;
    defaultReminders?: { method: string; minutes: number }[];
  }): Promise<CalendarListEntry> {
    const payload: Record<string, unknown> = {};
    if (opts.colorId !== undefined) payload.colorId = opts.colorId;
    if (opts.summaryOverride !== undefined) payload.summaryOverride = opts.summaryOverride;
    if (opts.hidden !== undefined) payload.hidden = opts.hidden;
    if (opts.selected !== undefined) payload.selected = opts.selected;
    if (opts.defaultReminders) payload.defaultReminders = opts.defaultReminders;
    return this.request(`/users/me/calendarList/${encodeURIComponent(opts.calendarId)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }) as Promise<CalendarListEntry>;
  }

  async removeCalendar(opts: {
    calendarId: string;
  }): Promise<void> {
    await this.request(`/users/me/calendarList/${encodeURIComponent(opts.calendarId)}`, {
      method: 'DELETE',
    });
  }

  // ========== Calendars (5) ==========

  async getCalendar(opts: {
    calendarId: string;
  }): Promise<Calendar> {
    return this.request(`/calendars/${encodeURIComponent(opts.calendarId)}`) as Promise<Calendar>;
  }

  async createCalendar(opts: {
    summary: string;
    description?: string;
    location?: string;
    timeZone?: string;
  }): Promise<Calendar> {
    const payload: Record<string, unknown> = { summary: opts.summary };
    if (opts.description) payload.description = opts.description;
    if (opts.location) payload.location = opts.location;
    if (opts.timeZone) payload.timeZone = opts.timeZone;
    return this.request('/calendars', {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as Promise<Calendar>;
  }

  async updateCalendar(opts: {
    calendarId: string;
    summary?: string;
    description?: string;
    location?: string;
    timeZone?: string;
  }): Promise<Calendar> {
    const payload: Record<string, unknown> = {};
    if (opts.summary !== undefined) payload.summary = opts.summary;
    if (opts.description !== undefined) payload.description = opts.description;
    if (opts.location !== undefined) payload.location = opts.location;
    if (opts.timeZone !== undefined) payload.timeZone = opts.timeZone;
    return this.request(`/calendars/${encodeURIComponent(opts.calendarId)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }) as Promise<Calendar>;
  }

  async deleteCalendar(opts: {
    calendarId: string;
  }): Promise<void> {
    await this.request(`/calendars/${encodeURIComponent(opts.calendarId)}`, {
      method: 'DELETE',
    });
  }

  async clearCalendar(opts: {
    calendarId: string;
  }): Promise<void> {
    await this.request(`/calendars/${encodeURIComponent(opts.calendarId)}/clear`, {
      method: 'POST',
    });
  }

  // ========== ACL (5) ==========

  async listAcl(opts: {
    calendarId: string;
    maxResults?: number;
    pageToken?: string;
    showDeleted?: boolean;
  }): Promise<AclList> {
    const params = new URLSearchParams();
    if (opts.maxResults) params.set('maxResults', String(opts.maxResults));
    if (opts.pageToken) params.set('pageToken', opts.pageToken);
    if (opts.showDeleted !== undefined) params.set('showDeleted', String(opts.showDeleted));
    const qs = params.toString();
    return this.request(`/calendars/${encodeURIComponent(opts.calendarId)}/acl${qs ? `?${qs}` : ''}`) as Promise<AclList>;
  }

  async getAcl(opts: {
    calendarId: string;
    ruleId: string;
  }): Promise<AclRule> {
    return this.request(`/calendars/${encodeURIComponent(opts.calendarId)}/acl/${encodeURIComponent(opts.ruleId)}`) as Promise<AclRule>;
  }

  async createAcl(opts: {
    calendarId: string;
    role: string;
    scopeType: string;
    scopeValue?: string;
    sendNotifications?: boolean;
  }): Promise<AclRule> {
    const payload: Record<string, unknown> = {
      role: opts.role,
      scope: { type: opts.scopeType, value: opts.scopeValue },
    };
    const params = new URLSearchParams();
    if (opts.sendNotifications !== undefined) params.set('sendNotifications', String(opts.sendNotifications));
    const qs = params.toString();
    return this.request(`/calendars/${encodeURIComponent(opts.calendarId)}/acl${qs ? `?${qs}` : ''}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as Promise<AclRule>;
  }

  async updateAcl(opts: {
    calendarId: string;
    ruleId: string;
    role: string;
    sendNotifications?: boolean;
  }): Promise<AclRule> {
    const params = new URLSearchParams();
    if (opts.sendNotifications !== undefined) params.set('sendNotifications', String(opts.sendNotifications));
    const qs = params.toString();
    return this.request(`/calendars/${encodeURIComponent(opts.calendarId)}/acl/${encodeURIComponent(opts.ruleId)}${qs ? `?${qs}` : ''}`, {
      method: 'PUT',
      body: JSON.stringify({ role: opts.role }),
    }) as Promise<AclRule>;
  }

  async deleteAcl(opts: {
    calendarId: string;
    ruleId: string;
  }): Promise<void> {
    await this.request(`/calendars/${encodeURIComponent(opts.calendarId)}/acl/${encodeURIComponent(opts.ruleId)}`, {
      method: 'DELETE',
    });
  }

  // ========== Utility (3) ==========

  async queryFreeBusy(opts: {
    timeMin: string;
    timeMax: string;
    timeZone?: string;
    calendarIds: string[];
  }): Promise<FreeBusyResponse> {
    const payload: Record<string, unknown> = {
      timeMin: opts.timeMin,
      timeMax: opts.timeMax,
      items: opts.calendarIds.map(id => ({ id })),
    };
    if (opts.timeZone) payload.timeZone = opts.timeZone;
    return this.request('/freeBusy', {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as Promise<FreeBusyResponse>;
  }

  async getColors(): Promise<Colors> {
    return this.request('/colors') as Promise<Colors>;
  }

  async listSettings(opts: {
    maxResults?: number;
    pageToken?: string;
  }): Promise<SettingsList> {
    const params = new URLSearchParams();
    if (opts.maxResults) params.set('maxResults', String(opts.maxResults));
    if (opts.pageToken) params.set('pageToken', opts.pageToken);
    const qs = params.toString();
    return this.request(`/users/me/settings${qs ? `?${qs}` : ''}`) as Promise<SettingsList>;
  }
}
