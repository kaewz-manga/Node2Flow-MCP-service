/**
 * Instagram Plugin Content
 * All Instagram-specific content used by global pages (Landing, Dashboard, Documentation, FAQ).
 */

import { Camera, BarChart3, Hash } from 'lucide-react';
import type { PluginContent } from '../registry';

export const instagramContent: PluginContent = {
  // ============================================
  // Landing Page
  // ============================================

  tagline: 'Manage Instagram with AI',
  description:
    'Manage your Instagram Business or Creator account through AI — publish photos, reels, carousels, and stories, moderate comments, track insights, search hashtags, and discover users.',

  features: [
    {
      icon: <Camera className="h-6 w-6" />,
      title: 'Content Publishing',
      description:
        'Publish photos, carousels, reels, and stories to your Instagram account. Add captions, location tags, and user tags with AI assistance.',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Analytics & Insights',
      description:
        'Access account and media insights including impressions, reach, engagement, and follower demographics. Track content performance over time.',
    },
    {
      icon: <Hash className="h-6 w-6" />,
      title: 'Hashtag & Discovery',
      description:
        'Search hashtags, discover other business accounts, view trending content, and monitor mentions and tags for your brand.',
    },
  ],

  setupSteps: [
    {
      title: 'Create a Facebook App',
      description:
        'Go to developers.facebook.com and create a new app. Add the Instagram Graph API product and configure the required permissions (instagram_basic, instagram_content_publish, instagram_manage_comments, instagram_manage_insights).',
    },
    {
      title: 'Get Access Token',
      description:
        'Generate a long-lived User Access Token with Instagram permissions from the Graph API Explorer. Your Instagram account must be a Business or Creator account linked to a Facebook Page.',
    },
  ],

  demoCode: `> Publish a photo to my Instagram account

Published photo to @mybusiness:
"New arrivals just dropped! Check out our latest collection."
Media ID: 17895695123456789
Permalink: https://www.instagram.com/p/ABC123/

> Get my account insights for the last 7 days

Account Insights (Last 7 days):
- Impressions: 12,450 (+8%)
- Reach: 8,234
- Profile Views: 567
- Follower Count: 2,345 (+23 new)

> Search hashtag #photography and get top posts

Found hashtag ID: 17843857123456789
Top 5 posts for #photography:
1. @naturephotos - 45.2K likes (landscape)
2. @streetshots - 38.1K likes (urban)
3. @portraitpro - 32.8K likes (portrait)`,

  externalDocUrl: 'https://developers.facebook.com/docs/instagram-api/',

  // ============================================
  // Dashboard
  // ============================================

  quickStartSteps: [
    'Create a Facebook App at developers.facebook.com',
    'Link your Instagram Business/Creator account to a Facebook Page',
    'Generate a long-lived Access Token with Instagram permissions',
    'Add a connection with your token and optional Account ID',
    'Copy the generated API key',
    'Start managing your Instagram account with AI!',
  ],

  emptyConnectionCTA: 'Add your first Instagram connection',

  // ============================================
  // Documentation
  // ============================================

  connectionGuide: (
    <>
      <p className="text-muted-foreground mb-4">
        Go to <strong>Connections</strong> and add your Instagram credentials:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
        <li>
          <strong className="text-foreground">Access Token:</strong> A long-lived User Access Token with Instagram permissions (instagram_basic, instagram_content_publish, instagram_manage_comments, instagram_manage_insights)
        </li>
        <li>
          <strong className="text-foreground">Account ID:</strong> (Optional) Your Instagram Business Account ID — can be found via the /me/accounts endpoint
        </li>
      </ul>
    </>
  ),

  examplePrompts: [
    'Publish a photo to my Instagram account',
    'List my recent Instagram posts',
    'Get account insights for the last 30 days',
    'Search for trending posts with #photography',
  ],

  mcpConfigName: 'instagram',

  // ============================================
  // FAQ
  // ============================================

  faqCategories: [
    {
      name: 'Instagram',
      icon: <Camera className="h-5 w-5" />,
      items: [
        {
          question: 'What do I need to get started?',
          answer: (
            <div className="space-y-2">
              <p>You need a <strong>Facebook App</strong> and an <strong>Instagram Business/Creator account</strong>:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Go to <strong>developers.facebook.com</strong> and create a new app</li>
                <li>Add the <strong>Instagram Graph API</strong> product</li>
                <li>Link your Instagram account to a <strong>Facebook Page</strong></li>
                <li>Generate a <strong>long-lived User Access Token</strong> with Instagram permissions</li>
                <li>For production, use a <strong>System User</strong> token (never expires)</li>
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
                <li><strong>instagram_basic</strong> — Read account profile and media</li>
                <li><strong>instagram_content_publish</strong> — Publish photos, reels, carousels, and stories</li>
                <li><strong>instagram_manage_comments</strong> — Read, reply, delete, and hide comments</li>
                <li><strong>instagram_manage_insights</strong> — Access account and media analytics</li>
                <li><strong>pages_show_list</strong> — List Facebook Pages linked to your account</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'What tools are available?',
          answer: (
            <div className="space-y-2">
              <p>25 tools across 9 categories:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Account</strong> — Profile info, account insights, list media</li>
                <li><strong>Publishing</strong> — Photos, carousels, reels, and stories</li>
                <li><strong>Media</strong> — Get media details, insights, and carousel children</li>
                <li><strong>Comments</strong> — List, reply, delete, hide comments, and list replies</li>
                <li><strong>Stories</strong> — List active stories and get story insights</li>
                <li><strong>Hashtags</strong> — Search, recent media, and top media</li>
                <li><strong>Discovery</strong> — Discover other business accounts</li>
                <li><strong>Publishing Limit</strong> — Check content publishing rate limits</li>
                <li><strong>Mentions</strong> — List tags and get mentioned media</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'Do I need to specify an Account ID?',
          answer: (
            <div className="space-y-2">
              <p>The <strong>Account ID</strong> field is optional. If you provide it in the connection config, it will be used as the default for all tools.</p>
              <p className="mt-2">You can also pass <code>account_id</code> as a parameter to individual tools to override the default.</p>
              <p className="mt-2">To find your Account ID, use the <strong>Facebook Graph API Explorer</strong> to call <code>/me/accounts</code> and look for the <code>instagram_business_account</code> field.</p>
            </div>
          ),
        },
      ],
    },
  ],
};
