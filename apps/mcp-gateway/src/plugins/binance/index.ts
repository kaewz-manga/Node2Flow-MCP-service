/**
 * Binance Global API Plugin - MCP Gateway
 * Spot trading, market data, and account management via Binance.com
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { BinanceClient } from './client';

export const binancePlugin: MCPPlugin = {
  id: 'binance',
  name: 'Binance',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    return new BinanceClient({
      apiKey: (config.api_key as string) || '',
      secretKey: (config.secret_key as string) || '',
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const bn = client as BinanceClient;

    // Strip _fields param (not a Binance API param)
    const { _fields, ...params } = args;

    try {
      let result: unknown;

      switch (toolName) {
        // ========== General (3) ==========
        case 'bn_ping':
          result = await bn.ping();
          break;
        case 'bn_server_time':
          result = await bn.getServerTimePublic();
          break;
        case 'bn_exchange_info':
          result = await bn.getExchangeInfo();
          break;

        // ========== Market Data (8) ==========
        case 'bn_order_book':
          result = await bn.getOrderBook(params as { symbol: string; limit?: number });
          break;
        case 'bn_recent_trades':
          result = await bn.getRecentTrades(params as { symbol: string; limit?: number });
          break;
        case 'bn_aggregate_trades':
          result = await bn.getAggregateTrades(params);
          break;
        case 'bn_klines':
          result = await bn.getKlines(params);
          break;
        case 'bn_avg_price':
          result = await bn.getAvgPrice(params as { symbol: string });
          break;
        case 'bn_ticker_24hr':
          result = await bn.getTicker24hr(params as { symbol: string });
          break;
        case 'bn_ticker_price':
          result = await bn.getTickerPrice(
            Object.keys(params).length ? (params as { symbol?: string }) : undefined
          );
          break;
        case 'bn_book_ticker':
          result = await bn.getBookTicker(params as { symbol: string });
          break;

        // ========== Orders (7) ==========
        case 'bn_new_order':
          result = await bn.newOrder(params);
          break;
        case 'bn_test_order':
          result = await bn.testOrder(params);
          break;
        case 'bn_query_order':
          result = await bn.queryOrder(params);
          break;
        case 'bn_cancel_order':
          result = await bn.cancelOrder(params);
          break;
        case 'bn_cancel_all_orders':
          result = await bn.cancelAllOrders(params);
          break;
        case 'bn_open_orders':
          result = await bn.getOpenOrders(
            Object.keys(params).length ? params : undefined
          );
          break;
        case 'bn_all_orders':
          result = await bn.getAllOrders(params);
          break;

        // ========== Account (2) ==========
        case 'bn_account_info':
          result = await bn.getAccountInfo(
            Object.keys(params).length ? params : undefined
          );
          break;
        case 'bn_my_trades':
          result = await bn.getMyTrades(params);
          break;

        // ========== User Data Stream (3) ==========
        case 'bn_create_listen_key':
          result = await bn.createListenKey();
          break;
        case 'bn_keepalive_listen_key':
          result = await bn.keepaliveListenKey(params.listenKey as string);
          break;
        case 'bn_close_listen_key':
          result = await bn.closeListenKey(params.listenKey as string);
          break;

        default:
          return {
            content: [{ type: 'text' as const, text: `Unknown tool: ${toolName}` }],
            isError: true,
          };
      }

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        isError: false,
      };
    } catch (error) {
      return {
        content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  },
};
