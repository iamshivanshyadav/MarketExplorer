'use client';

import React, { useState } from 'react';
import { Alert, AlertSettings } from '@/types';
import { Bell, Plus, X, Settings, Volume2, VolumeX, Mail, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AlertSystemProps {
  alerts: Alert[];
  settings: AlertSettings;
  onAlertCreate: (alert: Omit<Alert, 'id' | 'createdAt'>) => void;
  onAlertDelete: (alertId: string) => void;
  onAlertToggle: (alertId: string) => void;
  onSettingsChange: (settings: AlertSettings) => void;
}

const AlertSystem: React.FC<AlertSystemProps> = ({
  alerts,
  settings,
  onAlertCreate,
  onAlertDelete,
  onAlertToggle,
  onSettingsChange
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newAlert, setNewAlert] = useState({
    type: 'volatility' as Alert['type'],
    condition: 'above' as Alert['condition'],
    threshold: 0,
    symbol: 'BTCUSDT',
    timeframe: '1d',
    message: ''
  });

  const handleCreateAlert = () => {
    const alert: Omit<Alert, 'id' | 'createdAt'> = {
      ...newAlert,
      isActive: true,
      triggeredAt: undefined,
      message: newAlert.message || `${newAlert.type} ${newAlert.condition} ${newAlert.threshold} for ${newAlert.symbol}`
    };
    onAlertCreate(alert);
    setShowCreateForm(false);
    setNewAlert({
      type: 'volatility',
      condition: 'above',
      threshold: 0,
      symbol: 'BTCUSDT',
      timeframe: '1d',
      message: ''
    });
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'volatility': return '📊';
      case 'performance': return '📈';
      case 'volume': return '📊';
      case 'price': return '💰';
      default: return '🔔';
    }
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'volatility': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'performance': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'volume': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'price': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Bell className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Alert System</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {alerts.filter(a => a.isActive).length} active alerts
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            title="Alert Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Alert</span>
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Alert Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.browserNotifications}
                    onChange={(e) => onSettingsChange({ ...settings, browserNotifications: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Browser Notifications</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.soundAlerts}
                    onChange={(e) => onSettingsChange({ ...settings, soundAlerts: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  {settings.soundAlerts ? <Volume2 className="h-4 w-4 text-gray-500" /> : <VolumeX className="h-4 w-4 text-gray-500" />}
                  <span className="text-sm text-gray-700 dark:text-gray-300">Sound Alerts</span>
                </label>
              </div>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.autoRefresh}
                    onChange={(e) => onSettingsChange({ ...settings, autoRefresh: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Auto Refresh</span>
                </label>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Refresh Interval (seconds)</label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={settings.refreshInterval}
                    onChange={(e) => onSettingsChange({ ...settings, refreshInterval: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Alert Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Alert</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Alert Type</label>
                <select
                  value={newAlert.type}
                  onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value as Alert['type'] })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="volatility">Volatility</option>
                  <option value="performance">Performance</option>
                  <option value="volume">Volume</option>
                  <option value="price">Price</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Condition</label>
                <select
                  value={newAlert.condition}
                  onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value as Alert['condition'] })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                  <option value="equals">Equals</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Threshold</label>
                <input
                  type="number"
                  step="0.01"
                  value={newAlert.threshold}
                  onChange={(e) => setNewAlert({ ...newAlert, threshold: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Symbol</label>
                <input
                  type="text"
                  value={newAlert.symbol}
                  onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAlert}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Alert
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No alerts configured</p>
            <p className="text-sm">Create your first alert to get started</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-4 rounded-lg border-2 transition-all ${
                alert.isActive
                  ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                  : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getAlertIcon(alert.type)}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAlertColor(alert.type)}`}>
                        {alert.type}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {alert.symbol} • {alert.timeframe}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Created {alert.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onAlertToggle(alert.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      alert.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {alert.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => onAlertDelete(alert.id)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertSystem; 