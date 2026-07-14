import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, Flame, Sparkles, Rocket, BarChart2 } from 'lucide-react'
import { formatPrice, formatChange, isPositiveChange } from '../../utils/formatters'
import { ROUTES } from '../../utils/constants'

function StatCard({ title, icon: Icon, color, coins = [] }) {
  const navigate = useNavigate()
  return (
    <div className="bg-[#13151C] border border-[#252836] rounded-xl p-4 flex-1 min-w-[200px]">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} style={{ color }} />
        <span className="font-display font-semibold text-xs text-[#E2E8F0]">{title}</span>
        <span className="ml-auto text-[#5A6478] text-xs cursor-pointer hover:text-[#00D4FF]">More →</span>
      </div>
      <div className="space-y-2.5">
        {coins.map(c => {
          const isUp = isPositiveChange(c.priceChangePercent)
          return (
            <div
              key={c.symbol}
              onClick={() => navigate(`${ROUTES.TRADE}/${c.symbol}`)}
              className="flex items-center justify-between cursor-pointer hover:bg-[#1A1D27] -mx-2 px-2 py-1 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.15)] flex items-center justify-center">
                  <span className="text-[#00D4FF] text-[8px] font-mono font-bold">
                    {c.symbol.replace('USDT','').slice(0,2)}
                  </span>
                </div>
                <span className="font-display font-medium text-xs text-[#E2E8F0]">
                  {c.symbol.replace('USDT','')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#7E8BA0]">${formatPrice(c.lastPrice)}</span>
                <span className={`font-mono text-xs font-medium ${isUp ? 'text-[#00E676]' : 'text-[#FF3B5C]'}`}>
                  {formatChange(c.priceChangePercent)}
                </span>
              </div>
            </div>
          )
        })}
        {coins.length === 0 && (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-7 bg-[#1A1D27] rounded animate-pulse" />)}
          </div>
        )}
      </div>
    </div>
  )
}

export default function MarketStats({ tickers = [] }) {
  const sorted   = [...tickers]
  const byChange = [...tickers].sort((a,b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))
  const byVolume = [...tickers].sort((a,b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
  const newest   = [...tickers].slice(-3).reverse()

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      <StatCard title="Hot"        icon={Flame}    color="#FF6B35" coins={byVolume.slice(0, 3)} />
      <StatCard title="New"        icon={Sparkles} color="#A78BFA" coins={newest.slice(0, 3)} />
      <StatCard title="Top Gainer" icon={Rocket}   color="#00E676" coins={byChange.slice(0, 3)} />
      <StatCard title="Top Volume" icon={BarChart2} color="#00D4FF" coins={byVolume.slice(0, 3)} />
    </div>
  )
}
