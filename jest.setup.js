import '@testing-library/jest-dom'

jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => <div>{children}</div>,
}))

jest.mock('recharts', () => ({
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  ScatterChart: ({ children }) => <div data-testid="scatter-chart">{children}</div>,
  Scatter: () => <div data-testid="scatter" />,
}))

jest.mock('html2canvas', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({
    toDataURL: jest.fn().mockReturnValue('data:image/png;base64,mock'),
  }),
}))

jest.mock('jspdf', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    addImage: jest.fn(),
    save: jest.fn(),
  })),
}))

jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => {
    if (!date) return '';
    if (formatStr === 'yyyy-MM-dd') {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    if (formatStr === 'MMMM yyyy') {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${month} ${year}`;
    }
    if (formatStr === 'MMM dd') return 'Jan 01';
    if (formatStr === 'yyyy-MM') return '2024-01';
    if (formatStr === 'MMM dd, yyyy') return 'Jan 01, 2024';
    return date.toISOString ? date.toISOString() : '';
  }),
  startOfMonth: jest.fn((date) => new Date(date.getFullYear(), date.getMonth(), 1)),
  endOfMonth: jest.fn((date) => new Date(date.getFullYear(), date.getMonth() + 1, 0)),
  addMonths: jest.fn((date, months) => new Date(date.getFullYear(), date.getMonth() + months, date.getDate())),
  subMonths: jest.fn((date, months) => new Date(date.getFullYear(), date.getMonth() - months, date.getDate())),
  addYears: jest.fn((date, years) => new Date(date.getFullYear() + years, date.getMonth(), date.getDate())),
  subYears: jest.fn((date, years) => new Date(date.getFullYear() - years, date.getMonth(), date.getDate())),
  addDays: jest.fn((date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)),
  subDays: jest.fn((date, days) => new Date(date.getTime() - days * 24 * 60 * 60 * 1000)),
  isSameMonth: jest.fn((date1, date2) => date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear()),
  startOfWeek: jest.fn((date) => new Date(date.getTime() - date.getDay() * 24 * 60 * 60 * 1000)),
  addWeeks: jest.fn((date, weeks) => new Date(date.getTime() + weeks * 7 * 24 * 60 * 60 * 1000)),
}))

global.WebSocket = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1,
}))

Object.defineProperty(window, 'Notification', {
  value: {
    permission: 'granted',
    requestPermission: jest.fn().mockResolvedValue('granted'),
  },
  writable: true,
})

Object.defineProperty(window, 'AudioContext', {
  value: jest.fn().mockImplementation(() => ({
    createOscillator: jest.fn().mockReturnValue({
      connect: jest.fn(),
      frequency: { setValueAtTime: jest.fn() },
      start: jest.fn(),
      stop: jest.fn(),
    }),
    createGain: jest.fn().mockReturnValue({
      connect: jest.fn(),
      gain: { setValueAtTime: jest.fn() },
    }),
    destination: {},
    currentTime: 0,
  })),
  writable: true,
}) 