/**
 * Bitkub Plugin - Content Metadata
 * Landing, Dashboard, Documentation, FAQ content
 */

import {
  TrendingUp,
  Wallet,
  ArrowUpDown,
  ShieldCheck,
  Settings,
  HelpCircle,
  Code,
  Key,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import type { PluginContent } from '../registry';

export const bitkubContent: PluginContent = {
  // ======== Landing Page ========
  tagline: 'Trade Thai crypto markets with AI',
  description:
    'Access Bitkub, Thailand\'s leading cryptocurrency exchange. 28 tools covering market data, account management, order placement, and crypto wallet operations.',
  features: [
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: 'Market Data',
      description: 'Get real-time ticker prices, order books, recent trades, and trading symbols across all Bitkub markets.',
    },
    {
      icon: <Wallet className="h-5 w-5" />,
      title: 'Account',
      description: 'View account balances, trading history, and order status. Monitor your portfolio in real time.',
    },
    {
      icon: <ArrowUpDown className="h-5 w-5" />,
      title: 'Trading',
      description: 'Place buy and sell orders, manage open orders, and cancel pending trades on THB pairs.',
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: 'Crypto Wallet',
      description: 'View wallet addresses, check deposit and withdrawal history, and manage crypto transfers.',
    },
  ],
  setupSteps: [
    {
      title: 'Create a Bitkub Account',
      description: 'Sign up at bitkub.com, complete KYC verification, and enable two-factor authentication.',
    },
    {
      title: 'Generate API Keys',
      description: 'Go to Settings → API Keys in your Bitkub dashboard and create a new API key pair.',
    },
    {
      title: 'Set Permissions',
      description: 'Configure API key permissions: enable Market Data (read), Trading (read/write), and Wallet (read) as needed.',
    },
    {
      title: 'Add Connection',
      description: 'Paste the API Key and Secret Key in the Connections page to start using Bitkub tools.',
    },
  ],
  demoCode: `// Get ticker price
await btk_ticker({
  sym: "THB_BTC"
});

// Check wallet balances
await btk_wallet();

// Place a test bid order
await btk_place_bid_test({
  sym: "THB_BTC",
  amt: 1000,
  rat: 2500000,
  typ: "limit"
});`,
  externalDocUrl: 'https://github.com/bitkub/bitkub-official-api-docs',

  // ======== Dashboard ========
  quickStartSteps: [
    'Add a Bitkub connection with your API Key and Secret Key',
    'Check your wallet balances to verify the connection',
    'Get ticker data to see current market prices',
    'Try placing a test order to confirm trading access',
  ],
  emptyConnectionCTA: 'Add your Bitkub API credentials to start trading on Thailand\'s leading crypto exchange.',

  // ======== Documentation ========
  connectionGuide: (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold mb-1">1. Create a Bitkub Account</h4>
        <p className="text-sm text-muted-foreground">
          Visit <a href="https://www.bitkub.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">bitkub.com</a> and
          sign up for an account. Complete identity verification (KYC) to unlock full trading features.
        </p>
      </div>
      <div>
        <h4 className="font-semibold mb-1">2. Generate API Keys</h4>
        <p className="text-sm text-muted-foreground">
          Go to <a href="https://www.bitkub.com/settings/api" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Settings &rarr; API Keys</a> in
          your Bitkub dashboard. Click "Create API Key" and save both the API Key and Secret Key securely.
        </p>
      </div>
      <div>
        <h4 className="font-semibold mb-1">3. Configure & Connect</h4>
        <p className="text-sm text-muted-foreground">
          Set the appropriate permissions for your API key (Market Data, Trading, Wallet).
          Paste both keys in the Connections page. The Secret Key is used for HMAC SHA-256 request signing.
        </p>
      </div>
    </div>
  ),
  examplePrompts: [
    'What is the current price of BTC in THB?',
    'Show my wallet balances on Bitkub',
    'Place a limit buy order for 1000 THB of ETH',
    'List my recent trade history',
    'Show the order book for THB_BTC',
    'Cancel all my open orders',
    'Check the 24hr trading volume for THB_ADA',
    'What are the available trading pairs on Bitkub?',
  ],
  mcpConfigName: 'bitkub',
  configSections: (
    <div className="space-y-3">
      <div>
        <h4 className="font-semibold text-sm flex items-center gap-2"><Key className="h-4 w-4" /> Authentication</h4>
        <p className="text-sm text-muted-foreground mt-1">
          Uses HMAC SHA-256 signing with API Key and Secret Key pair. Each request is signed
          using the secret key to ensure authenticity and prevent tampering.
        </p>
      </div>
      <div>
        <h4 className="font-semibold text-sm flex items-center gap-2"><Shield className="h-4 w-4" /> Permissions</h4>
        <p className="text-sm text-muted-foreground mt-1">
          API keys have granular permissions. Market data tools require read access.
          Trading tools require trading permission. Wallet tools require wallet read access.
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
              Go to <a href="https://www.bitkub.com/settings/api" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Bitkub Settings &rarr; API Keys</a>,
              create a new API key, and copy both the API Key and Secret Key. Store the Secret Key securely as it is only shown once.
            </span>
          ),
        },
        {
          question: 'What permissions should I enable?',
          answer:
            'For read-only access, enable Market Data and Wallet (read). For trading, also enable Trading (read/write). Only enable withdrawal permissions if absolutely necessary.',
        },
        {
          question: 'Do I need KYC verification?',
          answer:
            'Yes. Bitkub requires identity verification (KYC) to use API trading features. Complete verification in your Bitkub account settings before generating API keys.',
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
            'Bitkub supports THB-based trading pairs (e.g., THB_BTC, THB_ETH, THB_ADA). Use the btk_symbols tool to get all available trading pairs.',
        },
        {
          question: 'How do test orders work?',
          answer:
            'The btk_place_bid_test and btk_place_ask_test tools validate order parameters without actually placing them. Use these to verify your order logic before trading with real funds.',
        },
        {
          question: 'Does this use real money?',
          answer: (
            <span>
              <strong className="text-yellow-400">WARNING: Yes, this uses real money.</strong> All non-test trading operations execute real orders on the Bitkub exchange.
              Always use test endpoints (btk_place_bid_test, btk_place_ask_test) first to validate your orders.
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
          question: 'Getting "Invalid API key" error?',
          answer:
            'Double-check that both your API Key and Secret Key are correct. Ensure there are no extra spaces. If the key was recently created, wait a few minutes for it to activate.',
        },
        {
          question: 'Getting "Insufficient balance" error?',
          answer:
            'Your account does not have enough THB or crypto balance to place the order. Deposit funds to your Bitkub account or reduce the order amount.',
        },
        {
          question: 'Getting "Permission denied" error?',
          answer:
            'Your API key does not have the required permissions. Go to Bitkub API settings and enable the necessary permissions (Trading, Wallet, etc.) for your key.',
        },
      ],
    },
  ],
};
