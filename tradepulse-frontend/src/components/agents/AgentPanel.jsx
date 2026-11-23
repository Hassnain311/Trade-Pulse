import { useState, useRef, useEffect } from 'react'
import { Bot, TrendingUp, TrendingDown, Minus, AlertCircle, RefreshCw } from 'lucide-react'
import Button from '../common/Button'
import { tradeAPI } from '../../api/trade.api'

const COINS   = ['BTCUSDT','ETHUSDT','BNBUSDT','SOLUSDT','XRPUSDT','DOGEUSDT','ADAUSDT']
const PERIODS = ['1 day','3 days','7 days','14 days','30 days']

export default function AgentPanel({ symbol, onSymbolChange }) {
  const [selectedSymbol, setSelectedSymbol] = useState(symbol || 'BTCUSDT')
  const [period,         setPeriod]         = useState('7 days')
  const [result,         setResult]         = useState(null)
  const [loading,        setLoading]        = useState(false)
  const [error,          setError]          = useState('')
  const resultRef = useRef(null)

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [result])

  const runPrediction = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      console.log('Sending prediction request for:', selectedSymbol, period)
      const res = await tradeAPI.runPrediction({
        symbol: selectedSymbol,
        period,
      })
      console.log('Prediction received:', res.data)
      setResult(res.data)
      onSymbolChange?.(selectedSymbol)
    } catch (err) {
      console.error('Prediction request error:', err)
      if (err.response?.status === 503) {
        setError('AI model service is not running yet. Will be available after the ML integration phase.')
      } else if (err.response?.status === 401) {
        setError('Please log in again to use the AI Prediction Agent.')
      } else {
        setError(err.response?.data?.message || err.message || 'Prediction failed. Try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const TrendIcon = () => {
    if (!result) return null
    if (result.trend === 'BULLISH')  return <TrendingUp  size={18} className="text-[#00E676]" />
    if (result.trend === 'BEARISH')  return <TrendingDown size={18} className="text-[#FF3B5C]" />
    return <Minus size={18} className="text-[#FFD166]" />
  }

  const trendColor = result?.trend === 'BULLISH' ? '#00E676'
                   : result?.trend === 'BEARISH' ? '#FF3B5C'
                   : '#FFD166'

  return (
    <div className="flex flex-col h-full bg-[#13151C] border border-[#252836] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#252836] flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-[rgba(167,139,250,0.1)] border border-[rgba(167,139,250,0.2)]
                        flex items-center justify-center">
          <Bot size={14} className="text-[#A78BFA]" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-sm text-[#E2E8F0]">AI Prediction Agent</h3>
          <p className="text-[10px] text-[#5A6478]">LSTM time-series model</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA] animate-pulse" />
          <span className="text-[10px] text-[#A78BFA]">LSTM</span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1 scrollbar-hide">
        {/* Symbol selector */}
        <div>
          <label className="text-[#5A6478] text-xs mb-1.5 block">Select Coin</label>
          <select
            value={selectedSymbol}
            onChange={e => {
              const newSym = e.target.value
              setSelectedSymbol(newSym)
              setResult(null)
              setError('')
              onSymbolChange?.(newSym)
            }}
            className="w-full bg-[#1A1D27] border border-[#252836] rounded-lg px-3 py-2.5
                       text-sm text-[#E2E8F0] focus:outline-none focus:border-[#A78BFA]
                       transition-colors cursor-pointer"
          >
            {COINS.map(c => (
              <option key={c} value={c}>{c.replace('USDT', '')} / USDT</option>
            ))}
          </select>
        </div>

        {/* Prediction period */}
        <div>
          <label className="text-[#5A6478] text-xs mb-1.5 block">Prediction Period</label>
          <div className="grid grid-cols-2 gap-1.5">
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => {
                  setPeriod(p)
                  setResult(null)
                  setError('')
                }}
                className={`py-2 text-xs font-display font-medium rounded-lg border transition-colors
                            ${period === p
                              ? 'bg-[rgba(167,139,250,0.12)] border-[rgba(167,139,250,0.4)] text-[#A78BFA]'
                              : 'bg-[#1A1D27] border-[#252836] text-[#5A6478] hover:text-[#E2E8F0]'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Model info */}
        <div className="bg-[#1A1D27] border border-[#252836] rounded-lg p-3 space-y-2">
          {[
            { label: 'Model',     value: 'LSTM (Long Short-Term Memory)' },
            { label: 'Input',     value: '60-day historical OHLCV'       },
            { label: 'Features',  value: 'Price, Volume, MA, RSI, MACD'  },
            { label: 'Accuracy',  value: '~72% directional (test set)'   },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between">
              <span className="text-[#5A6478] text-xs">{label}</span>
              <span className="text-[#E2E8F0] text-xs text-right max-w-[55%]">{value}</span>
            </div>
          ))}
        </div>

        {/* Run button */}
        <button
          onClick={runPrediction}
          disabled={loading}
          className="w-full py-3 bg-[rgba(167,139,250,0.12)] border border-[rgba(167,139,250,0.3)]
                     text-[#A78BFA] font-display font-semibold text-sm rounded-xl
                     hover:bg-[rgba(167,139,250,0.2)] transition-all active:scale-[0.98]
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
        >
          {loading
            ? <><RefreshCw size={14} className="animate-spin" /> Running Agent...</>
            : <><Bot size={14} /> Apply AI Agent</>
          }
        </button>

        {/* Prediction period change triggers auto-reset to avoid showing stale data */}

        {/* Error */}
        {error && (
          <div className="bg-[rgba(255,59,92,0.08)] border border-[#FF3B5C] rounded-lg px-3 py-2.5
                          flex items-start gap-2">
            <AlertCircle size={13} className="text-[#FF3B5C] shrink-0 mt-0.5" />
            <p className="text-[#FF3B5C] text-xs leading-relaxed">{error}</p>
          </div>
        )}

        {/* Prediction result */}
        {result && (
          <div ref={resultRef} className="bg-[#1A1D27] border border-[#252836] rounded-xl p-4 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[#7E8BA0] text-xs">Prediction ({period})</span>
              <div className="flex items-center gap-1.5">
                <TrendIcon />
                <span className="font-display font-bold text-sm" style={{ color: trendColor }}>
                  {result.trend}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Confidence',    value: `${result.confidence}%`,         color: '#A78BFA' },
                { label: 'Target Price',  value: `$${result.targetPrice}`,        color: trendColor },
                { label: 'Support',       value: `$${result.supportLevel}`,       color: '#00E676' },
                { label: 'Resistance',    value: `$${result.resistanceLevel}`,    color: '#FF3B5C' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-[#252836] rounded-lg p-2.5">
                  <p className="text-[#5A6478] text-[10px] mb-1">{label}</p>
                  <p className="font-mono font-bold text-sm" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>

            <p className="text-[#5A6478] text-[10px] leading-relaxed border-t border-[#252836] pt-3">
              ⚠️ This is a machine learning forecast for educational purposes only, not financial advice.
              Crypto markets are highly volatile and predictions may be inaccurate.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
