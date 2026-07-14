import { useState, useEffect, useRef, useCallback } from 'react'
// import { BINANCE_WS_BASE, TICKER_COINS } from '../utils/constants'
// import { binanceAPI } from '../api/market.api'
import { BINANCE_WS_BASE, TICKER_COINS } from '../utils/constants'
import { marketAPI } from '../api/market.api'

// Live ticker for all coins in the top bar
export function useTickerData() {
  const [tickers, setTickers] = useState({})
  const wsRef = useRef(null)

  useEffect(() => {
    const streams = TICKER_COINS
      .map(c => `${c.pair.toLowerCase()}@miniTicker`)
      .join('/')
    const url = `${BINANCE_WS_BASE}/${streams}`

    const connect = () => {
      wsRef.current = new WebSocket(url)
      wsRef.current.onmessage = (e) => {
        const d = JSON.parse(e.data)
        if (d?.s) {
          setTickers(prev => ({
            ...prev,
            [d.s]: { price: d.c, change: d.P, high: d.h, low: d.l, volume: d.v }
          }))
        }
      }
      wsRef.current.onclose = () => setTimeout(connect, 3000)
      wsRef.current.onerror = () => wsRef.current?.close()
    }

    connect()
    return () => wsRef.current?.close()
  }, [])

  return tickers
}

// Live ticker for a single trading pair (used on trade page)
export function useCoinTicker(symbol) {
  const [data, setData] = useState(null)
  const wsRef = useRef(null)

  useEffect(() => {
    if (!symbol) return
    wsRef.current = new WebSocket(`${BINANCE_WS_BASE}/${symbol.toLowerCase()}@ticker`)
    wsRef.current.onmessage = (e) => {
      const d = JSON.parse(e.data)
      setData({
        price:      d.c,
        change:     d.P,
        changePct:  d.p,
        high:       d.h,
        low:        d.l,
        volume:     d.v,
        quoteVol:   d.q,
        prevClose:  d.x,
      })
    }
    wsRef.current.onerror = () => wsRef.current?.close()
    return () => wsRef.current?.close()
  }, [symbol])

  return data
}

// Live order book (used on trade page)
export function useOrderBook(symbol) {
  const [book, setBook] = useState({ bids: [], asks: [] })
  const wsRef = useRef(null)

  useEffect(() => {
    if (!symbol) return
    wsRef.current = new WebSocket(`${BINANCE_WS_BASE}/${symbol.toLowerCase()}@depth20@100ms`)
    wsRef.current.onmessage = (e) => {
      const d = JSON.parse(e.data)
      setBook({ bids: d.bids?.slice(0, 15) || [], asks: d.asks?.slice(0, 15) || [] })
    }
    wsRef.current.onerror = () => wsRef.current?.close()
    return () => wsRef.current?.close()
  }, [symbol])

  return book
}

// Fetch all tickers (rest, refreshed every 5s) for markets page
export function useAllTickers() {
  const [tickers, setTickers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  // const fetchAll = useCallback(async () => {
  //   try {
  //     const res = await binanceAPI.getAllTickers()
  //     const sorted = res.data
  //       .filter(t => t.symbol.endsWith('USDT'))
  //       .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
  //     setTickers(sorted)
  //     setError(null)
  //   } catch (err) {
  //     setError('Failed to fetch market data')
  //   } finally {
  //     setLoading(false)
  //   }
  // }, [])

  const fetchAll = useCallback(async () => {
    try {
      const res = await marketAPI.getCoinList()
      const sorted = [...res.data.coins]
        .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
      setTickers(sorted)
      setError(null)
    } catch (err) {
      setError('Failed to fetch market data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const id = setInterval(fetchAll, 5000)
    return () => clearInterval(id)
  }, [fetchAll])

  return { tickers, loading, error, refetch: fetchAll }
}
