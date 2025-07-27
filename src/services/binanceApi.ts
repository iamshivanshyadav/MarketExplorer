import axios from 'axios';
import { KlineData, OrderBookData, MarketMetrics, ProcessedDayData, WebSocketMessage, HistoricalPattern, PatternDetection } from '@/types';

// Base URL for Binance REST API
const BINANCE_BASE_URL = 'https://api.binance.com/api/v3';

/**
 * Binance API Service
 * 
 * Provides comprehensive integration with Binance REST API and WebSocket streams.
 * Handles market data fetching, real-time updates, technical analysis, and pattern detection.
 * Implements singleton pattern for efficient resource management.
 */
export class BinanceApiService {
  private static instance: BinanceApiService;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  /**
   * Get singleton instance of BinanceApiService
   * Ensures only one instance exists for efficient resource management
   * @returns BinanceApiService instance
   */
  public static getInstance(): BinanceApiService {
    if (!BinanceApiService.instance) {
      BinanceApiService.instance = new BinanceApiService();
    }
    return BinanceApiService.instance;
  }

  /**
   * Fetch historical kline (candlestick) data from Binance API
   * @param symbol - Trading pair symbol (e.g., 'BTCUSDT')
   * @param interval - Time interval (e.g., '1d', '1h', '1m')
   * @param startTime - Start time in milliseconds (optional)
   * @param endTime - End time in milliseconds (optional)
   * @param limit - Maximum number of klines to return (default: 1000)
   * @returns Promise<KlineData[]> - Array of kline data
   */
  async getKlineData(
    symbol: string,
    interval: string,
    startTime?: number,
    endTime?: number,
    limit: number = 1000
  ): Promise<KlineData[]> {
    try {
      // Prepare query parameters
      const params: Record<string, string | number> = {
        symbol,
        interval,
        limit,
      };

      if (startTime) params.startTime = startTime;
      if (endTime) params.endTime = endTime;

      // Fetch data from Binance API
      const response = await axios.get(`${BINANCE_BASE_URL}/klines`, { params });
      
      // Transform raw array data into structured objects
      return response.data.map((kline: (string | number)[]) => ({
        openTime: kline[0],           // Open time in milliseconds
        open: kline[1],               // Open price
        high: kline[2],               // High price
        low: kline[3],                // Low price
        close: kline[4],              // Close price
        volume: kline[5],             // Volume
        closeTime: kline[6],          // Close time in milliseconds
        quoteAssetVolume: kline[7],   // Quote asset volume
        numberOfTrades: kline[8],     // Number of trades
        takerBuyBaseAssetVolume: kline[9],    // Taker buy base asset volume
        takerBuyQuoteAssetVolume: kline[10],  // Taker buy quote asset volume
      }));
    } catch (error) {
      console.error('Error fetching kline data:', error);
      return [];
    }
  }

  /**
   * Fetch order book data for a trading pair
   * @param symbol - Trading pair symbol
   * @param limit - Number of order book entries (default: 100)
   * @returns Promise<OrderBookData | null> - Order book data or null if error
   */
  async getOrderBook(symbol: string, limit: number = 100): Promise<OrderBookData | null> {
    try {
      const response = await axios.get(`${BINANCE_BASE_URL}/depth`, {
        params: { symbol, limit },
      });

      return {
        symbol,
        bids: response.data.bids,      // Buy orders
        asks: response.data.asks,      // Sell orders
        lastUpdateId: response.data.lastUpdateId,
      };
    } catch (error) {
      console.error('Error fetching order book:', error);
      return null;
    }
  }

  /**
   * Fetch 24-hour ticker statistics for a trading pair
   * @param symbol - Trading pair symbol
   * @returns Promise<MarketMetrics | null> - Market metrics or null if error
   */
  async get24hrTicker(symbol: string): Promise<MarketMetrics | null> {
    try {
      const response = await axios.get(`${BINANCE_BASE_URL}/ticker/24hr`, {
        params: { symbol },
      });

      const data = response.data;
      return {
        symbol: data.symbol,
        price: parseFloat(data.lastPrice),           // Current price
        priceChange: parseFloat(data.priceChange),   // Price change
        priceChangePercent: parseFloat(data.priceChangePercent), // Price change percentage
        volume: parseFloat(data.volume),             // 24h volume
        high: parseFloat(data.highPrice),            // 24h high
        low: parseFloat(data.lowPrice),              // 24h low
        open: parseFloat(data.openPrice),            // 24h open
        close: parseFloat(data.lastPrice),           // Current close
      };
    } catch (error) {
      console.error('Error fetching 24hr ticker:', error);
      return null;
    }
  }

  /**
   * Fetch available trading symbols from Binance
   * @returns Promise<string[]> - Array of trading symbols
   */
  async getSymbols(): Promise<string[]> {
    try {
      const response = await axios.get(`${BINANCE_BASE_URL}/exchangeInfo`);
      
      // Filter for USDT pairs and extract symbols
      return response.data.symbols
        .filter((symbol: any) => 
          symbol.status === 'TRADING' && 
          symbol.quoteAsset === 'USDT' &&
          symbol.isSpotTradingAllowed
        )
        .map((symbol: any) => symbol.symbol)
        .slice(0, 50); // Limit to top 50 for performance
    } catch (error) {
      console.error('Error fetching symbols:', error);
      return ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'DOTUSDT'];
    }
  }

  /**
   * Process raw kline data into structured market data with calculated metrics
   * @param klineData - Raw kline data from API
   * @returns ProcessedDayData[] - Processed market data with additional metrics
   */
  processKlineData(klineData: KlineData[]): ProcessedDayData[] {
    return klineData.map((kline, index) => {
      const open = parseFloat(kline.open);
      const high = parseFloat(kline.high);
      const low = parseFloat(kline.low);
      const close = parseFloat(kline.close);
      const volume = parseFloat(kline.volume);
      const date = new Date(kline.openTime);

      // Calculate volatility as percentage of price range
      const volatility = ((high - low) / open) * 100;
      
      // Calculate performance as percentage change
      const performance = ((close - open) / open) * 100;
      
      // Calculate liquidity score (0-1) based on volume
      const liquidity = Math.min(volume / 1000000, 1); // Normalize to 0-1 scale

      return {
        date,
        open,
        high,
        low,
        close,
        volume,
        volatility,
        performance,
        liquidity,
        dayOfWeek: date.getDay(),
        weekOfYear: this.getWeekOfYear(date),
        monthOfYear: date.getMonth() + 1
      };
    });
  }

  /**
   * Calculate week of year for a given date
   * @param date - Date to calculate week for
   * @returns number - Week of year (1-53)
   */
  private getWeekOfYear(date: Date): number {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
  }

  /**
   * Calculate technical indicators for market data
   * @param data - Processed market data
   * @returns ProcessedDayData[] - Data with technical indicators added
   */
  calculateTechnicalIndicators(data: ProcessedDayData[]) {
    if (data.length < 20) return data;

    return data.map((day, index) => {
      const indicators: any = {};

      // Calculate Simple Moving Averages (SMA)
      if (index >= 19) {
        // 20-day SMA
        const sma20Data = data.slice(index - 19, index + 1);
        indicators.sma20 = sma20Data.reduce((sum, d) => sum + d.close, 0) / 20;
      }

      if (index >= 49) {
        // 50-day SMA
        const sma50Data = data.slice(index - 49, index + 1);
        indicators.sma50 = sma50Data.reduce((sum, d) => sum + d.close, 0) / 50;
      }

      // Calculate RSI (Relative Strength Index)
      if (index >= 14) {
        const rsiData = data.slice(index - 14, index + 1);
        let gains = 0;
        let losses = 0;

        for (let i = 1; i < rsiData.length; i++) {
          const change = rsiData[i].close - rsiData[i - 1].close;
          if (change > 0) {
            gains += change;
          } else {
            losses += Math.abs(change);
          }
        }

        const avgGain = gains / 14;
        const avgLoss = losses / 14;
        const rs = avgGain / avgLoss;
        indicators.rsi = 100 - (100 / (1 + rs));
      }

      return {
        ...day,
        ...indicators
      };
    });
  }

  /**
   * Connect to Binance WebSocket for real-time data
   * @param symbols - Array of trading symbols to subscribe to
   * @param onMessage - Callback function for incoming messages
   */
  connectWebSocket(symbols: string[], onMessage: (message: WebSocketMessage) => void) {
    if (this.ws) {
      this.disconnectWebSocket();
    }

    // Create WebSocket connection to Binance stream
    const streams = symbols.map(symbol => `${symbol.toLowerCase()}@kline_1m`).join('/');
    const wsUrl = `wss://stream.binance.com:9443/ws/${streams}`;
    
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected to Binance');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle different message types
        if (data.e === 'kline') {
          const kline = data.k;
          const message: WebSocketMessage = {
            symbol: data.s,
            eventType: 'kline',
            data: {
              open: parseFloat(kline.o),
              high: parseFloat(kline.h),
              low: parseFloat(kline.l),
              close: parseFloat(kline.c),
              volume: parseFloat(kline.v),
              timestamp: kline.t
            }
          };
          onMessage(message);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      
      // Attempt to reconnect if not at max attempts
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => {
          this.connectWebSocket(symbols, onMessage);
        }, this.reconnectDelay * this.reconnectAttempts);
      }
    };
  }

  /**
   * Disconnect from WebSocket
   */
  disconnectWebSocket() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Detect seasonal patterns in market data
   * Identifies recurring patterns based on time periods (weekly, monthly)
   * @param data - Market data to analyze
   * @returns HistoricalPattern[] - Array of detected seasonal patterns
   */
  detectSeasonalPatterns(data: ProcessedDayData[]): HistoricalPattern[] {
    const patterns: HistoricalPattern[] = [];
    
    // Group data by day of week
    const weeklyPatterns = new Map<number, ProcessedDayData[]>();
    data.forEach(day => {
      if (!weeklyPatterns.has(day.dayOfWeek)) {
        weeklyPatterns.set(day.dayOfWeek, []);
      }
      weeklyPatterns.get(day.dayOfWeek)!.push(day);
    });

    // Analyze weekly patterns
    let idx = 0;
    weeklyPatterns.forEach((days, dayOfWeek) => {
      if (days.length < 5) return; // Need at least 5 data points

      const avgVolatility = days.reduce((sum, d) => sum + d.volatility, 0) / days.length;
      const avgPerformance = days.reduce((sum, d) => sum + d.performance, 0) / days.length;
      const avgVolume = days.reduce((sum, d) => sum + d.volume, 0) / days.length;

      // Check for significant patterns
      if (avgVolatility > 1.5 || avgVolatility < 0.3) {
        patterns.push({
          id: `seasonal-${dayOfWeek}-${days[0].date.getTime()}-${days[days.length-1].date.getTime()}-${idx++}`,
          type: 'seasonal',
          name: `High volatility on ${this.getDayName(dayOfWeek)}`,
          description: `Average volatility of ${avgVolatility.toFixed(2)}% on ${this.getDayName(dayOfWeek)}`,
          confidence: Math.min(avgVolatility / 2, 1),
          startDate: days[0].date,
          endDate: days[days.length - 1].date,
          metrics: { volatility: avgVolatility, performance: avgPerformance, volume: avgVolume }
        });
      }
    });

    return patterns;
  }

  /**
   * Detect cyclical patterns in market data
   * Identifies repeating cycles in price movements
   * @param data - Market data to analyze
   * @returns HistoricalPattern[] - Array of detected cyclical patterns
   */
  detectCyclicalPatterns(data: ProcessedDayData[]): HistoricalPattern[] {
    const patterns: HistoricalPattern[] = [];
    
    if (data.length < 30) return patterns; // Need sufficient data

    // Look for cycles in volatility
    const volatilityValues = data.map(d => d.volatility);
    const volatilityVariance = this.calculateVariance(volatilityValues);
    
    if (volatilityVariance > 0.5) {
      // High variance indicates cyclical patterns
      const avgVolatility = volatilityValues.reduce((sum, v) => sum + v, 0) / volatilityValues.length;
      
      patterns.push({
        id: `cyclical-${data[0].date.getTime()}-${data[data.length-1].date.getTime()}`,
        type: 'cyclical',
        name: 'Volatility Cycles Detected',
        description: `Cyclical volatility patterns with variance of ${volatilityVariance.toFixed(2)}`,
        confidence: Math.min(volatilityVariance, 1),
        startDate: data[0].date,
        endDate: data[data.length - 1].date,
        metrics: { volatility: avgVolatility, performance: 0, volume: 0 }
      });
    }

    return patterns;
  }

  /**
   * Detect anomalies in market data
   * Identifies unusual price movements or volume spikes
   * @param data - Market data to analyze
   * @returns HistoricalPattern[] - Array of detected anomalies
   */
  detectAnomalies(data: ProcessedDayData[]): HistoricalPattern[] {
    const patterns: HistoricalPattern[] = [];
    
    if (data.length < 10) return patterns;

    const volatilities = data.map(d => d.volatility);
    const performances = data.map(d => d.performance);
    const volumes = data.map(d => d.volume);

    // Calculate statistical thresholds
    const avgVolatility = volatilities.reduce((sum, v) => sum + v, 0) / volatilities.length;
    const volatilityStd = Math.sqrt(this.calculateVariance(volatilities));
    const volatilityThreshold = avgVolatility + (2 * volatilityStd);

    const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
    const volumeStd = Math.sqrt(this.calculateVariance(volumes));
    const volumeThreshold = avgVolume + (2 * volumeStd);

    // Detect anomalies
    let idx = 0;
    data.forEach(day => {
      if (day.volatility > volatilityThreshold) {
        patterns.push({
          id: `anomaly-volatility-${day.date.getTime()}-${idx++}`,
          type: 'anomaly',
          name: 'Volatility Spike',
          description: `Unusual volatility spike of ${day.volatility.toFixed(2)}%`,
          confidence: Math.min(day.volatility / volatilityThreshold, 1),
          startDate: day.date,
          endDate: day.date,
          metrics: { volatility: day.volatility, performance: day.performance ?? 0, volume: day.volume ?? 0 }
        });
      }

      if (day.volume > volumeThreshold) {
        patterns.push({
          id: `anomaly-volume-${day.date.getTime()}-${idx++}`,
          type: 'anomaly',
          name: 'Volume Spike',
          description: `Unusual volume spike of ${(day.volume / 1000000).toFixed(2)}M`,
          confidence: Math.min(day.volume / volumeThreshold, 1),
          startDate: day.date,
          endDate: day.date,
          metrics: { volatility: day.volatility ?? 0, performance: day.performance ?? 0, volume: day.volume ?? 0 }
        });
      }
    });

    return patterns;
  }

  /**
   * Detect trends in market data
   * Identifies directional price movements and trend strength
   * @param data - Market data to analyze
   * @returns HistoricalPattern[] - Array of detected trends
   */
  detectTrends(data: ProcessedDayData[]): HistoricalPattern[] {
    const patterns: HistoricalPattern[] = [];
    
    if (data.length < 20) return patterns;

    // Calculate trend metrics
    const prices = data.map(d => d.close);
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;

    // Determine trend direction and strength
    let trendType = 'neutral';
    let confidence = 0;

    if (priceChange > 5) {
      trendType = 'uptrend';
      confidence = Math.min(Math.abs(priceChange) / 20, 1);
    } else if (priceChange < -5) {
      trendType = 'downtrend';
      confidence = Math.min(Math.abs(priceChange) / 20, 1);
    }

    if (confidence > 0.3) {
      patterns.push({
        id: `trend-${trendType}-${data[0].date.getTime()}-${data[data.length-1].date.getTime()}`,
        type: 'trend',
        name: `${trendType.charAt(0).toUpperCase() + trendType.slice(1)} Detected`,
        description: `${trendType} with ${priceChange.toFixed(2)}% price change`,
        confidence,
        startDate: data[0].date,
        endDate: data[data.length - 1].date,
        metrics: { 
          volatility: data.reduce((sum, d) => sum + d.volatility, 0) / data.length,
          performance: priceChange,
          volume: data.reduce((sum, d) => sum + d.volume, 0) / data.length
        }
      });
    }

    return patterns;
  }

  /**
   * Calculate variance of a set of values
   * @param values - Array of numeric values
   * @returns number - Variance
   */
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  /**
   * Get month name from month number
   * @param month - Month number (1-12)
   * @returns string - Month name
   */
  private getMonthName(month: number): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1] || 'Unknown';
  }

  /**
   * Get day name from day number
   * @param day - Day number (0-6, where 0 is Sunday)
   * @returns string - Day name
   */
  private getDayName(day: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day] || 'Unknown';
  }

  /**
   * Detect all types of patterns in market data
   * Combines seasonal, cyclical, anomaly, and trend detection
   * @param data - Market data to analyze
   * @returns PatternDetection - Object containing all detected patterns
   */
  detectAllPatterns(data: ProcessedDayData[]): PatternDetection {
    return {
      seasonalPatterns: this.detectSeasonalPatterns(data),
      cyclicalPatterns: this.detectCyclicalPatterns(data),
      anomalies: this.detectAnomalies(data),
      trends: this.detectTrends(data)
    };
  }
}

// Export singleton instance
export default BinanceApiService.getInstance();
