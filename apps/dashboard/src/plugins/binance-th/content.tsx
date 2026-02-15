/**
 * Binance TH Plugin - Content Metadata
 * Landing, Dashboard, Documentation, FAQ content
 */

import {
  TrendingUp,
  ArrowUpDown,
  Wallet,
  Users,
  Settings,
  HelpCircle,
  Code,
  Key,
  Shield,
} from 'lucide-react';
import type { PluginContent } from '../registry';

export const binanceThContent: PluginContent = {
  // ======== Landing Page ========
  tagline: 'Trade Thai-regulated crypto markets with AI',
  description:
    'Access Binance Thailand (Gulf Binance), Thailand\'s regulated exchange. 27 tools covering market data, spot trading, wallet management, and sub-account operations.',
  features: [
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: 'Market Data',
      description: 'Get real-time ticker prices, order books, candlestick data, and 24hr statistics across all Binance TH markets.',
    },
    {
      icon: <ArrowUpDown className="h-5 w-5" />,
      title: 'Trading',
      description: 'Place market and limit orders, manage open orders, and execute trades on THB and USDT pairs.',
    },
    {
      icon: <Wallet className="h-5 w-5" />,
      title: 'Wallet',
      description: 'View wallet balances, check deposit and withdrawal history, and manage crypto transfers.',
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: 'Sub-Accounts',
      description: 'Manage sub-accounts, transfer funds between accounts, and monitor sub-account balances.',
    },
  ],
  setupSteps: [
    {
      title: 'Create a Binance TH Account',
      description: 'Sign up at binance.th, complete KYC verification with Thai ID, and enable two-factor authentication.',
    },
    {
      title: 'Generate API Keys',
      description: 'Go to API Management in your Binance TH account settings and create a new API key pair.',
    },
    {
      title: 'Set Permissions',
      description: 'Configure API key permissions: enable Reading, Spot Trading, and optionally IP restrictions for security.',
    },
    {
      title: 'Add Connection',
      description: 'Paste the API Key and Secret Key in the Connections page to start using Binance TH tools.',
    },
  ],
  demoCode: `// Get ticker price
await bth_ticker_price({
  symbol: "BTCTHB"
});

// Check account information
await bth_account_info();

// Place a new order
await bth_new_order({
  symbol: "BTCTHB",
  side: "BUY",
  type: "LIMIT",
  quantity: "0.001",
  price: "1500000",
  timeInForce: "GTC"
});`,
  externalDocUrl: 'https://docs.binance.th',

  // ======== Dashboard ========
  quickStartSteps: [
    'Add a Binance TH connection with your API Key and Secret Key',
    'Check your account info to verify the connection',
    'Get ticker data to see current THB market prices',
    'Try placing a test order to confirm trading access',
  ],
  emptyConnectionCTA: 'Add your Binance TH API credentials to start trading on Thailand\'s regulated crypto exchange.',

  // ======== Documentation ========
  connectionGuide: (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold mb-1">1. Create a Binance TH Account</h4>
        <p className="text-sm text-muted-foreground">
          Visit <a href="https://www.binance.th" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">binance.th</a> and
          sign up for an account. Complete identity verification (KYC) with a valid Thai ID to unlock full trading features.
        </p>
      </div>
      <div>
        <h4 className="font-semibold mb-1">2. Generate API Keys</h4>
        <p className="text-sm text-muted-foreground">
          Go to <a href="https://www.binance.th/en/my/settings/api-management" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">API Management</a> in
          your Binance TH account settings. Click "Create API" and save both the API Key and Secret Key securely.
        </p>
      </div>
      <div>
        <h4 className="font-semibold mb-1">3. Configure & Connect</h4>
        <p className="text-sm text-muted-foreground">
          Set the appropriate permissions for your API key (Enable Reading, Enable Spot Trading).
          Optionally restrict to specific IP addresses for added security.
          Paste both keys in the Connections page. The Secret Key is used for HMAC SHA-256 request signing.
        </p>
      </div>
    </div>
  ),
  examplePrompts: [
    'What is the current price of BTC in THB on Binance TH?',
    'Show my account balances on Binance TH',
    'Place a limit buy order for 0.001 BTC at 1,500,000 THB',
    'List my recent trade history for BTCTHB',
    'Show the order book for ETHTHB',
    'Cancel all my open orders for BTCTHB',
    'Get the 24hr price change statistics for BTCTHB',
    'List all available trading pairs on Binance TH',
  ],
  mcpConfigName: 'binance-th',
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
          Enable "Spot Trading" for order placement. Consider adding IP restrictions for production keys.
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
              Go to <a href="https://www.binance.th/en/my/settings/api-management" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Binance TH API Management</a>,
              create a new API key, and copy both the API Key and Secret Key. The Secret Key is only shown once during creation.
            </span>
          ),
        },
        {
          question: 'What permissions should I enable?',
          answer:
            'For read-only access, enable "Enable Reading". For trading, also enable "Enable Spot Trading". Never enable withdrawal permissions unless absolutely necessary. Add IP restrictions for production use.',
        },
        {
          question: 'Do I need Thai KYC verification?',
          answer:
            'Yes. Binance Thailand is a regulated exchange under Thai SEC. You must complete KYC verification with a valid Thai national ID or passport to use API trading features.',
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
            'Binance TH supports THB-based pairs (e.g., BTCTHB, ETHTHB) and USDT pairs. Use the bth_exchange_info tool to get all available trading pairs and their rules.',
        },
        {
          question: 'Is there a testnet available?',
          answer: (
            <span>
              <strong className="text-yellow-400">No testnet — all operations are REAL.</strong> Binance Thailand does not provide a testnet environment.
              Every order placed through the API will execute with real funds. Double-check all order parameters before submitting.
            </span>
          ),
        },
        {
          question: 'Does this use real money?',
          answer: (
            <span>
              <strong className="text-yellow-400">WARNING: Yes, this uses real money.</strong> All trading operations execute real orders on Binance Thailand.
              There is no testnet available. Always verify order parameters carefully before execution.
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
            'Your account does not have enough balance to place the order. Check your available balance with bth_account_info and ensure you have sufficient funds.',
        },
        {
          question: 'Getting "Order would trigger immediately" error?',
          answer:
            'Your limit order price is too close to the current market price. Adjust your limit price or use a market order instead.',
        },
      ],
    },
  ],
};
