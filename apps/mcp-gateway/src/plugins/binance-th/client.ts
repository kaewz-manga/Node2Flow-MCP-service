/**
 * Binance TH REST API Client
 *
 * Base URL: https://api.binance.th
 * API version: /api/v1/
 * Auth: HMAC SHA256 signature + X-MBX-APIKEY header
 *
 * Security types:
 * - NONE: Public endpoints, no auth needed
 * - USER_STREAM: API key in header only (no signature)
 * - SIGNED: API key + HMAC SHA256 signature
 *
 * Ported from @node2flow/binance-th-mcp (community)
 */

import { hmacSha256Hex } from '../_crypto-utils';
import type { BinanceThConfig } from './types';

export class BinanceThClient {
  private config: BinanceThConfig;
  private baseUrl = 'https://api.binance.th';

  constructor(config: BinanceThConfig) {
    this.config = config;
  }

  /**
   * Build query string from params, filtering out undefined values
   */
  private buildQueryString(params: Record<string, unknown>): string {
    const entries = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => [k, String(v)] as [string, string]);
    return new URLSearchParams(entries).toString();
  }

  /**
   * Get server time for signed requests
   */
  private async getServerTime(): Promise<number> {
    const data = await this.publicGet<{ serverTime: number }>('/api/v1/time');
    return data.serverTime;
  }

  /**
   * Public GET request (no authentication)
   */
  async publicGet<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const qs = this.buildQueryString(params);
      if (qs) url += `?${qs}`;
    }

    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Binance API Error ${response.status}: ${(error as any).msg || (error as any).message || response.statusText}`
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * Signed request (HMAC SHA256)
   * Adds timestamp + signature automatically
   */
  private async signedRequest<T>(
    method: string,
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    const serverTime = await this.getServerTime();

    const allParams: Record<string, unknown> = {
      ...params,
      timestamp: serverTime,
      recvWindow: (params?.recvWindow as number) || 5000,
    };

    const queryString = this.buildQueryString(allParams);
    const signature = await hmacSha256Hex(this.config.secretKey, queryString);
    const signedQs = `${queryString}&signature=${signature}`;

    const url =
      method === 'GET' || method === 'DELETE'
        ? `${this.baseUrl}${endpoint}?${signedQs}`
        : `${this.baseUrl}${endpoint}`;

    const fetchOpts: RequestInit = {
      method,
      headers: {
        'X-MBX-APIKEY': this.config.apiKey,
      },
    };

    if (method === 'POST') {
      fetchOpts.headers = {
        ...fetchOpts.headers,
        'Content-Type': 'application/x-www-form-urlencoded',
      };
      fetchOpts.body = signedQs;
    }

    const response = await fetch(url, fetchOpts);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Binance API Error ${response.status}: ${(error as any).msg || (error as any).code || response.statusText}`
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * User stream request (API key only, no signature)
   */
  private async userStreamRequest<T>(
    method: string,
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const qs = this.buildQueryString(params);
      if (qs) url += `?${qs}`;
    }

    const response = await fetch(url, {
      method,
      headers: {
        'X-MBX-APIKEY': this.config.apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Binance API Error ${response.status}: ${(error as any).msg || (error as any).code || response.statusText}`
      );
    }

    return response.json() as Promise<T>;
  }

  // ========== General ==========

  async getServerTimePublic() {
    return this.publicGet<{ serverTime: number }>('/api/v1/time');
  }

  async getExchangeInfo() {
    return this.publicGet('/api/v1/exchangeInfo');
  }

  async getSymbolType() {
    return this.publicGet('/api/v1/symbolType');
  }

  // ========== Market Data ==========

  async getOrderBook(params: { symbol: string; limit?: number }) {
    return this.publicGet('/api/v1/depth', params);
  }

  async getRecentTrades(params: { symbol: string; limit?: number }) {
    return this.publicGet('/api/v1/trades', params);
  }

  async getAggregateTrades(params: Record<string, unknown>) {
    return this.publicGet('/api/v1/aggTrades', params);
  }

  async getKlines(params: Record<string, unknown>) {
    return this.publicGet('/api/v1/klines', params);
  }

  async getTicker24hr(params: { symbol: string }) {
    return this.publicGet('/api/v1/ticker/24hr', params);
  }

  async getTickerPrice(params?: { symbol?: string }) {
    return this.publicGet('/api/v1/ticker/price', params);
  }

  async getBookTicker(params: { symbol: string }) {
    return this.publicGet('/api/v1/ticker/bookTicker', params);
  }

  // ========== Account ==========

  async getAccountInfo(params?: Record<string, unknown>) {
    return this.signedRequest('GET', '/api/v1/accountV2', params);
  }

  async getTradeList(params: Record<string, unknown>) {
    return this.signedRequest('GET', '/api/v1/userTrades', params);
  }

  async getTradeFee(params?: Record<string, unknown>) {
    return this.signedRequest('GET', '/api/v1/asset/tradeFee', params);
  }

  // ========== Orders ==========

  async queryOrder(params: Record<string, unknown>) {
    return this.signedRequest('GET', '/api/v1/order', params);
  }

  async newOrder(params: Record<string, unknown>) {
    return this.signedRequest('POST', '/api/v1/order', params);
  }

  async cancelOrder(params: Record<string, unknown>) {
    return this.signedRequest('DELETE', '/api/v1/order', params);
  }

  async getOpenOrders(params?: Record<string, unknown>) {
    return this.signedRequest('GET', '/api/v1/openOrders', params);
  }

  async getAllOrders(params: Record<string, unknown>) {
    return this.signedRequest('GET', '/api/v1/allOrders', params);
  }

  async cancelAllOrders(params: Record<string, unknown>) {
    return this.signedRequest('DELETE', '/api/v1/openOrders', params);
  }

  // ========== Wallet ==========

  async withdraw(params: Record<string, unknown>) {
    return this.signedRequest('POST', '/api/v1/capital/withdraw/apply', params);
  }

  async getDepositAddress(params: Record<string, unknown>) {
    return this.signedRequest('GET', '/api/v1/capital/deposit/address', params);
  }

  async getDepositHistory(params?: Record<string, unknown>) {
    return this.signedRequest('GET', '/api/v1/capital/deposit/hisrec', params);
  }

  async getWithdrawHistory(params?: Record<string, unknown>) {
    return this.signedRequest('GET', '/api/v1/capital/withdraw/history', params);
  }

  // ========== SubAccount ==========

  async subAccountTransfer(params: Record<string, unknown>) {
    return this.signedRequest('POST', '/api/v1/sub-account/transfer/subToSub', params);
  }

  // ========== User Data Stream ==========

  async createListenKey() {
    return this.userStreamRequest<{ listenKey: string }>('POST', '/api/v1/userDataStream');
  }

  async keepaliveListenKey(listenKey: string) {
    return this.userStreamRequest('PUT', '/api/v1/userDataStream', { listenKey });
  }

  async closeListenKey(listenKey: string) {
    return this.userStreamRequest('DELETE', '/api/v1/userDataStream', { listenKey });
  }
}
