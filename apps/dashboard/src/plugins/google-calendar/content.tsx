/**
 * Google Calendar Plugin Content
 */

import { CalendarDays, Tag, Share2 } from 'lucide-react';
import type { PluginContent } from '../registry';

export const googleCalendarContent: PluginContent = {
  tagline: 'Manage Google Calendar with AI',
  description:
    'Create events, manage calendars, check availability, and share calendars. Control your schedule with 28 powerful tools across events, calendars, and access control.',

  features: [
    {
      icon: <CalendarDays className="h-6 w-6" />,
      title: 'Events & Scheduling',
      description:
        'Create, update, delete events with recurrence support. Quick add with natural language. Find free/busy times and meeting slots.',
    },
    {
      icon: <Tag className="h-6 w-6" />,
      title: 'Calendar Management',
      description:
        'List all calendars, create new calendars with custom colors, update settings, manage multiple calendars efficiently.',
    },
    {
      icon: <Share2 className="h-6 w-6" />,
      title: 'Sharing & Availability',
      description:
        'Share calendars with ACL rules, check availability across calendars, manage access permissions for team collaboration.',
    },
  ],

  setupSteps: [
    {
      title: 'Connect Google Calendar',
      description:
        'Add your Google OAuth 2.0 Client ID, Client Secret, and Refresh Token. Enable the Google Calendar API in Google Cloud Console.',
    },
  ],

  demoCode: `> Create a team meeting tomorrow at 2pm

Created event: Team Meeting
Start: 2026-02-16 14:00
End: 2026-02-16 15:00
Event ID: abc123xyz

> Check my availability this week

Free slots found:
- Mon 10:00-12:00
- Wed 14:00-17:00
- Fri 09:00-11:00

> Create a new calendar "Project Alpha" with blue color

Created calendar: Project Alpha (#4285F4)
Calendar ID: abc123@group.calendar.google.com

> Share my calendar with team@company.com (read-only)

ACL rule created: team@company.com (reader)`,

  externalDocUrl: 'https://developers.google.com/calendar/api',

  quickStartSteps: [
    'Create OAuth 2.0 credentials in Google Cloud Console',
    'Enable the Google Calendar API for your project',
    'Generate a refresh token with Calendar scopes',
    'Add a connection with your credentials',
    'Copy the generated API key',
    'Start managing your calendar with AI!',
  ],

  emptyConnectionCTA: 'Add your first Google Calendar connection',

  connectionGuide: (
    <>
      <p className="text-muted-foreground mb-4">
        Go to <strong>Connections</strong> and add your Google Calendar account:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
        <li>
          <strong className="text-foreground">Name:</strong> A friendly name (e.g., "Work Calendar")
        </li>
        <li>
          <strong className="text-foreground">Client ID:</strong> From Google Cloud Console &gt; APIs &amp; Services &gt; Credentials
        </li>
        <li>
          <strong className="text-foreground">Client Secret:</strong> The secret paired with your Client ID
        </li>
        <li>
          <strong className="text-foreground">Refresh Token:</strong> Generated via OAuth Playground or a script with Calendar scopes
        </li>
      </ul>
    </>
  ),

  examplePrompts: [
    'Create a meeting tomorrow at 2pm with john@company.com',
    'List all my calendars',
    'Check my availability next week',
    'Find free slots for a 1-hour meeting this week',
    'Share my calendar with team@company.com',
    'Create a new calendar for project tracking',
  ],

  mcpConfigName: 'google-calendar',

  faqCategories: [
    {
      name: 'Google Calendar Connection',
      icon: <CalendarDays className="h-5 w-5" />,
      items: [
        {
          question: 'How do I get Google Calendar OAuth credentials?',
          answer: (
            <div className="space-y-2">
              <ol className="list-decimal pl-5 space-y-1">
                <li>Go to <strong>Google Cloud Console</strong> &gt; APIs &amp; Services &gt; Credentials</li>
                <li>Create an <strong>OAuth 2.0 Client ID</strong> (Desktop app type)</li>
                <li>Enable the <strong>Google Calendar API</strong> under Enabled APIs &amp; Services</li>
                <li>Use the <strong>OAuth Playground</strong> or a script to get a refresh token</li>
              </ol>
            </div>
          ),
        },
        {
          question: 'What Calendar scopes are needed?',
          answer: (
            <div className="space-y-2">
              <ul className="list-disc pl-5 space-y-1">
                <li><code className="bg-muted px-1 rounded">https://www.googleapis.com/auth/calendar</code> — Full access (recommended)</li>
                <li><code className="bg-muted px-1 rounded">https://www.googleapis.com/auth/calendar.readonly</code> — Read-only</li>
                <li><code className="bg-muted px-1 rounded">https://www.googleapis.com/auth/calendar.events</code> — Events only</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'What tools are available?',
          answer: (
            <div className="space-y-2">
              <p>28 tools across 5 categories:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Events (10)</strong> — Create, update, delete, list, get, quick add, move, import, watch changes</li>
                <li><strong>CalendarList (5)</strong> — List calendars, get calendar, add to list, update settings, remove</li>
                <li><strong>Calendars (5)</strong> — Create, update, delete, get, clear all events</li>
                <li><strong>ACL (5)</strong> — List access rules, get rule, create, update, delete sharing permissions</li>
                <li><strong>Utility (3)</strong> — Free/busy query, color definitions, settings</li>
              </ul>
            </div>
          ),
        },
      ],
    },
  ],
};

export default googleCalendarContent;
