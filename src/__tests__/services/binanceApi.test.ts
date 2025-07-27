import { BinanceApiService } from '../../services/binanceApi';

jest.mock('axios', () => ({
  get: jest.fn(),
  create: jest.fn(() => ({
    get: jest.fn()
  }))
}));

describe('BinanceApiService', () => {
  let service: BinanceApiService;

  beforeEach(() => {
    service = BinanceApiService.getInstance();
    jest.clearAllMocks();
  });

  describe('getKlineData', () => {
    test('fetches kline data successfully', async () => {
      const mockResponse = {
        data: [
          [1640995200000, '50000', '51000', '49000', '50500', '1000000', 1640995200000, '0.1', 100, '50000000', '0.1'],
          [1641081600000, '50500', '52000', '50000', '51500', '1200000', 1641081600000, '0.2', 120, '60000000', '0.2']
        ]
      };

      const axios = require('axios');
      axios.get.mockResolvedValue(mockResponse);

      const result = await service.getKlineData('BTCUSDT', '1d', 1640995200000, 1641081600000);

      expect(result).toEqual([
        {
          openTime: 1640995200000,
          open: '50000',
          high: '51000',
          low: '49000',
          close: '50500',
          volume: '1000000',
          closeTime: 1640995200000,
          quoteAssetVolume: '0.1',
          numberOfTrades: 100,
          takerBuyBaseAssetVolume: '50000000',
          takerBuyQuoteAssetVolume: '0.1',
        },
        {
          openTime: 1641081600000,
          open: '50500',
          high: '52000',
          low: '50000',
          close: '51500',
          volume: '1200000',
          closeTime: 1641081600000,
          quoteAssetVolume: '0.2',
          numberOfTrades: 120,
          takerBuyBaseAssetVolume: '60000000',
          takerBuyQuoteAssetVolume: '0.2',
        }
      ]);
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.binance.com/api/v3/klines',
        expect.objectContaining({
          params: {
            symbol: 'BTCUSDT',
            interval: '1d',
            startTime: 1640995200000,
            endTime: 1641081600000,
            limit: 1000
          }
        })
      );
    });

    test('handles API errors', async () => {
      const axios = require('axios');
      axios.get.mockRejectedValue(new Error('Network error'));

      const result = await service.getKlineData('BTCUSDT', '1d', 1640995200000, 1641081600000);
      expect(result).toEqual([]);
    });

    test('handles empty response', async () => {
      const mockResponse = { data: [] };
      const axios = require('axios');
      axios.get.mockResolvedValue(mockResponse);

      const result = await service.getKlineData('BTCUSDT', '1d', 1640995200000, 1641081600000);

      expect(result).toEqual([]);
    });
  });

  describe('getSymbols', () => {
    test('fetches symbols successfully', async () => {
      const mockResponse = {
        data: {
          symbols: [
            { symbol: 'BTCUSDT', status: 'TRADING', quoteAsset: 'USDT', isSpotTradingAllowed: true },
            { symbol: 'ETHUSDT', status: 'TRADING', quoteAsset: 'USDT', isSpotTradingAllowed: true },
            { symbol: 'BNBUSDT', status: 'TRADING', quoteAsset: 'USDT', isSpotTradingAllowed: true }
          ]
        }
      };

      const axios = require('axios');
      axios.get.mockResolvedValue(mockResponse);

      const result = await service.getSymbols();

      expect(result).toEqual(['BTCUSDT', 'ETHUSDT', 'BNBUSDT']);
      expect(axios.get).toHaveBeenCalledWith('https://api.binance.com/api/v3/exchangeInfo');
    });

    test('filters only trading symbols', async () => {
      const mockResponse = {
        data: {
          symbols: [
            { symbol: 'BTCUSDT', status: 'TRADING', quoteAsset: 'USDT', isSpotTradingAllowed: true },
            { symbol: 'ETHUSDT', status: 'BREAK', quoteAsset: 'USDT', isSpotTradingAllowed: true },
            { symbol: 'BNBUSDT', status: 'TRADING', quoteAsset: 'USDT', isSpotTradingAllowed: true }
          ]
        }
      };

      const axios = require('axios');
      axios.get.mockResolvedValue(mockResponse);

      const result = await service.getSymbols();

      expect(result).toEqual(['BTCUSDT', 'BNBUSDT']);
    });

    test('handles API errors', async () => {
      const axios = require('axios');
      axios.get.mockRejectedValue(new Error('Network error'));

      const result = await service.getSymbols();
      expect(result).toEqual(['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'DOTUSDT']);
    });
  });

  describe('processKlineData', () => {
    test('processes kline data correctly', () => {
      const klineData = [
        {
          openTime: 1640995200000,
          open: '50000',
          high: '51000',
          low: '49000',
          close: '50500',
          volume: '1000000',
          closeTime: 1640995200000,
          quoteAssetVolume: '0.1',
          numberOfTrades: 100,
          takerBuyBaseAssetVolume: '50000000',
          takerBuyQuoteAssetVolume: '0.1',
        },
        {
          openTime: 1641081600000,
          open: '50500',
          high: '52000',
          low: '50000',
          close: '51500',
          volume: '1200000',
          closeTime: 1641081600000,
          quoteAssetVolume: '0.2',
          numberOfTrades: 120,
          takerBuyBaseAssetVolume: '60000000',
          takerBuyQuoteAssetVolume: '0.2',
        }
      ];

      const result = service.processKlineData(klineData);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('open');
      expect(result[0]).toHaveProperty('high');
      expect(result[0]).toHaveProperty('low');
      expect(result[0]).toHaveProperty('close');
      expect(result[0]).toHaveProperty('volume');
      expect(result[0]).toHaveProperty('volatility');
      expect(result[0]).toHaveProperty('performance');
      expect(result[0]).toHaveProperty('liquidity');
    });

    test('handles empty data', () => {
      const result = service.processKlineData([]);
      expect(result).toEqual([]);
    });

    test('calculates volatility correctly', () => {
      const klineData = [
        {
          openTime: 1640995200000,
          open: '100',
          high: '110',
          low: '90',
          close: '105',
          volume: '1000000',
          closeTime: 1640995200000,
          quoteAssetVolume: '0.1',
          numberOfTrades: 100,
          takerBuyBaseAssetVolume: '50000000',
          takerBuyQuoteAssetVolume: '0.1',
        }
      ];

      const result = service.processKlineData(klineData);

      expect(result[0].volatility).toBeCloseTo(20.0, 1);
    });

    test('calculates performance correctly', () => {
      const klineData = [
        {
          openTime: 1640995200000,
          open: '100',
          high: '110',
          low: '90',
          close: '105',
          volume: '1000000',
          closeTime: 1640995200000,
          quoteAssetVolume: '0.1',
          numberOfTrades: 100,
          takerBuyBaseAssetVolume: '50000000',
          takerBuyQuoteAssetVolume: '0.1',
        }
      ];

      const result = service.processKlineData(klineData);

      expect(result[0].performance).toBeCloseTo(5.0, 1);
    });
  });

  describe('calculateTechnicalIndicators', () => {
    test('calculates technical indicators', () => {
      // Provide at least 50 data points
      const data = Array.from({ length: 50 }, (_, i) => ({
        date: new Date(2024, 0, 1 + i),
        open: 100 + i,
        high: 110 + i,
        low: 90 + i,
        close: 105 + i,
        volume: 1000000 + i * 1000,
          volatility: 20.0,
          performance: 5.0,
        liquidity: 0.8,
        dayOfWeek: new Date(2024, 0, 1 + i).getDay(),
        weekOfYear: Math.ceil((new Date(2024, 0, 1 + i).getTime() - new Date(2024, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)),
        monthOfYear: 1
      }));

      const result = service.calculateTechnicalIndicators(data);

      expect(result).toHaveLength(50);
      expect(result[49]).toHaveProperty('sma20');
      expect(result[49]).toHaveProperty('sma50');
      expect(result[49]).toHaveProperty('rsi');
    });

    test('handles single data point', () => {
      const data = [
        {
          date: new Date(2024, 0, 1),
          open: 100,
          high: 110,
          low: 90,
          close: 105,
          volume: 1000000,
          volatility: 20.0,
          performance: 5.0,
          liquidity: 0.8,
          dayOfWeek: 1,
          weekOfYear: 1,
          monthOfYear: 1
        }
      ];

      const result = service.calculateTechnicalIndicators(data);

      expect(result[0].sma20).toBeUndefined();
      expect(result[0].sma50).toBeUndefined();
    });
  });

  describe('detectAllPatterns', () => {
    test('detects patterns in data', () => {
      const data = [
        {
          date: new Date(2024, 0, 1),
          open: 100,
          high: 110,
          low: 90,
          close: 105,
          volume: 1000000,
          volatility: 20.0,
          performance: 5.0,
          liquidity: 0.8,
          dayOfWeek: 1,
          weekOfYear: 1,
          monthOfYear: 1
        }
      ];

      const result = service.detectAllPatterns(data);

      expect(result).toHaveProperty('seasonalPatterns');
      expect(result).toHaveProperty('cyclicalPatterns');
      expect(result).toHaveProperty('anomalies');
      expect(result).toHaveProperty('trends');
    });

    test('handles empty data', () => {
      const result = service.detectAllPatterns([]);

      expect(result.seasonalPatterns).toEqual([]);
      expect(result.cyclicalPatterns).toEqual([]);
      expect(result.anomalies).toEqual([]);
      expect(result.trends).toEqual([]);
    });
  });

  describe('WebSocket functionality', () => {
    test('connects to WebSocket', () => {
      const mockWebSocket = {
        addEventListener: jest.fn(),
        send: jest.fn(),
        close: jest.fn()
      };

      global.WebSocket = jest.fn(() => mockWebSocket) as any;

      service.connectWebSocket(['BTCUSDT'], jest.fn());

      expect(global.WebSocket).toHaveBeenCalledWith(
        'wss://stream.binance.com:9443/ws/btcusdt@kline_1m'
      );
    });

    test('disconnects from WebSocket', () => {
      const mockWebSocket = {
        addEventListener: jest.fn(),
        send: jest.fn(),
        close: jest.fn()
      };

      global.WebSocket = jest.fn(() => mockWebSocket) as any;

      service.connectWebSocket(['BTCUSDT'], jest.fn());
      service.disconnectWebSocket();

      expect(mockWebSocket.close).toHaveBeenCalled();
    });

    test('handles WebSocket message', () => {
      const mockWebSocket = {
        addEventListener: jest.fn(),
        send: jest.fn(),
        close: jest.fn()
      };

      global.WebSocket = jest.fn(() => mockWebSocket) as any;

      const messageHandler = jest.fn();
      service.connectWebSocket(['BTCUSDT'], messageHandler);

      // Simulate onmessage event
      const wsInstance = (global.WebSocket as any).mock.results[0].value;
      wsInstance.onmessage({
        data: JSON.stringify({
          e: 'kline',
          s: 'BTCUSDT',
          k: {
            t: 1640995200000,
            o: '50000',
            h: '51000',
            l: '49000',
            c: '50500',
            v: '1000000'
          }
        })
      } as MessageEvent);

      expect(messageHandler).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    test('handles network errors gracefully', async () => {
      const axios = require('axios');
      axios.get.mockRejectedValue(new Error('Network error'));

      const result = await service.getKlineData('BTCUSDT', '1d', 1640995200000, 1641081600000);
      expect(result).toEqual([]);
    });

    test('handles invalid data gracefully', () => {
      const invalidData = [
        { openTime: 0, open: 'data', high: 'format', low: 'test', close: 'test', volume: '0', closeTime: 0, quoteAssetVolume: '0', numberOfTrades: 0, takerBuyBaseAssetVolume: '0', takerBuyQuoteAssetVolume: '0' }
      ];

      const result = service.processKlineData(invalidData);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('date');
    });

    test('handles missing WebSocket', () => {
      const originalWebSocket = global.WebSocket;
      delete (global as any).WebSocket;

      expect(() => service.connectWebSocket(['BTCUSDT'], jest.fn())).toThrow();

      global.WebSocket = originalWebSocket;
    });
  });
}); 