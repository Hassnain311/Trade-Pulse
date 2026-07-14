# TradePulse — Frontend

AI-powered crypto trading platform built with React + Vite + Tailwind CSS.

## Tech Stack

- **React 18** + **Vite** — fast dev server and build
- **React Router DOM v6** — client-side routing with lazy loading
- **Tailwind CSS** — utility-first styling with TradePulse design system
- **Axios** — HTTP client with JWT interceptors and auto token refresh
- **Socket.io Client** — real-time news feed and live updates
- **Lucide React** — icons

## Project Structure

```
tradepulse-frontend/
├── index.html
├── package.json
├── vite.config.js              # path aliases: @, @components, @pages, @api, @hooks, @utils
├── tailwind.config.js          # TradePulse design tokens (colors, fonts, animations)
├── postcss.config.js
├── .env.example                # copy to .env and fill in
├── .gitignore
└── src/
    ├── main.jsx                # entry point — BrowserRouter > AuthProvider > SocketProvider
    ├── App.jsx                 # Suspense wrapper
    ├── index.css               # Tailwind directives + global styles + component classes
    │
    ├── api/                    # All HTTP calls — nothing else
    │   ├── axiosInstance.js    # Base axios with JWT attach + auto-refresh on 401
    │   ├── auth.api.js         # register, login, OTP, logout, logoutAll, profile
    │   ├── market.api.js       # Binance REST + backend proxy market routes
    │   ├── trade.api.js        # Paper trading orders, portfolio, balance
    │   └── news.api.js         # Social feed CRUD
    │
    ├── context/
    │   ├── AuthContext.jsx     # user, token, isAuthenticated, saveAuth, logout, logoutAll
    │   └── SocketContext.jsx   # socket.io connection (only when authenticated)
    │
    ├── hooks/
    │   ├── useAuth.js          # re-export of useAuth from AuthContext
    │   ├── useSocket.js        # re-export of useSocket from SocketContext
    │   └── useMarketData.js    # useTickerData, useCoinTicker, useOrderBook, useAllTickers
    │
    ├── components/
    │   ├── common/             # shared across all pages
    │   │   ├── Navbar.jsx      # fixed top nav with profile dropdown + logout all devices
    │   │   ├── TickerBar.jsx   # scrolling live price bar (Binance WebSocket)
    │   │   ├── Button.jsx      # primary / secondary / ghost / danger variants
    │   │   ├── Input.jsx       # with label, error, password toggle
    │   │   └── Loader.jsx      # spinner + fullscreen loading
    │   ├── auth/
    │   │   ├── OtpInput.jsx    # 6-box OTP with auto-advance, backspace, paste
    │   │   └── ProtectedRoute.jsx
    │   ├── market/
    │   │   ├── CoinTable.jsx   # sortable, searchable, paginated coin list
    │   │   └── MarketStats.jsx # Hot / New / Top Gainer / Top Volume cards
    │   ├── trade/
    │   │   ├── OrderBook.jsx   # live bid/ask with depth visualization
    │   │   ├── TradingChart.jsx # TradingView widget wrapper
    │   │   └── BuySellPanel.jsx # paper trade order form
    │   ├── news/
    │   │   ├── PostCard.jsx    # social post with like, comment, sentiment badge
    │   │   ├── CreatePost.jsx  # post composer with sentiment selector
    │   │   └── NewsSidebar.jsx # trending topics + search
    │   ├── agents/
    │   │   └── AgentPanel.jsx  # AI prediction controls + results display
    │   └── portfolio/
    │       └── HoldingsTable.jsx # holdings + PortfolioStats export
    │
    ├── pages/
    │   ├── Landing.jsx         # hero + ticker + features + CTA
    │   ├── Register.jsx        # split layout signup form
    │   ├── OtpVerify.jsx       # 6-digit OTP + countdown resend timer
    │   ├── Login.jsx           # split layout login → OTP redirect
    │   ├── Dashboard.jsx       # full markets overview
    │   ├── Trade.jsx           # chart + order book + buy/sell
    │   ├── Agents.jsx          # TradingView + AI agent panel
    │   ├── News.jsx            # real-time social feed (Socket.io)
    │   └── Portfolio.jsx       # balance + holdings + trade history
    │
    ├── routes/
    │   └── AppRoutes.jsx       # public + protected route config
    │
    └── utils/
        ├── constants.js        # ROUTES, STORAGE_KEYS, API URLs, coin list
        ├── formatters.js       # formatPrice, formatChange, formatVolume, formatTimeAgo
        └── validators.js       # email, password, OTP, form validators
```

## Auth & Token Flow

```
Register → POST /api/auth/register
         → OTP email sent
         → POST /api/auth/verify-register-otp
         → redirect to Login

Login    → POST /api/auth/login
         → OTP email sent (requiresOtp: true)
         → POST /api/auth/verify-login-otp
         → { accessToken, refreshToken, user }
         → saved to localStorage + AuthContext

Every API request:
  axiosInstance attaches: Authorization: Bearer <accessToken>
  On 401: auto-calls POST /api/auth/refresh with refreshToken
          → gets new accessToken → retries original request

Logout (this device):   POST /api/auth/logout      → revokes refresh token
Logout (all devices):   POST /api/auth/logout-all  → increments tokenVersion
```

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env: set VITE_API_URL to your backend URL

# 3. Start development server
npm run dev
# → http://localhost:5173

# 4. Build for production
npm run build
```

## Design System

| Token         | Value       | Usage                    |
|---------------|-------------|--------------------------|
| tp-bg         | `#0B0C10`   | Page background          |
| tp-card       | `#13151C`   | Card backgrounds         |
| tp-accent     | `#00D4FF`   | Primary cyan (TradePulse)|
| tp-green      | `#00E676`   | Price up / profit        |
| tp-red        | `#FF3B5C`   | Price down / loss        |
| tp-text       | `#E2E8F0`   | Primary text             |
| tp-muted      | `#7E8BA0`   | Secondary text           |
| font-display  | Space Grotesk | Headings, buttons      |
| font-body     | Inter         | Body text               |
| font-mono     | JetBrains Mono| Prices, amounts        |
