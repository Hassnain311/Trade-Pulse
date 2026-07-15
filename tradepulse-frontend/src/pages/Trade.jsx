// import { useState } from 'react'
// import { useParams, Link } from 'react-router-dom'
// import { Star, TrendingUp, TrendingDown, ArrowLeft } from 'lucide-react'
// import Navbar from '../components/common/Navbar'
// import OrderBook from '../components/trade/OrderBook'
// import TradingChart from '../components/trade/TradingChart'
// import BuySellPanel from '../components/trade/BuySellPanel'
// import { useCoinTicker } from '../hooks/useMarketData'
// import { formatPrice, formatChange, formatVolume, isPositiveChange } from '../utils/formatters'
// import { ROUTES } from '../utils/constants'

// function StatItem({ label, value, color }) {
//   return (
//     <div className="flex flex-col">
//       <span className="text-[#5A6478] text-[10px] font-medium">{label}</span>
//       <span className={`font-mono text-xs font-medium mt-0.5 ${color || 'text-[#E2E8F0]'}`}>{value}</span>
//     </div>
//   )
// }

// export default function Trade() {
//   const { symbol = 'BTCUSDT' } = useParams()
//   const [interval, setInterval] = useState('1D')
//   const ticker = useCoinTicker(symbol)

//   const baseSymbol  = symbol.replace('USDT', '')
//   const price       = ticker?.price   || '—'
//   const change      = ticker?.change  || '0'
//   const isUp        = isPositiveChange(change)

//   return (
//     <div className="h-screen bg-[#0B0C10] text-[#E2E8F0] flex flex-col overflow-hidden">
//       <Navbar />

//       {/* ── Trade header ── */}
//       <div className="mt-16 border-b border-[#252836] bg-[#13151C] px-4 py-2.5 flex items-center gap-4 overflow-x-auto scrollbar-hide shrink-0">
//         {/* Back */}
//         <Link to={ROUTES.DASHBOARD} className="text-[#5A6478] hover:text-[#E2E8F0] transition-colors shrink-0">
//           <ArrowLeft size={16} />
//         </Link>

//         {/* Symbol */}
//         <div className="flex items-center gap-2 shrink-0">
//           <button className="text-[#5A6478] hover:text-[#FFD166] transition-colors">
//             <Star size={14} />
//           </button>
//           <div className="w-7 h-7 rounded-full bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.15)]
//                           flex items-center justify-center">
//             <span className="text-[#00D4FF] text-[10px] font-mono font-bold">{baseSymbol.slice(0,2)}</span>
//           </div>
//           <div>
//             <p className="font-display font-bold text-sm text-[#E2E8F0] leading-none">{baseSymbol}/USDT</p>
//             <p className="text-[#5A6478] text-[10px]">Perpetual</p>
//           </div>
//         </div>

//         {/* Live price */}
//         <div className="shrink-0">
//           <p className={`font-mono font-bold text-lg leading-none ${isUp ? 'text-[#00E676]' : 'text-[#FF3B5C]'}`}>
//             ${formatPrice(price)}
//           </p>
//           <div className={`flex items-center gap-1 ${isUp ? 'text-[#00E676]' : 'text-[#FF3B5C]'}`}>
//             {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
//             <span className="font-mono text-xs">{formatChange(change)}</span>
//           </div>
//         </div>

//         {/* Divider */}
//         <div className="w-px h-8 bg-[#252836] shrink-0" />

//         {/* Stats */}
//         <div className="flex items-center gap-6">
//           <StatItem label="24h High"       value={`$${formatPrice(ticker?.high)}`}  color="text-[#00E676]" />
//           <StatItem label="24h Low"        value={`$${formatPrice(ticker?.low)}`}   color="text-[#FF3B5C]" />
//           <StatItem label="24h Vol"        value={formatVolume(ticker?.volume)}      />
//           <StatItem label="24h Vol (USDT)" value={formatVolume(ticker?.quoteVol)}   />
//         </div>
//       </div>

//       {/* ── Main trading layout ── */}
//       <div className="flex-1 flex overflow-hidden min-h-0">

//         {/* Left: Order Book */}
//         <div className="w-[220px] shrink-0 p-2 hidden lg:block">
//           <OrderBook symbol={symbol} />
//         </div>

//         {/* Center: Chart */}
//         <div className="flex-1 flex flex-col gap-2 p-2 min-w-0">
//           <div className="flex-1 min-h-0">
//             <TradingChart symbol={symbol} interval={interval} onIntervalChange={setInterval} />
//           </div>

//           {/* Mobile Buy/Sell panel */}
//           <div className="lg:hidden shrink-0">
//               <BuySellPanel symbol={symbol} currentPrice={parseFloat(ticker?.price) || 0} />
//           </div>
//         </div>

//         {/* Right: Buy/Sell + Recent Trades */}
//         <div className="w-[280px] shrink-0 hidden lg:flex flex-col gap-2 p-2">
//           <BuySellPanel symbol={symbol} currentPrice={parseFloat(ticker?.price) || 0} />

//           {/* Recent Trades */}
//           <div className="bg-[#13151C] border border-[#252836] rounded-xl flex-1 overflow-hidden flex flex-col">
//             <div className="px-3 py-3 border-b border-[#252836]">
//               <h3 className="font-display font-semibold text-xs text-[#E2E8F0]">Recent Trades</h3>
//             </div>
//             <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#252836]">
//               {['Price (USDT)', 'Qty', 'Time'].map(h => (
//                 <span key={h} className="text-[10px] text-[#5A6478]">{h}</span>
//               ))}
//             </div>
//             {/* Simulated recent trades — will be replaced by real WebSocket trades */}
//             <div className="overflow-y-auto flex-1 scrollbar-hide">
//               {Array.from({ length: 20 }).map((_, i) => {
//                 const isBuy = Math.random() > 0.5
//                 const p     = parseFloat(price) + (Math.random() - 0.5) * 50
//                 return (
//                   <div key={i} className="flex items-center justify-between px-3 py-[3px] text-[11px] font-mono
//                                           hover:bg-[#1A1D27] transition-colors">
//                     <span className={isBuy ? 'text-[#00E676]' : 'text-[#FF3B5C]'}>${formatPrice(p)}</span>
//                     <span className="text-[#7E8BA0]">{(Math.random() * 0.5).toFixed(4)}</span>
//                     <span className="text-[#5A6478]">{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
//                   </div>
//                 )
//               })}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, TrendingUp, TrendingDown, ArrowLeft } from 'lucide-react'
import Navbar from '../components/common/Navbar'
import OrderBook from '../components/trade/OrderBook'
import TradingChart from '../components/trade/TradingChart'
import BuySellPanel from '../components/trade/BuySellPanel'
import { useCoinTicker } from '../hooks/useMarketData'
import { formatPrice, formatChange, formatVolume, isPositiveChange } from '../utils/formatters'
import { ROUTES } from '../utils/constants'

function StatItem({ label, value, color }) {
  return (
    <div className="flex flex-col">
      <span className="text-[#5A6478] text-[10px] font-medium">{label}</span>
      <span className={`font-mono text-xs font-medium mt-0.5 ${color || 'text-[#E2E8F0]'}`}>{value}</span>
    </div>
  )
}

export default function Trade() {
  const { symbol = 'BTCUSDT' } = useParams()
  const [interval, setInterval] = useState('1D')
  const ticker = useCoinTicker(symbol)

  const baseSymbol  = symbol.replace('USDT', '')
  const price       = ticker?.price   || '—'
  const change      = ticker?.change  || '0'
  const isUp        = isPositiveChange(change)
  const livePrice   = parseFloat(ticker?.price) || 0

  return (
    <div className="h-screen bg-[#0B0C10] text-[#E2E8F0] flex flex-col overflow-hidden">
      <Navbar />

      {/* ── Trade header ── */}
      <div className="mt-16 border-b border-[#252836] bg-[#13151C] px-4 py-2.5 flex items-center gap-4 overflow-x-auto scrollbar-hide shrink-0">
        <Link to={ROUTES.DASHBOARD} className="text-[#5A6478] hover:text-[#E2E8F0] transition-colors shrink-0">
          <ArrowLeft size={16} />
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          <button className="text-[#5A6478] hover:text-[#FFD166] transition-colors">
            <Star size={14} />
          </button>
          <div className="w-7 h-7 rounded-full bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.15)]
                          flex items-center justify-center">
            <span className="text-[#00D4FF] text-[10px] font-mono font-bold">{baseSymbol.slice(0,2)}</span>
          </div>
          <div>
            <p className="font-display font-bold text-sm text-[#E2E8F0] leading-none">{baseSymbol}/USDT</p>
            <p className="text-[#5A6478] text-[10px]">Perpetual</p>
          </div>
        </div>

        <div className="shrink-0">
          <p className={`font-mono font-bold text-lg leading-none ${isUp ? 'text-[#00E676]' : 'text-[#FF3B5C]'}`}>
            ${formatPrice(price)}
          </p>
          <div className={`flex items-center gap-1 ${isUp ? 'text-[#00E676]' : 'text-[#FF3B5C]'}`}>
            {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            <span className="font-mono text-xs">{formatChange(change)}</span>
          </div>
        </div>

        <div className="w-px h-8 bg-[#252836] shrink-0" />

        <div className="flex items-center gap-6">
          <StatItem label="24h High"       value={`$${formatPrice(ticker?.high)}`}  color="text-[#00E676]" />
          <StatItem label="24h Low"        value={`$${formatPrice(ticker?.low)}`}   color="text-[#FF3B5C]" />
          <StatItem label="24h Vol"        value={formatVolume(ticker?.volume)}      />
          <StatItem label="24h Vol (USDT)" value={formatVolume(ticker?.quoteVol)}   />
        </div>
      </div>

      {/* ── Main trading layout ── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Left: Order Book */}
        <div className="w-[220px] shrink-0 p-2 hidden lg:block">
          <OrderBook symbol={symbol} />
        </div>

        {/* Center: Chart */}
        <div className="flex-1 flex flex-col gap-2 p-2 min-w-0">
          <div className="flex-1 min-h-0">
            <TradingChart symbol={symbol} interval={interval} onIntervalChange={setInterval} />
          </div>

          {/* Mobile Buy/Sell panel */}
          <div className="lg:hidden shrink-0">
            {livePrice > 0 && (
              <BuySellPanel key={symbol} symbol={symbol} currentPrice={livePrice} />
            )}
          </div>
        </div>

        {/* Right: Buy/Sell + Recent Trades */}
        <div className="w-[280px] shrink-0 hidden lg:flex flex-col gap-2 p-2">

          {livePrice > 0 ? (
            <BuySellPanel key={symbol} symbol={symbol} currentPrice={livePrice} />
          ) : (
            <div className="bg-[#13151C] border border-[#252836] rounded-xl flex items-center
                            justify-center h-[400px]">
              <p className="text-[#5A6478] text-xs">Connecting to market...</p>
            </div>
          )}

          {/* Recent Trades */}
          <div className="bg-[#13151C] border border-[#252836] rounded-xl flex-1 overflow-hidden flex flex-col">
            <div className="px-3 py-3 border-b border-[#252836]">
              <h3 className="font-display font-semibold text-xs text-[#E2E8F0]">Recent Trades</h3>
            </div>
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#252836]">
              {['Price (USDT)', 'Qty', 'Time'].map(h => (
                <span key={h} className="text-[10px] text-[#5A6478]">{h}</span>
              ))}
            </div>
            <div className="overflow-y-auto flex-1 scrollbar-hide">
              {livePrice > 0 && Array.from({ length: 20 }).map((_, i) => {
                const isBuy = Math.random() > 0.5
                const p     = livePrice + (Math.random() - 0.5) * 50
                return (
                  <div key={i} className="flex items-center justify-between px-3 py-[3px] text-[11px] font-mono
                                          hover:bg-[#1A1D27] transition-colors">
                    <span className={isBuy ? 'text-[#00E676]' : 'text-[#FF3B5C]'}>${formatPrice(p)}</span>
                    <span className="text-[#7E8BA0]">{(Math.random() * 0.5).toFixed(4)}</span>
                    <span className="text-[#5A6478]">{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}