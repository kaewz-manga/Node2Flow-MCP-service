/**
 * Brightdata MCP Tool Definitions
 * Official Bright Data MCP server tools for web scraping, search, and data extraction.
 * All tool names prefixed with brightdata_ to avoid conflicts.
 *
 * Categories:
 *   - Core scraping & search (rapid mode, free tier)
 *   - E-commerce datasets
 *   - Social media datasets
 *   - Browser automation
 *   - Finance & business intelligence
 *   - Research & app stores
 *   - Travel
 */

import type { MCPToolDefinition } from '../../types';

export const TOOLS: MCPToolDefinition[] = [
  // ========== Core Scraping & Search (Rapid Mode) ==========
  {
    name: 'brightdata_search_engine',
    description: 'Scrape search results from Google, Bing or Yandex. Returns SERP results in JSON for Google and Markdown for Bing/Yandex.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query string' },
        engine: { type: 'string', enum: ['google', 'bing', 'yandex'], description: 'Search engine to use (default: google)' },
        cursor: { type: 'string', description: 'Pagination cursor for next page of results' },
      },
      required: ['query'],
    },
  },
  {
    name: 'brightdata_scrape_as_markdown',
    description: 'Scrape a single webpage URL and get back the content in clean Markdown format. Handles bot protection and JavaScript rendering.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'The URL to scrape' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_scrape_as_html',
    description: 'Scrape a single webpage URL and get back the raw HTML content. Handles bot protection and JavaScript rendering.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'The URL to scrape' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_scrape_batch',
    description: 'Scrape multiple webpages simultaneously and get back results in Markdown format. Max 5 URLs per batch.',
    inputSchema: {
      type: 'object',
      properties: {
        urls: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of URLs to scrape (max 5)',
          maxItems: 5,
          minItems: 1,
        },
      },
      required: ['urls'],
    },
  },
  {
    name: 'brightdata_search_engine_batch',
    description: 'Run multiple search queries simultaneously. Returns JSON for Google, Markdown for Bing/Yandex. Max 5 queries per batch.',
    inputSchema: {
      type: 'object',
      properties: {
        queries: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search query' },
              engine: { type: 'string', enum: ['google', 'bing', 'yandex'] },
              cursor: { type: 'string' },
            },
            required: ['query'],
          },
          description: 'Array of search queries (max 5)',
          maxItems: 5,
          minItems: 1,
        },
      },
      required: ['queries'],
    },
  },
  {
    name: 'brightdata_extract',
    description: 'Scrape a webpage and extract structured data as JSON using AI. Optionally provide a custom extraction prompt.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'The URL to scrape and extract from' },
        extraction_prompt: { type: 'string', description: 'Optional custom prompt for what data to extract' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_session_stats',
    description: 'Get tool usage statistics for the current session.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // ========== E-commerce Datasets ==========
  {
    name: 'brightdata_web_data_amazon_product',
    description: 'Get structured Amazon product data including title, price, rating, reviews count, and more.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Amazon product URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_amazon_product_reviews',
    description: 'Get Amazon product reviews with ratings, text, and reviewer info.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Amazon product URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_amazon_product_search',
    description: 'Search Amazon products by keyword.',
    inputSchema: {
      type: 'object',
      properties: {
        keyword: { type: 'string', description: 'Search keyword' },
        url: { type: 'string', description: 'Amazon search URL' },
      },
    },
  },
  {
    name: 'brightdata_web_data_walmart_product',
    description: 'Get structured Walmart product data.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Walmart product URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_walmart_seller',
    description: 'Get Walmart seller information.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Walmart seller URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_ebay_product',
    description: 'Get structured eBay product data.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'eBay product URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_homedepot_products',
    description: 'Get Home Depot product inventory data.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Home Depot product URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_zara_products',
    description: 'Get Zara fashion product information.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Zara product URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_etsy_products',
    description: 'Get Etsy marketplace product data.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Etsy product URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_bestbuy_products',
    description: 'Get Best Buy electronics product data.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Best Buy product URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_google_shopping',
    description: 'Get Google Shopping product listings data.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Google Shopping URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_tiktok_shop',
    description: 'Get TikTok Shop merchandise data.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'TikTok Shop product URL' },
      },
      required: ['url'],
    },
  },

  // ========== Social Media Datasets ==========
  {
    name: 'brightdata_web_data_linkedin_person_profile',
    description: 'Get LinkedIn person profile data including experience, education, and skills.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'LinkedIn profile URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_linkedin_company_profile',
    description: 'Get LinkedIn company profile data.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'LinkedIn company page URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_linkedin_jobs',
    description: 'Get LinkedIn job listing data.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'LinkedIn job URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_linkedin_posts',
    description: 'Get LinkedIn post data.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'LinkedIn post URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_linkedin_people_search',
    description: 'Search LinkedIn people profiles.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'LinkedIn search URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_instagram_profiles',
    description: 'Get Instagram profile data including bio, follower count, and posts.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Instagram profile URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_instagram_posts',
    description: 'Get Instagram post data including caption, likes, and comments.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Instagram post URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_instagram_reels',
    description: 'Get Instagram Reels video data.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Instagram Reels URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_instagram_comments',
    description: 'Get Instagram post comments.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Instagram post URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_facebook_posts',
    description: 'Get Facebook post data.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Facebook post URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_facebook_marketplace_listings',
    description: 'Get Facebook Marketplace listing data.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Facebook Marketplace URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_facebook_reviews',
    description: 'Get Facebook page reviews.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Facebook page URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_facebook_events',
    description: 'Get Facebook event data.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Facebook event URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_tiktok_profiles',
    description: 'Get TikTok user profile data.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'TikTok profile URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_tiktok_posts',
    description: 'Get TikTok video/post data.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'TikTok post URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_tiktok_comments',
    description: 'Get TikTok video comments.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'TikTok video URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_x_posts',
    description: 'Get X (Twitter) post data.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'X (Twitter) post URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_x_profile_posts',
    description: 'Get all posts from an X (Twitter) profile with date filtering.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'X (Twitter) profile URL' },
        start_date: { type: 'string', description: 'Start date filter (YYYY-MM-DD)' },
        end_date: { type: 'string', description: 'End date filter (YYYY-MM-DD)' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_reddit_posts',
    description: 'Get Reddit post data including comments.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Reddit post URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_youtube_channel_profile',
    description: 'Get YouTube channel profile data.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'YouTube channel URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_youtube_videos',
    description: 'Get YouTube video metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'YouTube video URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_youtube_comments',
    description: 'Get YouTube video comments.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'YouTube video URL' },
      },
      required: ['url'],
    },
  },

  // ========== Browser Automation ==========
  {
    name: 'brightdata_scraping_browser_navigate',
    description: 'Navigate a Bright Data scraping browser session to a URL. Starts a new session or reuses existing one.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'The URL to navigate to' },
        country: { type: 'string', description: '2-letter ISO country code (e.g., "US", "GB")' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_scraping_browser_go_back',
    description: 'Go back to the previous page in the browser session.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'brightdata_scraping_browser_go_forward',
    description: 'Go forward to the next page in the browser session.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'brightdata_scraping_browser_snapshot',
    description: 'Capture an ARIA accessibility snapshot of the current page showing interactive elements with refs.',
    inputSchema: {
      type: 'object',
      properties: {
        filtered: { type: 'boolean', description: 'Apply filtering/compaction to snapshot (default: false)' },
      },
    },
  },
  {
    name: 'brightdata_scraping_browser_click_ref',
    description: 'Click an element using its ref attribute from the ARIA snapshot.',
    inputSchema: {
      type: 'object',
      properties: {
        ref: { type: 'string', description: 'The ref attribute from snapshot (e.g., "23")' },
        element: { type: 'string', description: 'Element description for context' },
      },
      required: ['ref', 'element'],
    },
  },
  {
    name: 'brightdata_scraping_browser_type_ref',
    description: 'Type text into an element using its ref from the ARIA snapshot.',
    inputSchema: {
      type: 'object',
      properties: {
        ref: { type: 'string', description: 'The ref attribute from snapshot' },
        element: { type: 'string', description: 'Element description for context' },
        text: { type: 'string', description: 'Text to type into the element' },
        submit: { type: 'boolean', description: 'Press Enter after typing' },
      },
      required: ['ref', 'element', 'text'],
    },
  },
  {
    name: 'brightdata_scraping_browser_screenshot',
    description: 'Take a screenshot of the current page in the browser session.',
    inputSchema: {
      type: 'object',
      properties: {
        full_page: { type: 'boolean', description: 'Capture full page screenshot (default: false)' },
      },
    },
  },
  {
    name: 'brightdata_scraping_browser_get_text',
    description: 'Get the text content of the current page in the browser session.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'brightdata_scraping_browser_get_html',
    description: 'Get the HTML content of the current page. Use full_page=true to include head and scripts.',
    inputSchema: {
      type: 'object',
      properties: {
        full_page: { type: 'boolean', description: 'Include head and script tags (default: false)' },
      },
    },
  },
  {
    name: 'brightdata_scraping_browser_scroll',
    description: 'Scroll to the bottom of the current page in the browser session.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'brightdata_scraping_browser_scroll_to_ref',
    description: 'Scroll to a specific element using its ref from the ARIA snapshot.',
    inputSchema: {
      type: 'object',
      properties: {
        ref: { type: 'string', description: 'The ref attribute from snapshot' },
        element: { type: 'string', description: 'Element description' },
      },
      required: ['ref', 'element'],
    },
  },
  {
    name: 'brightdata_scraping_browser_network_requests',
    description: 'Get all network requests made since loading the current page.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'brightdata_scraping_browser_wait_for_ref',
    description: 'Wait for an element to be visible on the page using its ref from the snapshot.',
    inputSchema: {
      type: 'object',
      properties: {
        ref: { type: 'string', description: 'The ref attribute from snapshot' },
        element: { type: 'string', description: 'Element description' },
        timeout: { type: 'number', description: 'Maximum wait time in milliseconds (default: 30000)' },
      },
      required: ['ref', 'element'],
    },
  },
  {
    name: 'brightdata_scraping_browser_fill_form',
    description: 'Fill multiple form fields in one operation using refs from the ARIA snapshot.',
    inputSchema: {
      type: 'object',
      properties: {
        fields: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Human-readable field name' },
              type: { type: 'string', enum: ['textbox', 'checkbox', 'radio', 'combobox', 'slider'], description: 'Field type' },
              ref: { type: 'string', description: 'Target field reference from snapshot' },
              value: { type: 'string', description: 'Value to fill' },
            },
            required: ['name', 'type', 'ref', 'value'],
          },
          description: 'Array of form field objects to fill',
        },
      },
      required: ['fields'],
    },
  },

  // ========== Finance ==========
  {
    name: 'brightdata_web_data_yahoo_finance_business',
    description: 'Get Yahoo Finance company financial profile data.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Yahoo Finance company URL' },
      },
      required: ['url'],
    },
  },

  // ========== Business Intelligence ==========
  {
    name: 'brightdata_web_data_crunchbase_company',
    description: 'Get Crunchbase startup/company funding and profile data.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Crunchbase company URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_zoominfo_company_profile',
    description: 'Get ZoomInfo B2B company intelligence data.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'ZoomInfo company URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_google_maps_reviews',
    description: 'Get Google Maps location reviews.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Google Maps place URL' },
        days_limit: { type: 'string', description: 'Limit reviews to last N days (default: "3")' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_zillow_properties_listing',
    description: 'Get Zillow real estate property listing data.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Zillow property listing URL' },
      },
      required: ['url'],
    },
  },

  // ========== Research ==========
  {
    name: 'brightdata_web_data_github_repository_file',
    description: 'Get content from a GitHub repository file.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'GitHub file URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_reuter_news',
    description: 'Get Reuters news article data.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Reuters article URL' },
      },
      required: ['url'],
    },
  },

  // ========== App Stores ==========
  {
    name: 'brightdata_web_data_google_play_store',
    description: 'Get Google Play Store app data.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Google Play Store app URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'brightdata_web_data_apple_app_store',
    description: 'Get Apple App Store app data.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Apple App Store app URL' },
      },
      required: ['url'],
    },
  },

  // ========== Travel ==========
  {
    name: 'brightdata_web_data_booking_hotel_listings',
    description: 'Get Booking.com hotel listing data.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Booking.com hotel URL' },
      },
      required: ['url'],
    },
  },
];
