export interface CoinData {
  id: string;
  name: string;
  symbol: string;
  image: string;
  priceChange: number;
  marketCap: number;
  volume: number;
  rank: number;
}

export interface MarketDominanceData {
  btc: number;
  eth: number;
  usdt: number;
  others: number;
}

export interface SeasonStatus {
  title: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  bgColor: string;
  additionalText?: string;
}
