import { generateMockData, generateSeasonalData, generateTrendData, generateVolatileData } from '../../utils/dataScenarios';

describe('Data Scenarios', () => {
  describe('generateMockData', () => {
    test('generates correct number of data points', () => {
      const days = 30;
      const data = generateMockData(days);
      
      expect(data).toHaveLength(days);
    });

    test('generates data with correct structure', () => {
      const data = generateMockData(1);
      
      expect(data[0]).toHaveProperty('date');
      expect(data[0]).toHaveProperty('open');
      expect(data[0]).toHaveProperty('high');
      expect(data[0]).toHaveProperty('low');
      expect(data[0]).toHaveProperty('close');
      expect(data[0]).toHaveProperty('volume');
      expect(data[0]).toHaveProperty('volatility');
      expect(data[0]).toHaveProperty('performance');
      expect(data[0]).toHaveProperty('liquidity');
    });

    test('generates sequential dates', () => {
      const data = generateMockData(3);
      
      expect(data[0].date.getTime()).toBeLessThan(data[1].date.getTime());
      expect(data[1].date.getTime()).toBeLessThan(data[2].date.getTime());
    });

    test('generates realistic price ranges', () => {
      const data = generateMockData(10);
      
      data.forEach(point => {
        expect(point.open).toBeGreaterThan(0);
        expect(point.high).toBeGreaterThanOrEqual(point.open);
        expect(point.low).toBeLessThanOrEqual(point.open);
        expect(point.close).toBeGreaterThan(0);
      });
    });

    test('generates realistic volume data', () => {
      const data = generateMockData(10);
      
      data.forEach(point => {
        expect(point.volume).toBeGreaterThan(0);
      });
    });

    test('calculates volatility correctly', () => {
      const data = generateMockData(10);
      
      data.forEach(point => {
        expect(point.volatility).toBeGreaterThanOrEqual(0);
        expect(point.volatility).toBeLessThanOrEqual(100);
      });
    });

    test('calculates performance correctly', () => {
      const data = generateMockData(10);
      
      data.forEach(point => {
        expect(typeof point.performance).toBe('number');
      });
    });

    test('generates liquidity values in correct range', () => {
      const data = generateMockData(10);
      
      data.forEach(point => {
        expect(point.liquidity).toBeGreaterThanOrEqual(0);
        expect(point.liquidity).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('generateSeasonalData', () => {
    test('generates seasonal patterns', () => {
      const data = generateSeasonalData(365);
      
      expect(data).toHaveLength(365);
    });

    test('includes seasonal variations', () => {
      const data = generateSeasonalData(365);
      
      // Check for seasonal patterns by comparing quarters
      const q1Avg = data.slice(0, 90).reduce((sum, d) => sum + d.close, 0) / 90;
      const q2Avg = data.slice(90, 180).reduce((sum, d) => sum + d.close, 0) / 90;
      const q3Avg = data.slice(180, 270).reduce((sum, d) => sum + d.close, 0) / 90;
      const q4Avg = data.slice(270, 365).reduce((sum, d) => sum + d.close, 0) / 95;
      
      // Should have some variation between quarters
      expect(Math.abs(q1Avg - q2Avg)).toBeGreaterThan(0);
      expect(Math.abs(q2Avg - q3Avg)).toBeGreaterThan(0);
      expect(Math.abs(q3Avg - q4Avg)).toBeGreaterThan(0);
    });

    test('maintains realistic price movements', () => {
      const data = generateSeasonalData(30);
      
      data.forEach(point => {
        expect(point.high).toBeGreaterThanOrEqual(point.low);
        expect(point.close).toBeGreaterThan(0);
      });
    });
  });

  describe('generateTrendData', () => {
    test('generates trending data', () => {
      const data = generateTrendData(30, 'up');
      
      expect(data).toHaveLength(30);
    });

    test('generates upward trend', () => {
      const data = generateTrendData(30, 'up');
      
      const firstPrice = data[0].close;
      const lastPrice = data[29].close;
      
      expect(lastPrice).toBeGreaterThan(firstPrice);
    });

    test('generates downward trend', () => {
      const data = generateTrendData(30, 'down');
      
      const firstPrice = data[0].close;
      const lastPrice = data[29].close;
      
      expect(lastPrice).toBeLessThan(firstPrice);
    });

    test('generates sideways trend', () => {
      const data = generateTrendData(30, 'sideways');
      
      const firstPrice = data[0].close;
      const lastPrice = data[29].close;
      
      // Should stay relatively flat
      expect(Math.abs(lastPrice - firstPrice) / firstPrice).toBeLessThan(0.1);
    });

    test('maintains realistic volatility', () => {
      const data = generateTrendData(30, 'up');
      
      data.forEach(point => {
        expect(point.volatility).toBeGreaterThan(0);
        expect(point.volatility).toBeLessThan(100);
      });
    });
  });

  describe('generateVolatileData', () => {
    test('generates volatile data', () => {
      const data = generateVolatileData(30);
      
      expect(data).toHaveLength(30);
    });

    test('has higher volatility than regular data', () => {
      const regularData = generateMockData(30);
      const volatileData = generateVolatileData(30);
      
      const regularAvgVol = regularData.reduce((sum, d) => sum + d.volatility, 0) / 30;
      const volatileAvgVol = volatileData.reduce((sum, d) => sum + d.volatility, 0) / 30;
      
      expect(volatileAvgVol).toBeGreaterThan(regularAvgVol);
    });

    test('maintains price continuity', () => {
      const data = generateVolatileData(30);
      
      for (let i = 1; i < data.length; i++) {
        const priceChange = Math.abs(data[i].close - data[i-1].close) / data[i-1].close;
        // Should have some volatility but not extreme jumps
        expect(priceChange).toBeLessThan(0.5);
      }
    });

    test('includes extreme price movements', () => {
      const data = generateVolatileData(30);
      
      let hasExtremeMovement = false;
      for (let i = 1; i < data.length; i++) {
        const priceChange = Math.abs(data[i].close - data[i-1].close) / data[i-1].close;
        if (priceChange > 0.1) {
          hasExtremeMovement = true;
          break;
        }
      }
      
      expect(hasExtremeMovement).toBe(true);
    });
  });

  describe('Edge cases', () => {
    test('handles zero days', () => {
      const data = generateMockData(0);
      expect(data).toEqual([]);
    });

    test('handles single day', () => {
      const data = generateMockData(1);
      expect(data).toHaveLength(1);
    });

    test('handles large datasets', () => {
      const data = generateMockData(1000);
      expect(data).toHaveLength(1000);
    });

    test('generates unique dates', () => {
      const data = generateMockData(10);
      const dates = data.map(d => d.date.getTime());
      const uniqueDates = new Set(dates);
      
      expect(uniqueDates.size).toBe(10);
    });

    test('maintains data consistency', () => {
      const data = generateMockData(10);
      
      data.forEach(point => {
        // High should be >= open, close, low
        expect(point.high).toBeGreaterThanOrEqual(point.open);
        expect(point.high).toBeGreaterThanOrEqual(point.close);
        expect(point.high).toBeGreaterThanOrEqual(point.low);
        
        // Low should be <= open, close, high
        expect(point.low).toBeLessThanOrEqual(point.open);
        expect(point.low).toBeLessThanOrEqual(point.close);
        expect(point.low).toBeLessThanOrEqual(point.high);
      });
    });

    test('handles different start dates', () => {
      const startDate = new Date(2023, 0, 1);
      const data = generateMockData(5, startDate);
      
      expect(data[0].date).toEqual(startDate);
    });

    test('generates realistic volume patterns', () => {
      const data = generateMockData(30);
      
      // Volume should have some variation
      const volumes = data.map(d => d.volume);
      const uniqueVolumes = new Set(volumes);
      
      expect(uniqueVolumes.size).toBeGreaterThan(1);
    });

    test('maintains performance calculation accuracy', () => {
      const data = generateMockData(10);
      
      data.forEach(point => {
        const calculatedPerformance = ((point.close - point.open) / point.open) * 100;
        expect(point.performance).toBeCloseTo(calculatedPerformance, 1);
      });
    });
  });
}); 