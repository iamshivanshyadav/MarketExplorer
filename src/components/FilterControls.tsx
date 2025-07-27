'use client';

import React from 'react';
import { Timeframe, FilterOptions } from '@/types';
import { Search, Clock, TrendingUp } from 'lucide-react';

interface FilterControlsProps {
  symbols: string[];
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
  timeframes: Timeframe[];
  currentTimeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
  filterOptions: FilterOptions;
  onFilterChange: (options: FilterOptions) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  symbols,
  selectedSymbol,
  onSymbolChange,
  timeframes,
  currentTimeframe,
  onTimeframeChange,
  filterOptions,
  onFilterChange,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Symbol Selector */}
        <div className="space-y-2">
          <div className="flex items-center space-x-1 sm:space-x-2">
          <Search className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">Symbol</h3>
        </div>
        <select
          value={selectedSymbol}
          onChange={(e) => onSymbolChange(e.target.value)}
            className="w-full p-1.5 sm:p-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {symbols.map((symbol) => (
            <option key={symbol} value={symbol}>
              {symbol}
            </option>
          ))}
        </select>
      </div>

      {/* Timeframe Selector */}
        <div className="space-y-2">
          <div className="flex items-center space-x-1 sm:space-x-2">
          <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">Timeframe</h3>
        </div>
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe.value}
              onClick={() => onTimeframeChange(timeframe)}
                className={`w-full text-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                currentTimeframe.value === timeframe.value
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 shadow-md scale-105'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-102'
              }`}
            >
              {timeframe.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Toggle */}
        <div className="space-y-2">
          <div className="flex items-center space-x-1 sm:space-x-2">
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">Metrics</h3>
        </div>
          <div className="grid grid-cols-1 gap-1 sm:gap-2">
          {['volatility', 'liquidity', 'performance'].map((metric) => (
              <label key={metric} className="flex items-center space-x-1 sm:space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filterOptions.metrics.includes(metric)}
                onChange={(e) => {
                  const newMetrics = e.target.checked
                    ? [...filterOptions.metrics, metric]
                    : filterOptions.metrics.filter((m) => m !== metric);
                  onFilterChange({ ...filterOptions, metrics: newMetrics });
                }}
                className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 capitalize">
                {metric}
              </span>
            </label>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;
