'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CalendarComponent from './CalendarComponent';
import DataDashboard from './DataDashboard';
import FilterControls from './FilterControls';
import ExportPanel from './ExportPanel';
import ColorSchemeSelector from './ColorSchemeSelector';
import AnalyticsDashboard from './AnalyticsDashboard';
import AlertSystem from './AlertSystem';
import DataComparison from './DataComparison';
import HistoricalPatterns from './HistoricalPatterns';
import binanceApi from '@/services/binanceApi';
import { ProcessedDayData, Timeframe, ColorScheme, DateRange, FilterOptions, Alert, AlertSettings, DataComparison as DataComparisonType, HistoricalPattern, PatternDetection, RealTimeConfig, WebSocketMessage } from '@/types';
import { Calendar, TrendingUp, BarChart3, Settings, Download, Bell, Target } from 'lucide-react';

// Available timeframes for data analysis
const timeframes: Timeframe[] = [
  { label: 'Daily', value: 'daily', interval: '1d' },
  { label: 'Weekly', value: 'weekly', interval: '1w' },
  { label: 'Monthly', value: 'monthly', interval: '1M' },
];

// Predefined color schemes for different accessibility needs and visual preferences
const colorSchemes: ColorScheme[] = [
  {
    name: 'Default',
    volatility: { 
      low: '#10b981',   // Green for low volatility
      medium: '#f59e0b', // Orange for medium volatility
      high: '#ef4444'     // Red for high volatility
    },
    performance: { positive: '#10b981', negative: '#ef4444', neutral: '#6b7280' },
    liquidity: { high: '#3b82f6', medium: '#6366f1', low: '#8b5cf6' },
  },
  {
    name: 'High Contrast',
    volatility: { 
      low: '#16a34a',    // Darker green
      medium: '#ea580c',  // Darker orange
      high: '#dc2626'     // Darker red
    },
    performance: { positive: '#16a34a', negative: '#dc2626', neutral: '#4b5563' },
    liquidity: { high: '#1d4ed8', medium: '#4338ca', low: '#7c3aed' },
  },
  {
    name: 'Colorblind Friendly',
    volatility: { 
      low: '#059669',    // Blue-green for colorblind users
      medium: '#d97706', // Orange-brown
      high: '#b91c1c'     // Red-brown
    },
    performance: { positive: '#059669', negative: '#b91c1c', neutral: '#64748b' },
    liquidity: { high: '#0369a1', medium: '#4338ca', low: '#7c2d12' },
  },
  {
    name: 'Pastel Theme',
    volatility: { 
      low: '#6ee7b7',   // Light green
      medium: '#fcd34d',  // Light yellow
      high: '#fca5a5'     // Light red
    },
    performance: { positive: '#34d399', negative: '#f87171', neutral: '#9ca3af' },
    liquidity: { high: '#60a5fa', medium: '#a78bfa', low: '#c084fc' },
  },
];

/**
 * Main Market Seasonality Explorer Component
 * 
 * This component serves as the central hub for the market analysis application.
 * It manages all state, handles data fetching, and coordinates between different
 * views and components.
 */
const MarketSeasonalityExplorer: React.FC = () => {
  // Core data state
  const [marketData, setMarketData] = useState<ProcessedDayData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  
  // UI configuration state
  const [currentTimeframe, setCurrentTimeframe] = useState<Timeframe>(timeframes[0]);
  const [currentColorScheme, setCurrentColorScheme] = useState<ColorScheme>(colorSchemes[0]);
  const [currentView, setCurrentView] = useState<'calendar' | 'analytics' | 'alerts' | 'comparison' | 'patterns'>('calendar');
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data source configuration
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [symbols, setSymbols] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['volatility', 'liquidity', 'performance']);
  
  // UI modal states
  const [showDashboard, setShowDashboard] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [showColorSchemes, setShowColorSchemes] = useState(false);
  
  // Alert system state
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    emailNotifications: false,
    browserNotifications: true,
    soundAlerts: true,
    autoRefresh: true,
    refreshInterval: 30
  });
  
  // Data comparison state
  const [comparisons, setComparisons] = useState<DataComparisonType[]>([]);
  const [comparisonData, setComparisonData] = useState<Map<string, ProcessedDayData[]>>(new Map());
  
  // Pattern detection state
  const [patterns, setPatterns] = useState<PatternDetection>({
    seasonalPatterns: [],
    cyclicalPatterns: [],
    anomalies: [],
    trends: []
  });
  
  // Real-time data configuration
  const [realTimeConfig, setRealTimeConfig] = useState<RealTimeConfig>({
    enabled: false,
    updateInterval: 5000,
    symbols: ['BTCUSDT'],
    autoReconnect: true,
    maxRetries: 5
  });
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);

  // Initialize default date range (last 365 days)
  useEffect(() => {
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const today = new Date();
    setDateRange({
      start: oneYearAgo,
      end: today
    });
  }, []);

  // Load available trading symbols from Binance API
  useEffect(() => {
    const loadSymbols = async () => {
      try {
        const symbolList = await binanceApi.getSymbols();
        setSymbols(symbolList);
      } catch (err) {
        console.error('Failed to load symbols:', err);
        // Fallback to default symbols if API fails
        setSymbols(['BTCUSDT', 'ETHUSDT', 'BNBUSDT']);
      }
    };
    loadSymbols();
  }, []);

  /**
   * Load market data from Binance API
   * Fetches historical kline data and processes it with technical indicators
   */
  const loadMarketData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const endTime = Date.now();
      const startTime = endTime - (365 * 24 * 60 * 60 * 1000); // Last 365 days
      
      // Fetch raw kline data from Binance API
      const klineData = await binanceApi.getKlineData(
        selectedSymbol,
        currentTimeframe.interval,
        startTime,
        endTime
      );
      
      if (klineData.length === 0) {
        throw new Error('No data received from API');
      }
      
      // Process raw data and calculate technical indicators
      const processedData = binanceApi.processKlineData(klineData);
      const dataWithIndicators = binanceApi.calculateTechnicalIndicators(processedData);
      
      setMarketData(dataWithIndicators);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load market data';
      setError(errorMessage);
      console.error('Error loading market data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedSymbol, currentTimeframe]);

  // Reload data when symbol or timeframe changes
  useEffect(() => {
    loadMarketData();
  }, [loadMarketData]);

  /**
   * Trigger alert notifications with browser notifications and sound
   * @param alert - The alert to trigger
   */
  const triggerAlert = useCallback((alert: Alert) => {
    // Update alert state to mark as triggered
    setAlerts(prev => prev.map(a => 
      a.id === alert.id ? { ...a, triggeredAt: new Date() } : a
    ));

    // Show browser notification if enabled
    if (alertSettings.browserNotifications && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Market Alert', {
          body: alert.message,
          icon: '/favicon.ico'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Market Alert', {
              body: alert.message,
              icon: '/favicon.ico'
            });
          }
        });
      }
    }

    // Play sound alert if enabled
    if (alertSettings.soundAlerts) {
      // Create audio context for sound generation
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set frequency and volume for alert sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    }
  }, [alertSettings.browserNotifications, alertSettings.soundAlerts]);

  /**
   * Handle incoming WebSocket messages for real-time data
   * @param message - WebSocket message containing market data
   */
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    console.log('WebSocket message received:', message);
    
    // Check if any alerts should be triggered based on real-time data
    if (alerts.length > 0) {
      alerts.forEach(alert => {
        if (!alert.isActive) return;
        
        let currentValue = 0;
        switch (alert.type) {
          case 'volatility':
            // Calculate volatility from OHLC data
            const { open, high, low, close } = message.data as { open: number; high: number; low: number; close: number };
            currentValue = ((high - low) / open) * 100;
            break;
          case 'performance':
            // Calculate performance as percentage change
            const { open: perfOpen, close: perfClose } = message.data as { open: number; close: number };
            currentValue = ((perfClose - perfOpen) / perfOpen) * 100;
            break;
          case 'volume':
            currentValue = (message.data as { volume: number }).volume;
            break;
          case 'price':
            currentValue = (message.data as { close: number }).close;
            break;
        }

        // Check if alert conditions are met
        let shouldTrigger = false;
        switch (alert.condition) {
          case 'above':
            shouldTrigger = currentValue > alert.threshold;
            break;
          case 'below':
            shouldTrigger = currentValue < alert.threshold;
            break;
          case 'equals':
            shouldTrigger = Math.abs(currentValue - alert.threshold) < 0.01;
            break;
        }

        if (shouldTrigger && !alert.triggeredAt) {
          triggerAlert(alert);
        }
      });
    }
  }, [alerts, triggerAlert]);

  // Manage WebSocket connection for real-time data
  useEffect(() => {
    if (realTimeConfig.enabled && marketData.length > 0) {
      binanceApi.connectWebSocket(realTimeConfig.symbols, handleWebSocketMessage);
      setIsRealTimeConnected(true);
    } else {
      binanceApi.disconnectWebSocket();
      setIsRealTimeConnected(false);
    }

    return () => {
      binanceApi.disconnectWebSocket();
    };
  }, [realTimeConfig.enabled, realTimeConfig.symbols, marketData.length, handleWebSocketMessage]);

  // Detect patterns in market data when data changes
  useEffect(() => {
    if (marketData.length > 0) {
      const detectedPatterns = binanceApi.detectAllPatterns(marketData);
      setPatterns(detectedPatterns);
    }
  }, [marketData]);

  // Monitor alerts and trigger them based on current market data
  useEffect(() => {
    if (alerts.length > 0 && marketData.length > 0) {
      const checkAlerts = () => {
        const latestData = marketData[marketData.length - 1];
        
        alerts.forEach(alert => {
          if (!alert.isActive) return;

          let shouldTrigger = false;
          let currentValue = 0;

          // Get current value based on alert type
          switch (alert.type) {
            case 'volatility':
              currentValue = latestData.volatility;
              break;
            case 'performance':
              currentValue = latestData.performance;
              break;
            case 'volume':
              currentValue = latestData.volume;
              break;
            case 'price':
              currentValue = latestData.close;
              break;
          }

          // Check if alert conditions are met
          switch (alert.condition) {
            case 'above':
              shouldTrigger = currentValue > alert.threshold;
              break;
            case 'below':
              shouldTrigger = currentValue < alert.threshold;
              break;
            case 'equals':
              shouldTrigger = Math.abs(currentValue - alert.threshold) < 0.01;
              break;
          }

          if (shouldTrigger && !alert.triggeredAt) {
            triggerAlert(alert);
          }
        });
      };

      // Set up interval to check alerts periodically
      const interval = setInterval(checkAlerts, alertSettings.refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [alerts, marketData, alertSettings.refreshInterval, triggerAlert]);

  // Event handlers for user interactions
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowDashboard(true);
  };

  const handleDateRangeSelect = (range: DateRange) => {
    setDateRange(range);
    setShowDashboard(true);
  };

  const handleTimeframeChange = (timeframe: Timeframe) => {
    setCurrentTimeframe(timeframe);
  };

  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  const handleColorSchemeChange = (scheme: ColorScheme) => {
    setCurrentColorScheme(scheme);
  };

  const handleFilterChange = (newFilterOptions: FilterOptions) => {
    setSelectedMetrics(newFilterOptions.metrics);
  };

  const handleDashboardClose = () => {
    setShowDashboard(false);
    setDateRange(null);
  };

  const handleCalendarDashboardClose = () => {
    setShowDashboard(false);
    setDateRange(null);
  };

  // Prepare filter options for child components
  const filterOptions: FilterOptions = {
    symbol: selectedSymbol,
    timeframe: currentTimeframe,
    metrics: selectedMetrics,
    dateRange: dateRange || {
      start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      end: new Date(),
    },
  };

  // Alert management handlers
  const handleAlertCreate = (alert: Omit<Alert, 'id' | 'createdAt'>) => {
    const newAlert: Alert = {
      ...alert,
      id: `alert-${Date.now()}`,
      createdAt: new Date()
    };
    setAlerts(prev => [...prev, newAlert]);
  };

  const handleAlertDelete = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const handleAlertToggle = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, isActive: !a.isActive } : a
    ));
  };

  const handleAlertSettingsChange = (settings: AlertSettings) => {
    setAlertSettings(settings);
  };

  // Data comparison handlers
  const handleComparisonCreate = async (comparison: Omit<DataComparisonType, 'id' | 'createdAt'>) => {
    const newComparison: DataComparisonType = {
      ...comparison,
      id: `comparison-${Date.now()}`,
      createdAt: new Date()
    };

    // Fetch data for each dataset in the comparison
    const newComparisonData = new Map(comparisonData);
    
    for (const dataset of comparison.datasets) {
      try {
        const data = await binanceApi.getKlineData(
          dataset.symbol,
          dataset.timeframe,
          dataset.dateRange.start.getTime(),
          dataset.dateRange.end.getTime()
        );
        const processedData = binanceApi.processKlineData(data);
        newComparisonData.set(`${dataset.symbol}_${dataset.timeframe}`, processedData);
      } catch (error) {
        console.error(`Error fetching data for ${dataset.symbol}:`, error);
      }
    }
    
    setComparisonData(newComparisonData);
    setComparisons(prev => [...prev, newComparison]);
  };

  const handleComparisonDelete = (comparisonId: string) => {
    setComparisons(prev => prev.filter(c => c.id !== comparisonId));
    
    // Clean up associated data
    const deletedComparison = comparisons.find(c => c.id === comparisonId);
    if (deletedComparison) {
      const newComparisonData = new Map(comparisonData);
      deletedComparison.datasets.forEach(dataset => {
        const key = `${dataset.symbol}_${dataset.timeframe}`;
        newComparisonData.delete(key);
      });
      setComparisonData(newComparisonData);
    }
  };

  const handlePatternSelect = (pattern: HistoricalPattern) => {
    console.log('Pattern selected:', pattern);
    // TODO: Implement pattern selection handling
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header with navigation and controls */}
      <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 sm:py-0 min-h-[64px]">
            {/* Logo and title */}
            <div className="flex items-center space-x-2 sm:space-x-4 mb-2 sm:mb-0">
              <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg">
                <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  Market Seasonality Explorer
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                  Interactive Financial Data Visualization
                </p>
              </div>
            </div>
            
            {/* Navigation and action buttons */}
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
              {/* View toggle buttons */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5 sm:p-1">
                {[
                  { key: 'calendar', icon: Calendar, label: 'Calendar' },
                  { key: 'analytics', icon: BarChart3, label: 'Analytics' },
                  { key: 'alerts', icon: Bell, label: 'Alerts' },
                  { key: 'comparison', icon: BarChart3, label: 'Compare' },
                  { key: 'patterns', icon: Target, label: 'Patterns' }
                ].map(({ key, icon: Icon, label }) => (
                <button
                    key={key}
                    onClick={() => setCurrentView(key as 'calendar' | 'analytics' | 'alerts' | 'comparison' | 'patterns')}
                  className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                      currentView === key
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                    <span className="hidden sm:inline">{label}</span>
                </button>
                ))}
              </div>
              
              {/* Settings and export buttons */}
              <button
                onClick={() => setShowColorSchemes(!showColorSchemes)}
                className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                title="Color Schemes"
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              
              <button
                onClick={() => setShowExportPanel(!showExportPanel)}
                className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                title="Export Data"
              >
                <Download className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Filter controls */}
        <div className="mb-6">
              <FilterControls
                symbols={symbols}
                selectedSymbol={selectedSymbol}
                onSymbolChange={handleSymbolChange}
                timeframes={timeframes}
                currentTimeframe={currentTimeframe}
                onTimeframeChange={handleTimeframeChange}
                filterOptions={filterOptions}
                onFilterChange={handleFilterChange}
              />
          </div>

          {/* Main content area with different views */}
        <div className="space-y-6">
            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading market data...</span>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <button
                  onClick={loadMarketData}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Main content when data is loaded */}
            {!loading && !error && marketData.length > 0 && (
              <div className="space-y-6">
                {/* Calendar view */}
                {currentView === 'calendar' && (
                  <CalendarComponent
                    data={marketData}
                    timeframe={currentTimeframe}
                    colorScheme={currentColorScheme}
                    onDateSelect={handleDateSelect}
                    onDateRangeSelect={handleDateRangeSelect}
                    selectedDate={selectedDate}
                    selectedRange={dateRange}
                  selectedMetrics={selectedMetrics}
                  onDashboardClose={handleCalendarDashboardClose}
                  />
                )}
                {/* Analytics view */}
                {currentView === 'analytics' && (
                  <AnalyticsDashboard
                    data={marketData}
                    timeframe={currentTimeframe}
                    colorScheme={currentColorScheme}
                    symbol={selectedSymbol}
                  selectedMetrics={selectedMetrics}
                  selectedRange={dateRange}
                  onDateRangeSelect={handleDateRangeSelect}
                />
              )}
              {/* Alerts view */}
              {currentView === 'alerts' && (
                <AlertSystem
                  alerts={alerts}
                  settings={alertSettings}
                  onAlertCreate={handleAlertCreate}
                  onAlertDelete={handleAlertDelete}
                  onAlertToggle={handleAlertToggle}
                  onSettingsChange={handleAlertSettingsChange}
                />
              )}
              {/* Comparison view */}
              {currentView === 'comparison' && (
                <DataComparison
                  comparisons={comparisons}
                  marketData={marketData}
                  comparisonData={comparisonData}
                  symbols={symbols}
                  onComparisonCreate={handleComparisonCreate}
                  onComparisonDelete={handleComparisonDelete}
                />
              )}
              {/* Patterns view */}
              {currentView === 'patterns' && (
                <HistoricalPatterns
                  patterns={patterns}
                  marketData={marketData}
                  onPatternSelect={handlePatternSelect}
                  />
                )}
              </div>
            )}
          </div>

        {/* Color scheme selector modal */}
        <AnimatePresence>
          {showColorSchemes && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowColorSchemes(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <ColorSchemeSelector
                  colorSchemes={colorSchemes}
                  currentScheme={currentColorScheme}
                  onSchemeChange={handleColorSchemeChange}
                  onClose={() => setShowColorSchemes(false)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Data dashboard modal */}
        <AnimatePresence>
          {showDashboard && (selectedDate || dateRange) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={handleDashboardClose}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <DataDashboard
                  data={marketData}
                  selectedDate={selectedDate}
                  selectedRange={dateRange}
                  symbol={selectedSymbol}
                  onClose={handleDashboardClose}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Export panel modal */}
        <AnimatePresence>
          {showExportPanel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowExportPanel(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <ExportPanel
                  data={marketData}
                  symbol={selectedSymbol}
                  timeframe={currentTimeframe}
                  selectedRange={dateRange}
                  onClose={() => setShowExportPanel(false)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MarketSeasonalityExplorer;
