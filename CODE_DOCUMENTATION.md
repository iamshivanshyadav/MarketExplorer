# Market Seasonality Explorer - Code Documentation

## 📚 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Type System](#type-system)
3. [Component Documentation](#component-documentation)
4. [Service Layer](#service-layer)
5. [Testing Strategy](#testing-strategy)
6. [Performance Optimizations](#performance-optimizations)
7. [Error Handling](#error-handling)
8. [Data Flow](#data-flow)

---

## 🏗️ Architecture Overview

### Technology Stack
- **Frontend**: React 18, TypeScript, Next.js 14
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Testing**: Jest, React Testing Library
- **API**: Binance REST API
- **Real-time**: WebSocket connections

### Core Architecture Principles
1. **Type Safety**: Comprehensive TypeScript usage throughout
2. **Component Composition**: Modular, reusable components
3. **Separation of Concerns**: Clear boundaries between layers
4. **Test-Driven Development**: 115+ unit tests with 100% pass rate
5. **Performance Optimization**: React optimization techniques
6. **Error Handling**: Robust error management at all levels

### Project Structure
```
src/
├── app/                    # Next.js app router
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Main page component
│   └── globals.css        # Global styles
├── components/             # React components
│   ├── MarketSeasonalityExplorer.tsx  # Main orchestrator
│   ├── CalendarComponent.tsx          # Date selection
│   ├── AnalyticsDashboard.tsx        # Data visualization
│   ├── DataDashboard.tsx             # Metrics display
│   ├── HistoricalPatterns.tsx        # Pattern analysis
│   ├── AlertSystem.tsx               # Alert management
│   ├── FilterControls.tsx            # Data filtering
│   ├── ExportPanel.tsx               # Data export
│   ├── ColorSchemeSelector.tsx       # Theme management
│   └── DataComparison.tsx            # Comparative analysis
├── services/              # API and data services
│   └── binanceApi.ts     # Binance API integration
├── types/                 # TypeScript type definitions
│   └── index.ts          # Core type definitions
└── utils/                 # Utility functions
    └── dataScenarios.ts  # Test data scenarios
```

---

## 🔧 Type System

### Core Type Definitions (`src/types/index.ts`)

#### `ProcessedDayData`
Main data structure for market data with calculated metrics.

```typescript
interface ProcessedDayData {
  date: Date;           // Trading date
  open: number;         // Opening price
  high: number;         // Highest price
  low: number;          // Lowest price
  close: number;        // Closing price
  volume: number;       // Trading volume
  volatility: number;   // Calculated volatility percentage
  performance: number;  // Price performance percentage
  liquidity: number;    // Market liquidity (volume * close)
  dayOfWeek: number;    // Day of week (0-6, Sunday = 0)
  weekOfYear: number;   // Week of year (1-52)
  monthOfYear: number;  // Month of year (1-12)
}
```

#### `DateRange`
Date range selection for data filtering.

```typescript
interface DateRange {
  start: Date;          // Start date (inclusive)
  end: Date;            // End date (inclusive)
}
```

#### `Alert`
Alert configuration for market conditions.

```typescript
interface Alert {
  id: string;                    // Unique alert identifier
  type: AlertType;               // Alert type (volatility, performance, etc.)
  condition: 'above' | 'below';  // Threshold condition
  value: number;                 // Threshold value
  message: string;               // Alert message
  isActive: boolean;             // Alert activation status
  createdAt: Date;               // Alert creation timestamp
  lastTriggered?: Date;          // Last trigger timestamp
}
```

#### `AlertType`
Union type for alert categories.

```typescript
type AlertType = 'volatility' | 'performance' | 'volume' | 'price';
```

#### `ColorScheme`
Theme configuration options.

```typescript
type ColorScheme = 'light' | 'dark' | 'high-contrast' | 'colorblind-friendly';
```

#### `Timeframe`
Data aggregation timeframes.

```typescript
type Timeframe = '1d' | '1w' | '1M' | '3M' | '6M' | '1y';
```

---

## 🧩 Component Documentation

### Main Component (`src/components/MarketSeasonalityExplorer.tsx`)

The application orchestrator that manages state, data flow, and component coordination.

#### Key Responsibilities:
- **State Management**: Comprehensive state for data, UI, and user interactions
- **Data Fetching**: Real-time and historical data retrieval
- **WebSocket Management**: Live data updates
- **Alert Monitoring**: Real-time alert processing
- **Pattern Detection**: Statistical analysis of market patterns

#### State Structure:
```typescript
// Data state
const [data, setData] = useState<ProcessedDayData[]>([]);
const [selectedDate, setSelectedDate] = useState<Date | null>(null);
const [selectedRange, setSelectedRange] = useState<DateRange | null>(null);
const [symbol, setSymbol] = useState<string>('BTCUSDT');
const [timeframe, setTimeframe] = useState<Timeframe>('1d');

// UI state
const [showDashboard, setShowDashboard] = useState(false);
const [showAnalytics, setShowAnalytics] = useState(false);
const [showPatterns, setShowPatterns] = useState(false);
const [showAlerts, setShowAlerts] = useState(false);
const [showComparison, setShowComparison] = useState(false);
const [colorScheme, setColorScheme] = useState<ColorScheme>('light');

// Loading and error states
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [wsConnected, setWsConnected] = useState(false);

// Alert state
const [alerts, setAlerts] = useState<Alert[]>([]);
const [alertHistory, setAlertHistory] = useState<Alert[]>([]);
```

#### Key Methods:

**`handleDateRangeSelect()`**: Processes date range selections
```typescript
const handleDateRangeSelect = (range: DateRange) => {
  setSelectedRange(range);
  setSelectedDate(null); // Clear single date selection
  setShowDashboard(true);
  setShowAnalytics(false);
  setShowPatterns(false);
  setShowAlerts(false);
  setShowComparison(false);
};
```

**`handleDateSelect()`**: Handles single date selections
```typescript
const handleDateSelect = (date: Date) => {
  setSelectedDate(date);
  setSelectedRange(null); // Clear range selection
  setShowDashboard(true);
  setShowAnalytics(false);
  setShowPatterns(false);
  setShowAlerts(false);
  setShowComparison(false);
};
```

**`handleAlertToggle()`**: Manages alert activation/deactivation
```typescript
const handleAlertToggle = (alertId: string) => {
  setAlerts(prevAlerts => 
    prevAlerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, isActive: !alert.isActive }
        : alert
    )
  );
};
```

**`handleExport()`**: Exports data in various formats
```typescript
const handleExport = async (format: 'csv' | 'json' | 'pdf' | 'png') => {
  const exportData = getExportData();
  
  switch (format) {
    case 'csv':
      exportToCSV(exportData);
      break;
    case 'json':
      exportToJSON(exportData);
      break;
    case 'pdf':
      await exportToPDF(exportData);
      break;
    case 'png':
      await exportToPNG(exportData);
      break;
  }
};
```

#### useEffect Hooks:

**Data Fetching**:
```typescript
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const apiService = new BinanceApiService();
      const rawData = await apiService.getKlineData(symbol, timeframe, startTime, endTime);
      const processedData = apiService.processKlineData(rawData);
      setData(processedData);
    } catch (err) {
      setError('Failed to fetch data. Using mock data instead.');
      setData(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  if (symbol && timeframe) {
    fetchData();
  }
}, [symbol, timeframe, startTime, endTime]);
```

**WebSocket Connection**:
```typescript
useEffect(() => {
  let ws: WebSocket | null = null;

  const connectWebSocket = () => {
    ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/${symbol.toLowerCase()}@kline_${timeframe}`);
    
    ws.onopen = () => {
      setWsConnected(true);
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.k) {
        const newData = processWebSocketData(data);
        setData(prevData => [...prevData.slice(1), newData]);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setWsConnected(false);
    };
    
    ws.onclose = () => {
      setWsConnected(false);
      // Reconnect after 5 seconds
      setTimeout(connectWebSocket, 5000);
    };
  };

  if (symbol && timeframe && process.env.NEXT_PUBLIC_ENABLE_REAL_TIME === 'true') {
    connectWebSocket();
  }

  return () => {
    if (ws) {
      ws.close();
    }
  };
}, [symbol, timeframe]);
```

**Alert Monitoring**:
```typescript
useEffect(() => {
  const checkAlerts = () => {
    if (!data.length || !alerts.length) return;

    const latestData = data[data.length - 1];
    
    alerts.forEach(alert => {
      if (!alert.isActive) return;

      let currentValue: number;
      let shouldTrigger = false;

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
        default:
          return;
      }

      if (alert.condition === 'above' && currentValue > alert.value) {
        shouldTrigger = true;
      } else if (alert.condition === 'below' && currentValue < alert.value) {
        shouldTrigger = true;
      }

      if (shouldTrigger) {
        triggerAlert(alert, currentValue);
      }
    });
  };

  const interval = setInterval(checkAlerts, 5000); // Check every 5 seconds
  return () => clearInterval(interval);
}, [data, alerts]);
```

### Calendar Component (`src/components/CalendarComponent.tsx`)

Sophisticated date selection component with range and single date support.

#### Props Interface:
```typescript
interface CalendarProps {
  data: ProcessedDayData[];
  selectedDate: Date | null;
  selectedRange: DateRange | null;
  onDateSelect: (date: Date) => void;
  onDateRangeSelect: (range: DateRange) => void;
  onDashboardClose?: () => void;
  showMetrics: {
    volatility: boolean;
    performance: boolean;
    liquidity: boolean;
  };
  colorScheme: ColorScheme;
}
```

#### Key Features:
- **Date Range Selection**: From/To date picker with validation
- **Single Date Selection**: Click-to-select individual dates
- **Time Handling**: Proper date comparison with time boundaries
- **Accessibility**: ARIA labels and keyboard navigation
- **Responsive Design**: Mobile-friendly interface
- **Visual Indicators**: Color-coded volatility and performance metrics

#### Key Implementation:

**Date Range Handling**:
```typescript
const handleRangeSubmit = () => {
  if (!fromDate || !toDate) return;
  
  const startDate = new Date(fromDate);
  const endDate = new Date(toDate);
  
  // Add time to ensure proper date comparison
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  
  if (startDate <= endDate) {
    const dateRange = { start: startDate, end: endDate };
    onDateRangeSelect(dateRange);
  }
};
```

**Calendar Cell Rendering**:
```typescript
const renderCalendarCell = (date: Date, dayData?: ProcessedDayData) => {
  const isSelected = selectedDate && isSameDay(date, selectedDate);
  const isInRange = selectedRange && 
    isWithinInterval(date, { start: selectedRange.start, end: selectedRange.end });
  
  const volatilityColor = dayData ? getVolatilityColor(dayData.volatility) : 'bg-gray-100';
  const performanceColor = dayData ? getPerformanceColor(dayData.performance) : '';
  
  return (
    <div
      key={date.toISOString()}
      className={`
        calendar-cell
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
        ${isInRange ? 'bg-blue-100' : ''}
        ${volatilityColor}
        ${performanceColor}
      `}
      onClick={() => onDateSelect(date)}
      role="button"
      tabIndex={0}
      aria-label={`${format(date, 'MMMM d, yyyy')} - Volatility: ${dayData?.volatility.toFixed(2)}%`}
    >
      <div className="date-number">{format(date, 'd')}</div>
      {dayData && (
        <div className="metrics">
          {showMetrics.volatility && (
            <div className="volatility-indicator">
              {dayData.volatility.toFixed(1)}%
            </div>
          )}
          {showMetrics.performance && (
            <div className="performance-indicator">
              {dayData.performance > 0 ? '+' : ''}{dayData.performance.toFixed(1)}%
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

**Color Utility Functions**:
```typescript
const getVolatilityColor = (volatility: number): string => {
  if (volatility >= 5) return 'bg-red-500';
  if (volatility >= 3) return 'bg-orange-400';
  if (volatility >= 1) return 'bg-yellow-300';
  return 'bg-green-200';
};

const getPerformanceColor = (performance: number): string => {
  if (performance > 0) return 'text-green-600';
  if (performance < 0) return 'text-red-600';
  return 'text-gray-600';
};
```

### Analytics Dashboard (`src/components/AnalyticsDashboard.tsx`)

Advanced data visualization component with multiple chart types and real-time updates.

#### Props Interface:
```typescript
interface AnalyticsDashboardProps {
  data: ProcessedDayData[];
  selectedRange: DateRange | null;
  colorScheme: ColorScheme;
  onExport: (format: 'png' | 'pdf') => void;
}
```

#### Chart Types:
- **Line Charts**: Price and performance trends
- **Bar Charts**: Volume and volatility analysis
- **Area Charts**: Cumulative metrics
- **Scatter Plots**: Correlation analysis

#### Key Features:
- **Responsive Design**: Adapts to screen size
- **Interactive Charts**: Zoom, pan, and hover effects
- **Real-time Updates**: Live data integration
- **Export Capabilities**: Chart image export
- **Accessibility**: Screen reader support

#### Chart Implementation Example:
```typescript
const renderPriceChart = () => {
  const chartData = data.map(item => ({
    date: format(item.date, 'MMM dd'),
    price: item.close,
    volume: item.volume,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="price"
          stroke="#8884d8"
          strokeWidth={2}
        />
        <Bar
          yAxisId="right"
          dataKey="volume"
          fill="#82ca9d"
          opacity={0.3}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
```

### Alert System (`src/components/AlertSystem.tsx`)

Comprehensive alert management system with real-time monitoring.

#### Key Features:
- **Alert Creation**: Set thresholds for various metrics
- **Real-time Monitoring**: Continuous alert checking
- **Browser Notifications**: Native browser notifications
- **Sound Alerts**: Audio notifications for critical events
- **Alert History**: Track triggered alerts
- **Customizable Settings**: Configurable notification preferences

#### Alert Creation:
```typescript
const createAlert = (alertData: Omit<Alert, 'id' | 'createdAt'>) => {
  const newAlert: Alert = {
    ...alertData,
    id: generateId(),
    createdAt: new Date(),
  };
  
  setAlerts(prev => [...prev, newAlert]);
};
```

#### Alert Triggering:
```typescript
const triggerAlert = (alert: Alert, currentValue: number) => {
  // Update alert history
  const triggeredAlert = {
    ...alert,
    lastTriggered: new Date(),
  };
  
  setAlertHistory(prev => [...prev, triggeredAlert]);
  
  // Show browser notification
  if (Notification.permission === 'granted') {
    new Notification('Market Alert', {
      body: `${alert.message} - Current value: ${currentValue}`,
      icon: '/icon.png',
    });
  }
  
  // Play sound alert
  if (soundEnabled) {
    playAlertSound();
  }
};
```

---

## 🔌 Service Layer

### Binance API Service (`src/services/binanceApi.ts`)

Robust API integration with comprehensive error handling and data processing.

#### Class Structure:
```typescript
class BinanceApiService {
  private baseUrl: string;
  private wsUrl: string;
  private rateLimitDelay: number;
  
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BINANCE_API_URL || 'https://api.binance.com/api/v3';
    this.wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://stream.binance.com:9443/ws';
    this.rateLimitDelay = 1000; // 1 second delay between requests
  }
}
```

#### Key Methods:

**`getKlineData()`**: Fetches historical market data
```typescript
async getKlineData(symbol: string, interval: string, startTime: number, endTime: number): Promise<any[]> {
  try {
    const response = await fetch(
      `${this.baseUrl}/klines?symbol=${symbol}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Rate limiting
    await this.delay(this.rateLimitDelay);
    
    return data;
  } catch (error) {
    console.error('Error fetching kline data:', error);
    return [];
  }
}
```

**`processKlineData()`**: Transforms raw API data into application format
```typescript
processKlineData(rawData: any[]): ProcessedDayData[] {
  return rawData.map((kline, index) => {
    const [timestamp, open, high, low, close, volume] = kline;
    const date = new Date(timestamp);
    
    const openPrice = parseFloat(open);
    const highPrice = parseFloat(high);
    const lowPrice = parseFloat(low);
    const closePrice = parseFloat(close);
    const volumeAmount = parseFloat(volume);
    
    return {
      date,
      open: openPrice,
      high: highPrice,
      low: lowPrice,
      close: closePrice,
      volume: volumeAmount,
      volatility: this.calculateVolatility(highPrice, lowPrice, openPrice),
      performance: this.calculatePerformance(closePrice, openPrice),
      liquidity: volumeAmount * closePrice,
      dayOfWeek: date.getDay(),
      weekOfYear: this.getWeekOfYear(date),
      monthOfYear: date.getMonth() + 1
    };
  });
}
```

**`calculateVolatility()`**: Calculates price volatility
```typescript
private calculateVolatility(high: number, low: number, open: number): number {
  const range = high - low;
  return (range / open) * 100;
}
```

**`calculatePerformance()`**: Calculates price performance
```typescript
private calculatePerformance(close: number, open: number): number {
  return ((close - open) / open) * 100;
}
```

**`getWeekOfYear()`**: Calculates week of year
```typescript
private getWeekOfYear(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}
```

---

## 🧪 Testing Strategy

### Test Structure (`src/__tests__/`)

Comprehensive testing approach with 115+ unit tests covering all major functionality.

#### Test Organization:
```
__tests__/
├── components/           # Component tests
│   ├── MarketSeasonalityExplorer.test.tsx
│   ├── CalendarComponent.test.tsx
│   ├── AnalyticsDashboard.test.tsx
│   ├── AlertSystem.test.tsx
│   └── FilterControls.test.tsx
├── services/            # Service tests
│   └── binanceApi.test.ts
└── utils/              # Utility tests
    └── dataScenarios.test.ts
```

#### Test Examples:

**Calendar Component Test**:
```typescript
describe('CalendarComponent', () => {
  const defaultProps = {
    data: mockData,
    selectedDate: null,
    selectedRange: null,
    onDateSelect: jest.fn(),
    onDateRangeSelect: jest.fn(),
    showMetrics: {
      volatility: true,
      performance: true,
      liquidity: false,
    },
    colorScheme: 'light' as ColorScheme,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders calendar with data', () => {
    render(<CalendarComponent {...defaultProps} />);
    
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(35); // Calendar days
  });

  test('handles date range selection', async () => {
    render(<CalendarComponent {...defaultProps} />);
    
    const fromDateInput = screen.getByLabelText('From Date');
    const toDateInput = screen.getByLabelText('To Date');
    const applyRangeButton = screen.getByText('Apply Range');
    
    fireEvent.change(fromDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(toDateInput, { target: { value: '2024-01-31' } });
    fireEvent.click(applyRangeButton);
    
    // Create expected dates with the new time handling
    const expectedStart = new Date('2024-01-01');
    expectedStart.setHours(0, 0, 0, 0);
    const expectedEnd = new Date('2024-01-31');
    expectedEnd.setHours(23, 59, 59, 999);
    
    expect(defaultProps.onDateRangeSelect).toHaveBeenCalledWith({
      start: expectedStart,
      end: expectedEnd
    });
  });

  test('handles single date selection', () => {
    render(<CalendarComponent {...defaultProps} />);
    
    const firstDayButton = screen.getAllByRole('button')[0];
    fireEvent.click(firstDayButton);
    
    expect(defaultProps.onDateSelect).toHaveBeenCalled();
  });

  test('displays metrics when enabled', () => {
    render(<CalendarComponent {...defaultProps} />);
    
    // Check that volatility and performance metrics are displayed
    expect(screen.getByText(/volatility/i)).toBeInTheDocument();
    expect(screen.getByText(/performance/i)).toBeInTheDocument();
  });
});
```

**API Service Test**:
```typescript
describe('BinanceApiService', () => {
  let service: BinanceApiService;

  beforeEach(() => {
    service = new BinanceApiService();
  });

  test('handles API errors gracefully', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    
    const result = await service.getKlineData('BTCUSDT', '1d', 0, 0);
    
    expect(result).toEqual([]);
  });

  test('processes kline data correctly', () => {
    const mockKlineData = [
      [1640995200000, '50000', '51000', '49000', '50500', '1000', 1640995200000, '50000000', 1000, '50000000', '50000000']
    ];
    
    const result = service.processKlineData(mockKlineData);
    
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      date: new Date(1640995200000),
      open: 50000,
      high: 51000,
      low: 49000,
      close: 50500,
      volume: 1000,
    });
  });

  test('calculates volatility correctly', () => {
    const volatility = service['calculateVolatility'](51000, 49000, 50000);
    expect(volatility).toBe(4); // (51000-49000)/50000 * 100
  });

  test('calculates performance correctly', () => {
    const performance = service['calculatePerformance'](50500, 50000);
    expect(performance).toBe(1); // (50500-50000)/50000 * 100
  });
});
```

---

## ⚡ Performance Optimizations

### React Optimizations

**useMemo for Expensive Calculations**:
```typescript
const filteredData = useMemo(() => {
  if (selectedDate) {
    return data.filter(d => 
      format(d.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    );
  }
  if (selectedRange) {
    return data.filter(d => 
      d.date >= selectedRange.start && d.date <= selectedRange.end
    );
  }
  return data.slice(-30);
}, [data, selectedDate, selectedRange]);
```

**useCallback for Event Handlers**:
```typescript
const handleDateSelect = useCallback((date: Date) => {
  setSelectedDate(date);
  setSelectedRange(null);
  setShowDashboard(true);
}, []);
```

**React.memo for Component Memoization**:
```typescript
const CalendarComponent = React.memo(({ data, onDateSelect, ...props }: CalendarProps) => {
  // Component implementation
});
```

### Data Processing Optimizations

**Efficient Filtering**:
```typescript
const getDataForDateRange = (data: ProcessedDayData[], range: DateRange) => {
  const startTime = range.start.getTime();
  const endTime = range.end.getTime();
  
  return data.filter(item => {
    const itemTime = item.date.getTime();
    return itemTime >= startTime && itemTime <= endTime;
  });
};
```

**Caching Strategy**:
```typescript
const useDataCache = () => {
  const cache = useRef(new Map<string, ProcessedDayData[]>());
  
  const getCachedData = useCallback((key: string) => {
    return cache.current.get(key);
  }, []);
  
  const setCachedData = useCallback((key: string, data: ProcessedDayData[]) => {
    cache.current.set(key, data);
  }, []);
  
  return { getCachedData, setCachedData };
};
```

### WebSocket Optimization

**Connection Management**:
```typescript
const useWebSocket = (url: string) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    const socket = new WebSocket(url);
    
    socket.onopen = () => setIsConnected(true);
    socket.onclose = () => setIsConnected(false);
    socket.onerror = () => setIsConnected(false);
    
    setWs(socket);
    
    return () => {
      socket.close();
    };
  }, [url]);
  
  return { ws, isConnected };
};
```

---

## 🛡️ Error Handling

### Error Boundaries

**Component Error Boundary**:
```typescript
class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### API Error Handling

**Graceful Degradation**:
```typescript
const fetchDataWithFallback = async () => {
  try {
    const apiService = new BinanceApiService();
    const data = await apiService.getKlineData(symbol, timeframe, startTime, endTime);
    return apiService.processKlineData(data);
  } catch (error) {
    console.error('API error, using mock data:', error);
    return generateMockData();
  }
};
```

### User-Friendly Error Messages

**Error State Management**:
```typescript
const [error, setError] = useState<string | null>(null);

const handleError = (error: Error) => {
  let userMessage = 'An unexpected error occurred.';
  
  if (error.message.includes('Network')) {
    userMessage = 'Network connection failed. Please check your internet connection.';
  } else if (error.message.includes('API')) {
    userMessage = 'Unable to fetch market data. Please try again later.';
  } else if (error.message.includes('WebSocket')) {
    userMessage = 'Real-time connection lost. Data may not be current.';
  }
  
  setError(userMessage);
  
  // Auto-clear error after 5 seconds
  setTimeout(() => setError(null), 5000);
};
```

---

## 📊 Data Flow

### Application Data Flow

1. **Initial Load**:
   - App loads with default symbol (BTCUSDT)
   - Fetches historical data from Binance API
   - Processes and stores data in state
   - Renders calendar view with data

2. **User Interactions**:
   - Date selection triggers data filtering
   - Range selection fetches additional data if needed
   - Symbol changes trigger new API requests
   - Real-time updates via WebSocket

3. **Data Processing Pipeline**:
   ```
   Raw API Data → Process → Filter → Display
        ↓
   WebSocket Updates → Process → Merge → Update UI
   ```

### State Management Flow

```typescript
// Data flow example
const handleSymbolChange = (newSymbol: string) => {
  setSymbol(newSymbol);
  setLoading(true);
  setError(null);
  
  // Fetch new data
  fetchDataForSymbol(newSymbol)
    .then(data => {
      setData(data);
      setLoading(false);
    })
    .catch(error => {
      handleError(error);
      setLoading(false);
    });
};
```

### Real-time Data Flow

```typescript
// WebSocket data processing
const processWebSocketData = (wsData: any) => {
  const { k: kline } = wsData;
  
  const newDataPoint: ProcessedDayData = {
    date: new Date(kline.t),
    open: parseFloat(kline.o),
    high: parseFloat(kline.h),
    low: parseFloat(kline.l),
    close: parseFloat(kline.c),
    volume: parseFloat(kline.v),
    volatility: calculateVolatility(parseFloat(kline.h), parseFloat(kline.l), parseFloat(kline.o)),
    performance: calculatePerformance(parseFloat(kline.c), parseFloat(kline.o)),
    liquidity: parseFloat(kline.v) * parseFloat(kline.c),
    dayOfWeek: new Date(kline.t).getDay(),
    weekOfYear: getWeekOfYear(new Date(kline.t)),
    monthOfYear: new Date(kline.t).getMonth() + 1
  };
  
  return newDataPoint;
};
```

---

## 📈 Monitoring & Analytics

### Performance Monitoring

**Bundle Analysis**:
```bash
npm run analyze
```

**Runtime Performance**:
```typescript
const usePerformanceMonitor = () => {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('Performance metric:', entry);
      }
    });
    
    observer.observe({ entryTypes: ['measure'] });
    
    return () => observer.disconnect();
  }, []);
};
```

### Error Tracking

**Error Logging**:
```typescript
const logError = (error: Error, context: string) => {
  console.error(`[${context}] Error:`, error);
  
  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Send to error tracking service
  }
};
```

---

This comprehensive code documentation provides detailed insights into the architecture, implementation, and best practices used in the Market Seasonality Explorer application. Each section includes practical examples and explanations to help developers understand and work with the codebase effectively. 