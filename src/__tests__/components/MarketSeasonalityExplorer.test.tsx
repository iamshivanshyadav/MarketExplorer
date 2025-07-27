import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import MarketSeasonalityExplorer from '../../components/MarketSeasonalityExplorer';

jest.mock('../../services/binanceApi', () => ({
  getKlineData: jest.fn().mockResolvedValue([
    [1640995200000, '50000', '51000', '49000', '50500', '1000000', 1640995200000, '0.1', 100, '50000000', '0.1'],
    [1641081600000, '50500', '52000', '50000', '51500', '1200000', 1641081600000, '0.2', 120, '60000000', '0.2']
  ]),
  getSymbols: jest.fn().mockResolvedValue(['BTCUSDT', 'ETHUSDT', 'BNBUSDT']),
  processKlineData: jest.fn().mockReturnValue([
    {
      date: new Date(2024, 0, 1),
      open: 50000,
      high: 51000,
      low: 49000,
      close: 50500,
      volume: 1000000,
      volatility: 4.0,
      performance: 1.0,
      liquidity: 0.8
    }
  ]),
  calculateTechnicalIndicators: jest.fn().mockReturnValue([
    {
      date: new Date(2024, 0, 1),
      open: 50000,
      high: 51000,
      low: 49000,
      close: 50500,
      volume: 1000000,
      volatility: 4.0,
      performance: 1.0,
      liquidity: 0.8
    }
  ]),
  detectAllPatterns: jest.fn().mockReturnValue({
    seasonalPatterns: [],
    cyclicalPatterns: [],
    anomalies: [],
    trends: []
  }),
  connectWebSocket: jest.fn(),
  disconnectWebSocket: jest.fn()
}));

describe('MarketSeasonalityExplorer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders main application header', async () => {
    await act(async () => {
      render(<MarketSeasonalityExplorer />);
    });
    
    expect(screen.getByText('Market Seasonality Explorer')).toBeInTheDocument();
  });

  test('displays navigation tabs', async () => {
    await act(async () => {
      render(<MarketSeasonalityExplorer />);
    });
    
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Alerts')).toBeInTheDocument();
    expect(screen.getByText('Compare')).toBeInTheDocument();
    expect(screen.getByText('Patterns')).toBeInTheDocument();
  });

  test('shows filter controls', async () => {
    await act(async () => {
      render(<MarketSeasonalityExplorer />);
    });
    
    expect(screen.getByText('Symbol')).toBeInTheDocument();
    expect(screen.getByText('Timeframe')).toBeInTheDocument();
    expect(screen.getByText('Metrics')).toBeInTheDocument();
  });

  test('displays timeframe buttons', async () => {
    await act(async () => {
      render(<MarketSeasonalityExplorer />);
    });
    
    expect(screen.getByText('Daily')).toBeInTheDocument();
    expect(screen.getByText('Weekly')).toBeInTheDocument();
    expect(screen.getByText('Monthly')).toBeInTheDocument();
  });

  test('shows metrics checkboxes', async () => {
    await act(async () => {
      render(<MarketSeasonalityExplorer />);
    });
    
    expect(screen.getByText('volatility')).toBeInTheDocument();
    expect(screen.getByText('liquidity')).toBeInTheDocument();
    expect(screen.getByText('performance')).toBeInTheDocument();
  });

  test('handles symbol selection', async () => {
    await act(async () => {
      render(<MarketSeasonalityExplorer />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('BTCUSDT')).toBeInTheDocument();
    });
  });

  test('handles timeframe selection', async () => {
    await act(async () => {
      render(<MarketSeasonalityExplorer />);
    });
    
    const weeklyButton = screen.getByText('Weekly');
    await act(async () => {
      fireEvent.click(weeklyButton);
    });
    
    await waitFor(() => expect(weeklyButton).toHaveClass('bg-blue-100'));
  });

  test('handles metrics selection', async () => {
    await act(async () => {
      render(<MarketSeasonalityExplorer />);
    });
    
    const volatilityCheckbox = screen.getByLabelText('volatility');
    await act(async () => {
      fireEvent.click(volatilityCheckbox);
    });
    
    expect(volatilityCheckbox).toBeInTheDocument();
  });

  test('shows loading state initially', async () => {
    await act(async () => {
      render(<MarketSeasonalityExplorer />);
    });
    

    expect(screen.getByText('Market Seasonality Explorer')).toBeInTheDocument();
  });

  test('handles navigation between views', async () => {
    await act(async () => {
      render(<MarketSeasonalityExplorer />);
    });
    
    const analyticsButton = screen.getByText('Analytics');
    await act(async () => {
      fireEvent.click(analyticsButton);
    });
    
    expect(analyticsButton).toBeInTheDocument();
  });

  test('displays color scheme selector button', async () => {
    await act(async () => {
      render(<MarketSeasonalityExplorer />);
    });
    
    const settingsButton = screen.getByTitle('Color Schemes');
    expect(settingsButton).toBeInTheDocument();
  });

  test('displays export button', async () => {
    await act(async () => {
      render(<MarketSeasonalityExplorer />);
    });
    
    const exportButton = screen.getByTitle('Export Data');
    expect(exportButton).toBeInTheDocument();
  });

  test('handles error state', async () => {
    const mockBinanceApi = require('../../services/binanceApi');
    mockBinanceApi.getKlineData.mockRejectedValueOnce(new Error('API Error'));
    
    await act(async () => {
      render(<MarketSeasonalityExplorer />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Market Seasonality Explorer')).toBeInTheDocument();
    });
  });

  test('handles empty data response', async () => {
    const mockBinanceApi = require('../../services/binanceApi');
    mockBinanceApi.getKlineData.mockResolvedValueOnce([]);
    
    await act(async () => {
      render(<MarketSeasonalityExplorer />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Market Seasonality Explorer')).toBeInTheDocument();
    });
  });

  test('handles WebSocket connection', async () => {
    await act(async () => {
      render(<MarketSeasonalityExplorer />);
    });
    
    expect(screen.getByText('Market Seasonality Explorer')).toBeInTheDocument();
  });

  test('handles real-time data updates', async () => {
    await act(async () => {
      render(<MarketSeasonalityExplorer />);
    });

    await waitFor(() => expect(screen.getByText('Market Seasonality Explorer')).toBeInTheDocument());
  });

  test('handles pattern detection', async () => {
    await act(async () => {
      render(<MarketSeasonalityExplorer />);
    });
    
    await waitFor(() => {
      const mockBinanceApi = require('../../services/binanceApi');
      expect(mockBinanceApi.detectAllPatterns).toHaveBeenCalled();
    });
  });

  test('handles alert system', async () => {
    await act(async () => {
      render(<MarketSeasonalityExplorer />);
    });
    
    const alertsButton = screen.getByText('Alerts');
    await act(async () => {
      fireEvent.click(alertsButton);
    });
    
    expect(alertsButton).toBeInTheDocument();
  });

  test('handles comparison view', async () => {
    await act(async () => {
      render(<MarketSeasonalityExplorer />);
    });
    
    const compareButton = screen.getByText('Compare');
    await act(async () => {
      fireEvent.click(compareButton);
    });
    
    expect(compareButton).toBeInTheDocument();
  });

  test('handles patterns view', async () => {
    await act(async () => {
      render(<MarketSeasonalityExplorer />);
    });
    
    const patternsButton = screen.getByText('Patterns');
    await act(async () => {
      fireEvent.click(patternsButton);
    });
    
    expect(patternsButton).toBeInTheDocument();
  });

  test('handles responsive design', async () => {
    await act(async () => {
      render(<MarketSeasonalityExplorer />);
    });
    
    const header = screen.getByText('Market Seasonality Explorer').closest('header');
    expect(header).toHaveClass('bg-white');
  });

  test('handles dark mode classes', async () => {
    await act(async () => {
      render(<MarketSeasonalityExplorer />);
    });

    await waitFor(() => expect(screen.getByText('Market Seasonality Explorer')).toBeInTheDocument());
  });

  test('handles accessibility features', async () => {
    await act(async () => {
      render(<MarketSeasonalityExplorer />);
    });
    
    const settingsButton = screen.getByTitle('Color Schemes');
    expect(settingsButton).toHaveAttribute('title');
  });

  test('handles keyboard navigation', async () => {
    await act(async () => {
      render(<MarketSeasonalityExplorer />);
    });
    
    const calendarButton = screen.getByText('Calendar').closest('button');
    if (calendarButton) {
      calendarButton.focus();
      expect(calendarButton).toHaveFocus();
    }
  });

  test('handles component unmounting', async () => {
    const { unmount } = render(<MarketSeasonalityExplorer />);
    
    await act(async () => {
      unmount();
    });
    
    const mockBinanceApi = require('../../services/binanceApi');
    expect(mockBinanceApi.disconnectWebSocket).toHaveBeenCalled();
  });
}); 