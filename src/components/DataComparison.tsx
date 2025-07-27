'use client';

import React, { useState, useEffect } from 'react';
import type { DataComparison, ProcessedDayData, DateRange } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plus, X, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';

interface DataComparisonProps {
  comparisons: DataComparison[];
  marketData: ProcessedDayData[];
  comparisonData: Map<string, ProcessedDayData[]>;
  symbols: string[];
  onComparisonCreate: (comparison: Omit<DataComparison, 'id' | 'createdAt'>) => void;
  onComparisonDelete: (comparisonId: string) => void;
}

const DataComparison: React.FC<DataComparisonProps> = ({
  comparisons,
  marketData,
  comparisonData,
  symbols,
  onComparisonCreate,
  onComparisonDelete
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newComparison, setNewComparison] = useState({
    name: '',
    datasets: [
      {
        symbol: 'BTCUSDT',
        timeframe: '1d',
        dateRange: {
          start: new Date(0), 
          end: new Date(0)    
        },
        color: '#3b82f6'
      }
    ]
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const today = new Date();
    
    setNewComparison(prev => ({
      ...prev,
      datasets: prev.datasets.map(dataset => ({
        ...dataset,
        dateRange: {
          start: thirtyDaysAgo,
          end: today
        }
      }))
    }));
  }, []);

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

  const addDataset = () => {
    const newColor = colors[newComparison.datasets.length % colors.length];
    setNewComparison({
      ...newComparison,
      datasets: [
        ...newComparison.datasets,
        {
          symbol: 'BTCUSDT',
          timeframe: '1d',
          dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            end: new Date()
          },
          color: newColor
        }
      ]
    });
  };

  const removeDataset = (index: number) => {
    setNewComparison({
      ...newComparison,
      datasets: newComparison.datasets.filter((_, i) => i !== index)
    });
  };

  const updateDataset = (index: number, field: string, value: string | DateRange) => {
    const updatedDatasets = [...newComparison.datasets];
    updatedDatasets[index] = { ...updatedDatasets[index], [field]: value };
    setNewComparison({ ...newComparison, datasets: updatedDatasets });
  };

  const handleCreateComparison = async () => {
    if (!newComparison.name.trim()) {
      alert('Please enter a comparison name');
      return;
    }

    setIsLoading(true);
    try {
      await onComparisonCreate(newComparison);
      setShowCreateForm(false);
      setNewComparison({
        name: '',
        datasets: [
          {
            symbol: 'BTCUSDT',
            timeframe: '1d',
            dateRange: {
              start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              end: new Date()
            },
            color: '#3b82f6'
          }
        ]
      });
    } catch (error) {
      console.error('Error creating comparison:', error);
      alert('Failed to create comparison. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getComparisonData = (comparison: DataComparison) => {
    const chartData: Record<string, string | number>[] = [];
    

    const datasetDataMap = new Map<string, ProcessedDayData[]>();
    
    comparison.datasets.forEach((dataset) => {
      const datasetKey = `${dataset.symbol}_${dataset.timeframe}`;
      

      let datasetData = comparisonData.get(datasetKey);
      
      if (!datasetData) {

        datasetData = marketData.filter(d => 
          d.date >= dataset.dateRange.start && 
          d.date <= dataset.dateRange.end
        );
      } else {

        datasetData = datasetData.filter(d => 
          d.date >= dataset.dateRange.start && 
          d.date <= dataset.dateRange.end
        );
      }
      
      datasetDataMap.set(datasetKey, datasetData);
    });


    const allDates = new Set<string>();
    datasetDataMap.forEach((data) => {
      data.forEach(item => {
        allDates.add(format(item.date, 'MMM dd'));
      });
    });


    const sortedDates = Array.from(allDates).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );


    sortedDates.forEach(dateStr => {
      const chartDataPoint: Record<string, string | number> = { date: dateStr };
      
      comparison.datasets.forEach((dataset) => {
        const datasetKey = `${dataset.symbol}_${dataset.timeframe}`;
        const datasetData = datasetDataMap.get(datasetKey) || [];
        

        const dateData = datasetData.find(d => format(d.date, 'MMM dd') === dateStr);
        
        if (dateData) {
          chartDataPoint[`${dataset.symbol}_volatility`] = dateData.volatility;
          chartDataPoint[`${dataset.symbol}_performance`] = dateData.performance;
          chartDataPoint[`${dataset.symbol}_volume`] = dateData.volume >= 1000000 
            ? (dateData.volume / 1000000)
            : dateData.volume >= 1000
            ? (dateData.volume / 1000)
            : dateData.volume;
        } else {

          chartDataPoint[`${dataset.symbol}_volatility`] = 0;
          chartDataPoint[`${dataset.symbol}_performance`] = 0;
          chartDataPoint[`${dataset.symbol}_volume`] = 0;
        }
      });
      
      chartData.push(chartDataPoint);
    });

    return chartData;
  };

  const renderComparisonChart = (comparison: DataComparison) => {
    const data = getComparisonData(comparison);
    // Custom legend with liquidity pattern
    const renderCustomLegend = () => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
        {comparison.datasets.map((dataset, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="18" height="10">
              <rect x="0" y="2" width="18" height="6" fill={dataset.color} />
              {/* Liquidity pattern overlay: SVG dots */}
              <g>
                {[...Array(6)].map((_, i) => (
                  <circle key={i} cx={3 + i * 3} cy={5} r={1} fill="#fff" opacity={0.7} />
                ))}
              </g>
            </svg>
            <span style={{ color: dataset.color }}>{dataset.symbol} (liquidity)</span>
          </div>
        ))}
      </div>
    );
    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 32, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend content={renderCustomLegend} />
          {comparison.datasets.map((dataset, index) => (
            <Line
              key={`${dataset.symbol}_${dataset.timeframe}_${index}_liquidity`}
              type="monotone"
              dataKey={`${dataset.symbol}_liquidity`}
              stroke={dataset.color}
              strokeWidth={2}
              name={`${dataset.symbol} Liquidity`}
              dot={{
                r: 5,
                stroke: dataset.color,
                strokeWidth: 2,
                fill: '#fff',
                // SVG dots overlay for marker
                // Not natively supported, but you can use a custom dot renderer if needed
              }}
            />
          ))}
          {comparison.datasets.map((dataset, index) => (
            <Line
              key={`${dataset.symbol}_${dataset.timeframe}_${index}_volatility`}
              type="monotone"
              dataKey={`${dataset.symbol}_volatility`}
              stroke={dataset.color}
              strokeWidth={2}
              name={`${dataset.symbol} Volatility`}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Data Comparison</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Compare multiple datasets side by side
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Comparison</span>
        </button>
      </div>

      {/* Create Comparison Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Comparison</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Comparison Name
            </label>
            <input
              type="text"
              value={newComparison.name}
              onChange={(e) => setNewComparison({ ...newComparison, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Enter comparison name"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Datasets</h4>
              <button
                onClick={addDataset}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-3 w-3" />
                <span>Add Dataset</span>
              </button>
            </div>

            {newComparison.datasets.map((dataset, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-white">Dataset {index + 1}</h4>
                  <button
                    onClick={() => removeDataset(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Symbol
                    </label>
                    <select
                      value={dataset.symbol}
                      onChange={(e) => updateDataset(index, 'symbol', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {symbols.map(symbol => (
                        <option key={symbol} value={symbol}>{symbol}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Timeframe
                    </label>
                    <select
                      value={dataset.timeframe}
                      onChange={(e) => updateDataset(index, 'timeframe', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="1d">Daily</option>
                      <option value="1w">Weekly</option>
                      <option value="1M">Monthly</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={format(dataset.dateRange.start, 'yyyy-MM-dd')}
                      onChange={(e) => updateDataset(index, 'dateRange', {
                        ...dataset.dateRange,
                        start: new Date(e.target.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={format(dataset.dateRange.end, 'yyyy-MM-dd')}
                      onChange={(e) => updateDataset(index, 'dateRange', {
                        ...dataset.dateRange,
                        end: new Date(e.target.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Color
                  </label>
                  <div className="flex space-x-2">
                    {colors.map(color => (
                      <button
                        key={color}
                        onClick={() => updateDataset(index, 'color', color)}
                        className={`w-8 h-8 rounded-full border-2 ${
                          dataset.color === color ? 'border-gray-900 dark:border-white' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Data availability indicator */}
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    comparisonData.has(`${dataset.symbol}_${dataset.timeframe}`) 
                      ? 'bg-green-500' 
                      : 'bg-gray-400'
                  }`} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {comparisonData.has(`${dataset.symbol}_${dataset.timeframe}`) 
                      ? 'Data available' 
                      : 'Data will be fetched on creation'
                    }
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateComparison}
              disabled={!newComparison.name || newComparison.datasets.length === 0 || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Comparison'}
            </button>
          </div>
        </div>
      )}

      {/* Comparisons List */}
      <div className="space-y-6">
        {comparisons.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No comparisons created</p>
            <p className="text-sm">Create your first comparison to get started</p>
          </div>
        ) : (
          comparisons.map((comparison) => (
            <div key={comparison.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {comparison.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {comparison.datasets.length} datasets • Created {comparison.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => onComparisonDelete(comparison.id)}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Datasets</h4>
                <div className="flex flex-wrap gap-2">
                  {comparison.datasets.map((dataset, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm"
                      style={{ backgroundColor: dataset.color + '20', color: dataset.color }}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: dataset.color }}
                      />
                      <span>{dataset.symbol}</span>
                      <span className="text-xs opacity-75">({dataset.timeframe})</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-80">
                {renderComparisonChart(comparison)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DataComparison; 