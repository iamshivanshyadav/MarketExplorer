# Testing Documentation

## Overview

This project includes comprehensive unit tests for all critical components and functions. The testing setup uses Jest with React Testing Library for component testing, and includes coverage for different data scenarios and edge cases.

## Test Structure

```
src/
├── __tests__/
│   ├── components/
│   │   ├── CalendarComponent.test.tsx
│   │   ├── AnalyticsDashboard.test.tsx
│   │   └── MarketSeasonalityExplorer.test.tsx
│   └── services/
│       └── binanceApi.test.ts
├── jest.config.js
└── jest.setup.js
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### Running Specific Tests

```bash
# Run tests for a specific component
npm test CalendarComponent

# Run tests for a specific service
npm test binanceApi

# Run tests matching a pattern
npm test -- --testNamePattern="renders"
```

## Test Coverage

The test suite covers:

### Components
- **CalendarComponent**: Calendar rendering, date selection, navigation, edge cases
- **AnalyticsDashboard**: Chart rendering, data display, export functionality
- **MarketSeasonalityExplorer**: Main application logic, state management, navigation

### Services
- **BinanceApi**: API calls, data processing, pattern detection, WebSocket handling

### Coverage Areas
- ✅ **Rendering**: Component rendering and display
- ✅ **User Interactions**: Click events, form inputs, navigation
- ✅ **Data Handling**: API calls, data processing, state updates
- ✅ **Edge Cases**: Empty data, invalid data, error scenarios
- ✅ **Performance**: Large datasets, rapid interactions
- ✅ **Accessibility**: ARIA labels, keyboard navigation
- ✅ **Responsive Design**: Different screen sizes

## Test Data Scenarios

### Normal Data
```typescript
const mockData: ProcessedDayData[] = [
  {
    date: new Date('2024-01-01'),
    open: 100,
    high: 110,
    low: 95,
    close: 105,
    volume: 1000000,
    volatility: 0.3,
    liquidity: 0.8,
    performance: 5.0,
    dayOfWeek: 1,
    weekOfYear: 1,
    monthOfYear: 1
  }
];
```

### Empty Data
```typescript
const mockEmptyData: ProcessedDayData[] = [];
```

### Large Datasets
```typescript
const mockLargeDataset: ProcessedDayData[] = Array.from({ length: 365 }, (_, i) => ({
  date: new Date(2024, 0, i + 1),
  open: 100 + i,
  high: 110 + i,
  low: 95 + i,
  close: 105 + i,
  volume: 1000000 + (i * 1000),
  volatility: Math.random() * 3,
  liquidity: 0.5 + (Math.random() * 0.5),
  performance: (Math.random() - 0.5) * 20,
  dayOfWeek: new Date(2024, 0, i + 1).getDay(),
  weekOfYear: Math.ceil((new Date(2024, 0, i + 1).getTime() - new Date(2024, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)),
  monthOfYear: new Date(2024, 0, i + 1).getMonth() + 1
}));
```

### Invalid Data
```typescript
const invalidData: ProcessedDayData[] = [
  {
    ...mockData[0],
    date: new Date('invalid-date'),
    volatility: NaN,
    performance: Infinity,
    volume: -1000
  }
];
```

## Edge Cases Covered

### 1. Data Edge Cases
- **Empty arrays**: Components handle empty data gracefully
- **Invalid dates**: Malformed date objects don't crash the app
- **NaN/Infinity values**: Mathematical calculations handle extreme values
- **Negative values**: Performance calculations with negative returns
- **Zero values**: Division by zero scenarios

### 2. API Edge Cases
- **Network errors**: Failed API calls are handled gracefully
- **Malformed responses**: Invalid JSON responses don't crash
- **HTTP errors**: 4xx and 5xx status codes are handled
- **Timeout scenarios**: Long-running requests are managed

### 3. User Interaction Edge Cases
- **Rapid clicking**: Multiple rapid interactions don't cause issues
- **Keyboard navigation**: All interactive elements support keyboard access
- **Screen reader compatibility**: Proper ARIA labels and semantic HTML
- **Responsive behavior**: Different screen sizes work correctly

### 4. Performance Edge Cases
- **Large datasets**: 1000+ data points render efficiently
- **Memory usage**: No memory leaks with large datasets
- **Render performance**: Components render within acceptable time limits
- **State updates**: Rapid state changes don't cause performance issues

## Example Test Cases

### Component Rendering
```typescript
it('renders calendar with correct month and year', () => {
  render(<CalendarComponent {...defaultProps} />);
  expect(screen.getByText('January 2024')).toBeInTheDocument();
});
```

### User Interactions
```typescript
it('calls onDateSelect when a date is clicked', () => {
  render(<CalendarComponent {...defaultProps} />);
  
  const dateButton = screen.getByText('1');
  fireEvent.click(dateButton);
  
  expect(defaultProps.onDateSelect).toHaveBeenCalledWith(expect.any(Date));
});
```

### API Testing
```typescript
it('fetches kline data successfully', async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => mockKlineResponse
  });

  const result = await binanceApi.getKlineData('BTCUSDT', '1d');
  expect(result).toHaveLength(1);
});
```

### Error Handling
```typescript
it('handles API errors gracefully', async () => {
  (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

  await expect(binanceApi.getKlineData('BTCUSDT', '1d')).rejects.toThrow('API Error');
});
```

### Performance Testing
```typescript
it('renders large datasets efficiently', () => {
  const startTime = performance.now();
  
  render(<CalendarComponent {...defaultProps} data={mockLargeDataset} />);
  
  const endTime = performance.now();
  const renderTime = endTime - startTime;
  
  expect(renderTime).toBeLessThan(1000); // Should render within 1 second
});
```

## Mocking Strategy

### API Mocks
```typescript
// Mock fetch for API testing
global.fetch = jest.fn();

// Mock WebSocket for real-time testing
global.WebSocket = jest.fn().mockImplementation(() => ({
  close: jest.fn(),
  send: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: 1,
}));
```

### Component Mocks
```typescript
// Mock external libraries
jest.mock('recharts', () => ({
  LineChart: ({ children, ...props }) => <div data-testid="line-chart" {...props}>{children}</div>,
  // ... other components
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <div data-testid="animate-presence">{children}</div>,
}));
```

### Browser API Mocks
```typescript
// Mock browser APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

## Testing Best Practices

### 1. Test Structure
- Use descriptive test names
- Group related tests with `describe` blocks
- Test one thing per test case
- Use `beforeEach` for setup and `afterEach` for cleanup

### 2. Component Testing
- Test user interactions, not implementation details
- Use `screen.getBy*` queries for better accessibility
- Test error states and loading states
- Verify that callbacks are called with correct parameters

### 3. API Testing
- Mock external dependencies
- Test both success and failure scenarios
- Verify that error handling works correctly
- Test async operations with `waitFor`

### 4. Performance Testing
- Test with realistic data sizes
- Measure render times and memory usage
- Test rapid user interactions
- Ensure no memory leaks

### 5. Accessibility Testing
- Test keyboard navigation
- Verify ARIA labels and roles
- Test with screen readers
- Ensure proper focus management

## Coverage Goals

- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

## Continuous Integration

Tests are automatically run in CI with:
- All tests must pass
- Coverage thresholds must be met
- No new code can reduce coverage
- Performance tests must pass

## Debugging Tests

### Common Issues

1. **Async Tests**: Use `waitFor` for async operations
2. **Mock Cleanup**: Clear mocks in `beforeEach`
3. **Component State**: Test state changes, not internal state
4. **Event Handling**: Use `fireEvent` for user interactions

### Debug Commands

```bash
# Run tests with verbose output
npm test -- --verbose

# Run tests with coverage and watch
npm run test:coverage -- --watch

# Debug specific test
npm test -- --testNamePattern="specific test name" --verbose
```

## Future Testing Enhancements

1. **Integration Tests**: Test component interactions
2. **E2E Tests**: Test complete user workflows
3. **Visual Regression Tests**: Test UI consistency
4. **Performance Tests**: Test with real data volumes
5. **Accessibility Tests**: Automated a11y testing
6. **Border Color Testing**: Test volatility-based border colors in calendar view
7. **CSS Custom Properties**: Test CSS variable-based styling for dynamic colors

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Accessibility Testing](https://www.npmjs.com/package/@testing-library/jest-dom) 