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

### **Frontend Framework**
- **Next.js 15.4.3**: React framework with App Router and SSR
  - **App Router**: File-based routing system
  - **Server-Side Rendering**: Improved SEO and performance
  - **Static Generation**: Pre-built pages for faster loading
  - **API Routes**: Built-in API endpoint support

### **Core Libraries**
- **React 18**: Modern React with concurrent features
  - **Hooks**: useState, useEffect, useMemo, useCallback
  - **Context API**: Global state management
  - **Error Boundaries**: Graceful error handling
- **TypeScript 5.0+**: Type-safe development
  - **Strict Mode**: Comprehensive type checking
  - **Interface Definitions**: Strong typing for all data structures
  - **Generic Types**: Reusable type-safe components

### **Styling & UI**
- **Tailwind CSS 3.3+**: Utility-first CSS framework
  - **Responsive Design**: Mobile-first approach
  - **Custom Colors**: Financial data color schemes
  - **Dark Mode**: Automatic theme switching
  - **JIT Compilation**: On-demand CSS generation
- **Framer Motion**: Animation library
  - **Smooth Transitions**: Micro-interactions and page transitions
  - **Gesture Support**: Touch and mouse interactions
  - **Performance Optimized**: Hardware-accelerated animations

### **Data Visualization**
- **Recharts 2.8+**: Comprehensive charting library
  - **Line Charts**: Price and performance trends
  - **Bar Charts**: Volume and volatility analysis
  - **Area Charts**: Cumulative metrics visualization
  - **Scatter Plots**: Correlation analysis
  - **Responsive Charts**: Auto-scaling for all screen sizes
  - **Interactive Features**: Zoom, pan, and hover effects

### **Data & APIs**
- **Binance REST API v3**: Real-time cryptocurrency market data
  - **Kline/Candlestick Data**: OHLCV market information
  - **Rate Limiting**: Respectful API usage (1200 requests/minute)
  - **Error Handling**: Graceful fallback to mock data
  - **Data Processing**: Real-time calculation of metrics
- **WebSocket Integration**: Live data streaming
  - **Real-time Updates**: Live price and volume updates
  - **Automatic Reconnection**: Robust connection management
  - **Event-driven Architecture**: Efficient data flow

### **Date & Time Handling**
- **date-fns 2.30+**: Modern date manipulation library
  - **Formatting**: Consistent date display across components
  - **Calculations**: Date range and interval computations
  - **Localization**: Multi-language date support
  - **Performance**: Tree-shakable bundle optimization

### **Export & File Handling**
- **html2canvas 1.4+**: Dashboard capture for exports
  - **High-resolution Screenshots**: 2x scale for crisp images
  - **PNG Format**: Lossless image quality
  - **Canvas Rendering**: Accurate visual representation
- **jsPDF 2.5+**: PDF generation library
  - **Landscape Orientation**: Optimized for dashboard layouts
  - **Multi-page Support**: Large datasets across multiple pages
  - **Custom Styling**: Professional PDF formatting
  - **Font Embedding**: Consistent typography

### **Development Tools**
- **ESLint 8.0+**: Code quality and consistency
  - **TypeScript Rules**: Type-aware linting
  - **React Rules**: Component and hook best practices
  - **Import Sorting**: Consistent import organization
- **Jest 29.0+**: Testing framework
  - **React Testing Library**: Component testing utilities
  - **Mock Service Worker**: API mocking for tests
  - **Coverage Reports**: Comprehensive test coverage
- **Turbopack**: Fast development builds
  - **Incremental Compilation**: Faster hot reloads
  - **Bundle Analysis**: Detailed size optimization
- **PostCSS**: CSS processing and optimization
  - **Autoprefixer**: Cross-browser compatibility
  - **CSS Minification**: Production optimization

### **Testing Libraries**
- **React Testing Library**: Component testing utilities
  - **User-centric Testing**: Tests that mimic user behavior
  - **Accessibility Testing**: Screen reader and keyboard navigation
  - **Custom Renderers**: Tailored testing environments
- **Jest DOM**: DOM testing utilities
  - **Custom Matchers**: Enhanced assertion capabilities
  - **Mock Implementations**: Controlled test environments

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

## 📋 Assumptions & Design Decisions

### **Technical Assumptions**
- **Modern Browser Support**: Assumes users have modern browsers with ES6+ support
- **JavaScript Enabled**: Requires JavaScript to be enabled for full functionality
- **Network Connectivity**: Assumes stable internet connection for real-time data
- **API Availability**: Binance API is assumed to be available (with fallback to mock data)
- **WebSocket Support**: Assumes browser support for WebSocket connections
- **Local Storage**: Uses browser localStorage for user preferences (optional)

### **Data Assumptions**
- **Market Data Accuracy**: Assumes Binance API provides accurate market data
- **Time Zone Handling**: All dates are processed in UTC for consistency
- **Data Freshness**: Real-time data may have slight delays (1-3 seconds)
- **Historical Data**: Limited to available historical data from Binance API
- **Symbol Availability**: Assumes selected trading pairs are available on Binance

### **User Experience Assumptions**
- **Financial Literacy**: Users have basic understanding of market metrics
- **Desktop Usage**: Primary interface designed for desktop/laptop use
- **Mobile Responsive**: Secondary support for mobile devices
- **Accessibility**: Assumes users may have varying accessibility needs
- **Performance Expectations**: Users expect sub-second response times

### **Business Logic Assumptions**
- **Volatility Calculation**: Uses high-low range percentage as volatility measure
- **Performance Metrics**: Calculates daily price change percentage
- **Pattern Detection**: Assumes market patterns can be identified through statistical analysis
- **Alert Thresholds**: Users can set meaningful thresholds for market conditions
- **Export Requirements**: Users need data in standard formats (CSV, JSON, PDF, PNG)

### **Development Assumptions**
- **TypeScript Adoption**: Team is comfortable with TypeScript development
- **React Knowledge**: Developers understand React hooks and patterns
- **Testing Culture**: Comprehensive testing is expected and maintained
- **Code Quality**: ESLint and Prettier are used for code consistency
- **Version Control**: Git is used for version control and collaboration

### **Performance Assumptions**
- **Bundle Size**: Assumes users can download initial bundle (target: < 500KB)
- **Memory Usage**: Assumes reasonable memory availability for data processing
- **CPU Resources**: Assumes sufficient CPU for real-time calculations
- **Network Speed**: Assumes broadband connection for optimal experience
- **Caching**: Browser caching is utilized for static assets

### **Security Assumptions**
- **HTTPS Required**: Assumes HTTPS deployment in production
- **No Sensitive Data**: No user credentials or personal data collected
- **API Security**: Binance API handles authentication and authorization
- **XSS Prevention**: React's built-in XSS protection is sufficient
- **CSRF Protection**: No server-side state reduces CSRF risk

### **Deployment Assumptions**
- **Node.js Environment**: Assumes Node.js 18+ runtime environment
- **Build Process**: Assumes npm/yarn for dependency management
- **Static Hosting**: Can be deployed to static hosting platforms
- **Environment Variables**: Configuration through environment variables
- **CDN Support**: Static assets can be served via CDN

### **Maintenance Assumptions**
- **Regular Updates**: Dependencies will be updated regularly
- **API Changes**: Binance API may change, requiring updates
- **Browser Updates**: New browser versions may require compatibility updates
- **Performance Monitoring**: Application performance will be monitored
- **User Feedback**: User feedback will guide feature development

### **Limitations & Constraints**
- **API Rate Limits**: Binance API has rate limiting (1200 requests/minute)
- **Data Retention**: No historical data storage beyond browser session
- **Real-time Accuracy**: WebSocket data may have network delays
- **Mobile Limitations**: Some features may be limited on mobile devices
- **Browser Compatibility**: Some features may not work in older browsers

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
