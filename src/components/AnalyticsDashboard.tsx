'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ProcessedDayData, Timeframe, ColorScheme, DateRange } from '@/types';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Calendar, BarChart3, PieChart as PieIcon,
  Activity, Target, Zap, AlertTriangle, Info, Award
} from 'lucide-react';
import { format, startOfWeek, startOfMonth, addWeeks, addMonths } from 'date-fns';

/**
 * Props interface for the AnalyticsDashboard component
 * Defines all the data and configuration needed for analytics visualization
 */
interface AnalyticsDashboardProps {
  data: ProcessedDayData[];                    // Raw market data to analyze
  timeframe: Timeframe;                        // Current timeframe (daily, weekly, monthly)
  colorScheme: ColorScheme;                    // Color scheme for charts and indicators
  symbol: string;                              // Trading symbol being analyzed
  selectedMetrics: string[];                   // Metrics to display in charts
  selectedRange?: DateRange | null;            // Optional date range filter
  onDateRangeSelect?: (range: DateRange) => void; // Callback for date range changes
}

/**
 * Interface for statistics cards displayed at the top of the dashboard
 */
interface StatCard {
  title: string;                               // Card title
  value: string;                               // Current value
  change: string;                              // Change from previous period
  trend: 'up' | 'down' | 'neutral';           // Trend direction
  icon: React.ReactNode;                       // Icon component
  metric: string;                              // Metric name for calculations
}

/**
 * Custom hook for responsive chart margins
 * Adjusts margins based on screen size for better mobile experience
 */
const useResponsiveMargin = () => {
  const [margin, setMargin] = useState({ top: 20, right: 10, left: 20, bottom: 5 });
  
  useEffect(() => {
    const updateMargin = () => {
      if (window.innerWidth < 640) {
        setMargin({ top: 10, right: 3, left: 10, bottom: 5 });
      } else if (window.innerWidth < 1024) {
        setMargin({ top: 15, right: 5, left: 15, bottom: 5 });
      } else {
        setMargin({ top: 20, right: 8, left: 20, bottom: 5 });
      }
    };
    
    updateMargin();
    window.addEventListener('resize', updateMargin);
    return () => window.removeEventListener('resize', updateMargin);
  }, []);
  
  return margin;
};

/**
 * Aggregate daily data into weekly data for analysis
 * Groups data by weeks and calculates averages and totals
 * @param data - Array of daily market data
 * @returns Array of weekly aggregated data
 */
const aggregateByWeek = (data: ProcessedDayData[]) => {
  if (data.length === 0) return [];
  
  const weeks: ProcessedDayData[][] = [];
  let currentWeek: ProcessedDayData[] = [];
  
  // Group data into weeks
  data.forEach((d, index) => {
    currentWeek.push(d);
    if (currentWeek.length === 7 || index === data.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  // Calculate weekly aggregates
  return weeks.map(weekData => {
    if (weekData.length === 0) return null;

    return {
      date: weekData[0].date,
      volatility: weekData.reduce((sum, d) => sum + d.volatility, 0) / weekData.length, // Average volatility
      performance: weekData.reduce((sum, d) => sum + d.performance, 0),                  // Cumulative performance
      volume: weekData.reduce((sum, d) => sum + d.volume, 0),                            // Total volume
      high: Math.max(...weekData.map(d => d.high)),                                       // Weekly high
      low: Math.min(...weekData.map(d => d.low)),                                         // Weekly low
      open: weekData[0].open,                                                             // Week opening price
      close: weekData[weekData.length - 1].close,                                         // Week closing price
      liquidity: weekData.reduce((sum, d) => sum + d.liquidity, 0) / weekData.length,    // Average liquidity
      dayCount: weekData.length
    };
  }).filter(Boolean);
};

/**
 * Aggregate daily data into monthly data for analysis
 * Groups data by months and calculates averages and totals
 * @param data - Array of daily market data
 * @returns Array of monthly aggregated data
 */
const aggregateByMonth = (data: ProcessedDayData[]) => {
  if (data.length === 0) return [];
  
  const monthGroups = new Map<string, ProcessedDayData[]>();
  
  // Group data by month
  data.forEach(d => {
    const monthKey = format(d.date, 'yyyy-MM');
    if (!monthGroups.has(monthKey)) {
      monthGroups.set(monthKey, []);
    }
    monthGroups.get(monthKey)!.push(d);
  });

  // Calculate monthly aggregates
  return Array.from(monthGroups.values()).map(monthData => {
    if (monthData.length === 0) return null;

    return {
      date: monthData[0].date,
      volatility: monthData.reduce((sum, d) => sum + d.volatility, 0) / monthData.length, // Average volatility
      performance: monthData.reduce((sum, d) => sum + d.performance, 0),                   // Cumulative performance
      volume: monthData.reduce((sum, d) => sum + d.volume, 0),                             // Total volume
      high: Math.max(...monthData.map(d => d.high)),                                        // Monthly high
      low: Math.min(...monthData.map(d => d.low)),                                          // Monthly low
      open: monthData[0].open,                                                              // Month opening price
      close: monthData[monthData.length - 1].close,                                         // Month closing price
      liquidity: monthData.reduce((sum, d) => sum + d.liquidity, 0) / monthData.length,    // Average liquidity
      dayCount: monthData.length
    };
  }).filter(Boolean);
};

/**
 * Analytics Dashboard Component
 * 
 * Provides comprehensive market analysis with multiple chart types and statistics.
 * Supports different timeframes, metrics, and interactive features for data exploration.
 */
const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  data,
  timeframe,
  colorScheme,
  symbol,
  selectedMetrics,
  selectedRange,
  onDateRangeSelect
}) => {
  // State for date range selection
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  
  // State for chart type selection
  const [activeChart, setActiveChart] = useState<'volatility' | 'performance' | 'volume' | 'patterns'>('volatility');
  
  // Responsive margin hook for charts
  const chartMargin = useResponsiveMargin();

  // Filter data based on selected date range
  const filteredData = useMemo(() => {
    if (!selectedRange) return data;
    
    return data.filter(d => 
      d.date >= selectedRange.start && d.date <= selectedRange.end
    );
  }, [data, selectedRange]);

  // Aggregate data based on timeframe
  const aggregatedData = useMemo(() => {
    switch (timeframe.value) {
      case 'weekly':
        return aggregateByWeek(filteredData);
      case 'monthly':
        return aggregateByMonth(filteredData);
      default:
        return filteredData; // Daily data
    }
  }, [filteredData, timeframe.value]);

  // Calculate statistics for the top cards
  const stats = useMemo(() => {
    if (aggregatedData.length === 0) return [];

    const latest = aggregatedData[aggregatedData.length - 1];
    const previous = aggregatedData[aggregatedData.length - 2];
    
    const calculateChange = (current: number, previous: number) => {
      if (!previous) return '0%';
      const change = ((current - previous) / previous) * 100;
      return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
    };

    const getTrend = (current: number, previous: number) => {
      if (!previous) return 'neutral';
      return current > previous ? 'up' : current < previous ? 'down' : 'neutral';
    };

    const statCards: StatCard[] = [];

    // Volatility statistics
    if (selectedMetrics.includes('volatility')) {
      statCards.push({
        title: 'Average Volatility',
        value: `${latest.volatility.toFixed(2)}%`,
        change: previous ? calculateChange(latest.volatility, previous.volatility) : '0%',
        trend: getTrend(latest.volatility, previous?.volatility || 0),
        icon: <Activity className="h-5 w-5" />,
        metric: 'volatility'
      });
    }

    // Performance statistics
    if (selectedMetrics.includes('performance')) {
      statCards.push({
        title: 'Total Performance',
        value: `${latest.performance.toFixed(2)}%`,
        change: previous ? calculateChange(latest.performance, previous.performance) : '0%',
        trend: getTrend(latest.performance, previous?.performance || 0),
        icon: <TrendingUp className="h-5 w-5" />,
        metric: 'performance'
      });
    }

    // Volume statistics
    if (selectedMetrics.includes('liquidity')) {
      const volumeInMillions = latest.volume / 1000000;
      statCards.push({
        title: 'Total Volume',
        value: `${volumeInMillions.toFixed(2)}M`,
        change: previous ? calculateChange(latest.volume, previous.volume) : '0%',
        trend: getTrend(latest.volume, previous?.volume || 0),
        icon: <BarChart3 className="h-5 w-5" />,
        metric: 'volume'
      });
    }

    // Price statistics
    statCards.push({
      title: 'Current Price',
      value: `$${latest.close.toFixed(2)}`,
      change: previous ? calculateChange(latest.close, previous.close) : '0%',
      trend: getTrend(latest.close, previous?.close || 0),
      icon: <Target className="h-5 w-5" />,
      metric: 'price'
    });

    return statCards;
  }, [aggregatedData, selectedMetrics]);

  /**
   * Render different chart types based on selected chart and metrics
   * @returns JSX element with appropriate chart
   */
  const renderChart = () => {
    if (aggregatedData.length === 0) {
      return (
        <div className="flex items-center justify-center h-96 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No data available for the selected time range</p>
          </div>
        </div>
      );
    }

    // Prepare chart data with proper formatting
    const chartData = aggregatedData.map(d => ({
      ...d,
      date: format(d.date, 'MMM dd'),
      formattedVolatility: `${d.volatility.toFixed(2)}%`,
      formattedPerformance: `${d.performance.toFixed(2)}%`,
      formattedVolume: d.volume > 1000000 
        ? `${(d.volume / 1000000).toFixed(2)}M` 
        : `${(d.volume / 1000).toFixed(0)}K`
    }));

    // Distribution data for pie charts
    const volatilityDistribution = [
      { name: 'Low (<0.5%)', value: aggregatedData.filter(d => d.volatility < 0.5).length, color: colorScheme.volatility.low },
      { name: 'Medium (0.5-1.5%)', value: aggregatedData.filter(d => d.volatility >= 0.5 && d.volatility < 1.5).length, color: colorScheme.volatility.medium },
      { name: 'High (>1.5%)', value: aggregatedData.filter(d => d.volatility >= 1.5).length, color: colorScheme.volatility.high }
    ];

    const performanceDistribution = [
      { name: 'Positive', value: aggregatedData.filter(d => d.performance > 0).length, color: colorScheme.performance.positive },
      { name: 'Negative', value: aggregatedData.filter(d => d.performance < 0).length, color: colorScheme.performance.negative },
      { name: 'Neutral', value: aggregatedData.filter(d => d.performance === 0).length, color: colorScheme.performance.neutral }
    ];

    switch (activeChart) {
      case 'volatility':
        return (
          <div className="w-full h-96">
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12}
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#f9fafb'
                  }}
                  formatter={(value: any) => [`${value}%`, 'Volatility']}
                />
                <Area 
                  type="monotone" 
                  dataKey="volatility" 
                  stroke={colorScheme.volatility.high}
                  fill={colorScheme.volatility.high}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );

      case 'performance':
        return (
          <div className="w-full h-96">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#f9fafb'
                  }}
                  formatter={(value: any) => [`${value}%`, 'Performance']}
                />
                <Line 
                  type="monotone" 
                  dataKey="performance" 
                  stroke={colorScheme.performance.positive} 
                  strokeWidth={2}
                  dot={{ fill: colorScheme.performance.positive, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: colorScheme.performance.positive, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case 'volume':
        return (
          <div className="w-full h-96">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#f9fafb'
                  }}
                  formatter={(value: any) => [`${(value / 1000000).toFixed(2)}M`, 'Volume']}
                />
                <Bar 
                  dataKey="volume" 
                  fill={colorScheme.liquidity.high}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'patterns':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h4 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-gray-900 dark:text-white">
                  Volatility Distribution
                </h4>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={volatilityDistribution.filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        dataKey="value"
                        label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {volatilityDistribution.filter(d => d.value > 0).map((entry, index) => (
                          <Cell key={`vol-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number, name: string) => [`${value} days`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-gray-900 dark:text-white">
                  Performance Distribution
                </h4>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={performanceDistribution.filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        dataKey="value"
                        label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {performanceDistribution.filter(d => d.value > 0).map((entry, index) => (
                          <Cell key={`perf-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number, name: string) => [`${value} days`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{volatilityDistribution[0].value}</div>
                <div className="text-sm text-green-600">Low Vol Days</div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{volatilityDistribution[1].value}</div>
                <div className="text-sm text-orange-600">Medium Vol Days</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{volatilityDistribution[2].value}</div>
                <div className="text-sm text-red-600">High Vol Days</div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{performanceDistribution[0].value}</div>
                <div className="text-sm text-blue-600">Positive Days</div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-96 text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a chart type to view data</p>
            </div>
          </div>
        );
    }
  };

  /**
   * Handle date range application
   */
  const handleApplyRange = () => {
    if (!fromDate || !toDate || !onDateRangeSelect) return;
    
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    
    if (startDate <= endDate) {
      onDateRangeSelect({ start: startDate, end: endDate });
    }
  };

  /**
   * Clear selected date range
   */
  const handleClearRange = () => {
    setFromDate('');
    setToDate('');
    if (onDateRangeSelect) {
      onDateRangeSelect({ 
        start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), 
        end: new Date() 
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600 dark:text-green-400' :
                  stat.trend === 'down' ? 'text-red-600 dark:text-red-400' :
                  'text-gray-600 dark:text-gray-400'
                }`}>
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                stat.trend === 'up' ? 'bg-green-100 dark:bg-green-900' :
                stat.trend === 'down' ? 'bg-red-100 dark:bg-red-900' :
                'bg-gray-100 dark:bg-gray-700'
              }`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Date Range Filter */}
      {onDateRangeSelect && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Date Range Filter
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex items-end space-x-2">
              <button
                onClick={handleApplyRange}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
              <button
                onClick={handleClearRange}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chart Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {symbol} Analytics - {timeframe.label} View
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>
              {aggregatedData.length} data points
            </span>
          </div>
        </div>

        {/* Chart Type Selection */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
          {[
            { key: 'volatility', label: 'Volatility Trend', icon: Activity, metric: 'volatility' },
            { key: 'performance', label: 'Performance', icon: TrendingUp, metric: 'performance' },
            { key: 'volume', label: 'Volume Analysis', icon: BarChart3, metric: 'liquidity' },
            { key: 'patterns', label: 'Distribution', icon: PieIcon, metric: 'all' }
          ]
          .filter(({ metric }) => metric === 'all' || selectedMetrics?.includes(metric))
          .map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveChart(key as 'volatility' | 'performance' | 'volume' | 'patterns')}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors ${
                activeChart === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
        
        {renderChart()}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
