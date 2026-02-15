/**
 * Bitkub MCP Plugin - Type Definitions
 */

export interface BitkubConfig {
  apiKey: string;
  secretKey: string;
}

export interface BitkubSymbol {
  symbol: string;
  base_asset: string;
  quote_asset: string;
  base_asset_scale: number;
  quote_asset_scale: number;
  price_scale: number;
  price_step: string;
  quantity_scale: number;
  quantity_step: string;
  min_quote_size: number;
  status: string;
  freeze_buy: boolean;
  freeze_sell: boolean;
  freeze_cancel: boolean;
  market_segment: string;
  source: string;
  pairing_id: number;
  name: string;
  description: string;
  [key: string]: unknown;
}

export interface Ticker {
  id: number;
  last: number;
  lowestAsk: number;
  highestBid: number;
  percentChange: number;
  baseVolume: number;
  quoteVolume: number;
  isFrozen: number;
  high24hr: number;
  low24hr: number;
  change: number;
  prevClose: number;
  prevOpen: number;
}

export interface BitkubOrder {
  id: string;
  hash: string;
  side: string;
  type: string;
  rate: number;
  fee: number;
  credit: number;
  amount: number;
  receive: number;
  parent_id: string;
  super_id: string;
  client_id: string;
  ts: number;
  [key: string]: unknown;
}

export interface OrderInfo extends BitkubOrder {
  status: string;
  partial_filled: number;
  remaining: number;
  history: {
    amount: number;
    credit: number;
    fee: number;
    txn_id: string;
    rate: number;
    ts: number;
  }[];
}

export interface OrderHistoryEntry {
  txn_id: string;
  order_id: string;
  hash: string;
  parent_order_id: string;
  super_order_id: string;
  taken_by_me: boolean;
  is_maker: boolean;
  side: string;
  type: string;
  rate: number;
  fee: number;
  credit: number;
  amount: number;
  ts: number;
}

export interface PlaceOrderResult {
  id: string;
  hash: string;
  typ: string;
  amt: number;
  rat: number;
  fee: number;
  cre: number;
  rec: number;
  ts: number;
  ci?: string;
}

export interface CryptoAddress {
  currency: string;
  address: string;
  tag: string | null;
  network: string;
  time: number;
}

export interface DepositRecord {
  hash: string;
  currency: string;
  amount: number;
  from_address: string;
  to_address: string;
  confirmations: number;
  status: string;
  time: number;
}

export interface WithdrawRecord {
  txn_id: string;
  hash: string;
  currency: string;
  amount: number;
  fee: number;
  address: string;
  status: string;
  time: number;
}

export interface WithdrawResult {
  txn: string;
  adr: string;
  mem: string;
  cur: string;
  amt: number;
  fee: number;
  ts: number;
}

export interface UserLimits {
  limits: {
    crypto: { deposit: number; withdraw: number };
    fiat: { deposit: number; withdraw: number };
  };
  usage: {
    crypto: {
      deposit: number;
      withdraw: number;
      deposit_percentage: number;
      withdraw_percentage: number;
      deposit_thb_equivalent: number;
      withdraw_thb_equivalent: number;
    };
    fiat: {
      deposit: number;
      withdraw: number;
      deposit_percentage: number;
      withdraw_percentage: number;
    };
  };
  rate: number;
}

export interface TradingViewHistory {
  c: number[];
  h: number[];
  l: number[];
  o: number[];
  s: string;
  t: number[];
  v: number[];
}

/**
 * Bitkub API response wrapper
 */
export interface BitkubResponse<T = unknown> {
  error: number;
  result: T;
  pagination?: {
    page: number;
    last: number;
    next: number;
    prev: number;
  };
}
