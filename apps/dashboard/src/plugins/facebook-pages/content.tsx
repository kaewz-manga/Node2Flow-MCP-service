/**
 * Facebook Pages Plugin Content
 * All Facebook Pages-specific content used by global pages (Landing, Dashboard, Documentation, FAQ).
 */

import { FileText, BarChart3, MessageSquare } from 'lucide-react';
import type { PluginContent } from '../registry';

export const facebookPagesContent: PluginContent = {
  // ============================================
  // Landing Page
  // ============================================

  tagline: 'Manage Facebook Pages with AI',
  description:
    'Manage your Facebook Pages through AI — create and schedule posts, moderate comments, upload photos and videos, track page insights, and handle Messenger conversations.',

  features: [
    {
      icon: <FileText className="h-6 w-6" />,
      title: 'Post Management',
      description:
        'Create, schedule, edit, and delete posts on your Facebook Page. Upload photos and videos, manage link previews, and control post visibility.',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Analytics & Insights',
      description:
        'Access detailed page insights including reach, engagement, impressions, and follower demographics. Track post performance and audience growth over time.',
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: 'Messenger Integration',
      description:
        'Read and reply to Messenger conversations from your Page. Manage customer inquiries, send quick replies, and automate common responses.',
    },
  ],

  setupSteps: [
    {
      title: 'Create a Facebook App',
      description:
        'Go to developers.facebook.com and create a new app. Enable the Pages API and configure the required permissions (pages_manage_posts, pages_read_engagement, pages_messaging).',
    },
    {
      title: 'Get Page Access Token',
      description:
        'Generate a Page Access Token from the Graph API Explorer or your app settings. Use a long-lived token for production use.',
    },
  ],

  demoCode: `> Create a new post on my Facebook Page

Created post on "My Business Page":
"Exciting news! We just launched our new product line.
Check it out at our website!"
Post ID: 123456789_987654321

> Get page insights for the last 7 days

Page Insights (Last 7 days):
- Page Views: 1,234 (+12%)
- Post Reach: 8,567
- Engagement: 432 reactions, 89 comments, 56 shares
- New Followers: 67
- Messenger Conversations: 23

> List recent comments on my latest post

Found 5 comments on post "Exciting news!...":
1. "Love the new products!" - Jane D. (2h ago)
2. "When will these be available?" - Mark S. (3h ago)
3. "Great work, team!" - Sarah L. (5h ago)`,

  externalDocUrl: 'https://developers.facebook.com/docs/pages-api/',

  // ============================================
  // Dashboard
  // ============================================

  quickStartSteps: [
    'Create a Facebook App at developers.facebook.com',
    'Generate a Page Access Token with required permissions',
    'Add a connection with your token and optional Page ID',
    'Copy the generated API key',
    'Start managing your Facebook Page with AI!',
  ],

  emptyConnectionCTA: 'Add your first Facebook Page connection',

  // ============================================
  // Documentation
  // ============================================

  connectionGuide: (
    <>
      <p className="text-muted-foreground mb-4">
        Go to <strong>Connections</strong> and add your Facebook Page credentials:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
        <li>
          <strong className="text-foreground">Page Access Token:</strong> A long-lived Page Access Token from your Facebook App (requires pages_manage_posts, pages_read_engagement permissions)
        </li>
        <li>
          <strong className="text-foreground">Page ID:</strong> (Optional) Your Facebook Page ID — auto-detected from the token if omitted
        </li>
      </ul>
    </>
  ),

  examplePrompts: [
    'Create a new post on my Facebook Page',
    'List comments on my latest post',
    'Get page insights for the last 30 days',
    'Send a reply to the latest Messenger conversation',
  ],

  mcpConfigName: 'facebook-pages',

  // ============================================
  // FAQ
  // ============================================

  faqCategories: [
    {
      name: 'Facebook Pages',
      icon: <FileText className="h-5 w-5" />,
      items: [
        {
          question: 'What do I need to get started?',
          answer: (
            <div className="space-y-2">
              <p>You need a <strong>Facebook App</strong> and a <strong>Page Access Token</strong>:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Go to <strong>developers.facebook.com</strong> and create a new app</li>
                <li>Add the <strong>Facebook Login</strong> and <strong>Pages API</strong> products</li>
                <li>Generate a <strong>Page Access Token</strong> from the Graph API Explorer</li>
                <li>For production, convert it to a <strong>long-lived token</strong> (60-day expiry or never-expiring with system user)</li>
              </ol>
            </div>
          ),
        },
        {
          question: 'What permissions are required?',
          answer: (
            <div className="space-y-2">
              <p>The following permissions are needed depending on your use case:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>pages_manage_posts</strong> — Create, edit, and delete posts</li>
                <li><strong>pages_read_engagement</strong> — Read comments, reactions, and insights</li>
                <li><strong>pages_messaging</strong> — Read and send Messenger messages</li>
                <li><strong>pages_read_user_content</strong> — Read user posts and comments on your Page</li>
                <li><strong>pages_manage_metadata</strong> — Manage Page settings and metadata</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'What tools are available?',
          answer: (
            <div className="space-y-2">
              <p>Tools for managing your Facebook Page:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Post Management</strong> — Create, edit, delete, and schedule posts with photos/videos</li>
                <li><strong>Comments</strong> — List, reply to, hide, and delete comments</li>
                <li><strong>Insights</strong> — Page analytics, post performance, audience demographics</li>
                <li><strong>Messenger</strong> — Read conversations, send replies, manage messages</li>
                <li><strong>Photos & Videos</strong> — Upload media, create albums, manage galleries</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'Do I need to specify a Page ID?',
          answer: (
            <div className="space-y-2">
              <p>The <strong>Page ID</strong> field is optional. If you leave it empty, the Page ID will be automatically detected from your Page Access Token.</p>
              <p className="mt-2">You only need to specify it if your token has access to multiple pages and you want to target a specific one.</p>
            </div>
          ),
        },
      ],
    },
  ],
};
