/**
 * Binance Plugin - Content Metadata
 * Landing, Dashboard, Documentation, FAQ content
 */

import {
  TrendingUp,
  ArrowUpDown,
  Wallet,
  Radio,
  Settings,
  HelpCircle,
  Code,
  Key,
  Shield,
} from 'lucide-react';
import type { PluginContent } from '../registry';

export const binanceContent: PluginContent = {
  // ======== Landing Page ========
  tagline: 'Trade global crypto markets with AI',
  description:
    'Access Binance, the world\'s largest cryptocurrency exchange. 23 tools covering market data, spot trading, account management, and user data streams.',
  features: [
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: 'Market Data',
      description: 'Get real-time ticker prices, order books, candlestick data, and 24hr statistics across all Binance markets.',
    },
    {
      icon: <ArrowUpDown className="h-5 w-5" />,
      title: 'Trading',
      description: 'Place market and limit orders, manage open orders, and execute trades on hundreds of spot trading pairs.',
    },
    {
      icon: <Wallet className="h-5 w-5" />,
      title: 'Account',
      description: 'View account balances, trade history, and order status. Monitor your portfolio across all assets.',
    },
    {
      icon: <Radio className="h-5 w-5" />,
      title: 'Data Streams',
      description: 'Create and manage user data streams for real-time account updates, order fills, and balance changes.',
    },
  ],
  setupSteps: [
    {
      title: 'Create a Binance Account',
      description: 'Sign up at binance.com, complete identity verification, and enable two-factor authentication.',
    },
    {
      title: 'Generate API Keys',
      description: 'Go to API Management in your Binance account settings and create a new API key pair.',
    },
    {
      title: 'Set Permissions',
      description: 'Configure API key permissions: enable Reading, Spot Trading, and optionally IP restrictions for security.',
    },
    {
      title: 'Add Connection',
      description: 'Paste the API Key and Secret Key in the Connections page to start using Binance tools.',
    },
  ],
  demoCode: `// Get 24hr ticker stats
await bn_ticker_24hr({
  symbol: "BTCUSDT"
});

// Check account information
await bn_account_info();

// Place a test order (no real execution)
await bn_test_order({
  symbol: "BTCUSDT",
  side: "BUY",
  type: "LIMIT",
  quantity: "0.001",
  price: "50000",
  timeInForce: "GTC"
});`,
  externalDocUrl: 'https://developers.binance.com/docs/binance-spot-api-docs',

  // ======== Dashboard ========
  quickStartSteps: [
    'Add a Binance connection with your API Key and Secret Key',
    'Check your account info to verify the connection',
    'Get ticker data to see current market prices',
    'Try placing a test order to confirm trading access',
  ],
  emptyConnectionCTA: 'Add your Binance API credentials to start trading on the world\'s largest crypto exchange.',

  // ======== Documentation ========
  connectionGuide: (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold mb-1">1. Create a Binance Account</h4>
        <p className="text-sm text-muted-foreground">
          Visit <a href="https://www.binance.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">binance.com</a> and
          sign up for an account. Complete identity verification (KYC) to unlock full trading features.
        </p>
      </div>
      <div>
        <h4 className="font-semibold mb-1">2. Generate API Keys</h4>
        <p className="text-sm text-muted-foreground">
          Go to <a href="https://www.binance.com/en/my/settings/api-management" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">API Management</a> in
          your Binance account settings. Click "Create API" and save both the API Key and Secret Key securely.
        </p>
      </div>
      <div>
        <h4 className="font-semibold mb-1">3. Configure & Connect</h4>
        <p className="text-sm text-muted-foreground">
          Set the appropriate permissions for your API key (Enable Reading, Enable Spot & Margin Trading).
          Optionally restrict to specific IP addresses for added security.
          Paste both keys in the Connections page. The Secret Key is used for HMAC SHA-256 request signing.
        </p>
      </div>
    </div>
  ),
  examplePrompts: [
    'What is the current price of BTC/USDT?',
    'Show my account balances on Binance',
    'Place a limit buy order for 0.01 BTC at $50,000',
    'List my recent trade history for ETHUSDT',
    'Show the order book for BTCUSDT',
    'Cancel all my open orders for ETHUSDT',
    'Get the 24hr price change statistics for SOLUSDT',
    'What are the top trading pairs by volume?',
  ],
  mcpConfigName: 'binance',
  configSections: (
    <div className="space-y-3">
      <div>
        <h4 className="font-semibold text-sm flex items-center gap-2"><Key className="h-4 w-4" /> Authentication</h4>
        <p className="text-sm text-muted-foreground mt-1">
          Uses HMAC SHA-256 signing with API Key and Secret Key pair. Each request is signed
          using the secret key to ensure authenticity. Requests include a timestamp and receive window for security.
        </p>
      </div>
      <div>
        <h4 className="font-semibold text-sm flex items-center gap-2"><Shield className="h-4 w-4" /> Permissions</h4>
        <p className="text-sm text-muted-foreground mt-1">
          API keys have granular permissions. Enable "Reading" for market data and account info.
          Enable "Spot & Margin Trading" for order placement. Consider adding IP restrictions for production keys.
        </p>
      </div>
    </div>
  ),

  // ======== FAQ ========
  faqCategories: [
    {
      name: 'Setup',
      icon: <Settings className="h-4 w-4" />,
      items: [
        {
          question: 'Where do I get my API Key and Secret Key?',
          answer: (
            <span>
              Go to <a href="https://www.binance.com/en/my/settings/api-management" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Binance API Management</a>,
              create a new API key, and copy both the API Key and Secret Key. The Secret Key is only shown once during creation.
            </span>
          ),
        },
        {
          question: 'What permissions should I enable?',
          answer:
            'For read-only access, enable "Enable Reading". For trading, also enable "Enable Spot & Margin Trading". Never enable withdrawal permissions unless absolutely necessary. Add IP restrictions for production use.',
        },
        {
          question: 'Should I restrict my API key to specific IPs?',
          answer:
            'Yes, it is strongly recommended. Restricting to specific IPs prevents unauthorized use of your API key. Add the IP address of your MCP server in the API key settings.',
        },
      ],
    },
    {
      name: 'Usage',
      icon: <HelpCircle className="h-4 w-4" />,
      items: [
        {
          question: 'What trading pairs are available?',
          answer:
            'Binance supports hundreds of trading pairs (e.g., BTCUSDT, ETHBTC, SOLUSDT). Use the bn_exchange_info tool to get all available trading pairs and their rules.',
        },
        {
          question: 'How do test orders work?',
          answer:
            'The bn_test_order tool validates order parameters and checks your balance without actually placing the order. Use this to verify your order logic before trading with real funds.',
        },
        {
          question: 'Does this use real money?',
          answer: (
            <span>
              <strong className="text-yellow-400">WARNING: Yes, this uses real money.</strong> All non-test trading operations execute real orders on Binance.
              Always use bn_test_order first to validate your orders. Consider using Binance Testnet for development.
            </span>
          ),
        },
      ],
    },
    {
      name: 'Troubleshooting',
      icon: <Code className="h-4 w-4" />,
      items: [
        {
          question: 'Getting "Invalid API-key" error?',
          answer:
            'Double-check that both your API Key and Secret Key are correct. Ensure there are no extra spaces. If using IP restrictions, verify your server IP is whitelisted.',
        },
        {
          question: 'Getting "Insufficient balance" error?',
          answer:
            'Your account does not have enough balance to place the order. Check your available balance with bn_account_info and ensure you have sufficient funds in the spot wallet.',
        },
        {
          question: 'Getting "Timestamp for this request is outside of the recvWindow" error?',
          answer:
            'This means your server\'s clock is not synced. Ensure your system time is accurate. Binance requires requests to arrive within 5000ms of the server time.',
        },
      ],
    },
  ],
};
