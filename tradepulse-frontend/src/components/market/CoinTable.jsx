import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, ArrowUpDown, BarChart2, Search } from 'lucide-react'
import { ROUTES } from '../../utils/constants'
import { formatPrice, formatChange, formatVolume, isPositiveChange } from '../../utils/formatters'

const SortBtn = ({ col, label, sortKey, onSort }) => (
  <button
    onClick={() => onSort(col)}
    className={`flex items-center gap-1 text-xs font-medium transition-colors hover:text-[#E2E8F0]
                ${sortKey === col ? 'text-[#00D4FF]' : 'text-[#5A6478]'}`}
  >
    {label}
    <ArrowUpDown size={10} />
  </button>
)

export default function CoinTable({ tickers = [], loading = false }) {
  const navigate = useNavigate()
  const [search,  setSearch]  = useState('')
  const [sortKey, setSortKey] = useState('quoteVolume')
  const [sortDir, setSortDir] = useState('desc')
  const [page,    setPage]    = useState(1)
  const PER_PAGE = 20

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
    setPage(1)
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return tickers
      .filter(t => t.symbol.toLowerCase().includes(q) || t.symbol.replace('USDT','').toLowerCase().includes(q))
      .sort((a, b) => {
        const va = parseFloat(a[sortKey]) || 0
        const vb = parseFloat(b[sortKey]) || 0
        return sortDir === 'asc' ? va - vb : vb - va
      })
  }, [tickers, search, sortKey, sortDir])

  const paginated = filtered.slice(0, page * PER_PAGE)

  if (loading) {
    return (
      <div className="space-y-2 mt-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-14 bg-[#13151C] rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-4 max-w-xs">
        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A6478] pointer-events-none" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search coin..."
          className="w-full bg-[#1A1D27] border border-[#252836] rounded-lg
                     pl-9 pr-4 py-2 text-sm text-[#E2E8F0] placeholder:text-[#5A6478]
                     focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[rgba(0,212,255,0.15)]
                     transition-all"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-[#252836]">
              <th className="pb-3 pl-3 pr-1 w-8 text-left">
                <Star size={12} className="text-[#5A6478]" />
              </th>
              <th className="pb-3 px-3 text-left">
                <SortBtn col="symbol" label="Name" sortKey={sortKey} onSort={handleSort} />
              </th>
              <th className="pb-3 px-3 text-right">
                <SortBtn col="lastPrice" label="Price" sortKey={sortKey} onSort={handleSort} />
              </th>
              <th className="pb-3 px-3 text-right">
                <SortBtn col="priceChangePercent" label="24h Change" sortKey={sortKey} onSort={handleSort} />
              </th>
              <th className="pb-3 px-3 text-right hidden md:table-cell">
                <SortBtn col="quoteVolume" label="24h Volume" sortKey={sortKey} onSort={handleSort} />
              </th>
              <th className="pb-3 px-3 text-right hidden lg:table-cell">
                <SortBtn col="highPrice" label="24h High" sortKey={sortKey} onSort={handleSort} />
              </th>
              <th className="pb-3 px-3 text-right hidden lg:table-cell">
                <SortBtn col="lowPrice" label="24h Low" sortKey={sortKey} onSort={handleSort} />
              </th>
              <th className="pb-3 px-3 text-right">
                <span className="text-xs text-[#5A6478]">Action</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((coin) => {
              const symbol = coin.symbol.replace('USDT', '')
              const isUp   = isPositiveChange(coin.priceChangePercent)
              return (
                <tr
                  key={coin.symbol}
                  onClick={() => navigate(`${ROUTES.TRADE}/${coin.symbol}`)}
                  className="border-b border-[#252836]/40 hover:bg-[#13151C] transition-colors cursor-pointer group"
                >
                  {/* Watchlist */}
                  <td className="py-4 pl-3 pr-1">
                    <button onClick={e => e.stopPropagation()}
                      className="text-[#5A6478] hover:text-[#FFD166] transition-colors">
                      <Star size={13} />
                    </button>
                  </td>

                  {/* Name */}
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.12)]
                                      flex items-center justify-center shrink-0">
                        <span className="text-[#00D4FF] text-[10px] font-mono font-bold">
                          {symbol.slice(0, 3)}
                        </span>
                      </div>
                      <div className="leading-tight">
                        <p className="font-display font-semibold text-sm text-[#E2E8F0]">{symbol}</p>
                        <p className="text-[#5A6478] text-xs">/{' '}USDT</p>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-4 px-3 text-right">
                    <span className="font-mono text-sm text-[#E2E8F0]">
                      ${formatPrice(coin.lastPrice)}
                    </span>
                  </td>

                  {/* 24h Change */}
                  <td className="py-4 px-3 text-right">
                    <span className={`font-mono text-sm font-medium
                                     ${isUp ? 'text-[#00E676]' : 'text-[#FF3B5C]'}`}>
                      {formatChange(coin.priceChangePercent)}
                    </span>
                  </td>

                  {/* Volume */}
                  <td className="py-4 px-3 text-right hidden md:table-cell">
                    <span className="font-mono text-xs text-[#7E8BA0]">
                      {formatVolume(coin.quoteVolume)}
                    </span>
                  </td>

                  {/* High */}
                  <td className="py-4 px-3 text-right hidden lg:table-cell">
                    <span className="font-mono text-xs text-[#00E676]">
                      ${formatPrice(coin.highPrice)}
                    </span>
                  </td>

                  {/* Low */}
                  <td className="py-4 px-3 text-right hidden lg:table-cell">
                    <span className="font-mono text-xs text-[#FF3B5C]">
                      ${formatPrice(coin.lowPrice)}
                    </span>
                  </td>

                  {/* Trade button */}
                  <td className="py-4 px-3 text-right">
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`${ROUTES.TRADE}/${coin.symbol}`) }}
                      className="opacity-0 group-hover:opacity-100 transition-all duration-200
                                 bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.25)]
                                 text-[#00D4FF] rounded-lg p-1.5 hover:bg-[rgba(0,212,255,0.15)]"
                    >
                      <BarChart2 size={14} />
                    </button>
                  </td>
                </tr>
              )
            })}

            {paginated.length === 0 && (
              <tr>
                <td colSpan={8} className="py-16 text-center text-[#5A6478] text-sm">
                  No coins found for "{search}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Load more */}
      {paginated.length < filtered.length && (
        <button
          onClick={() => setPage(p => p + 1)}
          className="w-full mt-6 py-3 text-[#00D4FF] text-sm font-display hover:bg-[#13151C]
                     rounded-lg border border-[#252836] transition-colors"
        >
          Load {Math.min(PER_PAGE, filtered.length - paginated.length)} more coins
        </button>
      )}
    </div>
  )
}
