'use client';

import React from 'react';
import { ColorScheme } from '@/types';
import { Palette, X } from 'lucide-react';

interface ColorSchemeSelectorProps {
  colorSchemes: ColorScheme[];
  currentScheme: ColorScheme;
  onSchemeChange: (scheme: ColorScheme) => void;
  onClose?: () => void;
}

const ColorSchemeSelector: React.FC<ColorSchemeSelectorProps> = ({
  colorSchemes,
  currentScheme,
  onSchemeChange,
  onClose,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 relative">
      {/* Header with close button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Palette className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Color Schemes</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        {colorSchemes.map((scheme) => (
          <div
            key={scheme.name}
            onClick={() => onSchemeChange(scheme)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
              currentScheme.name === scheme.name
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {scheme.name}
              </span>
              {currentScheme.name === scheme.name && (
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              )}
            </div>
            
            {/* Color Preview */}
            <div className="space-y-2">
              {/* Volatility Colors */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600 dark:text-gray-400 w-20">Volatility:</span>
                <div className="flex space-x-1">
                  <div 
                    className="w-5 h-5 rounded border border-gray-300"
                    style={{ backgroundColor: scheme.volatility.low }}
                    title="Low"
                  ></div>
                  <div 
                    className="w-5 h-5 rounded border border-gray-300"
                    style={{ backgroundColor: scheme.volatility.medium }}
                    title="Medium"
                  ></div>
                  <div 
                    className="w-5 h-5 rounded border border-gray-300"
                    style={{ backgroundColor: scheme.volatility.high }}
                    title="High"
                  ></div>
                </div>
              </div>
              
              {/* Performance Colors */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600 dark:text-gray-400 w-20">Performance:</span>
                <div className="flex space-x-1">
                  <div 
                    className="w-5 h-5 rounded border border-gray-300"
                    style={{ backgroundColor: scheme.performance.positive }}
                    title="Positive"
                  ></div>
                  <div 
                    className="w-5 h-5 rounded border border-gray-300"
                    style={{ backgroundColor: scheme.performance.neutral }}
                    title="Neutral"
                  ></div>
                  <div 
                    className="w-5 h-5 rounded border border-gray-300"
                    style={{ backgroundColor: scheme.performance.negative }}
                    title="Negative"
                  ></div>
                </div>
              </div>
              
              {/* Liquidity Colors */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600 dark:text-gray-400 w-20">Liquidity:</span>
                <div className="flex space-x-1">
                  <div 
                    className="w-5 h-5 rounded border border-gray-300"
                    style={{ backgroundColor: scheme.liquidity.high }}
                    title="High"
                  ></div>
                  <div 
                    className="w-5 h-5 rounded border border-gray-300"
                    style={{ backgroundColor: scheme.liquidity.medium }}
                    title="Medium"
                  ></div>
                  <div 
                    className="w-5 h-5 rounded border border-gray-300"
                    style={{ backgroundColor: scheme.liquidity.low }}
                    title="Low"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorSchemeSelector;
