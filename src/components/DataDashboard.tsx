'use client';

import React, { useState, useEffect } from 'react';
import { ProcessedDayData, DateRange } from '@/types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { X, TrendingUp, TrendingDown, Activity, Volume2, Download } from 'lucide-react';
import { format } from 'date-fns';

const useResponsiveMargin = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return isMobile ? 
    { top: 5, right: 5, left: 20, bottom: 5 } : 
    { top: 5, right: 30, left: 20, bottom: 5 };
};

interface DataDashboardProps {
  data: ProcessedDayData[];
  selectedDate: Date | null;
  selectedRange: DateRange | null;
  symbol: string;
  onClose: () => void;
}

const DataDashboard: React.FC<DataDashboardProps> = ({
  data,
  selectedDate,
  selectedRange,
  symbol,
  onClose,
}) => {
  const responsiveMargin = useResponsiveMargin();

  const getFilteredData = () => {
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
  };

  const filteredData = getFilteredData();
  const currentData = filteredData[0] || data[data.length - 1];


  const getAggregatedMetrics = () => {
    if (!selectedRange || filteredData.length === 0) return null;

    const totalDays = filteredData.length;
    const avgVolatility = filteredData.reduce((sum, d) => sum + d.volatility, 0) / totalDays;
    const avgVolume = filteredData.reduce((sum, d) => sum + d.volume, 0) / totalDays;
    const totalPerformance = filteredData.reduce((sum, d) => sum + (d.performance || 0), 0);
    const avgPerformance = totalPerformance / totalDays;
    
    const maxPrice = Math.max(...filteredData.map(d => d.high));
    const minPrice = Math.min(...filteredData.map(d => d.low));
    const priceRange = maxPrice - minPrice;
    
    const positiveDays = filteredData.filter(d => (d.performance || 0) > 0).length;
    const negativeDays = filteredData.filter(d => (d.performance || 0) < 0).length;
    const winRate = (positiveDays / totalDays) * 100;

    return {
      avgVolatility,
      avgVolume,
      avgPerformance,
      totalPerformance,
      maxPrice,
      minPrice,
      priceRange,
      totalDays,
      positiveDays,
      negativeDays,
      winRate
    };
  };

  const aggregatedMetrics = getAggregatedMetrics();

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(value);

  const formatPercentage = (value: number) => 
    `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

  const formatAveragePrice = (value: number) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);

  const exportRangeData = () => {
    if (!filteredData.length) return;

    const headers = [
      'Date',
      'Open',
      'High', 
      'Low',
      'Close',
      'Volume',
      'Volatility',
      'Liquidity',
      'Performance'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => [
        item.date.toISOString().split('T')[0],
        item.open.toFixed(8),
        item.high.toFixed(8),
        item.low.toFixed(8),
        item.close.toFixed(8),
        item.volume.toFixed(2),
        item.volatility.toFixed(2),
        item.liquidity.toFixed(2),
        item.performance.toFixed(2)
      ].join(','))
    ].join('\n');

    const rangeName = selectedRange 
      ? `${format(selectedRange.start, 'yyyy-MM-dd')}_to_${format(selectedRange.end, 'yyyy-MM-dd')}`
      : selectedDate 
        ? format(selectedDate, 'yyyy-MM-dd')
        : 'data';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${symbol}_${rangeName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {symbol} Dashboard
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {selectedDate 
              ? `Data for ${format(selectedDate, 'MMM dd, yyyy')}`
              : selectedRange 
                ? `Data from ${format(selectedRange.start, 'MMM dd')} to ${format(selectedRange.end, 'MMM dd, yyyy')} (${filteredData.length} days)`
                : 'Last 30 days'
            }
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {filteredData.length > 0 && (
            <button
              onClick={exportRangeData}
              className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1 text-sm"
              title="Export selected data"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
        <button
          onClick={onClose}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedRange ? 'Avg Price' : 'Current Price'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedRange 
                  ? formatAveragePrice(filteredData.reduce((sum, d) => sum + d.close, 0) / filteredData.length)
                  : formatCurrency(currentData?.close || 0)
                }
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedRange ? 'Avg Performance' : 'Performance'}
              </p>
              <p className={`text-2xl font-bold ${
                (selectedRange ? (aggregatedMetrics?.avgPerformance || 0) : (currentData?.performance || 0)) >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {formatPercentage(selectedRange ? (aggregatedMetrics?.avgPerformance || 0) : (currentData?.performance || 0))}
              </p>
            </div>
            {(selectedRange ? (aggregatedMetrics?.avgPerformance || 0) : (currentData?.performance || 0)) >= 0 ? (
              <TrendingUp className="h-8 w-8 text-green-500" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-500" />
            )}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedRange ? 'Avg Volatility' : 'Volatility'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(selectedRange ? (aggregatedMetrics?.avgVolatility || 0) : (currentData?.volatility || 0)).toFixed(2)}%
              </p>
            </div>
            <Activity className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedRange ? 'Avg Volume' : 'Volume'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(selectedRange ? (aggregatedMetrics?.avgVolume || 0) : (currentData?.volume || 0)).toLocaleString()}
              </p>
            </div>
            <Volume2 className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Range-specific metrics */}
      {selectedRange && aggregatedMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Performance</p>
                <p className={`text-xl font-bold ${
                  aggregatedMetrics.totalPerformance >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {formatPercentage(aggregatedMetrics.totalPerformance)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Win Rate</p>
                <p className="text-xl font-bold text-green-500">
                  {aggregatedMetrics.winRate.toFixed(1)}%
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {aggregatedMetrics.positiveDays}/{aggregatedMetrics.totalDays} days
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Price Range</p>
                <p className="text-xl font-bold text-purple-500">
                  {formatCurrency(aggregatedMetrics.priceRange)}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  {formatCurrency(aggregatedMetrics.minPrice)} - {formatCurrency(aggregatedMetrics.maxPrice)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Chart */}
      {filteredData.length > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Price Movement
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredData} margin={responsiveMargin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(new Date(date), 'MM/dd')}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                formatter={(value: number) => [formatCurrency(value), 'Price']}
              />
              <Line 
                type="monotone" 
                dataKey="close" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Volume Chart */}
      {filteredData.length > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Trading Volume
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={filteredData} margin={responsiveMargin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(new Date(date), 'MM/dd')}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                formatter={(value: number) => [value.toLocaleString(), 'Volume']}
              />
              <Bar dataKey="volume" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detailed Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Detailed Metrics
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 text-gray-600 dark:text-gray-400">Date</th>
                <th className="text-right py-2 text-gray-600 dark:text-gray-400">Open</th>
                <th className="text-right py-2 text-gray-600 dark:text-gray-400">High</th>
                <th className="text-right py-2 text-gray-600 dark:text-gray-400">Low</th>
                <th className="text-right py-2 text-gray-600 dark:text-gray-400">Close</th>
                <th className="text-right py-2 text-gray-600 dark:text-gray-400">Volume</th>
                <th className="text-right py-2 text-gray-600 dark:text-gray-400">Volatility</th>
                <th className="text-right py-2 text-gray-600 dark:text-gray-400">Performance</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(0, 10).map((item, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-2 text-gray-900 dark:text-white">
                    {format(item.date, 'MMM dd, yyyy')}
                  </td>
                  <td className="text-right py-2 text-gray-900 dark:text-white">
                    {formatCurrency(item.open)}
                  </td>
                  <td className="text-right py-2 text-gray-900 dark:text-white">
                    {formatCurrency(item.high)}
                  </td>
                  <td className="text-right py-2 text-gray-900 dark:text-white">
                    {formatCurrency(item.low)}
                  </td>
                  <td className="text-right py-2 text-gray-900 dark:text-white">
                    {formatCurrency(item.close)}
                  </td>
                  <td className="text-right py-2 text-gray-900 dark:text-white">
                    {item.volume.toLocaleString()}
                  </td>
                  <td className="text-right py-2 text-gray-900 dark:text-white">
                    {item.volatility.toFixed(2)}%
                  </td>
                  <td className={`text-right py-2 font-medium ${
                    item.performance >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {formatPercentage(item.performance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataDashboard;
