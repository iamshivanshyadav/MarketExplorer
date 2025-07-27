'use client';

import React, { useState } from 'react';
import { HistoricalPattern, PatternDetection, ProcessedDayData } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, Calendar, Activity, Target, Zap, Info, Award } from 'lucide-react';
import { format } from 'date-fns';

interface HistoricalPatternsProps {
  patterns: PatternDetection;
  marketData: ProcessedDayData[];
  onPatternSelect: (pattern: HistoricalPattern) => void;
}

const HistoricalPatterns: React.FC<HistoricalPatternsProps> = ({
  patterns,
  marketData,
  onPatternSelect
}) => {
  const [activeTab, setActiveTab] = useState<'seasonal' | 'cyclical' | 'anomalies' | 'trends'>('seasonal');
  const [selectedPattern, setSelectedPattern] = useState<HistoricalPattern | null>(null);

  const getPatternIcon = (type: HistoricalPattern['type']) => {
    switch (type) {
      case 'seasonal': return <Calendar className="h-4 w-4" />;
      case 'cyclical': return <Activity className="h-4 w-4" />;
      case 'anomaly': return <AlertTriangle className="h-4 w-4" />;
      case 'trend': return <TrendingUp className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getPatternColor = (type: HistoricalPattern['type']) => {
    switch (type) {
      case 'seasonal': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
      case 'cyclical': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'anomaly': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      case 'trend': return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPatternData = (pattern: HistoricalPattern) => {
    const startIndex = marketData.findIndex(d => d.date >= pattern.startDate);
    const endIndex = marketData.findIndex(d => d.date > pattern.endDate);
    const relevantData = marketData.slice(startIndex, endIndex > -1 ? endIndex : undefined);

    return relevantData.map(item => ({
      date: format(item.date, 'MMM dd'),
      volatility: item.volatility,
      performance: item.performance,
      volume: item.volume / 1000000,
      pattern: pattern.type
    }));
  };

  const renderPatternChart = (pattern: HistoricalPattern) => {
    const data = getPatternData(pattern);
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="volatility"
            stroke="#ef4444"
            strokeWidth={2}
            name="Volatility"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="performance"
            stroke="#10b981"
            strokeWidth={2}
            name="Performance"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const getActivePatterns = () => {
    switch (activeTab) {
      case 'seasonal': return patterns.seasonalPatterns;
      case 'cyclical': return patterns.cyclicalPatterns;
      case 'anomalies': return patterns.anomalies;
      case 'trends': return patterns.trends;
      default: return [];
    }
  };

  const activePatterns = getActivePatterns();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Target className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Historical Patterns</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Detected patterns and anomalies in market data
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {activePatterns.length} patterns found
          </span>
        </div>
      </div>

      {/* Pattern Type Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {[
          { key: 'seasonal', label: 'Seasonal', icon: Calendar, count: patterns.seasonalPatterns.length },
          { key: 'cyclical', label: 'Cyclical', icon: Activity, count: patterns.cyclicalPatterns.length },
          { key: 'anomalies', label: 'Anomalies', icon: AlertTriangle, count: patterns.anomalies.length },
          { key: 'trends', label: 'Trends', icon: TrendingUp, count: patterns.trends.length }
        ].map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as 'seasonal' | 'cyclical' | 'anomalies' | 'trends')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
            <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Patterns List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patterns List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Patterns
          </h3>
          
          {activePatterns.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No {activeTab} patterns detected</p>
              <p className="text-sm">Patterns will appear here as they are detected</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activePatterns.map((pattern) => (
                <div
                  key={pattern.id}
                  onClick={() => {
                    setSelectedPattern(pattern);
                    onPatternSelect(pattern);
                  }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedPattern?.id === pattern.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getPatternColor(pattern.type)}`}>
                        {getPatternIcon(pattern.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {pattern.description}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {format(pattern.startDate, 'MMM dd')} - {format(pattern.endDate, 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Award className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {pattern.confidence.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <Zap className="h-3 w-3 text-orange-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {(pattern.strength * 100).toFixed(0)}% strength
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pattern Metrics */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <div className="text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Volatility</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {pattern.metrics.volatility.toFixed(2)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Performance</div>
                      <div className={`text-sm font-medium ${
                        pattern.metrics.performance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {pattern.metrics.performance >= 0 ? '+' : ''}{pattern.metrics.performance.toFixed(2)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Volume</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {pattern.metrics.volume >= 1000000 
                          ? `${(pattern.metrics.volume / 1000000).toFixed(1)}M`
                          : pattern.metrics.volume >= 1000
                          ? `${(pattern.metrics.volume / 1000).toFixed(1)}K`
                          : pattern.metrics.volume.toFixed(2)
                        }
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pattern Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pattern Details</h3>
          
          {selectedPattern ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {selectedPattern.description}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {selectedPattern.confidence.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Strength:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {(selectedPattern.strength * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Frequency:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {selectedPattern.frequency} days
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {Math.ceil((selectedPattern.endDate.getTime() - selectedPattern.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-64">
                {renderPatternChart(selectedPattern)}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a pattern to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoricalPatterns; 