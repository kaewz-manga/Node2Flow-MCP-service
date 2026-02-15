/**
 * 28 Google Calendar MCP Tool Definitions
 */

import type { MCPToolDefinition } from '../../types';

export const TOOLS: MCPToolDefinition[] = [
  // ========== Events (10) ==========
  {
    name: 'gcal_list_events',
    description: 'List events on a calendar. Supports time range filtering, search query, and pagination. Use singleEvents=true to expand recurring events into individual instances.',
    inputSchema: {
      type: 'object',
      properties: {
        calendar_id: { type: 'string', description: 'Calendar ID (use "primary" for the main calendar, or a specific calendar ID from gcal_list_calendars)' },
        time_min: { type: 'string', description: 'Lower bound (inclusive) for event start time in RFC 3339 format (e.g., "2026-01-01T00:00:00Z")' },
        time_max: { type: 'string', description: 'Upper bound (exclusive) for event end time in RFC 3339 format (e.g., "2026-12-31T23:59:59Z")' },
        q: { type: 'string', description: 'Free text search query to filter events (searches summary, description, location, attendees)' },
        max_results: { type: 'number', description: 'Maximum number of events to return (default: 250, max: 2500)' },
        page_token: { type: 'string', description: 'Token for next page of results (from previous response nextPageToken)' },
        single_events: { type: 'boolean', description: 'Expand recurring events into instances (true) or return master events (false). Required for orderBy=startTime' },
        order_by: { type: 'string', description: 'Sort order: "startTime" (requires singleEvents=true) or "updated"', enum: ['startTime', 'updated'] },
        time_zone: { type: 'string', description: 'Time zone for the response (e.g., "America/New_York", "Asia/Bangkok")' },
        show_deleted: { type: 'boolean', description: 'Include deleted events (status=cancelled) in results' },
      },
      required: ['calendar_id'],
    },
    annotations: { title: 'List Events', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gcal_get_event',
    description: 'Get a specific event by ID. Returns full event details including attendees, reminders, recurrence, and conference data.',
    inputSchema: {
      type: 'object',
      properties: {
        calendar_id: { type: 'string', description: 'Calendar ID (use "primary" for the main calendar)' },
        event_id: { type: 'string', description: 'The event ID (from gcal_list_events)' },
        time_zone: { type: 'string', description: 'Time zone for the response (e.g., "America/New_York")' },
      },
      required: ['calendar_id', 'event_id'],
    },
    annotations: { title: 'Get Event', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gcal_create_event',
    description: 'Create a new calendar event. Supports timed events (dateTime) and all-day events (date). Can add attendees, recurrence rules, reminders, and set visibility.',
    inputSchema: {
      type: 'object',
      properties: {
        calendar_id: { type: 'string', description: 'Calendar ID (use "primary" for the main calendar)' },
        summary: { type: 'string', description: 'Event title/summary' },
        description: { type: 'string', description: 'Event description (supports HTML)' },
        location: { type: 'string', description: 'Event location (free text or address)' },
        start_date_time: { type: 'string', description: 'Start time in RFC 3339 format for timed events (e.g., "2026-03-15T10:00:00-05:00"). Mutually exclusive with start_date' },
        start_date: { type: 'string', description: 'Start date for all-day events in YYYY-MM-DD format (e.g., "2026-03-15"). Mutually exclusive with start_date_time' },
        start_time_zone: { type: 'string', description: 'Time zone for start time (e.g., "America/New_York"). Used with start_date_time' },
        end_date_time: { type: 'string', description: 'End time in RFC 3339 format for timed events (e.g., "2026-03-15T11:00:00-05:00"). Mutually exclusive with end_date' },
        end_date: { type: 'string', description: 'End date for all-day events in YYYY-MM-DD format. For single day, use next day (e.g., start=03-15, end=03-16)' },
        end_time_zone: { type: 'string', description: 'Time zone for end time (e.g., "America/New_York"). Used with end_date_time' },
        attendees: {
          type: 'array',
          description: 'Email addresses of attendees to invite',
          items: { type: 'string' },
        },
        recurrence: {
          type: 'array',
          description: 'Recurrence rules in RRULE format (e.g., ["RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR", "EXDATE:20260320T100000Z"])',
          items: { type: 'string' },
        },
        color_id: { type: 'string', description: 'Event color ID (1-11, use gcal_get_colors to see available colors)' },
        visibility: { type: 'string', description: 'Event visibility', enum: ['default', 'public', 'private', 'confidential'] },
        transparency: { type: 'string', description: 'Whether the event blocks time: "opaque" (busy) or "transparent" (available)', enum: ['opaque', 'transparent'] },
        send_updates: { type: 'string', description: 'Who to send notifications to: "all", "externalOnly", or "none"', enum: ['all', 'externalOnly', 'none'] },
      },
      required: ['calendar_id'],
    },
    annotations: { title: 'Create Event', readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
  {
    name: 'gcal_update_event',
    description: 'Full update of an event (PUT). All fields are replaced — unset fields will be cleared. Use gcal_patch_event for partial updates.',
    inputSchema: {
      type: 'object',
      properties: {
        calendar_id: { type: 'string', description: 'Calendar ID (use "primary" for the main calendar)' },
        event_id: { type: 'string', description: 'The event ID to update' },
        summary: { type: 'string', description: 'Event title/summary' },
        description: { type: 'string', description: 'Event description' },
        location: { type: 'string', description: 'Event location' },
        start_date_time: { type: 'string', description: 'Start time in RFC 3339 format for timed events' },
        start_date: { type: 'string', description: 'Start date for all-day events (YYYY-MM-DD)' },
        start_time_zone: { type: 'string', description: 'Time zone for start time' },
        end_date_time: { type: 'string', description: 'End time in RFC 3339 format for timed events' },
        end_date: { type: 'string', description: 'End date for all-day events (YYYY-MM-DD)' },
        end_time_zone: { type: 'string', description: 'Time zone for end time' },
        attendees: {
          type: 'array',
          description: 'Email addresses of attendees (replaces entire attendee list)',
          items: { type: 'string' },
        },
        recurrence: {
          type: 'array',
          description: 'Recurrence rules in RRULE format',
          items: { type: 'string' },
        },
        color_id: { type: 'string', description: 'Event color ID (1-11)' },
        visibility: { type: 'string', description: 'Event visibility', enum: ['default', 'public', 'private', 'confidential'] },
        transparency: { type: 'string', description: 'Busy/available status', enum: ['opaque', 'transparent'] },
        send_updates: { type: 'string', description: 'Who to send notifications to', enum: ['all', 'externalOnly', 'none'] },
      },
      required: ['calendar_id', 'event_id'],
    },
    annotations: { title: 'Update Event', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gcal_patch_event',
    description: 'Partial update of an event (PATCH). Only specified fields are changed — other fields remain unchanged. Preferred over update for changing individual fields.',
    inputSchema: {
      type: 'object',
      properties: {
        calendar_id: { type: 'string', description: 'Calendar ID (use "primary" for the main calendar)' },
        event_id: { type: 'string', description: 'The event ID to patch' },
        summary: { type: 'string', description: 'New event title/summary' },
        description: { type: 'string', description: 'New event description' },
        location: { type: 'string', description: 'New event location' },
        start_date_time: { type: 'string', description: 'New start time in RFC 3339 format' },
        start_date: { type: 'string', description: 'New start date for all-day events (YYYY-MM-DD)' },
        start_time_zone: { type: 'string', description: 'Time zone for start time' },
        end_date_time: { type: 'string', description: 'New end time in RFC 3339 format' },
        end_date: { type: 'string', description: 'New end date for all-day events (YYYY-MM-DD)' },
        end_time_zone: { type: 'string', description: 'Time zone for end time' },
        attendees: {
          type: 'array',
          description: 'Email addresses of attendees (replaces entire attendee list)',
          items: { type: 'string' },
        },
        color_id: { type: 'string', description: 'Event color ID (1-11)' },
        visibility: { type: 'string', description: 'Event visibility', enum: ['default', 'public', 'private', 'confidential'] },
        transparency: { type: 'string', description: 'Busy/available status', enum: ['opaque', 'transparent'] },
        send_updates: { type: 'string', description: 'Who to send notifications to', enum: ['all', 'externalOnly', 'none'] },
      },
      required: ['calendar_id', 'event_id'],
    },
    annotations: { title: 'Patch Event', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gcal_delete_event',
    description: 'Delete an event from the calendar. This action is irreversible.',
    inputSchema: {
      type: 'object',
      properties: {
        calendar_id: { type: 'string', description: 'Calendar ID (use "primary" for the main calendar)' },
        event_id: { type: 'string', description: 'The event ID to delete' },
        send_updates: { type: 'string', description: 'Who to send cancellation notifications to', enum: ['all', 'externalOnly', 'none'] },
      },
      required: ['calendar_id', 'event_id'],
    },
    annotations: { title: 'Delete Event', readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gcal_quick_add',
    description: 'Create an event from natural language text. Google Calendar parses the text to set summary, date, time, and location automatically.',
    inputSchema: {
      type: 'object',
      properties: {
        calendar_id: { type: 'string', description: 'Calendar ID (use "primary" for the main calendar)' },
        text: { type: 'string', description: 'Natural language event description (e.g., "Meeting with John tomorrow at 3pm at Starbucks", "Lunch on Friday 12-1pm")' },
        send_updates: { type: 'string', description: 'Who to send notifications to', enum: ['all', 'externalOnly', 'none'] },
      },
      required: ['calendar_id', 'text'],
    },
    annotations: { title: 'Quick Add Event', readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
  {
    name: 'gcal_move_event',
    description: 'Move an event from one calendar to another. The event is removed from the source calendar and added to the destination.',
    inputSchema: {
      type: 'object',
      properties: {
        calendar_id: { type: 'string', description: 'Source calendar ID where the event currently exists' },
        event_id: { type: 'string', description: 'The event ID to move' },
        destination: { type: 'string', description: 'Destination calendar ID to move the event to' },
        send_updates: { type: 'string', description: 'Who to send notifications to', enum: ['all', 'externalOnly', 'none'] },
      },
      required: ['calendar_id', 'event_id', 'destination'],
    },
    annotations: { title: 'Move Event', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gcal_list_instances',
    description: 'List individual instances of a recurring event. Returns expanded occurrences within a time range.',
    inputSchema: {
      type: 'object',
      properties: {
        calendar_id: { type: 'string', description: 'Calendar ID (use "primary" for the main calendar)' },
        event_id: { type: 'string', description: 'The recurring event ID (master event)' },
        time_min: { type: 'string', description: 'Lower bound for instance start time in RFC 3339 format' },
        time_max: { type: 'string', description: 'Upper bound for instance start time in RFC 3339 format' },
        max_results: { type: 'number', description: 'Maximum number of instances to return' },
        page_token: { type: 'string', description: 'Token for next page of results' },
        time_zone: { type: 'string', description: 'Time zone for the response' },
      },
      required: ['calendar_id', 'event_id'],
    },
    annotations: { title: 'List Recurring Instances', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gcal_import_event',
    description: 'Import an event with a unique iCalUID. Used for importing events from external calendars or iCal files. Does not send notifications.',
    inputSchema: {
      type: 'object',
      properties: {
        calendar_id: { type: 'string', description: 'Calendar ID to import into (use "primary" for the main calendar)' },
        ical_uid: { type: 'string', description: 'Unique iCalendar UID for the event (e.g., "event123@example.com")' },
        summary: { type: 'string', description: 'Event title/summary' },
        description: { type: 'string', description: 'Event description' },
        location: { type: 'string', description: 'Event location' },
        start_date_time: { type: 'string', description: 'Start time in RFC 3339 format for timed events' },
        start_date: { type: 'string', description: 'Start date for all-day events (YYYY-MM-DD)' },
        start_time_zone: { type: 'string', description: 'Time zone for start time' },
        end_date_time: { type: 'string', description: 'End time in RFC 3339 format for timed events' },
        end_date: { type: 'string', description: 'End date for all-day events (YYYY-MM-DD)' },
        end_time_zone: { type: 'string', description: 'Time zone for end time' },
      },
      required: ['calendar_id', 'ical_uid'],
    },
    annotations: { title: 'Import Event', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },

  // ========== CalendarList (5) ==========
  {
    name: 'gcal_list_calendars',
    description: 'List all calendars the user has subscribed to. Includes the primary calendar, other owned calendars, and calendars shared with the user.',
    inputSchema: {
      type: 'object',
      properties: {
        max_results: { type: 'number', description: 'Maximum number of calendars to return' },
        page_token: { type: 'string', description: 'Token for next page of results' },
        show_deleted: { type: 'boolean', description: 'Include deleted calendar entries' },
        show_hidden: { type: 'boolean', description: 'Include hidden calendar entries' },
      },
    },
    annotations: { title: 'List Calendars', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gcal_get_calendar_entry',
    description: 'Get a specific calendar list entry with display settings, color, notifications, and access role.',
    inputSchema: {
      type: 'object',
      properties: {
        calendar_id: { type: 'string', description: 'Calendar ID (use "primary" for the main calendar)' },
      },
      required: ['calendar_id'],
    },
    annotations: { title: 'Get Calendar Entry', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gcal_add_calendar',
    description: 'Subscribe to an existing calendar by its ID. Adds the calendar to the user\'s calendar list.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Calendar ID to subscribe to (e.g., "user@example.com" or a group calendar ID)' },
        color_id: { type: 'string', description: 'Display color ID for this calendar (use gcal_get_colors)' },
        summary_override: { type: 'string', description: 'Custom display name for this calendar (overrides the calendar\'s own name)' },
        hidden: { type: 'boolean', description: 'Whether to hide this calendar from the list' },
        selected: { type: 'boolean', description: 'Whether events are shown by default' },
      },
      required: ['id'],
    },
    annotations: { title: 'Add Calendar', readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
  {
    name: 'gcal_update_calendar_entry',
    description: 'Update display settings for a calendar in the user\'s list. Changes color, display name, visibility, and default reminders.',
    inputSchema: {
      type: 'object',
      properties: {
        calendar_id: { type: 'string', description: 'Calendar ID to update settings for' },
        color_id: { type: 'string', description: 'New display color ID' },
        summary_override: { type: 'string', description: 'Custom display name override' },
        hidden: { type: 'boolean', description: 'Whether to hide this calendar' },
        selected: { type: 'boolean', description: 'Whether events are shown by default' },
        default_reminders: {
          type: 'array',
          description: 'Default reminders for events on this calendar',
          items: {
            type: 'object',
            properties: {
              method: { type: 'string', description: 'Reminder method: "email" or "popup"' },
              minutes: { type: 'number', description: 'Minutes before event to trigger reminder' },
            },
          },
        },
      },
      required: ['calendar_id'],
    },
    annotations: { title: 'Update Calendar Entry', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gcal_remove_calendar',
    description: 'Unsubscribe from a calendar, removing it from the user\'s calendar list. Does not delete the calendar itself.',
    inputSchema: {
      type: 'object',
      properties: {
        calendar_id: { type: 'string', description: 'Calendar ID to unsubscribe from' },
      },
      required: ['calendar_id'],
    },
    annotations: { title: 'Remove Calendar', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },

  // ========== Calendars (5) ==========
  {
    name: 'gcal_get_calendar',
    description: 'Get calendar metadata including summary, description, location, and time zone.',
    inputSchema: {
      type: 'object',
      properties: {
        calendar_id: { type: 'string', description: 'Calendar ID (use "primary" for the main calendar)' },
      },
      required: ['calendar_id'],
    },
    annotations: { title: 'Get Calendar', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gcal_create_calendar',
    description: 'Create a new secondary calendar. The authenticated user becomes the owner.',
    inputSchema: {
      type: 'object',
      properties: {
        summary: { type: 'string', description: 'Calendar name/title' },
        description: { type: 'string', description: 'Calendar description' },
        location: { type: 'string', description: 'Geographic location of the calendar' },
        time_zone: { type: 'string', description: 'Calendar time zone (e.g., "America/New_York", "Asia/Bangkok")' },
      },
      required: ['summary'],
    },
    annotations: { title: 'Create Calendar', readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
  {
    name: 'gcal_update_calendar',
    description: 'Update calendar metadata (summary, description, location, time zone). Only works on secondary calendars the user owns.',
    inputSchema: {
      type: 'object',
      properties: {
        calendar_id: { type: 'string', description: 'Calendar ID to update' },
        summary: { type: 'string', description: 'New calendar name/title' },
        description: { type: 'string', description: 'New calendar description' },
        location: { type: 'string', description: 'New geographic location' },
        time_zone: { type: 'string', description: 'New time zone (e.g., "America/New_York")' },
      },
      required: ['calendar_id'],
    },
    annotations: { title: 'Update Calendar', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gcal_delete_calendar',
    description: 'Delete a secondary calendar. Only works on calendars the user owns. The primary calendar cannot be deleted.',
    inputSchema: {
      type: 'object',
      properties: {
        calendar_id: { type: 'string', description: 'Calendar ID to delete (cannot be "primary")' },
      },
      required: ['calendar_id'],
    },
    annotations: { title: 'Delete Calendar', readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gcal_clear_calendar',
    description: 'Delete all events from a primary calendar. Only works on the primary calendar. Secondary calendars should use gcal_delete_calendar instead.',
    inputSchema: {
      type: 'object',
      properties: {
        calendar_id: { type: 'string', description: 'Calendar ID to clear (typically "primary")' },
      },
      required: ['calendar_id'],
    },
    annotations: { title: 'Clear Calendar', readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
  },

  // ========== ACL (5) ==========
  {
    name: 'gcal_list_acl',
    description: 'List access control rules for a calendar. Shows who has access and their permission level.',
    inputSchema: {
      type: 'object',
      properties: {
        calendar_id: { type: 'string', description: 'Calendar ID to list ACL rules for' },
        max_results: { type: 'number', description: 'Maximum number of rules to return' },
        page_token: { type: 'string', description: 'Token for next page of results' },
        show_deleted: { type: 'boolean', description: 'Include deleted ACL rules' },
      },
      required: ['calendar_id'],
    },
    annotations: { title: 'List ACL Rules', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gcal_get_acl',
    description: 'Get a specific access control rule by rule ID.',
    inputSchema: {
      type: 'object',
      properties: {
        calendar_id: { type: 'string', description: 'Calendar ID' },
        rule_id: { type: 'string', description: 'ACL rule ID (e.g., "user:user@example.com")' },
      },
      required: ['calendar_id', 'rule_id'],
    },
    annotations: { title: 'Get ACL Rule', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gcal_create_acl',
    description: 'Share a calendar with a user, group, or domain by creating an access control rule.',
    inputSchema: {
      type: 'object',
      properties: {
        calendar_id: { type: 'string', description: 'Calendar ID to share' },
        role: { type: 'string', description: 'Permission level for the grantee', enum: ['none', 'freeBusyReader', 'reader', 'writer', 'owner'] },
        scope_type: { type: 'string', description: 'Type of the grantee: "user", "group", "domain", or "default" (public)', enum: ['user', 'group', 'domain', 'default'] },
        scope_value: { type: 'string', description: 'Email address (user/group) or domain name. Not required for scope_type="default"' },
        send_notifications: { type: 'boolean', description: 'Send notification email to the grantee (default: true)' },
      },
      required: ['calendar_id', 'role', 'scope_type'],
    },
    annotations: { title: 'Create ACL Rule', readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
  {
    name: 'gcal_update_acl',
    description: 'Update the permission level of an existing access control rule.',
    inputSchema: {
      type: 'object',
      properties: {
        calendar_id: { type: 'string', description: 'Calendar ID' },
        rule_id: { type: 'string', description: 'ACL rule ID to update (e.g., "user:user@example.com")' },
        role: { type: 'string', description: 'New permission level', enum: ['none', 'freeBusyReader', 'reader', 'writer', 'owner'] },
        send_notifications: { type: 'boolean', description: 'Send notification about the change' },
      },
      required: ['calendar_id', 'rule_id', 'role'],
    },
    annotations: { title: 'Update ACL Rule', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gcal_delete_acl',
    description: 'Remove an access control rule, revoking the grantee\'s access to the calendar.',
    inputSchema: {
      type: 'object',
      properties: {
        calendar_id: { type: 'string', description: 'Calendar ID' },
        rule_id: { type: 'string', description: 'ACL rule ID to delete (e.g., "user:user@example.com")' },
      },
      required: ['calendar_id', 'rule_id'],
    },
    annotations: { title: 'Delete ACL Rule', readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
  },

  // ========== Utility (3) ==========
  {
    name: 'gcal_query_freebusy',
    description: 'Check availability (free/busy) for one or more calendars within a time range. Useful for finding meeting times.',
    inputSchema: {
      type: 'object',
      properties: {
        time_min: { type: 'string', description: 'Start of the time range in RFC 3339 format (e.g., "2026-03-15T08:00:00Z")' },
        time_max: { type: 'string', description: 'End of the time range in RFC 3339 format (e.g., "2026-03-15T18:00:00Z")' },
        time_zone: { type: 'string', description: 'Time zone for the response (e.g., "America/New_York")' },
        calendar_ids: {
          type: 'array',
          description: 'Calendar IDs to check availability for (e.g., ["primary", "user@example.com"])',
          items: { type: 'string' },
        },
      },
      required: ['time_min', 'time_max', 'calendar_ids'],
    },
    annotations: { title: 'Query Free/Busy', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gcal_get_colors',
    description: 'Get the color palette for calendars and events. Returns color IDs that can be used with gcal_create_event and gcal_update_calendar_entry.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    annotations: { title: 'Get Colors', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gcal_list_settings',
    description: 'List all user settings for Google Calendar (locale, timezone, date format, week start, etc.).',
    inputSchema: {
      type: 'object',
      properties: {
        max_results: { type: 'number', description: 'Maximum number of settings to return' },
        page_token: { type: 'string', description: 'Token for next page of results' },
      },
    },
    annotations: { title: 'List Settings', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
];
