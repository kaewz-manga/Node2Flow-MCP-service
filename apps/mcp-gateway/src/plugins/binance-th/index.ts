/**
 * Binance TH Plugin - MCP Gateway
 * Connects to Binance Thailand API (api.binance.th)
 * Ported from @node2flow/binance-th-mcp (community)
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { BinanceThClient } from './client';

export const binanceThPlugin: MCPPlugin = {
  id: 'binance-th',
  name: 'Binance TH',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    return new BinanceThClient({
      apiKey: (config.api_key as string) || '',
      secretKey: (config.secret_key as string) || '',
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const bth = client as BinanceThClient;

    // Strip _fields param (not a Binance API param)
    const { _fields, ...params } = args;

    try {
      let result: unknown;

      switch (toolName) {
        // ========== General (3) ==========
        case 'bth_server_time':
          result = await bth.getServerTimePublic();
          break;
        case 'bth_exchange_info':
          result = await bth.getExchangeInfo();
          break;
        case 'bth_symbol_type':
          result = await bth.getSymbolType();
          break;

        // ========== Market Data (7) ==========
        case 'bth_order_book':
          result = await bth.getOrderBook(params as { symbol: string; limit?: number });
          break;
        case 'bth_recent_trades':
          result = await bth.getRecentTrades(params as { symbol: string; limit?: number });
          break;
        case 'bth_aggregate_trades':
          result = await bth.getAggregateTrades(params);
          break;
        case 'bth_klines':
          result = await bth.getKlines(params);
          break;
        case 'bth_ticker_24hr':
          result = await bth.getTicker24hr(params as { symbol: string });
          break;
        case 'bth_ticker_price':
          result = await bth.getTickerPrice(
            Object.keys(params).length ? (params as { symbol?: string }) : undefined
          );
          break;
        case 'bth_book_ticker':
          result = await bth.getBookTicker(params as { symbol: string });
          break;

        // ========== Account (3) ==========
        case 'bth_account_info':
          result = await bth.getAccountInfo(Object.keys(params).length ? params : undefined);
          break;
        case 'bth_trade_list':
          result = await bth.getTradeList(params);
          break;
        case 'bth_trade_fee':
          result = await bth.getTradeFee(Object.keys(params).length ? params : undefined);
          break;

        // ========== Orders (6) ==========
        case 'bth_query_order':
          result = await bth.queryOrder(params);
          break;
        case 'bth_new_order':
          result = await bth.newOrder(params);
          break;
        case 'bth_cancel_order':
          result = await bth.cancelOrder(params);
          break;
        case 'bth_open_orders':
          result = await bth.getOpenOrders(Object.keys(params).length ? params : undefined);
          break;
        case 'bth_all_orders':
          result = await bth.getAllOrders(params);
          break;
        case 'bth_cancel_all_orders':
          result = await bth.cancelAllOrders(params);
          break;

        // ========== Wallet (4) ==========
        case 'bth_withdraw':
          result = await bth.withdraw(params);
          break;
        case 'bth_deposit_address':
          result = await bth.getDepositAddress(params);
          break;
        case 'bth_deposit_history':
          result = await bth.getDepositHistory(Object.keys(params).length ? params : undefined);
          break;
        case 'bth_withdraw_history':
          result = await bth.getWithdrawHistory(Object.keys(params).length ? params : undefined);
          break;

        // ========== SubAccount (1) ==========
        case 'bth_sub_account_transfer':
          result = await bth.subAccountTransfer(params);
          break;

        // ========== User Data Stream (3) ==========
        case 'bth_create_listen_key':
          result = await bth.createListenKey();
          break;
        case 'bth_keepalive_listen_key':
          result = await bth.keepaliveListenKey(params.listenKey as string);
          break;
        case 'bth_close_listen_key':
          result = await bth.closeListenKey(params.listenKey as string);
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
