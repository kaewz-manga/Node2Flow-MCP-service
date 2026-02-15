/**
 * Binance TH Plugin - Type Definitions
 * Ported from @node2flow/binance-th-mcp (community)
 */

export interface BinanceThConfig {
  apiKey: string;
  secretKey: string;
}

export interface ExchangeSymbol {
  symbol: string;
  status: string;
  baseAsset: string;
  baseAssetPrecision: number;
  quoteAsset: string;
  quotePrecision: number;
  quoteAssetPrecision: number;
  type: string;
  orderTypes: string[];
  filters: Record<string, unknown>[];
  [key: string]: unknown;
}

export interface ExchangeInfo {
  timezone: string;
  serverTime: number;
  rateLimits: Record<string, unknown>[];
  symbols: ExchangeSymbol[];
  [key: string]: unknown;
}

export interface OrderBook {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
}

export interface Trade {
  id: number;
  price: string;
  qty: string;
  quoteQty: string;
  time: number;
  isBuyerMaker: boolean;
  isBestMatch: boolean;
}

export interface AggTrade {
  a: number;
  p: string;
  q: string;
  f: number;
  l: number;
  T: number;
  m: boolean;
}

export interface Ticker24hr {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  askPrice: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  count: number;
  [key: string]: unknown;
}

export interface TickerPrice {
  symbol: string;
  price: string;
}

export interface BookTicker {
  symbol: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
}

export interface Balance {
  asset: string;
  free: string;
  locked: string;
}

export interface Account {
  makerCommission: number;
  takerCommission: number;
  canTrade: boolean;
  canWithdraw: boolean;
  canDeposit: boolean;
  updateTime: number;
  balances: Balance[];
  [key: string]: unknown;
}

export interface Order {
  symbol: string;
  orderId: number;
  clientOrderId: string;
  price: string;
  origQty: string;
  executedQty: string;
  cumulativeQuoteQty: string;
  status: string;
  timeInForce: string;
  type: string;
  side: string;
  stopPrice?: string;
  time: number;
  updateTime: number;
  isWorking: boolean;
  [key: string]: unknown;
}

export interface UserTrade {
  symbol: string;
  id: number;
  orderId: number;
  price: string;
  qty: string;
  quoteQty: string;
  commission: string;
  commissionAsset: string;
  time: number;
  isBuyer: boolean;
  isMaker: boolean;
  isBestMatch: boolean;
}

export interface TradeFee {
  symbol: string;
  makerCommission: string;
  takerCommission: string;
}

export interface DepositAddress {
  address: string;
  coin: string;
  tag?: string;
  url?: string;
  [key: string]: unknown;
}

export interface DepositRecord {
  amount: string;
  coin: string;
  network: string;
  status: number;
  address: string;
  txId: string;
  insertTime: number;
  [key: string]: unknown;
}

export interface WithdrawRecord {
  id: string;
  amount: string;
  coin: string;
  network: string;
  status: number;
  address: string;
  txId: string;
  applyTime: string;
  [key: string]: unknown;
}

export interface SymbolType {
  symbol: string;
  type: string;
}

export interface ListenKey {
  listenKey: string;
}
