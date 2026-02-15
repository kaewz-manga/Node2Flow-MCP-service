/**
 * Binance TH Plugin - MCP Tool Definitions (27 tools)
 * Ported from @node2flow/binance-th-mcp (community)
 */

import type { MCPToolDefinition } from '../../types';

export const TOOLS: MCPToolDefinition[] = [
  // ========== General (3) ==========
  {
    name: 'bth_server_time',
    description: 'Get Binance TH server time (millisecond timestamp). Use to check connectivity and sync timestamps for signed requests.',
    annotations: {
      title: 'Get Server Time',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
    },
  },
  {
    name: 'bth_exchange_info',
    description: 'Get exchange information including trading rules, symbol list, filters (PRICE_FILTER, LOT_SIZE, MIN_NOTIONAL), and rate limits.',
    annotations: {
      title: 'Get Exchange Info',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
    },
  },
  {
    name: 'bth_symbol_type',
    description: 'Check if symbols are GLOBAL (international) or SITE (Thailand-specific). Returns type classification for all trading pairs.',
    annotations: {
      title: 'Get Symbol Types',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
    },
  },

  // ========== Market Data (7) ==========
  {
    name: 'bth_order_book',
    description: 'Get order book (bids and asks) for a symbol. Limit controls depth: 1-100 (weight 1), 101-500 (weight 5), 501-1000 (weight 10).',
    annotations: {
      title: 'Get Order Book',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Trading pair symbol, e.g. BTCTHB, ETHUSDT' },
        limit: { type: 'integer', description: 'Order book depth. Default: 500, Max: 1000' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'bth_recent_trades',
    description: 'Get recent trades for a symbol. Returns up to 1000 most recent trades.',
    annotations: {
      title: 'Get Recent Trades',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Trading pair symbol, e.g. BTCTHB' },
        limit: { type: 'integer', description: 'Number of trades. Default: 500, Max: 1000' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'bth_aggregate_trades',
    description: 'Get compressed/aggregate trades for a symbol. Trades that fill at the same time, price, and side are aggregated.',
    annotations: {
      title: 'Get Aggregate Trades',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Trading pair symbol, e.g. BTCTHB' },
        fromId: { type: 'integer', description: 'Aggregate trade ID to fetch from (inclusive)' },
        startTime: { type: 'integer', description: 'Start time in milliseconds (inclusive)' },
        endTime: { type: 'integer', description: 'End time in milliseconds (inclusive)' },
        limit: { type: 'integer', description: 'Number of results. Default: 500, Max: 1000' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'bth_klines',
    description: 'Get candlestick/kline data for a symbol. Returns OHLCV data (open, high, low, close, volume) for the specified interval.',
    annotations: {
      title: 'Get Klines/Candlesticks',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Trading pair symbol, e.g. BTCTHB' },
        interval: { type: 'string', description: 'Kline interval: 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M' },
        startTime: { type: 'integer', description: 'Start time in milliseconds' },
        endTime: { type: 'integer', description: 'End time in milliseconds' },
        limit: { type: 'integer', description: 'Number of klines. Default: 500, Max: 1000' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
      required: ['symbol', 'interval'],
    },
  },
  {
    name: 'bth_ticker_24hr',
    description: 'Get 24-hour price change statistics for a symbol. Includes price change, high/low, volume, and trade count.',
    annotations: {
      title: 'Get 24hr Ticker',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Trading pair symbol, e.g. BTCTHB' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'bth_ticker_price',
    description: 'Get latest price for a symbol or all symbols. If symbol is omitted, returns prices for all trading pairs.',
    annotations: {
      title: 'Get Price Ticker',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Trading pair symbol (optional — omit for all symbols)' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
    },
  },
  {
    name: 'bth_book_ticker',
    description: 'Get best bid/ask price and quantity for a symbol.',
    annotations: {
      title: 'Get Book Ticker',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Trading pair symbol, e.g. BTCTHB' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
      required: ['symbol'],
    },
  },

  // ========== Account (3) ==========
  {
    name: 'bth_account_info',
    description: 'Get account information including balances, commission rates, and trading permissions. Requires API key with SIGNED security.',
    annotations: {
      title: 'Get Account Info',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        recvWindow: { type: 'integer', description: 'Request validity window in ms. Default: 5000, Max: 60000' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
    },
  },
  {
    name: 'bth_trade_list',
    description: 'Get trade history for a specific symbol. Returns executed trades with price, quantity, commission, and timestamps.',
    annotations: {
      title: 'Get Trade History',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Trading pair symbol, e.g. BTCTHB' },
        orderId: { type: 'integer', description: 'Filter by order ID (must use with symbol)' },
        startTime: { type: 'integer', description: 'Start time in milliseconds' },
        endTime: { type: 'integer', description: 'End time in milliseconds' },
        fromId: { type: 'integer', description: 'Trade ID to fetch from' },
        limit: { type: 'integer', description: 'Number of results. Default: 500, Max: 1000' },
        recvWindow: { type: 'integer', description: 'Request validity window in ms. Default: 5000, Max: 60000' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'bth_trade_fee',
    description: 'Get trading fee rates (maker and taker commission) for one or all symbols.',
    annotations: {
      title: 'Get Trade Fee',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Trading pair symbol (optional — omit for all)' },
        recvWindow: { type: 'integer', description: 'Request validity window in ms. Default: 5000, Max: 60000' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
    },
  },

  // ========== Orders (6) ==========
  {
    name: 'bth_query_order',
    description: 'Query a specific order by orderId or origClientOrderId. Returns order status, filled quantity, and execution details.',
    annotations: {
      title: 'Query Order',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Trading pair symbol, e.g. BTCTHB' },
        orderId: { type: 'integer', description: 'Order ID (either orderId or origClientOrderId required)' },
        origClientOrderId: { type: 'string', description: 'Client order ID (either orderId or origClientOrderId required)' },
        recvWindow: { type: 'integer', description: 'Request validity window in ms. Default: 5000, Max: 60000' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'bth_new_order',
    description: 'Place a new order. WARNING: This uses REAL MONEY. Supports LIMIT, MARKET, STOP_LOSS, STOP_LOSS_LIMIT, TAKE_PROFIT, TAKE_PROFIT_LIMIT, LIMIT_MAKER order types.',
    annotations: {
      title: 'Place New Order',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Trading pair symbol, e.g. BTCTHB' },
        side: { type: 'string', description: 'Order side: BUY or SELL' },
        type: { type: 'string', description: 'Order type: LIMIT, MARKET, STOP_LOSS, STOP_LOSS_LIMIT, TAKE_PROFIT, TAKE_PROFIT_LIMIT, LIMIT_MAKER' },
        timeInForce: { type: 'string', description: 'Time in force: GTC (Good Till Canceled), IOC (Immediate Or Cancel), FOK (Fill Or Kill). Required for LIMIT orders.' },
        quantity: { type: 'string', description: 'Order quantity (decimal string)' },
        quoteOrderQty: { type: 'string', description: 'Quote order quantity for MARKET orders (alternative to quantity)' },
        price: { type: 'string', description: 'Order price (decimal string). Required for LIMIT orders.' },
        stopPrice: { type: 'string', description: 'Stop price for STOP_LOSS, STOP_LOSS_LIMIT, TAKE_PROFIT, TAKE_PROFIT_LIMIT orders' },
        newClientOrderId: { type: 'string', description: 'Unique client order ID for tracking' },
        recvWindow: { type: 'integer', description: 'Request validity window in ms. Default: 5000, Max: 60000' },
      },
      required: ['symbol', 'side', 'type'],
    },
  },
  {
    name: 'bth_cancel_order',
    description: 'Cancel an active order by orderId or origClientOrderId.',
    annotations: {
      title: 'Cancel Order',
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Trading pair symbol, e.g. BTCTHB' },
        orderId: { type: 'integer', description: 'Order ID to cancel (either orderId or origClientOrderId required)' },
        origClientOrderId: { type: 'string', description: 'Client order ID to cancel' },
        recvWindow: { type: 'integer', description: 'Request validity window in ms. Default: 5000, Max: 60000' },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'bth_open_orders',
    description: 'Get all open orders for a symbol or all symbols. Without symbol: weight 40, with symbol: weight 3.',
    annotations: {
      title: 'Get Open Orders',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Trading pair symbol (optional — omit for all symbols, higher rate limit weight)' },
        recvWindow: { type: 'integer', description: 'Request validity window in ms. Default: 5000, Max: 60000' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
    },
  },
  {
    name: 'bth_all_orders',
    description: 'Get all orders (active, canceled, filled) for a symbol. Supports time range and pagination.',
    annotations: {
      title: 'Get All Orders',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Trading pair symbol, e.g. BTCTHB' },
        orderId: { type: 'integer', description: 'Order ID to fetch from' },
        startTime: { type: 'integer', description: 'Start time in milliseconds' },
        endTime: { type: 'integer', description: 'End time in milliseconds' },
        limit: { type: 'integer', description: 'Number of results. Default: 500, Max: 1000' },
        recvWindow: { type: 'integer', description: 'Request validity window in ms. Default: 5000, Max: 60000' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'bth_cancel_all_orders',
    description: 'Cancel all open orders for a symbol. WARNING: This cancels ALL pending orders at once.',
    annotations: {
      title: 'Cancel All Orders',
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Trading pair symbol, e.g. BTCTHB' },
        recvWindow: { type: 'integer', description: 'Request validity window in ms. Default: 5000, Max: 60000' },
      },
      required: ['symbol'],
    },
  },

  // ========== Wallet (4) ==========
  {
    name: 'bth_withdraw',
    description: 'Withdraw cryptocurrency to an external address. WARNING: Withdrawals are IRREVERSIBLE. Double-check address and amount before confirming.',
    annotations: {
      title: 'Withdraw',
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        coin: { type: 'string', description: 'Coin to withdraw, e.g. BTC, ETH, USDT' },
        address: { type: 'string', description: 'Destination wallet address' },
        amount: { type: 'string', description: 'Withdrawal amount (decimal string)' },
        network: { type: 'string', description: 'Blockchain network, e.g. BTC, ETH, BSC, TRX' },
        addressTag: { type: 'string', description: 'Secondary address identifier (memo/tag) for coins like XRP, XLM' },
        name: { type: 'string', description: 'Description/label for the withdrawal address' },
        recvWindow: { type: 'integer', description: 'Request validity window in ms. Default: 5000, Max: 60000' },
      },
      required: ['coin', 'address', 'amount'],
    },
  },
  {
    name: 'bth_deposit_address',
    description: 'Get deposit address for a specific coin and network.',
    annotations: {
      title: 'Get Deposit Address',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        coin: { type: 'string', description: 'Coin to get deposit address for, e.g. BTC, ETH' },
        network: { type: 'string', description: 'Blockchain network, e.g. BTC, ETH, BSC' },
        recvWindow: { type: 'integer', description: 'Request validity window in ms. Default: 5000, Max: 60000' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
      required: ['coin'],
    },
  },
  {
    name: 'bth_deposit_history',
    description: 'Get deposit history with optional filters by coin, status (0=pending, 1=success), and time range.',
    annotations: {
      title: 'Get Deposit History',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        coin: { type: 'string', description: 'Filter by coin, e.g. BTC' },
        status: { type: 'integer', description: 'Deposit status: 0=pending, 1=success' },
        startTime: { type: 'integer', description: 'Start time in milliseconds' },
        endTime: { type: 'integer', description: 'End time in milliseconds' },
        offset: { type: 'integer', description: 'Pagination offset' },
        limit: { type: 'integer', description: 'Number of results. Default: 1000, Max: 1000' },
        recvWindow: { type: 'integer', description: 'Request validity window in ms. Default: 5000, Max: 60000' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
    },
  },
  {
    name: 'bth_withdraw_history',
    description: 'Get withdrawal history. Status codes: 0=email sent, 1=cancelled, 2=awaiting approval, 3=rejected, 4=processing, 5=failure, 6=completed.',
    annotations: {
      title: 'Get Withdraw History',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        coin: { type: 'string', description: 'Filter by coin, e.g. BTC' },
        status: { type: 'integer', description: 'Withdrawal status: 0=email sent, 1=cancelled, 2=awaiting, 3=rejected, 4=processing, 5=failure, 6=completed' },
        startTime: { type: 'integer', description: 'Start time in milliseconds' },
        endTime: { type: 'integer', description: 'End time in milliseconds' },
        offset: { type: 'integer', description: 'Pagination offset' },
        limit: { type: 'integer', description: 'Number of results. Default: 1000, Max: 1000' },
        recvWindow: { type: 'integer', description: 'Request validity window in ms. Default: 5000, Max: 60000' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
    },
  },

  // ========== SubAccount (1) ==========
  {
    name: 'bth_sub_account_transfer',
    description: 'Transfer assets between sub-accounts. WARNING: Transfers real funds between accounts.',
    annotations: {
      title: 'Sub-Account Transfer',
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        fromEmail: { type: 'string', description: 'Sender sub-account email' },
        toEmail: { type: 'string', description: 'Recipient sub-account email' },
        asset: { type: 'string', description: 'Asset to transfer, e.g. BTC, USDT' },
        amount: { type: 'string', description: 'Transfer amount (decimal string)' },
        recvWindow: { type: 'integer', description: 'Request validity window in ms. Default: 5000, Max: 60000' },
      },
      required: ['fromEmail', 'toEmail', 'asset', 'amount'],
    },
  },

  // ========== User Data Stream (3) ==========
  {
    name: 'bth_create_listen_key',
    description: 'Create a listen key for user data stream (WebSocket). The key is valid for 60 minutes and must be kept alive with keepalive requests.',
    annotations: {
      title: 'Create Listen Key',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in response' },
      },
    },
  },
  {
    name: 'bth_keepalive_listen_key',
    description: 'Keepalive a listen key to extend its validity. Should be called every 60 minutes to prevent expiration.',
    annotations: {
      title: 'Keepalive Listen Key',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        listenKey: { type: 'string', description: 'Listen key to keep alive' },
      },
      required: ['listenKey'],
    },
  },
  {
    name: 'bth_close_listen_key',
    description: 'Close/invalidate a listen key. The associated user data stream will be terminated.',
    annotations: {
      title: 'Close Listen Key',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        listenKey: { type: 'string', description: 'Listen key to close' },
      },
      required: ['listenKey'],
    },
  },
];
