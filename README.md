TradePulse is a full-stack AI-powered crypto trading simulation platform. It combines real-time market data, paper trading, a live social feed, and (upcoming) AI price prediction agents — built end-to-end with Node.js, React, MongoDB, and Socket.io.

⚠️ Paper trading only. No real money is involved anywhere in this platform. Built as a learning/portfolio project.


Features
🔐 Authentication & Security

Email + password registration with OTP email verification before login is allowed
JWT access & refresh tokens, both stored as httpOnly cookies (immune to XSS token theft)
Automatic silent token refresh on the frontend when the access token expires
Session model tracks every login (IP, User-Agent, revoked status)
Logout (current device) and Logout from all devices (revokes every active session)
Forgot / Reset password flow, OTP-verified
Passwords hashed with bcrypt; OTPs hashed with SHA-256 before being stored — nothing sensitive is ever stored in plain text
Profile picture upload via Multer (memory storage) + ImageKit CDN

📊 Live Market Data

Real-time prices, 24h stats, and candlestick history proxied from Binance's public API
In-memory caching layer to avoid hammering the exchange API
Top gainers / top volume endpoints
Full TradingView charting widget embed with RSI/MACD indicators

💰 Paper Trading

Market and Limit orders (Buy/Sell)
Real-time order book and live ticker via Binance WebSocket streams
Portfolio tracking with live P&L calculated against current market price
Trade history with pagination
Open orders list + order cancellation
Every new user starts with $100,000 virtual USDT balance

📰 Social Feed (real-time via Socket.io)

Create posts tagged with market sentiment (Bullish / Bearish / Neutral)
Like / Unlike, Comment, Delete (own posts only) — all broadcast live to every connected user
Full-text post search (regex-based, safely escaped)
Trending Topics — coin mentions ($BTC, $ETH, etc.) auto-extracted from posts in the last 24h, weighted by engagement
Live crypto news aggregated from CoinDesk, CoinTelegraph, and Decrypt RSS feeds
Read-only "Notifications" digest of the last 24 hours

🤖 AI Prediction Agents (coming soon)

Dedicated page with TradingView chart + prediction panel
Backend route scaffolded and ready — actual LSTM model integration planned for the AI/ML phase of this project's roadmap


Tech Stack
Backend

Node.js, Express
MongoDB + Mongoose
Socket.io (real-time feed)
JWT, bcrypt, crypto (SHA-256)
Multer + ImageKit (file uploads)
Nodemailer (OAuth2 Gmail) for OTP emails
rss-parser (crypto news), Axios (Binance API)

Frontend

React 18 + Vite
React Router v6
Tailwind CSS
Axios (with credentialed cookie-based requests + auto token refresh)
Socket.io-client
TradingView Widget
