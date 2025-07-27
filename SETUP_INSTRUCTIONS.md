# Market Seasonality Explorer - Setup Instructions

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
- **npm or yarn** - Package manager (comes with Node.js)
- **Git** - Version control system
- **Modern Browser** - Chrome, Firefox, Safari, or Edge

### System Requirements
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB free space
- **Network**: Stable internet connection for API access

---

## 📦 Installation Steps

### 1. Clone the Repository
```bash
# Clone the repository
git clone <repository-url>
cd market-seasonality-explorer

# Verify the clone
ls -la
```

### 2. Install Dependencies
```bash
# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

### 3. Environment Configuration
Create a `.env.local` file in the project root:

```env
# API Configuration
NEXT_PUBLIC_BINANCE_API_URL=https://api.binance.com/api/v3
NEXT_PUBLIC_WS_URL=wss://stream.binance.com:9443/ws

# Feature Flags
NEXT_PUBLIC_ENABLE_REAL_TIME=true
NEXT_PUBLIC_ENABLE_ALERTS=true

# Development Settings
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_MOCK_DATA_FALLBACK=true
```

### 4. Start Development Server
```bash
# Start the development server
npm run dev

# The application will be available at:
# http://localhost:3000
```

### 5. Verify Installation
- Open your browser to `http://localhost:3000`
- You should see the Market Seasonality Explorer interface
- Check that the calendar view loads properly
- Verify that test data is displayed

---

## 🛠️ Available Scripts

### Development Commands
```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run development server on specific port
npm run dev -- -p 3001
```

### Testing Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test CalendarComponent.test.tsx

# Run tests with verbose output
npm test -- --verbose
```

### Code Quality Commands
```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Type checking
npm run type-check

# Build type checking
npm run build -- --no-lint
```

### Utility Commands
```bash
# Clean build artifacts
npm run clean

# Analyze bundle size
npm run analyze

# Generate API documentation
npm run docs:generate
```

---

## 🔧 Configuration Options

### Environment Variables

#### Required Variables
```env
# Binance API Configuration
NEXT_PUBLIC_BINANCE_API_URL=https://api.binance.com/api/v3
NEXT_PUBLIC_WS_URL=wss://stream.binance.com:9443/ws
```

#### Optional Variables
```env
# Feature Toggles
NEXT_PUBLIC_ENABLE_REAL_TIME=true
NEXT_PUBLIC_ENABLE_ALERTS=true
NEXT_PUBLIC_ENABLE_PATTERNS=true
NEXT_PUBLIC_ENABLE_EXPORT=true

# Development Settings
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_MOCK_DATA_FALLBACK=true
NEXT_PUBLIC_LOG_LEVEL=info

# Performance Settings
NEXT_PUBLIC_CACHE_DURATION=300000
NEXT_PUBLIC_MAX_DATA_POINTS=1000
```

### Tailwind Configuration
The project uses Tailwind CSS with custom financial data colors:

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'market-green': '#00ff88',
        'market-red': '#ff4444',
        'market-blue': '#0088ff',
        'market-yellow': '#ffaa00',
        'market-purple': '#8844ff',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    }
  }
}
```

### TypeScript Configuration
The project uses strict TypeScript configuration:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

---

## 🚀 Deployment Options

### 1. Vercel Deployment (Recommended)

#### Automatic Deployment
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

#### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

### 2. Docker Deployment

#### Create Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Build and Run Docker Container
```bash
# Build the Docker image
docker build -t market-seasonality-explorer .

# Run the container
docker run -p 3000:3000 market-seasonality-explorer

# Run with environment variables
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_BINANCE_API_URL=https://api.binance.com/api/v3 \
  market-seasonality-explorer
```

### 3. Traditional Server Deployment

#### Build for Production
```bash
# Install dependencies
npm ci --only=production

# Build the application
npm run build

# Start the production server
npm start
```

#### Using PM2 (Process Manager)
```bash
# Install PM2 globally
npm install -g pm2

# Start the application with PM2
pm2 start npm --name "market-explorer" -- start

# Monitor the application
pm2 monit

# View logs
pm2 logs market-explorer
```

---

## 🧪 Testing Setup

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test suite
npm test -- --testPathPattern=CalendarComponent

# Run tests with verbose output
npm test -- --verbose
```

### Test Configuration
The project uses Jest with the following configuration:

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
}
```

### Test Data
The project includes comprehensive test data scenarios:

```typescript
// src/utils/dataScenarios.ts
export const mockData = {
  bullMarket: [...],
  bearMarket: [...],
  highVolatility: [...],
  lowLiquidity: [...],
  seasonalPatterns: [...]
};
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Error: Port 3000 is already in use
# Solution: Use a different port
npm run dev -- -p 3001
```

#### 2. Node Version Issues
```bash
# Check Node.js version
node --version

# If version is < 18, upgrade Node.js
# Download from https://nodejs.org/
```

#### 3. Dependency Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. TypeScript Errors
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Fix type issues
npm run type-check
```

#### 5. Build Failures
```bash
# Clean build artifacts
npm run clean

# Rebuild
npm run build
```

### Performance Issues

#### 1. Slow Development Server
```bash
# Use Turbopack for faster builds
npm run dev --turbo

# Or use specific port
npm run dev -- -p 3001
```

#### 2. Memory Issues
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run dev
```

### API Issues

#### 1. Binance API Rate Limits
- The application includes automatic rate limiting
- Fallback to mock data when API is unavailable
- Check network connectivity

#### 2. WebSocket Connection Issues
- Verify `NEXT_PUBLIC_WS_URL` in environment variables
- Check firewall settings
- Ensure stable internet connection

---

## 📊 Monitoring & Analytics

### Development Monitoring
```bash
# Monitor bundle size
npm run analyze

# Check for unused dependencies
npm run deps:check

# Run performance audit
npm run audit
```

### Production Monitoring
- **Error Tracking**: Built-in error boundaries
- **Performance Monitoring**: React DevTools integration
- **User Analytics**: Optional Google Analytics integration

### Logging
```bash
# Enable debug logging
DEBUG=* npm run dev

# View application logs
npm run logs
```

---

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env.local` to version control
- Use different API keys for development and production
- Rotate API keys regularly

### API Security
- The application uses public Binance API endpoints
- No sensitive data is stored locally
- All data processing happens client-side

### Browser Security
- HTTPS enforcement in production
- Content Security Policy (CSP) headers
- XSS prevention through React's built-in protections

---

## 📞 Support

### Getting Help
1. **Check the documentation** - This file and README.md
2. **Review test examples** - See `src/__tests__/` for usage examples
3. **Check TypeScript definitions** - See `src/types/` for type information
4. **Create an issue** - Report bugs or request features

### Community Resources
- **GitHub Issues**: For bug reports and feature requests
- **Stack Overflow**: For general questions
- **Discord**: For community discussions

### Development Resources
- **Next.js Documentation**: https://nextjs.org/docs
- **React Documentation**: https://react.dev
- **TypeScript Handbook**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

---

