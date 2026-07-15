export const API_BASE_URL = ''

export const ROUTES = {
  HOME:      '/',
  LOGIN:     '/login',
  REGISTER:  '/register',
  OTP:       '/verify-otp',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD:  '/reset-password',
  DASHBOARD: '/dashboard',
  TRADE:     '/trade',
  AGENTS:    '/agents',
  NEWS:      '/news',
  PORTFOLIO: '/portfolio',
}

export const STORAGE_KEYS = {
  TOKEN:         'tp_access_token',
  REFRESH_TOKEN: 'tp_refresh_token',
  USER:          'tp_user',
  OTP_EMAIL:     'tp_otp_email',
  OTP_PURPOSE:   'tp_otp_purpose',
  RESET_EMAIL:   'tp_reset_email',
}

export const OTP_PURPOSE = {
  REGISTER: 'register',
  LOGIN:    'login',
  RESET:    'reset',
}

export const BINANCE_WS_BASE  = 'wss://stream.binance.com:9443/ws'
export const BINANCE_API_BASE = 'https://api.binance.com/api/v3'
export const COINGECKO_BASE   = 'https://api.coingecko.com/api/v3'

export const TICKER_COINS = [
  { symbol: 'BTC',   pair: 'BTCUSDT',   name: 'Bitcoin'   },
  { symbol: 'ETH',   pair: 'ETHUSDT',   name: 'Ethereum'  },
  { symbol: 'BNB',   pair: 'BNBUSDT',   name: 'BNB'       },
  { symbol: 'SOL',   pair: 'SOLUSDT',   name: 'Solana'    },
  { symbol: 'XRP',   pair: 'XRPUSDT',   name: 'XRP'       },
  { symbol: 'DOGE',  pair: 'DOGEUSDT',  name: 'Dogecoin'  },
  { symbol: 'ADA',   pair: 'ADAUSDT',   name: 'Cardano'   },
  { symbol: 'AVAX',  pair: 'AVAXUSDT',  name: 'Avalanche' },
  { symbol: 'DOT',   pair: 'DOTUSDT',   name: 'Polkadot'  },
  { symbol: 'MATIC', pair: 'MATICUSDT', name: 'Polygon'   },
  { symbol: 'LINK',  pair: 'LINKUSDT',  name: 'Chainlink' },
  { symbol: 'UNI',   pair: 'UNIUSDT',   name: 'Uniswap'   },
]

export const DEFAULT_SYMBOL = 'BTCUSDT'

export const CHART_INTERVALS = [
  { label: '1m',  tv: '1'   },
  { label: '5m',  tv: '5'   },
  { label: '15m', tv: '15'  },
  { label: '1H',  tv: '60'  },
  { label: '4H',  tv: '240' },
  { label: '1D',  tv: 'D'   },
  { label: '1W',  tv: 'W'   },
]

export const OTP_RESEND_SECONDS = 60

// Mock initial balance for paper trading
export const INITIAL_PAPER_BALANCE = 100000
