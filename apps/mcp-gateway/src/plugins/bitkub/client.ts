/**
 * Bitkub REST API Client
 *
 * Base URL: https://api.bitkub.com
 * Auth: HMAC SHA-256 signature via headers
 *
 * Security types:
 * - Non-secure: Public endpoints, no auth needed
 * - Secure: API key + timestamp + HMAC SHA-256 signature
 *
 * Signature string = timestamp + method + path + query + payload
 */

import type { BitkubConfig, BitkubResponse } from './types';
import { hmacSha256Hex } from '../_crypto-utils';

export class BitkubClient {
  private config: BitkubConfig;
  private baseUrl = 'https://api.bitkub.com';

  constructor(config: BitkubConfig) {
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
   * Get server timestamp (milliseconds)
   */
  private async getServerTimestamp(): Promise<number> {
    const data = await this.publicGet<BitkubResponse<number>>('/api/v3/servertime');
    return data.result;
  }

  /**
   * Generate HMAC SHA-256 signature
   * sigString = timestamp + method + path + queryString + payloadJson
   */
  private async sign(
    timestamp: number,
    method: string,
    path: string,
    query: string,
    payload: string
  ): Promise<string> {
    const sigString = `${timestamp}${method}${path}${query}${payload}`;
    return hmacSha256Hex(this.config.secretKey, sigString);
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

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Bitkub API Error ${response.status}: ${(error as any).error || response.statusText}`
      );
    }

    const data = await response.json() as any;
    if (data.error && data.error !== 0) {
      throw new Error(`Bitkub API Error ${data.error}: ${this.getErrorMessage(data.error)}`);
    }

    return data as T;
  }

  /**
   * Signed GET request (API key + timestamp + signature in headers)
   */
  async signedGet<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    const timestamp = await this.getServerTimestamp();
    const query = params ? this.buildQueryString(params) : '';
    const url = query
      ? `${this.baseUrl}${endpoint}?${query}`
      : `${this.baseUrl}${endpoint}`;

    const signature = await this.sign(timestamp, 'GET', endpoint, query ? `?${query}` : '', '');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-BTK-APIKEY': this.config.apiKey,
        'X-BTK-TIMESTAMP': String(timestamp),
        'X-BTK-SIGN': signature,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Bitkub API Error ${response.status}: ${(error as any).error || response.statusText}`
      );
    }

    const data = await response.json() as any;
    if (data.error && data.error !== 0) {
      throw new Error(`Bitkub API Error ${data.error}: ${this.getErrorMessage(data.error)}`);
    }

    return data as T;
  }

  /**
   * Signed POST request (API key + timestamp + signature + JSON body)
   */
  async signedPost<T>(endpoint: string, payload?: Record<string, unknown>): Promise<T> {
    const timestamp = await this.getServerTimestamp();
    const payloadJson = payload && Object.keys(payload).length > 0
      ? JSON.stringify(payload)
      : '';

    const signature = await this.sign(timestamp, 'POST', endpoint, '', payloadJson);

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-BTK-APIKEY': this.config.apiKey,
        'X-BTK-TIMESTAMP': String(timestamp),
        'X-BTK-SIGN': signature,
      },
      body: payloadJson || undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Bitkub API Error ${response.status}: ${(error as any).error || response.statusText}`
      );
    }

    const data = await response.json() as any;
    if (data.error && data.error !== 0) {
      throw new Error(`Bitkub API Error ${data.error}: ${this.getErrorMessage(data.error)}`);
    }

    return data as T;
  }

  /**
   * Map Bitkub error code to message
   */
  private getErrorMessage(code: number): string {
    const errors: Record<number, string> = {
      1: 'Invalid JSON payload',
      2: 'Missing X-BTK-APIKEY',
      3: 'Invalid API key',
      4: 'API pending for activation',
      5: 'IP not allowed',
      6: 'Missing / invalid signature',
      7: 'Missing timestamp',
      8: 'Invalid timestamp',
      9: 'Invalid user',
      10: 'Invalid parameter',
      11: 'Invalid symbol',
      12: 'Invalid amount',
      13: 'Invalid rate',
      14: 'Improper rate',
      15: 'Amount too low',
      16: 'Failed to get balance',
      17: 'Wallet is empty',
      18: 'Insufficient balance',
      19: 'Failed to insert order',
      20: 'Failed to deduct balance',
      21: 'Invalid order for cancellation',
      22: 'Invalid side',
      23: 'Failed to update order status',
      24: 'Invalid order for lookup',
      25: 'KYC level 1 required',
      30: 'Limit exceeded',
      40: 'Pending withdrawal exists',
      41: 'Invalid currency for withdrawal',
      42: 'Address is not in whitelist',
      43: 'Failed to deduct crypto',
      44: 'Failed to create withdrawal record',
      45: 'Nonce has to be numeric',
      46: 'Invalid nonce',
      47: 'Withdrawal limit exceeded',
      48: 'Invalid bank account',
      49: 'Bank limit exceeded',
      50: 'Pending withdrawal exists',
      51: 'Withdrawal is under maintenance',
      90: 'Server error',
    };
    return errors[code] || `Unknown error (code: ${code})`;
  }

  // ========== General / Market Data (10) ==========

  async getServerTime() {
    return this.publicGet<BitkubResponse<number>>('/api/v3/servertime');
  }

  async getServerStatus() {
    return this.publicGet<{ name: string; status: string; message: string }[]>('/api/status');
  }

  async getSymbols() {
    return this.publicGet<BitkubResponse>('/api/v3/market/symbols');
  }

  async getTicker(params?: { sym?: string }) {
    return this.publicGet('/api/v3/market/ticker', params);
  }

  async getRecentTrades(params: { sym: string; lmt?: number }) {
    return this.publicGet<BitkubResponse>('/api/v3/market/trades', params);
  }

  async getBids(params: { sym: string; lmt?: number }) {
    return this.publicGet<BitkubResponse>('/api/v3/market/bids', params);
  }

  async getAsks(params: { sym: string; lmt?: number }) {
    return this.publicGet<BitkubResponse>('/api/v3/market/asks', params);
  }

  async getBooks(params: { sym: string; lmt?: number }) {
    return this.publicGet<BitkubResponse>('/api/v3/market/books', params);
  }

  async getDepth(params: { sym: string; lmt?: number }) {
    return this.publicGet<BitkubResponse>('/api/v3/market/depth', params);
  }

  async getTradingViewHistory(params: { symbol: string; resolution: string; from: number; to: number }) {
    return this.publicGet('/api/tradingview/history', params);
  }

  // ========== Account (4) ==========

  async getWallet() {
    return this.signedGet<BitkubResponse>('/api/v3/market/wallet');
  }

  async getBalances() {
    return this.signedPost<BitkubResponse>('/api/v3/market/balances');
  }

  async getTradingCredits() {
    return this.signedPost<BitkubResponse>('/api/v3/market/trading-credits');
  }

  async getUserLimits() {
    return this.signedPost<BitkubResponse>('/api/v3/user/limits');
  }

  // ========== Orders (8) ==========

  async placeBid(params: Record<string, unknown>) {
    return this.signedPost<BitkubResponse>('/api/v3/market/place-bid', params);
  }

  async placeAsk(params: Record<string, unknown>) {
    return this.signedPost<BitkubResponse>('/api/v3/market/place-ask', params);
  }

  async placeBidTest(params: Record<string, unknown>) {
    return this.signedPost<BitkubResponse>('/api/v3/market/place-bid/test', params);
  }

  async placeAskTest(params: Record<string, unknown>) {
    return this.signedPost<BitkubResponse>('/api/v3/market/place-ask/test', params);
  }

  async cancelOrder(params: Record<string, unknown>) {
    return this.signedPost<BitkubResponse>('/api/v3/market/cancel-order', params);
  }

  async getMyOpenOrders(params: Record<string, unknown>) {
    return this.signedPost<BitkubResponse>('/api/v3/market/my-open-orders', params);
  }

  async getMyOrderHistory(params: Record<string, unknown>) {
    return this.signedPost<BitkubResponse>('/api/v3/market/my-order-history', params);
  }

  async getOrderInfo(params: Record<string, unknown>) {
    return this.signedPost<BitkubResponse>('/api/v3/market/order-info', params);
  }

  // ========== Crypto / Wallet (6) ==========

  async getCryptoAddresses(params?: Record<string, unknown>) {
    return this.signedPost<BitkubResponse>('/api/v4/crypto/addresses', params);
  }

  async cryptoWithdraw(params: Record<string, unknown>) {
    return this.signedPost<BitkubResponse>('/api/v4/crypto/withdraw', params);
  }

  async cryptoInternalWithdraw(params: Record<string, unknown>) {
    return this.signedPost<BitkubResponse>('/api/v4/crypto/internal-withdraw', params);
  }

  async getCryptoDepositHistory(params?: Record<string, unknown>) {
    return this.signedPost<BitkubResponse>('/api/v4/crypto/deposit-history', params);
  }

  async getCryptoWithdrawHistory(params?: Record<string, unknown>) {
    return this.signedPost<BitkubResponse>('/api/v4/crypto/withdraw-history', params);
  }

  async generateCryptoAddress(params: Record<string, unknown>) {
    return this.signedPost<BitkubResponse>('/api/v4/crypto/generate-address', params);
  }
}
