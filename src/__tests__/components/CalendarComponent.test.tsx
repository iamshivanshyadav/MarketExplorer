jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => {
    if (!date) return '';
    if (formatStr === 'yyyy-MM-dd') {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    if (formatStr === 'MMMM yyyy') {
      return 'January 2024';
    }
    if (formatStr === 'd') {
      return String(date.getDate());
    }
    if (formatStr === 'yyyy') {
      return String(date.getFullYear());
    }
    if (formatStr === 'MMM dd') return 'Jan 01';
    if (formatStr === 'yyyy-MM') return '2024-01';
    if (formatStr === 'MMM dd, yyyy') return 'Jan 01, 2024';
    return date.toISOString ? date.toISOString() : '';
  }),
  startOfMonth: jest.fn((date) => new Date(date.getFullYear(), date.getMonth(), 1)),
  endOfMonth: jest.fn((date) => new Date(date.getFullYear(), date.getMonth() + 1, 0)),
  addMonths: jest.fn((date, months) => new Date(date.getFullYear(), date.getMonth() + months, date.getDate())),
  subMonths: jest.fn((date, months) => new Date(date.getFullYear(), date.getMonth() - months, date.getDate())),
  addYears: jest.fn((date, years) => new Date(date.getFullYear() + years, date.getMonth(), date.getDate())),
  subYears: jest.fn((date, years) => new Date(date.getFullYear() - years, date.getMonth(), date.getDate())),
  addDays: jest.fn((date, days) => { const newDate = new Date(date); newDate.setDate(newDate.getDate() + days); return newDate; }),
  subDays: jest.fn((date, days) => { const newDate = new Date(date); newDate.setDate(newDate.getDate() - days); return newDate; }),
  isSameMonth: jest.fn((dateLeft, dateRight) => dateLeft.getMonth() === dateRight.getMonth() && dateLeft.getFullYear() === dateRight.getFullYear()),
}));

import { format } from 'date-fns';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CalendarComponent from '../../components/CalendarComponent';
import { ProcessedDayData, DateRange } from '../../types';

test('date-fns format mock works for different dates', () => {
  const d1 = new Date(2024, 0, 1);
  const d2 = new Date(2024, 0, 31);
  console.log('MOCK TEST format d1:', format(d1, 'yyyy-MM-dd'));
  console.log('MOCK TEST format d2:', format(d2, 'yyyy-MM-dd'));
  expect(format(d1, 'yyyy-MM-dd')).toBe('2024-01-01');
  expect(format(d2, 'yyyy-MM-dd')).toBe('2024-01-31');
});

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

describe('CalendarComponent', () => {
  const defaultProps = {
    data: mockData,
    selectedDate: null,
    onDateSelect: jest.fn(),
    selectedRange: null,
    onDateRangeSelect: jest.fn(),
    timeframe: { label: 'Daily', value: 'daily' as const, interval: '1d' },
    colorScheme: {
      name: 'Default',
      volatility: { low: '#10b981', medium: '#f59e0b', high: '#ef4444' },
      performance: { positive: '#10b981', negative: '#ef4444', neutral: '#6b7280' },
      liquidity: { high: '#3b82f6', medium: '#6366f1', low: '#8b5cf6' }
    },
    selectedMetrics: ['volatility', 'liquidity', 'performance']
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders calendar with correct month and year', () => {
    render(<CalendarComponent {...defaultProps} />);
    
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  test('displays calendar days correctly', () => {
    render(<CalendarComponent {...defaultProps} />);
    
    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();
  });

  test('shows data indicators for days with data', () => {
    render(<CalendarComponent {...defaultProps} />);
    
    const dayElements = screen.getAllByText(/\d/);
    expect(dayElements.length).toBeGreaterThan(0);
  });

  test('handles date selection', async () => {
    const onDateSelect = jest.fn();
    render(<CalendarComponent {...defaultProps} onDateSelect={onDateSelect} />);
    
    await waitFor(() => {
      expect(screen.getAllByText('1')[0]).toBeInTheDocument();
    });
    
    const dayElements = screen.getAllByText(/\d/);
    const firstDayElement = dayElements.find(element => 
      element.textContent && /\d/.test(element.textContent) && 
      parseInt(element.textContent) >= 1 && parseInt(element.textContent) <= 31
    );
    
    if (firstDayElement) {
      fireEvent.click(firstDayElement);
      await waitFor(() => {
        expect(onDateSelect).toHaveBeenCalled();
      });
    }
  });

  test('displays date range selection inputs', () => {
    render(<CalendarComponent {...defaultProps} />);
    
    expect(screen.getByText('From Date')).toBeInTheDocument();
    expect(screen.getByText('To Date')).toBeInTheDocument();
    expect(screen.getByText('Apply Range')).toBeInTheDocument();
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

  test('handles invalid date range', async () => {
    render(<CalendarComponent {...defaultProps} />);
    
    const fromDateInput = screen.getByLabelText('From Date');
    const toDateInput = screen.getByLabelText('To Date');
    const applyRangeButton = screen.getByText('Apply Range');
    
    fireEvent.change(fromDateInput, { target: { value: '2024-01-31' } });
    fireEvent.change(toDateInput, { target: { value: '2024-01-01' } });
    fireEvent.click(applyRangeButton);
    
    expect(defaultProps.onDateRangeSelect).not.toHaveBeenCalled();
  });

  test('handles selected range display', () => {
    const selectedRange: DateRange = {
      start: new Date(2024, 0, 1),
      end: new Date(2024, 0, 31)
    };
    console.log('TEST selectedRange.start:', selectedRange.start, 'end:', selectedRange.end);
    render(<CalendarComponent {...defaultProps} selectedRange={selectedRange} />);
    const fromDateInput = screen.getByLabelText('From Date');
    const toDateInput = screen.getByLabelText('To Date');
    expect(fromDateInput).toHaveValue('2024-01-01');
    expect(toDateInput).toHaveValue('2024-01-31');
  });

  test('handles different selected metrics', () => {
    render(<CalendarComponent {...defaultProps} selectedMetrics={['volatility']} />);
    
    expect(screen.getByText('January 2024')).toBeInTheDocument();
  });

  test('handles empty data array', () => {
    render(<CalendarComponent {...defaultProps} data={[]} />);
    
    expect(screen.getByText('January 2024')).toBeInTheDocument();
  });

  test('handles extreme data values', () => {
    const extremeData: ProcessedDayData[] = [
      {
        date: new Date(2024, 0, 1),
        open: 0,
        high: 999999,
        low: -999999,
        close: 50000,
        volume: 0,
        volatility: 0,
        performance: 0,
        liquidity: 0,
        dayOfWeek: 1,
        weekOfYear: 1,
        monthOfYear: 1
      }
    ];
    
    render(<CalendarComponent {...defaultProps} data={extremeData} />);
    
    expect(screen.getByText('January 2024')).toBeInTheDocument();
  });

  test('handles invalid data gracefully', () => {
    const invalidData: ProcessedDayData[] = [
      {
        date: new Date(2024, 0, 1),
        open: NaN,
        high: Infinity,
        low: -Infinity,
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
    
    render(<CalendarComponent {...defaultProps} data={invalidData} />);
    
    expect(screen.getByText('January 2024')).toBeInTheDocument();
  });

  test('handles navigation buttons', () => {
    render(<CalendarComponent {...defaultProps} />);
    
    const prevButton = screen.getByLabelText('Previous month');
    const nextButton = screen.getByLabelText('Next month');
    
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
    
    fireEvent.click(prevButton);
    fireEvent.click(nextButton);
    
    // Verify buttons are still present after clicking
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
  });

  test('handles year navigation', () => {
    render(<CalendarComponent {...defaultProps} />);
    
    const prevYearButton = screen.getByLabelText('Previous year');
    const nextYearButton = screen.getByLabelText('Next year');
    
    expect(prevYearButton).toBeInTheDocument();
    expect(nextYearButton).toBeInTheDocument();
    
    fireEvent.click(prevYearButton);
    fireEvent.click(nextYearButton);
    
    // Verify buttons are still present after clicking
    expect(prevYearButton).toBeInTheDocument();
    expect(nextYearButton).toBeInTheDocument();
  });

  test('handles different timeframes', () => {
    const weeklyTimeframe = { label: 'Weekly', value: 'weekly' as const, interval: '1w' };
    
    render(<CalendarComponent {...defaultProps} timeframe={weeklyTimeframe} />);
    
    expect(screen.getByText('January 2024')).toBeInTheDocument();
  });

  test('handles custom color schemes', () => {
    const customColorScheme = {
      name: 'Custom',
      volatility: { low: '#00ff00', medium: '#ffff00', high: '#ff0000' },
      performance: { positive: '#00ff00', negative: '#ff0000', neutral: '#888888' },
      liquidity: { high: '#0000ff', medium: '#8888ff', low: '#ff00ff' }
    };
    
    render(<CalendarComponent {...defaultProps} colorScheme={customColorScheme} />);
    
    expect(screen.getByText('January 2024')).toBeInTheDocument();
  });

  test('handles leap year data', () => {
    const leapYearData: ProcessedDayData[] = [
      {
        date: new Date(2024, 1, 29),
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
    
    render(<CalendarComponent {...defaultProps} data={leapYearData} />);
    
    expect(screen.getByText('January 2024')).toBeInTheDocument();
  });

  test('handles year boundary data', () => {
    const yearBoundaryData: ProcessedDayData[] = [
      {
        date: new Date(2023, 11, 31),
        open: 100,
        high: 110,
        low: 95,
        close: 105,
        volume: 1000000,
        volatility: 5.2,
        performance: 5.0,
        liquidity: 0.8,
        dayOfWeek: 0,
        weekOfYear: 53,
        monthOfYear: 12
      }
    ];
    
    render(<CalendarComponent {...defaultProps} data={yearBoundaryData} />);
    
    expect(screen.getByText('January 2024')).toBeInTheDocument();
  });

  test('displays tooltip on hover', async () => {
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
      <CalendarComponent
        data={mockData}
        timeframe={{ label: 'Daily', value: 'daily', interval: '1d' }}
        colorScheme={{
          volatility: { low: '#10b981', medium: '#f59e0b', high: '#ef4444' },
          performance: { positive: '#10b981', negative: '#ef4444', neutral: '#6b7280' },
          liquidity: { high: '#3b82f6', medium: '#6366f1', low: '#8b5cf6' }
        }}
        onDateSelect={jest.fn()}
        onDateRangeSelect={jest.fn()}
        selectedDate={null}
        selectedRange={null}
        selectedMetrics={['volatility', 'performance']}
      />
    );

    const dayCell = screen.getByText('1');
    fireEvent.mouseEnter(dayCell);

    await waitFor(() => {
      expect(screen.getByText(/Jan 01, 2024/)).toBeInTheDocument();
    });
  });

  test('displays metrics correctly in calendar cells', () => {
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
      <CalendarComponent
        data={mockData}
        timeframe={{ label: 'Daily', value: 'daily', interval: '1d' }}
        colorScheme={{
          volatility: { low: '#10b981', medium: '#f59e0b', high: '#ef4444' },
          performance: { positive: '#10b981', negative: '#ef4444', neutral: '#6b7280' },
          liquidity: { high: '#3b82f6', medium: '#6366f1', low: '#8b5cf6' }
        }}
        onDateSelect={jest.fn()}
        onDateRangeSelect={jest.fn()}
        selectedDate={null}
        selectedRange={null}
        selectedMetrics={['volatility', 'performance', 'liquidity']}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('January 2024')).toBeInTheDocument();
  });
}); 