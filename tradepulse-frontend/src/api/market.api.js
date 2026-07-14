import axios from 'axios'
import axiosInstance from './axiosInstance'
import { BINANCE_API_BASE } from '../utils/constants'

// ── Backend proxy routes (caching + rate limit control) ──
export const marketAPI = {
  getCoinList:     ()                  => axiosInstance.get('/api/market/coins'),
  getCoinDetail:   (symbol)            => axiosInstance.get(`/api/market/coin/${symbol}`),
  getHistory:      (symbol, interval)  => axiosInstance.get(`/api/market/history/${symbol}?interval=${interval}`),
  getOrderBook:    (symbol)            => axiosInstance.get(`/api/market/orderbook/${symbol}`),
  getRecentTrades: (symbol)            => axiosInstance.get(`/api/market/trades/${symbol}`),
  searchCoins:     (query)             => axiosInstance.get(`/api/market/search?q=${query}`),
  getTopGainers:   ()                  => axiosInstance.get('/api/market/top-gainers'),
  getTopVolume:    ()                  => axiosInstance.get('/api/market/top-volume'),
}

// ── Direct Binance calls (public, no auth, used in frontend for live data) ──
export const binanceAPI = {
  getAllTickers:  () =>
    axios.get(`${BINANCE_API_BASE}/ticker/24hr`),

  getPrice:      (symbol) =>
    axios.get(`${BINANCE_API_BASE}/ticker/price?symbol=${symbol}`),

  get24hrTicker: (symbol) =>
    axios.get(`${BINANCE_API_BASE}/ticker/24hr?symbol=${symbol}`),

  getKlines:     (symbol, interval, limit = 100) =>
    axios.get(`${BINANCE_API_BASE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`),

  getOrderBook:  (symbol, limit = 20) =>
    axios.get(`${BINANCE_API_BASE}/depth?symbol=${symbol}&limit=${limit}`),

  getRecentTrades: (symbol, limit = 30) =>
    axios.get(`${BINANCE_API_BASE}/trades?symbol=${symbol}&limit=${limit}`),
}
