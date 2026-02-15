/**
 * Binance Global MCP — 23 Tool Definitions
 */

import type { MCPToolDefinition } from '../../types';

export const TOOLS: MCPToolDefinition[] = [
  // ========== General (3) ==========
  {
    name: 'bn_ping',
    description: 'Test connectivity to the Binance API. Returns empty object on success.',
    annotations: {
      title: 'Ping',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'bn_server_time',
    description: 'Get Binance server time (millisecond timestamp). Use to check connectivity and sync timestamps for signed requests.',
    annotations: {
      title: 'Get Server Time',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'bn_exchange_info',
    description: 'Get exchange information including trading rules, symbol list, filters (PRICE_FILTER, LOT_SIZE, MIN_NOTIONAL), rate limits, and permissions.',
    annotations: {
      title: 'Get Exchange Info',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // ========== Market Data (8) ==========
  {
    name: 'bn_order_book',
    description: 'Get order book (bids and asks) for a symbol. Limit controls depth: 5, 10, 20, 50, 100, 500, 1000, 5000.',
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
        symbol: { type: 'string', description: 'Trading pair symbol, e.g. BTCUSDT, ETHBTC' },
        limit: { type: 'integer', description: 'Order book depth. Default: 100. Valid: 5, 10, 20, 50, 100, 500, 1000, 5000' },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'bn_recent_trades',
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
        symbol: { type: 'string', description: 'Trading pair symbol, e.g. BTCUSDT' },
        limit: { type: 'integer', description: 'Number of trades. Default: 500, Max: 1000' },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'bn_aggregate_trades',
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
        symbol: { type: 'string', description: 'Trading pair symbol, e.g. BTCUSDT' },
        fromId: { type: 'integer', description: 'Aggregate trade ID to fetch from (inclusive)' },
        startTime: { type: 'integer', description: 'Start time in milliseconds (inclusive)' },
        endTime: { type: 'integer', description: 'End time in milliseconds (inclusive)' },
        limit: { type: 'integer', description: 'Number of results. Default: 500, Max: 1000' },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'bn_klines',
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
        symbol: { type: 'string', description: 'Trading pair symbol, e.g. BTCUSDT' },
        interval: { type: 'string', description: 'Kline interval: 1s, 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M' },
        startTime: { type: 'integer', description: 'Start time in milliseconds' },
        endTime: { type: 'integer', description: 'End time in milliseconds' },
        limit: { type: 'integer', description: 'Number of klines. Default: 500, Max: 1000' },
      },
      required: ['symbol', 'interval'],
    },
  },
  {
    name: 'bn_avg_price',
    description: 'Get current average price for a symbol (5-minute weighted average).',
    annotations: {
      title: 'Get Average Price',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Trading pair symbol, e.g. BTCUSDT' },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'bn_ticker_24hr',
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
        symbol: { type: 'string', description: 'Trading pair symbol, e.g. BTCUSDT' },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'bn_ticker_price',
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
      },
    },
  },
  {
    name: 'bn_book_ticker',
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
        symbol: { type: 'string', description: 'Trading pair symbol, e.g. BTCUSDT' },
      },
      required: ['symbol'],
    },
  },

  // ========== Orders (7) ==========
  {
    name: 'bn_new_order',
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
        symbol: { type: 'string', description: 'Trading pair symbol, e.g. BTCUSDT' },
        side: { type: 'string', description: 'Order side: BUY or SELL' },
        type: { type: 'string', description: 'Order type: LIMIT, MARKET, STOP_LOSS, STOP_LOSS_LIMIT, TAKE_PROFIT, TAKE_PROFIT_LIMIT, LIMIT_MAKER' },
        timeInForce: { type: 'string', description: 'Time in force: GTC (Good Till Canceled), IOC (Immediate Or Cancel), FOK (Fill Or Kill). Required for LIMIT orders.' },
        quantity: { type: 'string', description: 'Order quantity (decimal string)' },
        quoteOrderQty: { type: 'string', description: 'Quote order quantity for MARKET orders (alternative to quantity)' },
        price: { type: 'string', description: 'Order price (decimal string). Required for LIMIT orders.' },
        stopPrice: { type: 'string', description: 'Stop price for STOP_LOSS, STOP_LOSS_LIMIT, TAKE_PROFIT, TAKE_PROFIT_LIMIT orders' },
        newClientOrderId: { type: 'string', description: 'Unique client order ID for tracking' },
        icebergQty: { type: 'string', description: 'Iceberg order quantity' },
        newOrderRespType: { type: 'string', description: 'Response type: ACK, RESULT, or FULL. Default: FULL for MARKET/LIMIT' },
        recvWindow: { type: 'integer', description: 'Request validity window in ms. Default: 5000, Max: 60000' },
      },
      required: ['symbol', 'side', 'type'],
    },
  },
  {
    name: 'bn_test_order',
    description: 'Test new order creation without actually placing it. Validates parameters and filters. Same params as bn_new_order but no order is created.',
    annotations: {
      title: 'Test New Order',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Trading pair symbol, e.g. BTCUSDT' },
        side: { type: 'string', description: 'Order side: BUY or SELL' },
        type: { type: 'string', description: 'Order type: LIMIT, MARKET, etc.' },
        timeInForce: { type: 'string', description: 'Time in force: GTC, IOC, FOK' },
        quantity: { type: 'string', description: 'Order quantity (decimal string)' },
        quoteOrderQty: { type: 'string', description: 'Quote order quantity for MARKET orders' },
        price: { type: 'string', description: 'Order price (decimal string)' },
        stopPrice: { type: 'string', description: 'Stop price' },
        newClientOrderId: { type: 'string', description: 'Unique client order ID' },
        icebergQty: { type: 'string', description: 'Iceberg order quantity' },
        newOrderRespType: { type: 'string', description: 'Response type: ACK, RESULT, or FULL' },
        recvWindow: { type: 'integer', description: 'Request validity window in ms' },
      },
      required: ['symbol', 'side', 'type'],
    },
  },
  {
    name: 'bn_query_order',
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
        symbol: { type: 'string', description: 'Trading pair symbol, e.g. BTCUSDT' },
        orderId: { type: 'integer', description: 'Order ID (either orderId or origClientOrderId required)' },
        origClientOrderId: { type: 'string', description: 'Client order ID (either orderId or origClientOrderId required)' },
        recvWindow: { type: 'integer', description: 'Request validity window in ms. Default: 5000, Max: 60000' },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'bn_cancel_order',
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
        symbol: { type: 'string', description: 'Trading pair symbol, e.g. BTCUSDT' },
        orderId: { type: 'integer', description: 'Order ID to cancel (either orderId or origClientOrderId required)' },
        origClientOrderId: { type: 'string', description: 'Client order ID to cancel' },
        newClientOrderId: { type: 'string', description: 'New client order ID for the cancel request' },
        recvWindow: { type: 'integer', description: 'Request validity window in ms. Default: 5000, Max: 60000' },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'bn_cancel_all_orders',
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
        symbol: { type: 'string', description: 'Trading pair symbol, e.g. BTCUSDT' },
        recvWindow: { type: 'integer', description: 'Request validity window in ms. Default: 5000, Max: 60000' },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'bn_open_orders',
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
      },
    },
  },
  {
    name: 'bn_all_orders',
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
        symbol: { type: 'string', description: 'Trading pair symbol, e.g. BTCUSDT' },
        orderId: { type: 'integer', description: 'Order ID to fetch from' },
        startTime: { type: 'integer', description: 'Start time in milliseconds' },
        endTime: { type: 'integer', description: 'End time in milliseconds' },
        limit: { type: 'integer', description: 'Number of results. Default: 500, Max: 1000' },
        recvWindow: { type: 'integer', description: 'Request validity window in ms. Default: 5000, Max: 60000' },
      },
      required: ['symbol'],
    },
  },

  // ========== Account (2) ==========
  {
    name: 'bn_account_info',
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
      },
    },
  },
  {
    name: 'bn_my_trades',
    description: 'Get trade history for a specific symbol. Returns executed trades with price, quantity, commission, and timestamps.',
    annotations: {
      title: 'Get My Trades',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Trading pair symbol, e.g. BTCUSDT' },
        orderId: { type: 'integer', description: 'Filter by order ID' },
        startTime: { type: 'integer', description: 'Start time in milliseconds' },
        endTime: { type: 'integer', description: 'End time in milliseconds' },
        fromId: { type: 'integer', description: 'Trade ID to fetch from' },
        limit: { type: 'integer', description: 'Number of results. Default: 500, Max: 1000' },
        recvWindow: { type: 'integer', description: 'Request validity window in ms. Default: 5000, Max: 60000' },
      },
      required: ['symbol'],
    },
  },

  // ========== User Data Stream (3) ==========
  {
    name: 'bn_create_listen_key',
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
      properties: {},
    },
  },
  {
    name: 'bn_keepalive_listen_key',
    description: 'Keepalive a listen key to extend its validity. Should be called every 30 minutes to prevent expiration.',
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
    name: 'bn_close_listen_key',
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
