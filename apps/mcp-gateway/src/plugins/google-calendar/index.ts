import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { CalendarClient } from './calendar-client';

function ok(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data ?? { success: true }, null, 2) }], isError: false };
}

export const googleCalendarPlugin: MCPPlugin = {
  id: 'google-calendar',
  name: 'Google Calendar',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    const clientId = config.client_id as string | undefined;
    const clientSecret = config.client_secret as string | undefined;
    const refreshToken = config.refresh_token as string | undefined;
    if (!clientId || !clientSecret || !refreshToken) return null;
    return new CalendarClient({ clientId, clientSecret, refreshToken });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const cal = client as CalendarClient;
    switch (toolName) {
      // ========== Events ==========
      case 'gcal_list_events':
        return ok(await cal.listEvents({
          calendarId: args.calendar_id as string,
          timeMin: args.time_min as string | undefined,
          timeMax: args.time_max as string | undefined,
          q: args.q as string | undefined,
          maxResults: args.max_results as number | undefined,
          pageToken: args.page_token as string | undefined,
          singleEvents: args.single_events as boolean | undefined,
          orderBy: args.order_by as string | undefined,
          timeZone: args.time_zone as string | undefined,
          showDeleted: args.show_deleted as boolean | undefined,
        }));
      case 'gcal_get_event':
        return ok(await cal.getEvent({
          calendarId: args.calendar_id as string,
          eventId: args.event_id as string,
          timeZone: args.time_zone as string | undefined,
        }));
      case 'gcal_create_event':
        return ok(await cal.createEvent({
          calendarId: args.calendar_id as string,
          summary: args.summary as string | undefined,
          description: args.description as string | undefined,
          location: args.location as string | undefined,
          startDateTime: args.start_date_time as string | undefined,
          startDate: args.start_date as string | undefined,
          startTimeZone: args.start_time_zone as string | undefined,
          endDateTime: args.end_date_time as string | undefined,
          endDate: args.end_date as string | undefined,
          endTimeZone: args.end_time_zone as string | undefined,
          attendees: args.attendees as string[] | undefined,
          recurrence: args.recurrence as string[] | undefined,
          colorId: args.color_id as string | undefined,
          visibility: args.visibility as string | undefined,
          transparency: args.transparency as string | undefined,
          sendUpdates: args.send_updates as string | undefined,
        }));
      case 'gcal_update_event':
        return ok(await cal.updateEvent({
          calendarId: args.calendar_id as string,
          eventId: args.event_id as string,
          summary: args.summary as string | undefined,
          description: args.description as string | undefined,
          location: args.location as string | undefined,
          startDateTime: args.start_date_time as string | undefined,
          startDate: args.start_date as string | undefined,
          startTimeZone: args.start_time_zone as string | undefined,
          endDateTime: args.end_date_time as string | undefined,
          endDate: args.end_date as string | undefined,
          endTimeZone: args.end_time_zone as string | undefined,
          attendees: args.attendees as string[] | undefined,
          recurrence: args.recurrence as string[] | undefined,
          colorId: args.color_id as string | undefined,
          visibility: args.visibility as string | undefined,
          transparency: args.transparency as string | undefined,
          sendUpdates: args.send_updates as string | undefined,
        }));
      case 'gcal_patch_event':
        return ok(await cal.patchEvent({
          calendarId: args.calendar_id as string,
          eventId: args.event_id as string,
          summary: args.summary as string | undefined,
          description: args.description as string | undefined,
          location: args.location as string | undefined,
          startDateTime: args.start_date_time as string | undefined,
          startDate: args.start_date as string | undefined,
          startTimeZone: args.start_time_zone as string | undefined,
          endDateTime: args.end_date_time as string | undefined,
          endDate: args.end_date as string | undefined,
          endTimeZone: args.end_time_zone as string | undefined,
          attendees: args.attendees as string[] | undefined,
          colorId: args.color_id as string | undefined,
          visibility: args.visibility as string | undefined,
          transparency: args.transparency as string | undefined,
          sendUpdates: args.send_updates as string | undefined,
        }));
      case 'gcal_delete_event':
        return ok(await cal.deleteEvent({
          calendarId: args.calendar_id as string,
          eventId: args.event_id as string,
          sendUpdates: args.send_updates as string | undefined,
        }));
      case 'gcal_quick_add':
        return ok(await cal.quickAdd({
          calendarId: args.calendar_id as string,
          text: args.text as string,
          sendUpdates: args.send_updates as string | undefined,
        }));
      case 'gcal_move_event':
        return ok(await cal.moveEvent({
          calendarId: args.calendar_id as string,
          eventId: args.event_id as string,
          destination: args.destination as string,
          sendUpdates: args.send_updates as string | undefined,
        }));
      case 'gcal_list_instances':
        return ok(await cal.listInstances({
          calendarId: args.calendar_id as string,
          eventId: args.event_id as string,
          timeMin: args.time_min as string | undefined,
          timeMax: args.time_max as string | undefined,
          maxResults: args.max_results as number | undefined,
          pageToken: args.page_token as string | undefined,
          timeZone: args.time_zone as string | undefined,
        }));
      case 'gcal_import_event':
        return ok(await cal.importEvent({
          calendarId: args.calendar_id as string,
          iCalUID: args.ical_uid as string,
          summary: args.summary as string | undefined,
          description: args.description as string | undefined,
          location: args.location as string | undefined,
          startDateTime: args.start_date_time as string | undefined,
          startDate: args.start_date as string | undefined,
          startTimeZone: args.start_time_zone as string | undefined,
          endDateTime: args.end_date_time as string | undefined,
          endDate: args.end_date as string | undefined,
          endTimeZone: args.end_time_zone as string | undefined,
        }));

      // ========== CalendarList ==========
      case 'gcal_list_calendars':
        return ok(await cal.listCalendars({
          maxResults: args.max_results as number | undefined,
          pageToken: args.page_token as string | undefined,
          showDeleted: args.show_deleted as boolean | undefined,
          showHidden: args.show_hidden as boolean | undefined,
        }));
      case 'gcal_get_calendar_entry':
        return ok(await cal.getCalendarEntry({
          calendarId: args.calendar_id as string,
        }));
      case 'gcal_add_calendar':
        return ok(await cal.addCalendar({
          id: args.id as string,
          colorId: args.color_id as string | undefined,
          summaryOverride: args.summary_override as string | undefined,
          hidden: args.hidden as boolean | undefined,
          selected: args.selected as boolean | undefined,
        }));
      case 'gcal_update_calendar_entry':
        return ok(await cal.updateCalendarEntry({
          calendarId: args.calendar_id as string,
          colorId: args.color_id as string | undefined,
          summaryOverride: args.summary_override as string | undefined,
          hidden: args.hidden as boolean | undefined,
          selected: args.selected as boolean | undefined,
          defaultReminders: args.default_reminders as { method: string; minutes: number }[] | undefined,
        }));
      case 'gcal_remove_calendar':
        return ok(await cal.removeCalendar({
          calendarId: args.calendar_id as string,
        }));

      // ========== Calendars ==========
      case 'gcal_get_calendar':
        return ok(await cal.getCalendar({
          calendarId: args.calendar_id as string,
        }));
      case 'gcal_create_calendar':
        return ok(await cal.createCalendar({
          summary: args.summary as string,
          description: args.description as string | undefined,
          location: args.location as string | undefined,
          timeZone: args.time_zone as string | undefined,
        }));
      case 'gcal_update_calendar':
        return ok(await cal.updateCalendar({
          calendarId: args.calendar_id as string,
          summary: args.summary as string | undefined,
          description: args.description as string | undefined,
          location: args.location as string | undefined,
          timeZone: args.time_zone as string | undefined,
        }));
      case 'gcal_delete_calendar':
        return ok(await cal.deleteCalendar({
          calendarId: args.calendar_id as string,
        }));
      case 'gcal_clear_calendar':
        return ok(await cal.clearCalendar({
          calendarId: args.calendar_id as string,
        }));

      // ========== ACL ==========
      case 'gcal_list_acl':
        return ok(await cal.listAcl({
          calendarId: args.calendar_id as string,
          maxResults: args.max_results as number | undefined,
          pageToken: args.page_token as string | undefined,
          showDeleted: args.show_deleted as boolean | undefined,
        }));
      case 'gcal_get_acl':
        return ok(await cal.getAcl({
          calendarId: args.calendar_id as string,
          ruleId: args.rule_id as string,
        }));
      case 'gcal_create_acl':
        return ok(await cal.createAcl({
          calendarId: args.calendar_id as string,
          role: args.role as string,
          scopeType: args.scope_type as string,
          scopeValue: args.scope_value as string | undefined,
          sendNotifications: args.send_notifications as boolean | undefined,
        }));
      case 'gcal_update_acl':
        return ok(await cal.updateAcl({
          calendarId: args.calendar_id as string,
          ruleId: args.rule_id as string,
          role: args.role as string,
          sendNotifications: args.send_notifications as boolean | undefined,
        }));
      case 'gcal_delete_acl':
        return ok(await cal.deleteAcl({
          calendarId: args.calendar_id as string,
          ruleId: args.rule_id as string,
        }));

      // ========== Utility ==========
      case 'gcal_query_freebusy':
        return ok(await cal.queryFreeBusy({
          timeMin: args.time_min as string,
          timeMax: args.time_max as string,
          timeZone: args.time_zone as string | undefined,
          calendarIds: args.calendar_ids as string[],
        }));
      case 'gcal_get_colors':
        return ok(await cal.getColors());
      case 'gcal_list_settings':
        return ok(await cal.listSettings({
          maxResults: args.max_results as number | undefined,
          pageToken: args.page_token as string | undefined,
        }));

      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${toolName}` }], isError: true };
    }
  },
};
