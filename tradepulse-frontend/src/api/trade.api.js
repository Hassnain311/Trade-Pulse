import axiosInstance from './axiosInstance'

const TRADE = '/api/trade'

export const tradeAPI = {
  // Paper trading
  placeTrade:       (data) => axiosInstance.post(`${TRADE}/place`, data),
  cancelOrder:      (id)   => axiosInstance.delete(`${TRADE}/order/${id}`),

  // Data fetching
  getOpenOrders:    ()     => axiosInstance.get(`${TRADE}/open-orders`),
  getTradeHistory:  ()     => axiosInstance.get(`${TRADE}/history`),
  getPortfolio:     ()     => axiosInstance.get(`${TRADE}/portfolio`),
  // getBalance:       ()     => axiosInstance.get(`${TRADE}/balance`),
  getBalance: (symbol) => axiosInstance.get(`${TRADE}/balance${symbol ? `?symbol=${symbol}` : ''}`),

  // AI Agent predictions
  runPrediction:    (data) => axiosInstance.post('/api/agents/predict', data),
  getPredictions:   (symbol) => axiosInstance.get(`/api/agents/predictions/${symbol}`),
}
