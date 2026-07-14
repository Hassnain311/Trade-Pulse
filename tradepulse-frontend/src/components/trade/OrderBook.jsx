import { useOrderBook } from '../../hooks/useMarketData'
import { formatPrice, formatQuantity } from '../../utils/formatters'

function OrderRow({ price, qty, total, maxTotal, side }) {
  const pct = maxTotal > 0 ? (parseFloat(total) / maxTotal) * 100 : 0
  const isAsk = side === 'ask'

  return (
    <div className="relative flex items-center justify-between px-3 py-[3px] text-xs font-mono group hover:brightness-125 cursor-default">
      {/* depth bar */}
      <div
        className={`absolute inset-y-0 right-0 opacity-15 transition-all
                    ${isAsk ? 'bg-[#FF3B5C]' : 'bg-[#00E676]'}`}
        style={{ width: `${pct}%` }}
      />
      <span className={`z-10 ${isAsk ? 'text-[#FF3B5C]' : 'text-[#00E676]'}`}>
        {formatPrice(price)}
      </span>
      <span className="z-10 text-[#7E8BA0]">{formatQuantity(qty)}</span>
      <span className="z-10 text-[#5A6478]">{formatQuantity(total)}</span>
    </div>
  )
}

export default function OrderBook({ symbol }) {
  const { bids, asks } = useOrderBook(symbol)

  const withTotals = (arr, reverse = false) => {
    const rows = reverse ? [...arr].reverse() : arr
    let running = 0
    return rows.map(([price, qty]) => {
      running += parseFloat(qty)
      return { price, qty, total: running.toFixed(4) }
    })
  }

  const askRows = withTotals(asks, true)
  const bidRows = withTotals(bids)
  const maxTotal = Math.max(
    parseFloat(askRows[askRows.length - 1]?.total || 0),
    parseFloat(bidRows[bidRows.length - 1]?.total || 0)
  )

  const midPrice = asks[0]?.[0]
    ? ((parseFloat(asks[0][0]) + parseFloat(bids[0]?.[0] || 0)) / 2).toFixed(2)
    : '—'

  const spread = asks[0]?.[0] && bids[0]?.[0]
    ? (parseFloat(asks[0][0]) - parseFloat(bids[0][0])).toFixed(2)
    : '—'

  return (
    <div className="flex flex-col h-full bg-[#13151C] border border-[#252836] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-3 py-3 border-b border-[#252836]">
        <h3 className="font-display font-semibold text-sm text-[#E2E8F0]">Order Book</h3>
      </div>

      {/* Column headers */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#252836]">
        {['Price (USDT)', 'Amount', 'Total'].map(h => (
          <span key={h} className="text-[10px] text-[#5A6478] font-medium">{h}</span>
        ))}
      </div>

      {/* Asks (sell orders) — top, red */}
      <div className="flex-1 overflow-hidden flex flex-col-reverse">
        {askRows.slice(0, 15).map((row, i) => (
          <OrderRow key={i} {...row} maxTotal={maxTotal} side="ask" />
        ))}
      </div>

      {/* Mid price spread */}
      <div className="px-3 py-2 border-y border-[#252836] bg-[#1A1D27] flex items-center justify-between">
        <span className="font-mono font-bold text-sm text-[#E2E8F0]">${midPrice}</span>
        <span className="text-[10px] text-[#5A6478]">Spread: ${spread}</span>
      </div>

      {/* Bids (buy orders) — bottom, green */}
      <div className="flex-1 overflow-hidden">
        {bidRows.slice(0, 15).map((row, i) => (
          <OrderRow key={i} {...row} maxTotal={maxTotal} side="bid" />
        ))}
      </div>
    </div>
  )
}
