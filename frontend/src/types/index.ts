import type React from "react"
// Cryptocurrency types
export interface Cryptocurrency {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  fully_diluted_valuation?: number
  total_volume: number
  high_24h: number
  low_24h: number
  price_change_24h: number
  price_change_percentage_24h: number
  market_cap_change_24h: number
  market_cap_change_percentage_24h: number
  circulating_supply: number
  total_supply?: number
  max_supply?: number
  ath: number
  ath_change_percentage: number
  ath_date: string
  atl: number
  atl_change_percentage: number
  atl_date: string
  roi?: {
    times: number
    currency: string
    percentage: number
  }
  last_updated: string
}

// News article type
export interface NewsArticle {
  source: {
    id: string | null
    name: string
  }
  author: string | null
  title: string
  description: string
  url: string
  urlToImage: string | null
  publishedAt: string
  content: string
}

// Trending coin type
export interface TrendingCoin {
  item: {
    id: string
    coin_id: number
    name: string
    symbol: string
    market_cap_rank: number
    thumb: string
    small: string
    large: string
    slug: string
    price_btc: number
    score: number
    data?: {
      price: number
      price_change_percentage_24h: {
        usd: number
      }
    }
  }
}

// Whale transaction type
export interface WhaleTransaction {
  hash: string
  from: string
  to: string
  value: number
  blockchain: string
  exchange: string
  date: string
  timeStamp: number
  block?: string
  fee?: string
  age?: string
  icon?: React.ReactNode
}

export interface WhaleTransactionsResponse {
  transactions: WhaleTransaction[]
  totalPages: number
}

// Fear and Greed Index type
export interface FearGreedIndexData {
  value: string
  value_classification: string
  timestamp: number
  time_until_update: string
}

// Coin detail type
export interface CoinDetail {
  id: string
  symbol: string
  name: string
  asset_platform_id: string | null
  platforms: Record<string, string>
  block_time_in_minutes: number
  hashing_algorithm: string
  categories: string[]
  public_notice: string | null
  additional_notices: string[]
  description: {
    en: string
  }
  links: {
    homepage: string[]
    blockchain_site: string[]
    official_forum_url: string[]
    chat_url: string[]
    announcement_url: string[]
    twitter_screen_name: string
    facebook_username: string
    bitcointalk_thread_identifier: number | null
    telegram_channel_identifier: string
    subreddit_url: string
    repos_url: {
      github: string[]
      bitbucket: string[]
    }
  }
  image: {
    thumb: string
    small: string
    large: string
  }
  country_origin: string
  genesis_date: string | null
  sentiment_votes_up_percentage: number
  sentiment_votes_down_percentage: number
  market_cap_rank: number
  coingecko_rank: number
  coingecko_score: number
  developer_score: number
  community_score: number
  liquidity_score: number
  public_interest_score: number
  market_data: {
    current_price: Record<string, number>
    total_value_locked: number | null
    mcap_to_tvl_ratio: number | null
    fdv_to_tvl_ratio: number | null
    roi: {
      times: number
      currency: string
      percentage: number
    } | null
    ath: Record<string, number>
    ath_change_percentage: Record<string, number>
    ath_date: Record<string, string>
    atl: Record<string, number>
    atl_change_percentage: Record<string, number>
    atl_date: Record<string, string>
    market_cap: Record<string, number>
    market_cap_rank: number
    fully_diluted_valuation: Record<string, number>
    total_volume: Record<string, number>
    high_24h: Record<string, number>
    low_24h: Record<string, number>
    price_change_24h: number
    price_change_percentage_24h: number
    price_change_percentage_7d: number
    price_change_percentage_14d: number
    price_change_percentage_30d: number
    price_change_percentage_60d: number
    price_change_percentage_200d: number
    price_change_percentage_1y: number
    market_cap_change_24h: number
    market_cap_change_percentage_24h: number
    price_change_24h_in_currency: Record<string, number>
    price_change_percentage_1h_in_currency: Record<string, number>
    price_change_percentage_24h_in_currency: Record<string, number>
    price_change_percentage_7d_in_currency: Record<string, number>
    price_change_percentage_14d_in_currency: Record<string, number>
    price_change_percentage_30d_in_currency: Record<string, number>
    price_change_percentage_60d_in_currency: Record<string, number>
    price_change_percentage_200d_in_currency: Record<string, number>
    price_change_percentage_1y_in_currency: Record<string, number>
    market_cap_change_24h_in_currency: Record<string, number>
    market_cap_change_percentage_24h_in_currency: Record<string, number>
    total_supply: number
    max_supply: number | null
    circulating_supply: number
    sparkline_7d: {
      price: number[]
    }
    last_updated: string
  }
  community_data: {
    facebook_likes: number | null
    twitter_followers: number
    reddit_average_posts_48h: number
    reddit_average_comments_48h: number
    reddit_subscribers: number
    reddit_accounts_active_48h: number
    telegram_channel_user_count: number | null
  }
  developer_data: {
    forks: number
    stars: number
    subscribers: number
    total_issues: number
    closed_issues: number
    pull_requests_merged: number
    pull_request_contributors: number
    code_additions_deletions_4_weeks: {
      additions: number
      deletions: number
    }
    commit_count_4_weeks: number
    last_4_weeks_commit_activity_series: number[]
  }
  public_interest_stats: {
    alexa_rank: number
    bing_matches: number | null
  }
  status_updates: any[]
  last_updated: string
  tickers: any[]
}

// Chart data types
export interface ChartDataPoint {
  time: string
  price: number
  timestamp?: number
  fullDate?: Date
  ma5?: number | null
  ma8?: number | null
  ma13?: number | null
  ma50?: number | null
  ma100?: number | null
  ma200?: number | null
  rsi?: number
}

export interface MarketDominanceItem {
  name: string
  value: number
}

export interface SentimentChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    fill: boolean
    borderColor: string
    backgroundColor: string
    tension: number
    pointBackgroundColor: string | ((context: any) => string)
    pointBorderColor: string
    pointRadius: number
    pointHoverRadius: number
    borderWidth: number
  }[]
}
