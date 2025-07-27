export interface KlineData {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteAssetVolume: string;
  numberOfTrades: number;
  takerBuyBaseAssetVolume: string;
  takerBuyQuoteAssetVolume: string;
}

export interface ProcessedDayData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  volatility: number;
  liquidity: number;
  performance: number;
  dayOfWeek: number;
  weekOfYear: number;
  monthOfYear: number;
}

export interface CalendarCellData extends ProcessedDayData {
  isToday: boolean;
  isSelected: boolean;
  isInRange: boolean;
}

export interface Timeframe {
  label: string;
  value: 'daily' | 'weekly' | 'monthly';
  interval: string;
}

export interface TechnicalIndicators {
  sma20: number;
  sma50: number;
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
}

export interface Alert {
  id: string;
  type: 'volatility' | 'performance' | 'volume' | 'price';
  condition: 'above' | 'below' | 'equals';
  threshold: number;
  symbol: string;
  timeframe: string;
  isActive: boolean;
  createdAt: Date;
  triggeredAt?: Date;
  message: string;
}

export interface AlertSettings {
  emailNotifications: boolean;
  browserNotifications: boolean;
  soundAlerts: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

export interface DataComparison {
  id: string;
  name: string;
  datasets: {
    symbol: string;
    timeframe: string;
    dateRange: DateRange;
    color: string;
  }[];
  createdAt: Date;
}

export interface HistoricalPattern {
  id: string;
  type: 'seasonal' | 'cyclical' | 'anomaly' | 'trend';
  description: string;
  confidence: number; 
  startDate: Date;
  endDate: Date;
  frequency: number; 
  strength: number;
  metrics: {
    volatility: number;
    performance: number;
    volume: number;
  };
}

export interface PatternDetection {
  seasonalPatterns: HistoricalPattern[];
  cyclicalPatterns: HistoricalPattern[];
  anomalies: HistoricalPattern[];
  trends: HistoricalPattern[];
}

export interface RealTimeConfig {
  enabled: boolean;
  updateInterval: number; 
  symbols: string[];
  autoReconnect: boolean;
  maxRetries: number;
}

export interface WebSocketMessage {
  type: 'price' | 'volume' | 'trade' | 'kline';
  symbol: string;
  data: Record<string, number>;
  timestamp: number;
}

export interface OrderBookData {
  symbol: string;
  bids: [string, string][];
  asks: [string, string][];
  lastUpdateId: number;
}

export interface MarketMetrics {
  symbol: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
}

export interface ColorScheme {
  name: string;
  volatility: {
    low: string;
    medium: string;
    high: string;
  };
  performance: {
    positive: string;
    negative: string;
    neutral: string;
  };
  liquidity: {
    high: string;
    medium: string;
    low: string;
  };
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface FilterOptions {
  symbol: string;
  timeframe: Timeframe;
  metrics: string[];
  dateRange: DateRange;
}
