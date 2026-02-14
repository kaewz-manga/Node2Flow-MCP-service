/**
 * YouTube Data API v3 Plugin Content
 * All YouTube-specific content used by global pages (Landing, Dashboard, Documentation, FAQ).
 */

import { Play, ListVideo, MessageSquare } from 'lucide-react';
import type { PluginContent } from '../registry';

export const youtubeContent: PluginContent = {
  // ============================================
  // Landing Page
  // ============================================

  tagline: 'Manage YouTube with AI',
  description:
    'Search videos, manage playlists, post comments, and interact with YouTube Data API through natural language.',

  features: [
    {
      icon: <Play className="h-6 w-6" />,
      title: 'Video Search & Discovery',
      description:
        'Search videos, get video details, browse trending content, and explore channels.',
    },
    {
      icon: <ListVideo className="h-6 w-6" />,
      title: 'Playlist Management',
      description:
        'Create, update, and delete playlists. Add or remove videos from playlists.',
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: 'Comments & Engagement',
      description:
        'Post comments, reply to threads, rate videos, and manage comment threads.',
    },
  ],

  setupSteps: [
    {
      title: 'Connect YouTube',
      description:
        'Add your OAuth 2.0 credentials (Client ID, Client Secret, Refresh Token). Your credentials are encrypted and securely stored.',
    },
  ],

  demoCode: `> Search for "TypeScript tutorial" videos

Found 10 results:
1. TypeScript Full Course 2024 (1.2M views)
2. TypeScript for Beginners (800K views)
...

> Create a playlist called "Learning TS"

Playlist created!
ID: PLxyz123
Title: Learning TS
Privacy: Private

> Add video dQw4w9WgXcQ to my playlist

Video added to "Learning TS" at position 0`,

  externalDocUrl: 'https://developers.google.com/youtube/v3/docs',

  // ============================================
  // Dashboard
  // ============================================

  quickStartSteps: [
    'Create a project in Google Cloud Console',
    'Enable the YouTube Data API v3',
    'Create OAuth 2.0 credentials (Client ID + Secret)',
    'Generate a Refresh Token using the OAuth playground',
    'Add a connection with your credentials',
  ],

  emptyConnectionCTA: 'Add your first YouTube connection',

  // ============================================
  // Documentation
  // ============================================

  connectionGuide: (
    <>
      <p className="text-muted-foreground mb-4">
        Go to <strong>Connections</strong> and add your YouTube credentials:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
        <li>
          <strong className="text-foreground">Name:</strong> A friendly name (e.g., "My YouTube")
        </li>
        <li>
          <strong className="text-foreground">Client ID:</strong> From{' '}
          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Google Cloud Console
          </a>
        </li>
        <li>
          <strong className="text-foreground">Client Secret:</strong> From the same OAuth 2.0 credentials
        </li>
        <li>
          <strong className="text-foreground">Refresh Token:</strong> Generated via OAuth consent flow
        </li>
      </ul>
    </>
  ),

  examplePrompts: [
    'Search for "React tutorial" on YouTube',
    'Get details about video dQw4w9WgXcQ',
    'Create a playlist called "Favorites"',
    'List comments on video xyz123',
  ],

  mcpConfigName: 'youtube',

  // ============================================
  // FAQ
  // ============================================

  faqCategories: [
    {
      name: 'YouTube Connection',
      icon: <Play className="h-5 w-5" />,
      items: [
        {
          question: 'How do I get YouTube API credentials?',
          answer: (
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Go to{' '}
                <a
                  href="https://console.cloud.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google Cloud Console
                </a>
              </li>
              <li>Create a new project or select existing one</li>
              <li>Enable "YouTube Data API v3" in APIs & Services</li>
              <li>Create OAuth 2.0 Client ID credentials</li>
              <li>Use OAuth Playground or your app to get a Refresh Token</li>
            </ol>
          ),
        },
        {
          question: 'Are my credentials secure?',
          answer: (
            <div className="space-y-2">
              <p>Yes, we take security seriously:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your credentials are <strong>encrypted with AES-256-GCM</strong> before storage</li>
                <li>We only decrypt when proxying requests to YouTube API</li>
                <li>Access tokens are auto-refreshed and never stored</li>
                <li>All communications use HTTPS/TLS encryption</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'What YouTube features can I access via MCP?',
          answer: (
            <div className="space-y-2">
              <p>The YouTube plugin provides 20 tools covering:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Search & Discovery</strong> - Search videos, get video/channel details, trending</li>
                <li><strong>Playlists</strong> - Create, update, delete playlists, manage items</li>
                <li><strong>Comments</strong> - Post, reply, update, delete comments</li>
                <li><strong>Engagement</strong> - Rate videos (like/dislike), subscriptions, categories</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'What about YouTube API quota?',
          answer: (
            <div className="space-y-2">
              <p>YouTube Data API v3 has a daily quota of <strong>10,000 units</strong>:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Read operations cost 1 unit each</li>
                <li>Search costs 100 units per request</li>
                <li>Write operations cost 50 units each</li>
                <li>You can request higher quota from Google Cloud Console</li>
              </ul>
            </div>
          ),
        },
      ],
    },
  ],
};
