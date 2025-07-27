'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ProcessedDayData, Timeframe, ColorScheme, DateRange } from '@/types';
import { startOfMonth, endOfMonth, format, addMonths, subMonths, addYears, subYears, addDays, subDays, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Props interface for the CalendarComponent
 * Defines all the data and callbacks needed for calendar functionality
 */
interface CalendarProps {
  data: ProcessedDayData[];                    // Market data for each day
  timeframe: Timeframe;                        // Current timeframe (daily, weekly, monthly)
  colorScheme: ColorScheme;                    // Color scheme for volatility visualization
  onDateSelect: (date: Date) => void;         // Callback when a single date is selected
  onDateRangeSelect: (range: DateRange) => void; // Callback when a date range is selected
  selectedDate: Date | null;                   // Currently selected single date
  selectedRange: DateRange | null;             // Currently selected date range
  selectedMetrics: string[];                   // Metrics to display (volatility, performance, etc.)
  onDashboardClose?: () => void;               // Optional callback when dashboard is closed
}

/**
 * Interactive Calendar Component
 * 
 * Displays market data in a calendar format with color-coded volatility indicators.
 * Supports single date selection, date range selection, and keyboard navigation.
 * Each day cell shows volatility through background color and can display additional metrics.
 */
const CalendarComponent: React.FC<CalendarProps> = ({
  data,
  timeframe,
  colorScheme,
  onDateSelect,
  onDateRangeSelect,
  selectedDate,
  selectedRange,
  selectedMetrics,
  onDashboardClose,
}) => {
  const [displayedDate, setDisplayedDate] = useState<Date | null>(null);
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Date range input state
  const [fromDate, setFromDate] = useState<string>('');  // Start date for range selection
  const [toDate, setToDate] = useState<string>('');      // End date for range selection
  
  // DOM reference for accessibility
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Initialize calendar with current date
  useEffect(() => {
    const today = new Date();
    setDisplayedDate(today);
    setFocusedDate(selectedDate || today);
  }, [selectedDate]);
  
  // Update date range inputs when selectedRange changes
  useEffect(() => {
    if (!selectedRange) {
      setFromDate('');
      setToDate('');
    } else {
      setFromDate(format(selectedRange.start, 'yyyy-MM-dd'));
      setToDate(format(selectedRange.end, 'yyyy-MM-dd'));
    }
  }, [selectedRange]);
  
  // Generate array of dates for the current month
  const start = startOfMonth(displayedDate || new Date());
  const end = endOfMonth(displayedDate || new Date());
  const days: Date[] = [];
  let currentDate = new Date(start);
  while (currentDate <= end) {
    days.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  /**
   * Get color for volatility level
   * @param volatility - Volatility value (0-100)
   * @returns CSS color string based on volatility level and color scheme
   */
  const getColorFromVolatility = (volatility: number) => {
    if (typeof volatility !== 'number' || isNaN(volatility)) return '#e5e7eb'; // fallback gray
    if (volatility < 0.5) return colorScheme.volatility.low;      // Low volatility - green
    if (volatility < 1.5) return colorScheme.volatility.medium;   // Medium volatility - orange
    return colorScheme.volatility.high;                            // High volatility - red
  };

  /**
   * Get text color that provides good contrast against volatility background
   * @param volatility - Volatility value
   * @returns CSS text color class
   */
  const getTextColorForVolatility = (volatility: number) => {
    if (volatility >= 1.5) return 'text-black dark:text-black';      // Black text on high volatility (red)
    if (volatility >= 0.5) return 'text-gray-900 dark:text-gray-900'; // Dark text on medium volatility (orange)
    return 'text-white dark:text-white';                              // White text on low volatility (green)
  };

  /**
   * Navigate to today's date
   */
  const handleTodayClick = () => {
    const today = new Date();
    setDisplayedDate(today);
    setFocusedDate(today);
  };

  /**
   * Handle single date selection
   * @param date - Selected date
   */
  const handleDateClick = (date: Date) => {
    setFocusedDate(date);
    onDateSelect(date);
  };

  /**
   * Handle keyboard navigation for accessibility
   * @param event - Keyboard event
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!focusedDate) return;

    let newDate = focusedDate;
    
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        newDate = subDays(focusedDate, 7);  // Move up one week
        break;
      case 'ArrowDown':
        event.preventDefault();
        newDate = addDays(focusedDate, 7);   // Move down one week
        break;
      case 'ArrowLeft':
        event.preventDefault();
        newDate = subDays(focusedDate, 1);   // Move left one day
        break;
      case 'ArrowRight':
        event.preventDefault();
        newDate = addDays(focusedDate, 1);   // Move right one day
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleDateClick(focusedDate);        // Select focused date
        break;
      case 'Home':
        event.preventDefault();
        newDate = startOfMonth(displayedDate || new Date()); // Go to first day of month
        break;
      case 'End':
        event.preventDefault();
        newDate = endOfMonth(displayedDate || new Date());   // Go to last day of month
        break;
      case 'PageUp':
        event.preventDefault();
        newDate = subMonths(focusedDate, 1); // Previous month
        setDisplayedDate(newDate);
        break;
      case 'PageDown':
        event.preventDefault();
        newDate = addMonths(focusedDate, 1); // Next month
        setDisplayedDate(newDate);
        break;
    }

    if (newDate !== focusedDate) {
      setFocusedDate(newDate);
    }
  };

  /**
   * Navigate to previous or next month
   * @param direction - 'prev' or 'next'
   */
  const navigateMonth = (direction: 'prev' | 'next') => {
    if (!displayedDate) return;
    
    const newDate = direction === 'prev' 
      ? subMonths(displayedDate, 1) 
      : addMonths(displayedDate, 1);
    
    setDisplayedDate(newDate);
  };

  /**
   * Navigate to previous or next year
   * @param direction - 'prev' or 'next'
   */
  const navigateYear = (direction: 'prev' | 'next') => {
    if (!displayedDate) return;
    
    const newDate = direction === 'prev' 
      ? subYears(displayedDate, 1) 
      : addYears(displayedDate, 1);
    
    setDisplayedDate(newDate);
  };

  /**
   * Check if a date is today
   * @param day - Date to check
   * @returns true if the date is today
   */
  const isTodayDate = (day: Date) => {
    const today = new Date();
    return isSameMonth(day, today) && day.getDate() === today.getDate();
  };

  /**
   * Validates and submits the selected date range
   */
  const handleRangeSubmit = () => {
    if (!fromDate || !toDate) {
      return;
    }
    
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

  /**
   * Generate tooltip content for a day with market data
   * @param dayData - Market data for the day
   * @returns Formatted tooltip content
   */
  const getTooltipContent = (dayData: ProcessedDayData) => {
    const dateStr = format(dayData.date, 'MMM dd, yyyy');
    const volatilityStr = `Volatility: ${dayData.volatility.toFixed(2)}%`;
    const performanceStr = `Performance: ${dayData.performance.toFixed(2)}%`;
    const liquidityStr = `Liquidity: ${dayData.liquidity.toFixed(2)}`;
    
    return `${dateStr}\n${volatilityStr}\n${performanceStr}\n${liquidityStr}`;
  };

  const handleMouseEnter = (day: Date, event: React.MouseEvent) => {
    setHoveredDate(day);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setHoveredDate(null);
    setShowTooltip(false);
  };

  return (
    <div 
      ref={containerRef}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="grid"
      aria-label="Calendar"
    >
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateYear('prev')}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Previous year"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {displayedDate ? format(displayedDate, 'MMMM yyyy') : 'Calendar'}
          </h2>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigateYear('next')}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Next year"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
        <button
          onClick={handleTodayClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Today
        </button>
      </div>

      {/* Date Range Selection */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Date Range Selection</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="from-date" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">From Date</label>
            <input 
              id="from-date"
              type="date" 
              value={fromDate} 
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="to-date" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">To Date</label>
            <input 
              id="to-date"
              type="date" 
              value={toDate} 
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <div className="flex items-end space-x-2">
            <button
              onClick={handleRangeSubmit}
              disabled={!fromDate || !toDate}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Range
            </button>
            <button
              onClick={() => {
                setFromDate('');
                setToDate('');
                if (onDateRangeSelect) {
                  onDateRangeSelect({ 
                    start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), 
                    end: new Date() 
                  });
                }
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
            >
              Clear
            </button>
          </div>
        </div>
        {selectedRange && (
          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900 rounded-md">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              Selected Range: {format(selectedRange.start, 'MMM dd, yyyy')} - {format(selectedRange.end, 'MMM dd, yyyy')}
            </p>
          </div>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
          >
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map((day) => {
          const dayData = data.find(d => {
            const dataDate = new Date(d.date);
            return dataDate.getDate() === day.getDate() && 
                   dataDate.getMonth() === day.getMonth() && 
                   dataDate.getFullYear() === day.getFullYear();
          });
          
          const isSelected = selectedDate && 
            day.getDate() === selectedDate.getDate() && 
            day.getMonth() === selectedDate.getMonth() && 
            day.getFullYear() === selectedDate.getFullYear();
          
          const isInRange = selectedRange && 
            day >= selectedRange.start && 
            day <= selectedRange.end;
          
          const isRangeEnd = selectedRange && 
            day.getDate() === selectedRange.end.getDate() && 
            day.getMonth() === selectedRange.end.getMonth() && 
            day.getFullYear() === selectedRange.end.getFullYear();
          
          const isFocused = focusedDate && 
            day.getDate() === focusedDate.getDate() && 
            day.getMonth() === focusedDate.getMonth() && 
            day.getFullYear() === focusedDate.getFullYear();
          
          const isToday = isTodayDate(day);
          const isHovered = hoveredDate && 
            day.getDate() === hoveredDate.getDate() && 
            day.getMonth() === hoveredDate.getMonth() && 
            day.getFullYear() === hoveredDate.getFullYear();

          return (
            <div
              key={day.toISOString()}
              onClick={() => handleDateClick(day)}
              onMouseEnter={(e) => handleMouseEnter(day, e)}
              onMouseLeave={handleMouseLeave}
              className={`
                relative p-2 text-center text-sm cursor-pointer transition-all duration-200 rounded-md
                ${dayData ? 'font-medium' : 'text-gray-400 dark:text-gray-500'}
                ${isSelected ? 'ring-2 ring-blue-500' : ''}
                ${isInRange ? 'ring-2 ring-blue-300' : ''}
                ${isRangeEnd && selectedRange ? 'ring-4 ring-blue-400' : ''}
                ${isFocused ? 'ring-2 ring-yellow-300' : ''}
                ${isToday ? 'ring-2 ring-orange-300' : ''}
                ${!dayData ? 'bg-gray-50 dark:bg-gray-900 opacity-60 border border-gray-300 dark:border-gray-700' : 'border-0'}
                ${isHovered ? 'scale-105 shadow-lg' : ''}
              `}
              style={{
                backgroundColor: dayData ? getColorFromVolatility(dayData.volatility) : undefined,
                border: dayData ? `2px solid ${getColorFromVolatility(dayData.volatility)}` : undefined,
                '--volatility-color': dayData ? getColorFromVolatility(dayData.volatility) : 'transparent',
              } as React.CSSProperties & { '--volatility-color': string }}
              role="gridcell"
              aria-selected={isSelected}
              tabIndex={isFocused ? 0 : -1}
            >
              {/* Day number in top-left */}
              <div className="absolute top-1 left-1 text-xs font-bold">
                <span className={`
                  ${dayData ? getTextColorForVolatility(dayData.volatility) : 'text-gray-400 dark:text-gray-500'}
                `}>
                  {day.getDate()}
                </span>
              </div>
              
              {/* Trend indicator in top-right */}
              {dayData && selectedMetrics.includes('performance') && (
                <div className="absolute top-1 right-1">
                  <div className={`p-1 rounded ${
                    dayData.performance > 0 
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                  }`}>
                    {dayData.performance > 0 ? (
                      <TrendingUp className="w-3 h-3 text-white" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
              )}
              
              {/* Market data content */}
              {dayData && (
                <div className="mt-4 space-y-0.5 text-xs">
                  {/* Volatility line */}
                  {selectedMetrics.includes('volatility') && (
                    <div className={`${getTextColorForVolatility(dayData.volatility)} font-medium`}>
                      Vol: {dayData.volatility.toFixed(1)}%
                    </div>
                  )}
                  
                  {/* Volume line */}
                  {selectedMetrics.includes('liquidity') && (
                    <div className={`${getTextColorForVolatility(dayData.volatility)}`}>
                      {dayData.volume > 1000000 
                        ? `${(dayData.volume / 1000000).toFixed(1)}M`
                        : `${(dayData.volume / 1000).toFixed(0)}K`
                      }
                    </div>
                  )}
                  
                  {/* Performance line */}
                  {selectedMetrics.includes('performance') && (
                    <div className="font-medium text-black dark:text-white">
                      {dayData.performance > 0 ? '+' : ''}{dayData.performance.toFixed(2)}%
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showTooltip && hoveredDate && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg p-2 shadow-lg pointer-events-none"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          {(() => {
            const dayData = data.find(d => 
              d.date.getDate() === hoveredDate.getDate() && 
              d.date.getMonth() === hoveredDate.getMonth() && 
              d.date.getFullYear() === hoveredDate.getFullYear()
            );
            return dayData ? getTooltipContent(dayData) : format(hoveredDate, 'MMM dd, yyyy');
          })()}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Volatility Legend</h3>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded border-2"
              style={{ backgroundColor: colorScheme.volatility.low, borderColor: colorScheme.volatility.low }}
            />
            <span className="text-gray-600 dark:text-gray-400">Low (&lt;0.5%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded border-2"
              style={{ backgroundColor: colorScheme.volatility.medium, borderColor: colorScheme.volatility.medium }}
            />
            <span className="text-gray-600 dark:text-gray-400">Medium (0.5-1.5%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded border-2"
              style={{ backgroundColor: colorScheme.volatility.high, borderColor: colorScheme.volatility.high }}
            />
            <span className="text-gray-600 dark:text-gray-400">High (&gt;1.5%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarComponent;

