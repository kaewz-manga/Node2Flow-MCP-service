/**
 * Bright Data Plugin Content
 * All Bright Data-specific content used by global pages (Landing, Dashboard, Documentation, FAQ).
 */

import { Globe, Search, ShoppingCart } from 'lucide-react';
import type { PluginContent } from '../registry';

export const brightdataContent: PluginContent = {
  // ============================================
  // Landing Page
  // ============================================

  tagline: 'Web Scraping & Data Extraction',
  description:
    'Scrape websites, extract structured data, and search the web using Bright Data\'s infrastructure. Handles anti-bot protection and JavaScript rendering.',

  features: [
    {
      icon: <Search className="h-6 w-6" />,
      title: 'Search & Scrape',
      description:
        'Search Google, Bing, or Yandex. Scrape any URL as Markdown or HTML with anti-bot bypass.',
    },
    {
      icon: <ShoppingCart className="h-6 w-6" />,
      title: 'E-commerce & Social Data',
      description:
        'Extract product data from Amazon, Walmart, eBay. Get social media profiles and posts.',
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: 'Browser Automation',
      description:
        'Navigate, click, fill forms, and take screenshots with a cloud browser. No infrastructure needed.',
    },
  ],

  setupSteps: [
    {
      title: 'Connect Bright Data',
      description:
        'Add your Bright Data API token. Your credentials are encrypted and securely stored.',
    },
  ],

  demoCode: `> Scrape the pricing page of example.com

Scraped https://example.com/pricing as Markdown:

# Pricing Plans

| Plan    | Price   | Features       |
|---------|---------|----------------|
| Free    | $0/mo   | 100 requests   |
| Pro     | $49/mo  | 10,000 requests|
| Enterprise | Custom | Unlimited    |

> Search for "best web scraping tools 2026"

Found 10 results from Google:
1. Top Web Scraping Tools Comparison (techreview.com)
2. Bright Data vs Competitors (scraperapi.dev)
...`,

  externalDocUrl: 'https://docs.brightdata.com',

  // ============================================
  // Dashboard
  // ============================================

  quickStartSteps: [
    'Get your API token from Bright Data dashboard',
    'Add a connection with your token',
    'Copy the generated Service API key',
    'Start scraping and extracting data!',
  ],

  emptyConnectionCTA: 'Add your first Bright Data connection',

  // ============================================
  // Documentation
  // ============================================

  connectionGuide: (
    <>
      <p className="text-muted-foreground mb-4">
        Go to <strong>Connections</strong> and add your Bright Data API token:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
        <li>
          <strong className="text-foreground">Name:</strong> A friendly name (e.g., "My Scraper")
        </li>
        <li>
          <strong className="text-foreground">API Token:</strong> Your token from{' '}
          <a
            href="https://brightdata.com/cp/setting/users"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Bright Data Dashboard
          </a>
        </li>
      </ul>
    </>
  ),

  examplePrompts: [
    'Scrape example.com as markdown',
    'Search Google for "web scraping tools"',
    'Get Amazon product details for ASIN B09V3KXJPB',
    'Take a screenshot of example.com',
  ],

  mcpConfigName: 'brightdata',

  // ============================================
  // FAQ
  // ============================================

  faqCategories: [
    {
      name: 'Bright Data',
      icon: <Globe className="h-5 w-5" />,
      items: [
        {
          question: 'How do I get a Bright Data API token?',
          answer: (
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Go to{' '}
                <a
                  href="https://brightdata.com/cp/setting/users"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Bright Data Dashboard
                </a>
              </li>
              <li>Navigate to Settings &gt; API tokens</li>
              <li>Create a new API token</li>
              <li>Copy the generated token</li>
            </ol>
          ),
        },
        {
          question: 'Is my API token secure?',
          answer: (
            <div className="space-y-2">
              <p>Yes, we take security seriously:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Your API token is <strong>encrypted with AES-256-GCM</strong> before storage
                </li>
                <li>We only decrypt when proxying requests to Bright Data</li>
                <li>All communications use HTTPS/TLS encryption</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'What can I scrape with Bright Data?',
          answer: (
            <div className="space-y-2">
              <p>The Bright Data plugin provides 65 tools covering:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Web Scraping</strong> - Scrape any URL as Markdown or HTML
                </li>
                <li>
                  <strong>Search Engines</strong> - Google, Bing, Yandex SERP results
                </li>
                <li>
                  <strong>E-commerce</strong> - Amazon, Walmart, eBay, AliExpress product data
                </li>
                <li>
                  <strong>Social Media</strong> - LinkedIn, Instagram, Facebook, X profiles
                </li>
                <li>
                  <strong>Browser Automation</strong> - Navigate, click, fill forms, screenshots
                </li>
                <li>
                  <strong>Finance</strong> - Stock data, company info, market research
                </li>
              </ul>
            </div>
          ),
        },
      ],
    },
  ],
};
