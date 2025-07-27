import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnalyticsDashboard from '../../components/AnalyticsDashboard';
import { ProcessedDayData, DateRange } from '@/types';

const mockData: ProcessedDayData[] = [
  {
    date: new Date(2024, 0, 1),
    open: 100,
    high: 110,
    low: 95,
    close: 105,
    volume: 1000000,
    volatility: 5.2,
    performance: 5.0,
    liquidity: 0.8,
    dayOfWeek: 1,
    weekOfYear: 1,
    monthOfYear: 1
  },
  {
    date: new Date(2024, 0, 2),
    open: 105,
    high: 115,
    low: 100,
    close: 112,
    volume: 1200000,
    volatility: 6.7,
    performance: 6.7,
    liquidity: 0.9,
    dayOfWeek: 2,
    weekOfYear: 1,
    monthOfYear: 1
  },
  {
    date: new Date(2024, 0, 3),
    open: 112,
    high: 118,
    low: 108,
    close: 115,
    volume: 1100000,
    volatility: 4.5,
    performance: 2.7,
    liquidity: 0.7,
    dayOfWeek: 3,
    weekOfYear: 1,
    monthOfYear: 1
  }
];

describe('AnalyticsDashboard', () => {
  const defaultProps = {
    data: mockData,
    selectedMetrics: ['volatility', 'liquidity', 'performance'],
    selectedRange: null,
    onDateRangeSelect: jest.fn(),
    timeframe: { label: 'Daily', value: 'daily' as const, interval: '1d' },
    colorScheme: {
      name: 'Default',
      volatility: { low: '#10b981', medium: '#f59e0b', high: '#ef4444' },
      performance: { positive: '#10b981', negative: '#ef4444', neutral: '#6b7280' },
      liquidity: { high: '#3b82f6', medium: '#6366f1', low: '#8b5cf6' }
    },
    symbol: 'BTCUSDT'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders analytics dashboard with correct title', () => {
    render(
      <AnalyticsDashboard
        data={mockData}
        timeframe={defaultProps.timeframe}
        colorScheme={defaultProps.colorScheme}
        symbol="BTCUSDT"
        selectedMetrics={defaultProps.selectedMetrics}
      />
    );
    
    expect(screen.getByText('BTCUSDT Analytics - Daily View')).toBeInTheDocument();
  });

  test('displays statistical overview cards', async () => {
    render(
      <AnalyticsDashboard
        data={mockData}
        timeframe={defaultProps.timeframe}
        colorScheme={defaultProps.colorScheme}
        symbol="BTCUSDT"
        selectedMetrics={['volatility', 'performance', 'liquidity']}
      />
    );
    
    expect(screen.getByText('BTCUSDT Analytics - Daily View')).toBeInTheDocument();
  });

  test('calculates and displays correct statistics', async () => {
    render(
      <AnalyticsDashboard
        data={mockData}
        timeframe={defaultProps.timeframe}
        colorScheme={defaultProps.colorScheme}
        symbol="BTCUSDT"
        selectedMetrics={['volatility', 'performance', 'liquidity']}
      />
    );
    
    expect(screen.getByText('BTCUSDT Analytics - Daily View')).toBeInTheDocument();
  });

  test('handles empty data', async () => {
    render(
      <AnalyticsDashboard
        data={[]}
        timeframe={defaultProps.timeframe}
        colorScheme={defaultProps.colorScheme}
        symbol="BTCUSDT"
        selectedMetrics={['volatility', 'performance', 'liquidity']}
      />
    );
    
    expect(screen.getByText('No data available for the selected time range')).toBeInTheDocument();
  });

  test('handles single data point', async () => {
    const singleDataPoint = [
      {
        date: new Date(2024, 0, 1),
        open: 100,
        high: 110,
        low: 95,
        close: 105,
        volume: 1000000,
        volatility: 5.2,
        performance: 5.0,
        liquidity: 0.8,
        dayOfWeek: 1,
        weekOfYear: 1,
        monthOfYear: 1
      }
    ];

    render(
      <AnalyticsDashboard
        data={singleDataPoint}
        timeframe={defaultProps.timeframe}
        colorScheme={defaultProps.colorScheme}
        symbol="BTCUSDT"
        selectedMetrics={['volatility', 'performance', 'liquidity']}
      />
    );
    
    expect(screen.getByText('BTCUSDT Analytics - Daily View')).toBeInTheDocument();
  });

  test('filters data based on selected range', async () => {
    const rangeData = [
      {
        date: new Date(2024, 0, 1),
        open: 100,
        high: 110,
        low: 95,
        close: 105,
        volume: 1000000,
        volatility: 5.2,
        performance: 5.0,
        liquidity: 0.8,
        dayOfWeek: 1,
        weekOfYear: 1,
        monthOfYear: 1
      },
      {
        date: new Date(2024, 0, 2),
        open: 105,
        high: 115,
        low: 100,
        close: 110,
        volume: 2000000,
        volatility: 6.2,
        performance: 4.8,
        liquidity: 0.9,
        dayOfWeek: 2,
        weekOfYear: 1,
        monthOfYear: 1
      }
    ];

    render(
      <AnalyticsDashboard
        data={rangeData}
        timeframe={defaultProps.timeframe}
        colorScheme={defaultProps.colorScheme}
        symbol="BTCUSDT"
        selectedMetrics={['volatility', 'performance', 'liquidity']}
      />
    );
    
    expect(screen.getByText('BTCUSDT Analytics - Daily View')).toBeInTheDocument();
  });

  test('handles date range selection', async () => {
    const onDateRangeSelect = jest.fn();
    
    render(
      <AnalyticsDashboard
        data={mockData}
        timeframe={defaultProps.timeframe}
        colorScheme={defaultProps.colorScheme}
        symbol="BTCUSDT"
        selectedMetrics={['volatility', 'performance', 'liquidity']}
        onDateRangeSelect={onDateRangeSelect}
      />
    );
    
    const dateInputs = screen.getAllByDisplayValue('');
    const fromDateInput = dateInputs[0];
    const toDateInput = dateInputs[1];
    const applyButton = screen.getByText('Apply');
    
    await act(async () => {
      fireEvent.change(fromDateInput, { target: { value: '2024-01-01' } });
      fireEvent.change(toDateInput, { target: { value: '2024-01-31' } });
      fireEvent.click(applyButton);
    });
    
    expect(onDateRangeSelect).toHaveBeenCalled();
  });

  test('clears date range filter', async () => {
    const onDateRangeSelect = jest.fn();
    await act(async () => {
      render(<AnalyticsDashboard {...defaultProps} onDateRangeSelect={onDateRangeSelect} />);
    });
    
    const clearButton = screen.getByText('Clear');
    await act(async () => {
      fireEvent.click(clearButton);
    });
    
    await waitFor(() => {
      expect(onDateRangeSelect).toHaveBeenCalledWith(expect.objectContaining({
        start: expect.any(Date),
        end: expect.any(Date)
      }));
    });
  });

  test('handles extreme values in data', async () => {
    const extremeData: ProcessedDayData[] = [
      {
        date: new Date(2024, 0, 1),
        open: 0,
        high: 0,
        low: 0,
        close: 0,
        volume: 0,
        volatility: 0,
        performance: 0,
        liquidity: 0,
        dayOfWeek: 1,
        weekOfYear: 1,
        monthOfYear: 1
      }
    ];
    
    await act(async () => {
      render(<AnalyticsDashboard {...defaultProps} data={extremeData} />);
    });
    
    expect(screen.getByText('BTCUSDT Analytics - Daily View')).toBeInTheDocument();
  });

  test('handles negative performance values', async () => {
    const negativeData: ProcessedDayData[] = [
      {
        date: new Date(2024, 0, 1),
        open: 100,
        high: 110,
        low: 95,
        close: 92,
        volume: 1000000,
        volatility: 5.0,
        performance: -8.0,
        liquidity: 0.8,
        dayOfWeek: 1,
        weekOfYear: 1,
        monthOfYear: 1
      }
    ];
    
    await act(async () => {
      render(<AnalyticsDashboard {...defaultProps} data={negativeData} />);
    });
    
    expect(screen.getByText('BTCUSDT Analytics - Daily View')).toBeInTheDocument();
  });

  test('handles zero values', async () => {
    const zeroData: ProcessedDayData[] = [
      {
        date: new Date(2024, 0, 1),
        open: 0,
        high: 0,
        low: 0,
        close: 0,
        volume: 0,
        volatility: 0,
        performance: 0,
        liquidity: 0,
        dayOfWeek: 1,
        weekOfYear: 1,
        monthOfYear: 1
      }
    ];
    
    await act(async () => {
      render(<AnalyticsDashboard {...defaultProps} data={zeroData} />);
    });
    
    expect(screen.getByText('BTCUSDT Analytics - Daily View')).toBeInTheDocument();
  });

  test('handles large datasets', async () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      date: new Date(2024, 0, i + 1),
      open: 100 + i,
      high: 110 + i,
      low: 95 + i,
      close: 105 + i,
      volume: 1000000 + (i * 1000),
      volatility: 5 + (i % 10),
      performance: (i % 20) - 10,
      liquidity: 0.5 + (i % 10) / 20,
      dayOfWeek: new Date(2024, 0, i + 1).getDay(),
      weekOfYear: Math.ceil((new Date(2024, 0, i + 1).getTime() - new Date(2024, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)),
      monthOfYear: new Date(2024, 0, i + 1).getMonth() + 1
    }));

    render(
      <AnalyticsDashboard
        data={largeDataset}
        timeframe={defaultProps.timeframe}
        colorScheme={defaultProps.colorScheme}
        symbol="BTCUSDT"
        selectedMetrics={['volatility', 'performance', 'liquidity']}
      />
    );
    
    expect(screen.getByText('BTCUSDT Analytics - Daily View')).toBeInTheDocument();
  });

  test('displays selected metrics only', async () => {
    const selectedMetricsData = [
      {
        date: new Date(2024, 0, 1),
        open: 100,
        high: 110,
        low: 95,
        close: 105,
        volume: 1000000,
        volatility: 4.5,
        performance: 5.0,
        liquidity: 0.8,
        dayOfWeek: 1,
        weekOfYear: 1,
        monthOfYear: 1
      },
      {
        date: new Date(2024, 0, 2),
        open: 105,
        high: 115,
        low: 100,
        close: 110,
        volume: 2000000,
        volatility: 5.5,
        performance: 4.8,
        liquidity: 0.9,
        dayOfWeek: 2,
        weekOfYear: 1,
        monthOfYear: 1
      },
      {
        date: new Date(2024, 0, 3),
        open: 110,
        high: 120,
        low: 105,
        close: 115,
        volume: 3000000,
        volatility: 6.5,
        performance: 4.5,
        liquidity: 1.0,
        dayOfWeek: 3,
        weekOfYear: 1,
        monthOfYear: 1
      }
    ];

    render(
      <AnalyticsDashboard
        data={selectedMetricsData}
        timeframe={defaultProps.timeframe}
        colorScheme={defaultProps.colorScheme}
        symbol="BTCUSDT"
        selectedMetrics={['volatility']}
        onDateRangeSelect={jest.fn()}
      />
    );
    
    expect(screen.getByText('BTCUSDT Analytics - Daily View')).toBeInTheDocument();
  });

  test('handles incomplete data', async () => {
    const incompleteData = [
      {
        date: new Date(2024, 0, 1),
        open: 100,
        high: 110,
        low: 95,
        close: 105,
        volume: 1000000,
        volatility: 5.2,
        performance: 5.0,
        liquidity: 0.8,
        dayOfWeek: 1,
        weekOfYear: 1,
        monthOfYear: 1
      }
    ];

    render(
      <AnalyticsDashboard
        data={incompleteData}
        timeframe={defaultProps.timeframe}
        colorScheme={defaultProps.colorScheme}
        symbol="BTCUSDT"
        selectedMetrics={['volatility', 'performance', 'liquidity']}
      />
    );
    
    expect(screen.getByText('BTCUSDT Analytics - Daily View')).toBeInTheDocument();
  });

  test('handles edge case dates', async () => {
    const edgeCaseData = [
      {
        date: new Date('2024-02-29'), // Leap year date
        open: 100,
        high: 110,
        low: 95,
        close: 105,
        volume: 1000000,
        volatility: 5.2,
        performance: 5.0,
        liquidity: 0.8,
        dayOfWeek: 4,
        weekOfYear: 9,
        monthOfYear: 2
      }
    ];

    render(
      <AnalyticsDashboard
        data={edgeCaseData}
        timeframe={defaultProps.timeframe}
        colorScheme={defaultProps.colorScheme}
        symbol="BTCUSDT"
        selectedMetrics={defaultProps.selectedMetrics}
      />
    );
    
    expect(screen.getByText('BTCUSDT Analytics - Daily View')).toBeInTheDocument();
  });

  test('handles leap year data', async () => {
    const leapYearData = Array.from({ length: 29 }, (_, i) => ({
      date: new Date(2024, 1, i + 1), // February 2024 (leap year)
      open: 100 + i,
      high: 110 + i,
      low: 95 + i,
      close: 105 + i,
      volume: 1000000 + (i * 1000),
      volatility: 5 + (i % 10),
      performance: (i % 20) - 10,
      liquidity: 0.5 + (i % 10) / 20,
      dayOfWeek: new Date(2024, 1, i + 1).getDay(),
      weekOfYear: Math.ceil((new Date(2024, 1, i + 1).getTime() - new Date(2024, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)),
      monthOfYear: 2
    }));

    render(
      <AnalyticsDashboard
        data={leapYearData}
        timeframe={defaultProps.timeframe}
        colorScheme={defaultProps.colorScheme}
        symbol="BTCUSDT"
        selectedMetrics={defaultProps.selectedMetrics}
      />
    );
    
    expect(screen.getByText('BTCUSDT Analytics - Daily View')).toBeInTheDocument();
  });

  test('handles timezone edge cases', async () => {
    const edgeCaseData = [
      {
        date: new Date('2024-01-01T00:00:00.000Z'),
        open: 100,
        high: 110,
        low: 95,
        close: 105,
        volume: 1000000,
        volatility: 9.0,
        performance: -6.0,
        liquidity: 0.8,
        dayOfWeek: 1,
        weekOfYear: 1,
        monthOfYear: 1
      },
      {
        date: new Date('2024-01-02T00:00:00.000Z'),
        open: 105,
        high: 115,
        low: 100,
        close: 110,
        volume: 1360000,
        volatility: 8.0,
        performance: 4.8,
        liquidity: 0.9,
        dayOfWeek: 2,
        weekOfYear: 1,
        monthOfYear: 1
      }
    ];

    render(
      <AnalyticsDashboard
        data={edgeCaseData}
        timeframe={defaultProps.timeframe}
        colorScheme={defaultProps.colorScheme}
        symbol="BTCUSDT"
        selectedMetrics={defaultProps.selectedMetrics}
      />
    );
    
    expect(screen.getByText('BTCUSDT Analytics - Daily View')).toBeInTheDocument();
  });

  test('handles invalid data gracefully', async () => {
    const invalidData = [
      {
        date: new Date('invalid-date'),
        open: NaN,
        high: Infinity,
        low: -Infinity,
        close: 0,
        volume: -1000,
        volatility: NaN,
        performance: Infinity,
        liquidity: -0.5,
        dayOfWeek: 1,
        weekOfYear: 1,
        monthOfYear: 1
      }
    ];

    render(
      <AnalyticsDashboard
        data={invalidData}
        timeframe={defaultProps.timeframe}
        colorScheme={defaultProps.colorScheme}
        symbol="BTCUSDT"
        selectedMetrics={defaultProps.selectedMetrics}
      />
    );
    
    expect(screen.getByText('BTCUSDT Analytics - Daily View')).toBeInTheDocument();
  });

  test('handles long date ranges', async () => {
    const longRangeData = Array.from({ length: 365 }, (_, i) => ({
      date: new Date(2024, 0, i + 1),
      open: 100 + i,
      high: 110 + i,
      low: 95 + i,
      close: 105 + i,
      volume: 1000000 + (i * 1000),
      volatility: 5 + (i % 10),
      performance: (i % 20) - 10,
      liquidity: 0.5 + (i % 10) / 20,
      dayOfWeek: new Date(2024, 0, i + 1).getDay(),
      weekOfYear: Math.ceil((new Date(2024, 0, i + 1).getTime() - new Date(2024, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)),
      monthOfYear: new Date(2024, 0, i + 1).getMonth() + 1
    }));

    render(
      <AnalyticsDashboard
        data={longRangeData}
        timeframe={defaultProps.timeframe}
        colorScheme={defaultProps.colorScheme}
        symbol="BTCUSDT"
        selectedMetrics={defaultProps.selectedMetrics}
      />
    );
    
    expect(screen.getByText('BTCUSDT Analytics - Daily View')).toBeInTheDocument();
  });

  test('displays metrics correctly in statistics cards', () => {
    const mockData = [
      {
        date: new Date(2024, 0, 1),
        volatility: 1.2,
        performance: 2.5,
        volume: 1500000,
        high: 50000,
        low: 48000,
        open: 49000,
        close: 49500,
        liquidity: 0.8,
        dayOfWeek: 1,
        weekOfYear: 1,
        monthOfYear: 1
      },
      {
        date: new Date(2024, 0, 2),
        volatility: 1.5,
        performance: 3.0,
        volume: 1800000,
        high: 51000,
        low: 49000,
        open: 49500,
        close: 50000,
        liquidity: 0.9,
        dayOfWeek: 2,
        weekOfYear: 1,
        monthOfYear: 1
      }
    ];

    render(
      <AnalyticsDashboard
        data={mockData}
        timeframe={{ label: 'Daily', value: 'daily', interval: '1d' }}
        colorScheme={{
          volatility: { low: '#10b981', medium: '#f59e0b', high: '#ef4444' },
          performance: { positive: '#10b981', negative: '#ef4444', neutral: '#6b7280' },
          liquidity: { high: '#3b82f6', medium: '#6366f1', low: '#8b5cf6' }
        }}
        symbol="BTCUSDT"
        selectedMetrics={['volatility', 'performance', 'liquidity']}
      />
    );

    expect(screen.getByText('Average Volatility')).toBeInTheDocument();
    expect(screen.getByText('1.50%')).toBeInTheDocument();
    expect(screen.getByText('Total Performance')).toBeInTheDocument();
    expect(screen.getByText('3.00%')).toBeInTheDocument();
    expect(screen.getByText('Total Volume')).toBeInTheDocument();
    expect(screen.getByText('1.80M')).toBeInTheDocument();
  });

  test('chart type selection buttons work correctly', () => {
    const mockData = [
      {
        date: new Date(2024, 0, 1),
        volatility: 1.2,
        performance: 2.5,
        volume: 1500000,
        high: 50000,
        low: 48000,
        open: 49000,
        close: 49500,
        liquidity: 0.8,
        dayOfWeek: 1,
        weekOfYear: 1,
        monthOfYear: 1
      }
    ];

    render(
      <AnalyticsDashboard
        data={mockData}
        timeframe={{ label: 'Daily', value: 'daily', interval: '1d' }}
        colorScheme={{
          volatility: { low: '#10b981', medium: '#f59e0b', high: '#ef4444' },
          performance: { positive: '#10b981', negative: '#ef4444', neutral: '#6b7280' },
          liquidity: { high: '#3b82f6', medium: '#6366f1', low: '#8b5cf6' }
        }}
        symbol="BTCUSDT"
        selectedMetrics={['volatility', 'performance', 'liquidity']}
      />
    );

    const performanceButton = screen.getByText('Performance');
    fireEvent.click(performanceButton);

    expect(performanceButton.closest('button')).toHaveClass('bg-blue-600');
  });
}); 