/**
 * Bitkub Exchange Plugin - MCP Gateway
 * Thailand's leading crypto exchange (28 tools)
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { BitkubClient } from './client';

export const bitkubPlugin: MCPPlugin = {
  id: 'bitkub',
  name: 'Bitkub',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    return new BitkubClient({
      apiKey: (config.api_key as string) || '',
      secretKey: (config.secret_key as string) || '',
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const btk = client as BitkubClient;

    // Strip _fields param (Smithery quality — not a Bitkub API param)
    const { _fields, ...params } = args;

    try {
      let result: unknown;

      switch (toolName) {
        // ========== General / Market Data (10) ==========
        case 'btk_server_time':
          result = await btk.getServerTime();
          break;
        case 'btk_server_status':
          result = await btk.getServerStatus();
          break;
        case 'btk_symbols':
          result = await btk.getSymbols();
          break;
        case 'btk_ticker':
          result = await btk.getTicker(
            Object.keys(params).length ? (params as { sym?: string }) : undefined
          );
          break;
        case 'btk_recent_trades':
          result = await btk.getRecentTrades(params as { sym: string; lmt?: number });
          break;
        case 'btk_bids':
          result = await btk.getBids(params as { sym: string; lmt?: number });
          break;
        case 'btk_asks':
          result = await btk.getAsks(params as { sym: string; lmt?: number });
          break;
        case 'btk_books':
          result = await btk.getBooks(params as { sym: string; lmt?: number });
          break;
        case 'btk_depth':
          result = await btk.getDepth(params as { sym: string; lmt?: number });
          break;
        case 'btk_tradingview_history':
          result = await btk.getTradingViewHistory(
            params as { symbol: string; resolution: string; from: number; to: number }
          );
          break;

        // ========== Account (4) ==========
        case 'btk_wallet':
          result = await btk.getWallet();
          break;
        case 'btk_balances':
          result = await btk.getBalances();
          break;
        case 'btk_trading_credits':
          result = await btk.getTradingCredits();
          break;
        case 'btk_user_limits':
          result = await btk.getUserLimits();
          break;

        // ========== Orders (8) ==========
        case 'btk_place_bid':
          result = await btk.placeBid(params);
          break;
        case 'btk_place_ask':
          result = await btk.placeAsk(params);
          break;
        case 'btk_place_bid_test':
          result = await btk.placeBidTest(params);
          break;
        case 'btk_place_ask_test':
          result = await btk.placeAskTest(params);
          break;
        case 'btk_cancel_order':
          result = await btk.cancelOrder(params);
          break;
        case 'btk_my_open_orders':
          result = await btk.getMyOpenOrders(params);
          break;
        case 'btk_my_order_history':
          result = await btk.getMyOrderHistory(params);
          break;
        case 'btk_order_info':
          result = await btk.getOrderInfo(params);
          break;

        // ========== Crypto / Wallet (6) ==========
        case 'btk_crypto_addresses':
          result = await btk.getCryptoAddresses(Object.keys(params).length ? params : undefined);
          break;
        case 'btk_crypto_withdraw':
          result = await btk.cryptoWithdraw(params);
          break;
        case 'btk_crypto_internal_withdraw':
          result = await btk.cryptoInternalWithdraw(params);
          break;
        case 'btk_crypto_deposit_history':
          result = await btk.getCryptoDepositHistory(Object.keys(params).length ? params : undefined);
          break;
        case 'btk_crypto_withdraw_history':
          result = await btk.getCryptoWithdrawHistory(Object.keys(params).length ? params : undefined);
          break;
        case 'btk_crypto_generate_address':
          result = await btk.generateCryptoAddress(params);
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
