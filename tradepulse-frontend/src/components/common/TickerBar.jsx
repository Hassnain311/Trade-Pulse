import { useTickerData } from '../../hooks/useMarketData'
import { TICKER_COINS } from '../../utils/constants'
import { formatPrice, formatChange, isPositiveChange } from '../../utils/formatters'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../utils/constants'

export default function TickerBar() {
  const tickers  = useTickerData()
  const navigate = useNavigate()

  const items = TICKER_COINS.map(coin => ({
    ...coin,
    price:  tickers[coin.pair]?.price  ?? null,
    change: tickers[coin.pair]?.change ?? null,
  }))

  // Duplicate for seamless infinite scroll
  const allItems = [...items, ...items]

  return (
    <div className="border-b border-[#252836] bg-[#0F1116]/60 backdrop-blur-sm overflow-hidden ticker-wrap">
      <div className="flex animate-ticker ticker-inner" style={{ width: 'max-content' }}>
        {allItems.map((coin, i) => {
          const up      = isPositiveChange(coin.change)
          const hasData = coin.price !== null

          return (
            <button
              key={`${coin.symbol}-${i}`}
              onClick={() => navigate(`${ROUTES.TRADE}/${coin.pair}`)}
              className="flex items-center gap-2.5 px-5 py-2.5 border-r border-[#252836]
                         shrink-0 hover:bg-[#13151C] transition-colors group"
            >
              <span className="font-display font-semibold text-xs text-[#E2E8F0] group-hover:text-[#00D4FF] transition-colors">
                {coin.symbol}
              </span>
              {hasData ? (
                <>
                  <span className="font-mono text-xs text-[#E2E8F0]">
                    ${formatPrice(coin.price)}
                  </span>
                  <span className={`text-xs font-mono flex items-center gap-0.5 ${up ? 'text-[#00E676]' : 'text-[#FF3B5C]'}`}>
                    {up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                    {formatChange(coin.change)}
                  </span>
                </>
              ) : (
                <span className="text-[10px] text-[#5A6478] animate-pulse">—</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
