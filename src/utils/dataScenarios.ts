import { ProcessedDayData } from '@/types';

/**
 * Generate realistic mock market data for testing and development
 * Creates data with random price movements, volatility, and volume patterns
 * 
 * @param days - Number of days of data to generate
 * @param startDate - Starting date for the data (defaults to Jan 1, 2024)
 * @returns ProcessedDayData[] - Array of mock market data
 */
export const generateMockData = (days: number, startDate?: Date): ProcessedDayData[] => {
  const data: ProcessedDayData[] = [];
  const baseDate = startDate || new Date(2024, 0, 1);
  const basePrice = 50000; // Base price in USD
  
  for (let i = 0; i < days; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    
    // Generate random price movements
    const priceChange = (Math.random() - 0.5) * 0.1; // ±5% daily change
    let open = basePrice * (1 + priceChange);
    let high = open * (1 + Math.random() * 0.05);    // High up to 5% above open
    let low = open * (1 - Math.random() * 0.05);     // Low up to 5% below open
    let close = open * (1 + (Math.random() - 0.5) * 0.02); // Close ±1% from open
    const volume = 1000000 + Math.random() * 500000; // Volume between 1M-1.5M

    // Ensure data consistency: high >= open,close and low <= open,close
    const prices = [open, high, low, close];
    high = Math.max(...prices);
    low = Math.min(...prices);

    // Calculate derived metrics
    const volatility = ((high - low) / open) * 100;  // Volatility as percentage
    const performance = ((close - open) / open) * 100; // Performance as percentage
    const liquidity = Math.random() * 0.5 + 0.5;      // Liquidity score 0.5-1.0
    
    data.push({
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
      weekOfYear: Math.ceil((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)),
      monthOfYear: date.getMonth() + 1
    });
  }
  
  return data;
};

/**
 * Generate seasonal market data with recurring patterns
 * Creates data that shows seasonal variations in price and volatility
 * 
 * @param days - Number of days of data to generate
 * @returns ProcessedDayData[] - Array of seasonal market data
 */
export const generateSeasonalData = (days: number): ProcessedDayData[] => {
  const data: ProcessedDayData[] = [];
  const baseDate = new Date(2024, 0, 1);
  const basePrice = 50000;
  
  for (let i = 0; i < days; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    
    // Create seasonal pattern using sine wave
    const month = date.getMonth();
    const seasonalFactor = 1 + Math.sin((month / 11) * Math.PI * 2) * 0.1; // ±10% seasonal variation
    
    // Apply seasonal factor to price movements
    const priceChange = (Math.random() - 0.5) * 0.05 * seasonalFactor;
    const open = basePrice * seasonalFactor * (1 + priceChange);
    const high = open * (1 + Math.random() * 0.03);  // Smaller daily range
    const low = open * (1 - Math.random() * 0.03);
    const close = open * (1 + (Math.random() - 0.5) * 0.01);
    const volume = 1000000 + Math.random() * 300000; // Lower volume variation
    
    // Calculate metrics
    const volatility = ((high - low) / open) * 100;
    const performance = ((close - open) / open) * 100;
    const liquidity = Math.random() * 0.4 + 0.6; // Higher liquidity (0.6-1.0)
    
    data.push({
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
      weekOfYear: Math.ceil((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)),
      monthOfYear: date.getMonth() + 1
    });
  }
  
  return data;
};

/**
 * Generate trending market data with directional price movements
 * Creates data that shows clear upward, downward, or sideways trends
 * 
 * @param days - Number of days of data to generate
 * @param trend - Direction of the trend ('up', 'down', or 'sideways')
 * @returns ProcessedDayData[] - Array of trending market data
 */
export const generateTrendData = (days: number, trend: 'up' | 'down' | 'sideways'): ProcessedDayData[] => {
  const data: ProcessedDayData[] = [];
  const baseDate = new Date(2024, 0, 1);
  const basePrice = 50000;
  
  for (let i = 0; i < days; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    
    // Apply trend factor based on direction
    let trendFactor = 1;
    if (trend === 'up') {
      trendFactor = 1 + (i / days) * 0.2; // 20% total increase over period
    } else if (trend === 'down') {
      trendFactor = 1 - (i / days) * 0.2; // 20% total decrease over period
    }
    // For sideways trend, trendFactor remains 1
    
    // Generate price data with trend applied
    const priceChange = (Math.random() - 0.5) * 0.02; // Small daily variations
    const open = basePrice * trendFactor * (1 + priceChange);
    const high = open * (1 + Math.random() * 0.02);   // Small daily range
    const low = open * (1 - Math.random() * 0.02);
    const close = open * (1 + (Math.random() - 0.5) * 0.01);
    const volume = 1000000 + Math.random() * 200000;  // Consistent volume
    
    // Calculate metrics
    const volatility = ((high - low) / open) * 100;
    const performance = ((close - open) / open) * 100;
    const liquidity = Math.random() * 0.3 + 0.7; // High liquidity (0.7-1.0)
    
    data.push({
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
      weekOfYear: Math.ceil((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)),
      monthOfYear: date.getMonth() + 1
    });
  }
  
  return data;
};

/**
 * Generate highly volatile market data for stress testing
 * Creates data with large price swings and high volatility for testing edge cases
 * 
 * @param days - Number of days of data to generate
 * @returns ProcessedDayData[] - Array of volatile market data
 */
export const generateVolatileData = (days: number): ProcessedDayData[] => {
  const data: ProcessedDayData[] = [];
  const baseDate = new Date(2024, 0, 1);
  const basePrice = 50000;
  
  for (let i = 0; i < days; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    
    // Generate large price movements
    const priceChange = (Math.random() - 0.5) * 0.15; // ±7.5% daily change
    const open = basePrice * (1 + priceChange);
    const high = open * (1 + Math.random() * 0.08);   // High up to 8% above open
    const low = open * (1 - Math.random() * 0.08);    // Low up to 8% below open
    const close = open * (1 + (Math.random() - 0.5) * 0.06); // Close ±3% from open
    const volume = 1000000 + Math.random() * 800000;  // High volume variation
    
    // Calculate metrics (will show high volatility)
    const volatility = ((high - low) / open) * 100;
    const performance = ((close - open) / open) * 100;
    const liquidity = Math.random() * 0.6 + 0.4; // Lower liquidity (0.4-1.0)
    
    data.push({
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
      weekOfYear: Math.ceil((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)),
      monthOfYear: date.getMonth() + 1
    });
  }
  
  return data;
}; 