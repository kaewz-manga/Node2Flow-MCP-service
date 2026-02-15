/**
 * Bitkub Exchange - MCP Tool Definitions (28 tools)
 * Ported from @node2flow/bitkub-mcp (community)
 */

import type { MCPToolDefinition } from '../../types';

export const TOOLS: MCPToolDefinition[] = [
  // ========== General / Market Data (10) ==========
  {
    name: 'btk_server_time',
    description: 'Get Bitkub server time (millisecond timestamp). Use to check connectivity and sync timestamps for signed requests.',
    inputSchema: {
      type: 'object',
      properties: {
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
    },
    annotations: {
      title: 'Get Server Time',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'btk_server_status',
    description: 'Get Bitkub API server status. Returns status for both non-secure and secure endpoints.',
    inputSchema: {
      type: 'object',
      properties: {
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
    },
    annotations: {
      title: 'Get Server Status',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'btk_symbols',
    description: 'List all trading symbols on Bitkub with details: base/quote asset, price scale, min order size, status, market segment. The "source" field indicates "exchange" (regular) or "broker" (broker coins).',
    inputSchema: {
      type: 'object',
      properties: {
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
    },
    annotations: {
      title: 'List All Symbols',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'btk_ticker',
    description: 'Get 24-hour ticker data: last price, bid/ask, percent change, volume, high/low. Returns all symbols if no sym specified.',
    inputSchema: {
      type: 'object',
      properties: {
        sym: { type: 'string', description: 'Symbol (e.g., "THB_BTC"). Omit for all symbols.' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
    },
    annotations: {
      title: 'Get Ticker',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'btk_recent_trades',
    description: 'Get recent trades for a symbol. Each trade includes timestamp, price, amount, and side (BUY/SELL).',
    inputSchema: {
      type: 'object',
      properties: {
        sym: { type: 'string', description: 'Symbol (e.g., "THB_BTC")' },
        lmt: { type: 'integer', description: 'Number of trades to return (default: 10, max: 100)' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
      required: ['sym'],
    },
    annotations: {
      title: 'Get Recent Trades',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'btk_bids',
    description: 'Get buy-side order book (bids) for a symbol. Each entry: [price, volume, timestamp].',
    inputSchema: {
      type: 'object',
      properties: {
        sym: { type: 'string', description: 'Symbol (e.g., "THB_BTC")' },
        lmt: { type: 'integer', description: 'Number of entries (default: 10, max: 100)' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
      required: ['sym'],
    },
    annotations: {
      title: 'Get Bids (Buy Orders)',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'btk_asks',
    description: 'Get sell-side order book (asks) for a symbol. Each entry: [price, volume, timestamp].',
    inputSchema: {
      type: 'object',
      properties: {
        sym: { type: 'string', description: 'Symbol (e.g., "THB_BTC")' },
        lmt: { type: 'integer', description: 'Number of entries (default: 10, max: 100)' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
      required: ['sym'],
    },
    annotations: {
      title: 'Get Asks (Sell Orders)',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'btk_books',
    description: 'Get complete order book (both bids and asks) for a symbol.',
    inputSchema: {
      type: 'object',
      properties: {
        sym: { type: 'string', description: 'Symbol (e.g., "THB_BTC")' },
        lmt: { type: 'integer', description: 'Entries per side (default: 10, max: 100)' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
      required: ['sym'],
    },
    annotations: {
      title: 'Get Order Book (Complete)',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'btk_depth',
    description: 'Get market depth for a symbol. Similar to order book but without timestamps — just [price, volume] pairs.',
    inputSchema: {
      type: 'object',
      properties: {
        sym: { type: 'string', description: 'Symbol (e.g., "THB_BTC")' },
        lmt: { type: 'integer', description: 'Number of levels (default: 10, max: 100)' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
      required: ['sym'],
    },
    annotations: {
      title: 'Get Market Depth',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'btk_tradingview_history',
    description: 'Get TradingView-compatible OHLCV candlestick data. Returns arrays of open, high, low, close, volume for charting.',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Symbol (e.g., "THB_BTC")' },
        resolution: { type: 'string', description: 'Candle interval: 1, 5, 15, 60, 240, or 1D' },
        from: { type: 'integer', description: 'Start time (UNIX timestamp in seconds)' },
        to: { type: 'integer', description: 'End time (UNIX timestamp in seconds)' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
      required: ['symbol', 'resolution', 'from', 'to'],
    },
    annotations: {
      title: 'Get TradingView History',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },

  // ========== Account (4) ==========
  {
    name: 'btk_wallet',
    description: 'Get available balances for all currencies. Shows only available balance (not reserved). For full balance info, use btk_balances.',
    inputSchema: {
      type: 'object',
      properties: {
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
    },
    annotations: {
      title: 'Get Wallet (Available Balance)',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'btk_balances',
    description: 'Get complete balances for all currencies including both available and reserved amounts.',
    inputSchema: {
      type: 'object',
      properties: {
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
    },
    annotations: {
      title: 'Get Balances (Full)',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'btk_trading_credits',
    description: 'Get trading credit balance. Trading credits can be used to offset trading fees.',
    inputSchema: {
      type: 'object',
      properties: {
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
    },
    annotations: {
      title: 'Get Trading Credits',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'btk_user_limits',
    description: 'Get user deposit/withdrawal limits and current usage for both crypto and fiat currencies.',
    inputSchema: {
      type: 'object',
      properties: {
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
    },
    annotations: {
      title: 'Get User Limits',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },

  // ========== Orders (8) ==========
  {
    name: 'btk_place_bid',
    description: 'Place a buy order. For limit orders specify rate. For market orders, rate is ignored. WARNING: Uses real money.',
    inputSchema: {
      type: 'object',
      properties: {
        sym: { type: 'string', description: 'Symbol (e.g., "THB_BTC")' },
        amt: { type: 'number', description: 'Amount in quote currency (THB). No trailing zeros.' },
        rat: { type: 'number', description: 'Rate/price. Required for limit orders, ignored for market orders.' },
        typ: { type: 'string', description: 'Order type: "limit" or "market"' },
        client_id: { type: 'string', description: 'Custom order ID for tracking (optional)' },
      },
      required: ['sym', 'amt', 'typ'],
    },
    annotations: {
      title: 'Place Buy Order',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'btk_place_ask',
    description: 'Place a sell order. For limit orders specify rate. For market orders, rate is ignored. WARNING: Uses real money.',
    inputSchema: {
      type: 'object',
      properties: {
        sym: { type: 'string', description: 'Symbol (e.g., "THB_BTC")' },
        amt: { type: 'number', description: 'Amount in base currency (e.g., BTC amount). No trailing zeros.' },
        rat: { type: 'number', description: 'Rate/price. Required for limit orders, ignored for market orders.' },
        typ: { type: 'string', description: 'Order type: "limit" or "market"' },
        client_id: { type: 'string', description: 'Custom order ID for tracking (optional)' },
      },
      required: ['sym', 'amt', 'typ'],
    },
    annotations: {
      title: 'Place Sell Order',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'btk_place_bid_test',
    description: 'Test (dry run) a buy order. Validates parameters without placing an actual order. Safe to use — no real money involved.',
    inputSchema: {
      type: 'object',
      properties: {
        sym: { type: 'string', description: 'Symbol (e.g., "THB_BTC")' },
        amt: { type: 'number', description: 'Amount in quote currency (THB)' },
        rat: { type: 'number', description: 'Rate/price for limit orders' },
        typ: { type: 'string', description: 'Order type: "limit" or "market"' },
        client_id: { type: 'string', description: 'Custom order ID (optional)' },
      },
      required: ['sym', 'amt', 'typ'],
    },
    annotations: {
      title: 'Test Buy Order (Dry Run)',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'btk_place_ask_test',
    description: 'Test (dry run) a sell order. Validates parameters without placing an actual order. Safe to use — no real money involved.',
    inputSchema: {
      type: 'object',
      properties: {
        sym: { type: 'string', description: 'Symbol (e.g., "THB_BTC")' },
        amt: { type: 'number', description: 'Amount in base currency' },
        rat: { type: 'number', description: 'Rate/price for limit orders' },
        typ: { type: 'string', description: 'Order type: "limit" or "market"' },
        client_id: { type: 'string', description: 'Custom order ID (optional)' },
      },
      required: ['sym', 'amt', 'typ'],
    },
    annotations: {
      title: 'Test Sell Order (Dry Run)',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'btk_cancel_order',
    description: 'Cancel an open order. Requires symbol, order ID, and side (buy/sell).',
    inputSchema: {
      type: 'object',
      properties: {
        sym: { type: 'string', description: 'Symbol (e.g., "THB_BTC")' },
        id: { type: 'string', description: 'Order ID to cancel' },
        sd: { type: 'string', description: 'Side: "buy" or "sell"' },
      },
      required: ['sym', 'id', 'sd'],
    },
    annotations: {
      title: 'Cancel Order',
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'btk_my_open_orders',
    description: 'Get all open (pending) orders for a symbol.',
    inputSchema: {
      type: 'object',
      properties: {
        sym: { type: 'string', description: 'Symbol (e.g., "THB_BTC")' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
      required: ['sym'],
    },
    annotations: {
      title: 'Get My Open Orders',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'btk_my_order_history',
    description: 'Get order history for a symbol. Supports pagination and date range filtering. History older than 90 days is archived.',
    inputSchema: {
      type: 'object',
      properties: {
        sym: { type: 'string', description: 'Symbol (e.g., "THB_BTC")' },
        p: { type: 'integer', description: 'Page number (default: 1)' },
        lmt: { type: 'integer', description: 'Results per page (default: 10, max: 100)' },
        start: { type: 'integer', description: 'Start timestamp (UNIX milliseconds)' },
        end: { type: 'integer', description: 'End timestamp (UNIX milliseconds)' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
      required: ['sym'],
    },
    annotations: {
      title: 'Get My Order History',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'btk_order_info',
    description: 'Get detailed information about a specific order including fill history, status, and remaining amount.',
    inputSchema: {
      type: 'object',
      properties: {
        sym: { type: 'string', description: 'Symbol (e.g., "THB_BTC")' },
        id: { type: 'string', description: 'Order ID' },
        sd: { type: 'string', description: 'Side: "buy" or "sell"' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
      required: ['sym', 'id', 'sd'],
    },
    annotations: {
      title: 'Get Order Info',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },

  // ========== Crypto / Wallet (6) ==========
  {
    name: 'btk_crypto_addresses',
    description: 'List all crypto deposit addresses for your account. Shows currency, address, tag/memo, and network.',
    inputSchema: {
      type: 'object',
      properties: {
        p: { type: 'integer', description: 'Page number' },
        lmt: { type: 'integer', description: 'Results per page' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
    },
    annotations: {
      title: 'List Crypto Addresses',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'btk_crypto_withdraw',
    description: 'Withdraw crypto to an external address. WARNING: IRREVERSIBLE — double-check address, network, and amount before executing.',
    inputSchema: {
      type: 'object',
      properties: {
        cur: { type: 'string', description: 'Currency (e.g., "BTC", "ETH")' },
        amt: { type: 'number', description: 'Amount to withdraw' },
        adr: { type: 'string', description: 'Destination address' },
        mem: { type: 'string', description: 'Memo/tag (required for some networks like XRP, ATOM)' },
        net: { type: 'string', description: 'Network (e.g., "BTC", "ETH", "BSC", "TRC20")' },
      },
      required: ['cur', 'amt', 'adr', 'net'],
    },
    annotations: {
      title: 'Withdraw Crypto',
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'btk_crypto_internal_withdraw',
    description: 'Transfer crypto to another Bitkub user by email or phone number. Faster and cheaper than blockchain withdrawal. WARNING: IRREVERSIBLE.',
    inputSchema: {
      type: 'object',
      properties: {
        cur: { type: 'string', description: 'Currency (e.g., "BTC", "ETH")' },
        amt: { type: 'number', description: 'Amount to transfer' },
        adr: { type: 'string', description: 'Destination Bitkub email or phone number' },
        mem: { type: 'string', description: 'Memo (optional)' },
      },
      required: ['cur', 'amt', 'adr'],
    },
    annotations: {
      title: 'Internal Withdraw (Bitkub-to-Bitkub)',
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'btk_crypto_deposit_history',
    description: 'Get crypto deposit history with status, confirmations, and transaction details.',
    inputSchema: {
      type: 'object',
      properties: {
        p: { type: 'integer', description: 'Page number' },
        lmt: { type: 'integer', description: 'Results per page' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
    },
    annotations: {
      title: 'Get Deposit History',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'btk_crypto_withdraw_history',
    description: 'Get crypto withdrawal history with status, fees, and transaction details.',
    inputSchema: {
      type: 'object',
      properties: {
        p: { type: 'integer', description: 'Page number' },
        lmt: { type: 'integer', description: 'Results per page' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
    },
    annotations: {
      title: 'Get Withdrawal History',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'btk_crypto_generate_address',
    description: 'Generate a new crypto deposit address for a specific currency.',
    inputSchema: {
      type: 'object',
      properties: {
        cur: { type: 'string', description: 'Currency (e.g., "BTC", "ETH")' },
      },
      required: ['cur'],
    },
    annotations: {
      title: 'Generate Deposit Address',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
];
