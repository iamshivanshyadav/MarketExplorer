# Market Seasonality Explorer

A comprehensive cryptocurrency market analysis tool that explores seasonal patterns, trends, and anomalies in market data. Built with Next.js, TypeScript, and modern React patterns.

## 🌟 Features

### 📊 **Core Analytics**
- **Calendar View**: Interactive calendar displaying daily market metrics with color-coded volatility indicators and matching borders
- **Analytics Dashboard**: Comprehensive charts and statistics with multiple visualization types (Line, Area, Bar, Pie)
- **Custom Date Range Selection**: Flexible date filtering for both calendar and analytics views
- **Real-time Data Integration**: WebSocket connectivity for live market updates
- **Selective Metrics Display**: Toggle individual metrics (volatility, liquidity, performance) in calendar view
- **Trend Indicators**: Colored background indicators with trend icons for performance visualization

### 🔍 **Advanced Pattern Detection**
- **Seasonal Patterns**: Monthly volatility and performance pattern analysis
- **Cyclical Patterns**: Day-of-week trading pattern detection
- **Anomaly Detection**: Statistical outlier identification using Z-score analysis
- **Trend Analysis**: Sliding window trend detection with configurable sensitivity
- **Enhanced Sensitivity**: Improved algorithms detect more subtle market patterns

### 📈 **Data Comparison**
- **Multi-Dataset Comparison**: Compare different symbols, timeframes, and date ranges side-by-side
- **Dynamic Data Fetching**: Automatic data retrieval for each comparison dataset
- **Visual Indicators**: Data availability status and loading states
- **Flexible Configuration**: Custom colors, date ranges, and symbol selection

### 🚨 **Alert System**
- **Volatility Alerts**: Set thresholds for price volatility changes
- **Performance Alerts**: Monitor price performance against thresholds
- **Browser Notifications**: Real-time browser notifications for alert triggers
- **Sound Alerts**: Audio notifications for critical market events
- **Customizable Settings**: Configurable notification preferences

### 📤 **Export Functionality**
- **Multiple Formats**: CSV, JSON, PDF, and PNG export options
- **High-Quality PDF**: Landscape orientation with multi-page support
- **Image Export**: High-resolution PNG captures of dashboard views
- **Custom Filenames**: Timestamped files with symbol and timeframe information

### 🎨 **Customization**
- **Color Schemes**: Multiple themes including high contrast and colorblind-friendly options
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Mode**: Automatic theme switching based on system preferences
- **Animation Effects**: Smooth transitions and micro-interactions
- **Dynamic Borders**: Calendar cell borders that match volatility colors for enhanced visual consistency
- **Performance Color Coding**: Black text for performance percentages with colored trend indicators

### 🔧 **Technical Features**
- **Hydration Error Prevention**: Robust handling of browser extensions and date initialization
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Performance Optimized**: Efficient data processing and rendering
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Mock Data Fallback**: Automatic fallback to mock data when API is unavailable

## 🛠️ Technology Stack

### **Frontend**
- **Next.js 15.4.3**: React framework with App Router and SSR
- **TypeScript**: Type-safe development with strict configuration
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Framer Motion**: Smooth animations and transitions
- **Recharts**: Comprehensive charting library for data visualization

### **Data & APIs**
- **Binance API**: Real-time cryptocurrency market data
- **WebSocket Integration**: Live data streaming for real-time updates
- **date-fns**: Modern date manipulation and formatting
- **html2canvas**: Dashboard capture for PDF/image export
- **jsPDF**: PDF generation with custom layouts

### **Development Tools**
- **ESLint**: Code quality and consistency
- **Turbopack**: Fast development builds
- **PostCSS**: CSS processing and optimization

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Setup
```bash
# Clone the repository
git clone https://github.com/iamshivanshyadav/MarketExplorer.git
cd MarketExplorer

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🚀 Usage Guide

### **Getting Started**
1. **Select Symbol**: Choose from available cryptocurrency pairs (BTCUSDT, ETHUSDT, etc.)
2. **Set Timeframe**: Select daily, weekly, or monthly analysis
3. **Choose Metrics**: Toggle volatility, liquidity, and performance indicators in the filter controls
4. **Navigate Views**: Switch between Calendar, Analytics, Alerts, Comparison, and Patterns

### **Calendar View**
- **Interactive Calendar**: Click dates to view detailed market data
- **Color Coding**: Volatility-based color coding with matching borders
- **Metric Indicators**: Visual indicators for selected metrics only
- **Trend Indicators**: Colored background indicators with trend icons (green for positive, red for negative performance)
- **Date Range Selection**: Custom date range filtering
- **Selective Display**: Only selected metrics display in calendar cells

### **Analytics Dashboard**
- **Multiple Chart Types**: Line, area, bar, and pie charts with interactive controls
- **Statistical Overview**: Average, total, and distribution metrics
- **Custom Date Ranges**: Filter data by specific time periods
- **Export Options**: Download charts and data in multiple formats
- **Chart Type Selection**: Switch between different chart types for each metric

### **Pattern Detection**
- **Seasonal Analysis**: Monthly pattern detection with confidence scores
- **Cyclical Patterns**: Day-of-week trading pattern analysis
- **Anomaly Detection**: Statistical outlier identification
- **Trend Analysis**: Sliding window trend detection
- **Pattern Details**: Click patterns for detailed analysis and charts

### **Data Comparison**
1. **Create Comparison**: Add multiple datasets with different symbols/timeframes
2. **Configure Datasets**: Set date ranges, colors, and data sources
3. **View Results**: Side-by-side comparison charts with multiple metrics
4. **Export Comparisons**: Save comparison results for further analysis

### **Alert System**
1. **Create Alerts**: Set volatility or performance thresholds
2. **Configure Notifications**: Enable browser and sound alerts
3. **Monitor Triggers**: Real-time alert monitoring and history
4. **Customize Settings**: Adjust notification preferences and intervals

### **Filter Controls**
- **Symbol Selection**: Choose from available trading pairs
- **Timeframe Toggle**: Switch between daily, weekly, monthly views
- **Metrics Toggle**: Select which metrics to display (volatility, liquidity, performance)
- **Real-time Updates**: Changes apply immediately to all views

## 🔧 Configuration

### **Environment Variables**
```env
# Optional: Custom API endpoints
NEXT_PUBLIC_API_BASE_URL=https://api.binance.com
NEXT_PUBLIC_WS_URL=wss://stream.binance.com:9443
```

### **Pattern Detection Settings**
- **Seasonal Sensitivity**: Reduced minimum data points (3) for more pattern detection
- **Cyclical Sensitivity**: Lowered variance thresholds for better pattern recognition
- **Anomaly Detection**: Z-score threshold of 1.5 for more sensitive outlier detection
- **Trend Analysis**: 7-day sliding window for more responsive trend detection

### **Export Settings**
- **PDF Quality**: High-resolution captures with landscape orientation
- **Image Format**: PNG format with 2x scale for crisp exports
- **File Naming**: Timestamped files with symbol and timeframe information

## 📊 Data Sources

### **Binance API Integration**
- **Kline Data**: OHLCV data for technical analysis
- **Real-time Streams**: WebSocket connections for live updates
- **Symbol Information**: Available trading pairs and metadata
- **Order Book Data**: Market depth and liquidity information

### **Data Processing**
- **Volatility Calculation**: High-low range percentage with color-coded visualization
- **Performance Metrics**: Price change percentage with black text display
- **Liquidity Analysis**: Volume-based liquidity indicators
- **Technical Indicators**: SMA, RSI, and other technical metrics
- **Visual Consistency**: Border colors that match cell background colors for unified heatmap effect
- **Trend Visualization**: Colored background indicators with trend icons for performance direction
- **Mock Data Generation**: Comprehensive fallback data when API is unavailable

## 🎨 Design System

### **Color Schemes**
- **Default Theme**: Professional blue-based color scheme
- **High Contrast**: Accessibility-focused high contrast theme
- **Colorblind-Friendly**: Optimized for various color vision types
- **Dark Mode**: Automatic dark/light theme switching

### **Responsive Design**
- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Enhanced layouts for tablet screens
- **Desktop Experience**: Full-featured desktop interface
- **Touch Interactions**: Optimized touch targets and gestures

## ⚡ Performance Features

### **Optimization**
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js automatic image optimization
- **Bundle Analysis**: Detailed bundle size analysis
- **Caching Strategies**: Efficient data caching and memoization

### **Real-time Features**
- **WebSocket Management**: Automatic connection handling and reconnection
- **Data Streaming**: Efficient real-time data processing
- **Alert Processing**: Real-time alert checking and notification
- **State Management**: Optimized React state updates

## 🔒 Security & Privacy

### **Data Handling**
- **Client-Side Processing**: All data processing happens in the browser
- **No Data Storage**: No personal data is stored on servers
- **API Rate Limiting**: Respectful API usage with proper rate limiting
- **Error Handling**: Secure error handling without data exposure

### **Browser Compatibility**
- **Modern Browsers**: Chrome, Firefox, Safari, Edge support
- **Mobile Browsers**: iOS Safari and Android Chrome support
- **Extension Compatibility**: Handles browser extensions gracefully
- **Hydration Safety**: Robust hydration error prevention

## 🐛 Troubleshooting

### **Common Issues**

**Hydration Errors**
- **Cause**: Browser extensions or date initialization mismatches
- **Solution**: Application includes `suppressHydrationWarning` and client-side date initialization

**Data Loading Issues**
- **Cause**: API rate limits or network connectivity
- **Solution**: Application automatically falls back to mock data when API is unavailable

**Metrics Not Displaying**
- **Cause**: Metrics not selected in filter controls
- **Solution**: Ensure desired metrics are checked in the filter controls

**Export Failures**
- **Cause**: Large datasets or browser memory limits
- **Solution**: Try smaller date ranges or different export formats

**Pattern Detection**
- **Cause**: Insufficient data for pattern analysis
- **Solution**: Ensure adequate historical data is available

**Trend Indicators**
- **Cause**: Performance metrics not selected
- **Solution**: Enable performance metrics in filter controls to see trend indicators

### **Debug Mode**
```bash
# Enable debug logging
DEBUG=* npm run dev
```

## 🤝 Contributing

### **Development Setup**
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### **Testing**
- **Comprehensive Coverage**: 115+ tests covering all major components
- **Component Testing**: React Testing Library for component behavior
- **Service Testing**: API service and data processing tests
- **Utility Testing**: Data generation and processing utilities
- **Mock Data**: Extensive mock data scenarios for testing
- **Error Handling**: Tests for error states and edge cases

### **Code Standards**
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency rules
- **Prettier**: Automatic code formatting
- **Git Hooks**: Pre-commit linting and formatting

### **Pull Request Process**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Binance API**: For providing comprehensive market data
- **Recharts**: For excellent charting capabilities
- **Next.js Team**: For the amazing React framework
- **Tailwind CSS**: For the utility-first CSS framework
- **Framer Motion**: For smooth animations and transitions

## 📞 Support

### **Documentation**
- **API Reference**: Comprehensive API documentation
- **Component Guide**: Detailed component usage examples
- **Troubleshooting**: Common issues and solutions
- **Performance Tips**: Optimization recommendations

### **Community**
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Community discussions and Q&A
- **Contributions**: Welcome contributions and improvements

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies**
