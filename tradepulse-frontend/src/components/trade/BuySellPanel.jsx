import { useState, useEffect } from 'react'
import { Zap, AlertCircle } from 'lucide-react'
import Button from '../common/Button'
import { tradeAPI } from '../../api/trade.api'
import { formatPrice, formatBalance } from '../../utils/formatters'

const TABS = ['Market', 'Limit', 'Stop']

export default function BuySellPanel({ symbol = 'BTCUSDT', currentPrice = 0 }) {
  const [side,      setSide]      = useState('BUY')
  const [orderType, setOrderType] = useState('Market')
  const [amount,    setAmount]    = useState('')
  const [price,     setPrice]     = useState('')
  const [total,     setTotal]     = useState('')
  const [balance,   setBalance]   = useState({ USDT: 100000, base: 0 })
  const [loading,   setLoading]   = useState(false)
  const [message,   setMessage]   = useState({ type: '', text: '' })

  const baseSymbol = symbol.replace('USDT', '')

  // Fetch balance on mount — uses access token via axiosInstance
  useEffect(() => {
    tradeAPI.getBalance()
      .then(res => setBalance(res.data))
      .catch(() => {}) // silently fail — balance stays at default
  }, [])

  // Auto-fill price with current market price for limit orders
  useEffect(() => {
    if (orderType === 'Market' && currentPrice) {
      setPrice(currentPrice.toString())
    }
  }, [currentPrice, orderType])

  // Auto-calculate total
  const handleAmountChange = (val) => {
    setAmount(val)
    const p = orderType === 'Market' ? currentPrice : parseFloat(price)
    if (val && p) setTotal((parseFloat(val) * p).toFixed(2))
    else setTotal('')
  }

  const handleTotalChange = (val) => {
    setTotal(val)
    const p = orderType === 'Market' ? currentPrice : parseFloat(price)
    if (val && p) setAmount((parseFloat(val) / p).toFixed(6))
    else setAmount('')
  }

  const PERCENT_BTNS = [25, 50, 75, 100]
  const handlePct = (pct) => {
    const avail = side === 'BUY' ? balance.USDT : balance.base
    const p     = orderType === 'Market' ? currentPrice : parseFloat(price) || currentPrice
    if (side === 'BUY') {
      const t = ((avail * pct) / 100).toFixed(2)
      setTotal(t)
      if (p) setAmount((parseFloat(t) / p).toFixed(6))
    } else {
      const a = ((avail * pct) / 100).toFixed(6)
      setAmount(a)
      if (p) setTotal((parseFloat(a) * p).toFixed(2))
    }
  }

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setMessage({ type: 'error', text: 'Enter a valid amount' }); return
    }
    setLoading(true)
    setMessage({ type: '', text: '' })
    try {
      // tradeAPI.placeTrade uses axiosInstance which auto-attaches Bearer token
      // If token expired → axiosInstance auto-refreshes via refresh token → retries
      await tradeAPI.placeTrade({
        symbol,
        side,
        type:   orderType.toUpperCase(),
        amount: parseFloat(amount),
        price:  parseFloat(orderType === 'Market' ? currentPrice : price),
      })
      setMessage({ type: 'success', text: `${side} order placed! ${amount} ${baseSymbol}` })
      setAmount(''); setTotal('')
      // Refresh balance after trade
      tradeAPI.getBalance().then(res => setBalance(res.data)).catch(() => {})
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Order failed. Try again.' })
    } finally {
      setLoading(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 4000)
    }
  }

  return (
    <div className="bg-[#13151C] border border-[#252836] rounded-xl overflow-hidden flex flex-col">
      {/* Buy / Sell toggle */}
      <div className="grid grid-cols-2">
        {['BUY', 'SELL'].map(s => (
          <button
            key={s}
            onClick={() => setSide(s)}
            className={`py-3 text-sm font-display font-bold transition-colors
                        ${side === s
                          ? s === 'BUY'
                            ? 'bg-[#00E676] text-[#0B0C10]'
                            : 'bg-[#FF3B5C] text-white'
                          : 'bg-[#1A1D27] text-[#5A6478] hover:text-[#E2E8F0]'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Order type tabs */}
        <div className="flex items-center gap-0.5 bg-[#1A1D27] p-0.5 rounded-lg">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setOrderType(t)}
              className={`flex-1 py-1.5 text-xs font-display font-medium rounded-md transition-colors
                          ${orderType === t
                            ? 'bg-[#252836] text-[#E2E8F0]'
                            : 'text-[#5A6478] hover:text-[#E2E8F0]'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Available balance */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#5A6478]">Available</span>
          <span className="text-[#E2E8F0] font-mono">
            {side === 'BUY'
              ? formatBalance(balance.USDT, 'USDT')
              : formatBalance(balance.base, baseSymbol)}
          </span>
        </div>

        {/* Price input (for Limit/Stop) */}
        {orderType !== 'Market' && (
          <div>
            <label className="text-[#5A6478] text-xs mb-1.5 block">Price (USDT)</label>
            <div className="relative">
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#1A1D27] border border-[#252836] rounded-lg px-4 py-2.5
                           text-sm text-right font-mono text-[#E2E8F0] placeholder:text-[#5A6478]
                           focus:outline-none focus:border-[#00D4FF] transition-colors
                           [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                           [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5A6478]">USDT</span>
            </div>
          </div>
        )}

        {orderType === 'Market' && (
          <div className="bg-[#1A1D27] border border-[#252836] rounded-lg px-4 py-2.5 flex justify-between">
            <span className="text-xs text-[#5A6478]">Market Price</span>
            <span className="text-sm font-mono text-[#00D4FF]">${formatPrice(currentPrice)}</span>
          </div>
        )}

        {/* Amount input */}
        <div>
          <label className="text-[#5A6478] text-xs mb-1.5 block">Amount ({baseSymbol})</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={e => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[#1A1D27] border border-[#252836] rounded-lg px-4 py-2.5
                         text-sm text-right font-mono text-[#E2E8F0] placeholder:text-[#5A6478]
                         focus:outline-none focus:border-[#00D4FF] transition-colors
                         [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                         [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5A6478]">{baseSymbol}</span>
          </div>
        </div>

        {/* Percentage quick-fill buttons */}
        <div className="grid grid-cols-4 gap-1.5">
          {PERCENT_BTNS.map(pct => (
            <button
              key={pct}
              onClick={() => handlePct(pct)}
              className="py-1.5 text-xs text-[#5A6478] bg-[#1A1D27] border border-[#252836]
                         rounded-lg hover:border-[#00D4FF] hover:text-[#00D4FF] transition-colors font-display"
            >
              {pct}%
            </button>
          ))}
        </div>

        {/* Total input */}
        <div>
          <label className="text-[#5A6478] text-xs mb-1.5 block">Total (USDT)</label>
          <div className="relative">
            <input
              type="number"
              value={total}
              onChange={e => handleTotalChange(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[#1A1D27] border border-[#252836] rounded-lg px-4 py-2.5
                         text-sm text-right font-mono text-[#E2E8F0] placeholder:text-[#5A6478]
                         focus:outline-none focus:border-[#00D4FF] transition-colors
                         [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                         [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5A6478]">USDT</span>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs
                          ${message.type === 'success'
                            ? 'bg-[rgba(0,230,118,0.08)] border border-[#00E676] text-[#00E676]'
                            : 'bg-[rgba(255,59,92,0.08)] border border-[#FF3B5C] text-[#FF3B5C]'}`}>
            <AlertCircle size={13} className="shrink-0 mt-0.5" />
            {message.text}
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !amount}
          className={`w-full py-3 rounded-xl font-display font-bold text-sm transition-all
                      active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center justify-center gap-2
                      ${side === 'BUY'
                        ? 'bg-[#00E676] hover:opacity-90 text-[#0B0C10]'
                        : 'bg-[#FF3B5C] hover:opacity-90 text-white'}`}
        >
          <Zap size={15} />
          {loading ? 'Placing...' : `${side} ${baseSymbol}`}
        </button>

        <p className="text-[#5A6478] text-[10px] text-center leading-relaxed">
          Paper trading only — no real money involved
        </p>
      </div>
    </div>
  )
}
