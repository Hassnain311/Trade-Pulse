import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatBalance, formatChange, formatPrice, isPositiveChange } from '../../utils/formatters'

// ─── Portfolio Stats (balance overview cards) ─────────────────
export function PortfolioStats({ balance = {}, totalValue = 0, pnl = 0, pnlPct = 0 }) {
  const isUp = pnl >= 0

  const CARDS = [
    {
      label:   'Total Portfolio Value',
      value:   `$${parseFloat(totalValue).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      sub:     'Paper trading account',
      icon:    Wallet,
      color:   '#00D4FF',
      bg:      'rgba(0,212,255,0.08)',
      border:  'rgba(0,212,255,0.2)',
    },
    {
      label:   'Available USDT',
      value:   formatBalance(balance.USDT || 0, 'USDT'),
      sub:     'Ready to trade',
      icon:    ArrowUpRight,
      color:   '#00E676',
      bg:      'rgba(0,230,118,0.08)',
      border:  'rgba(0,230,118,0.2)',
    },
    {
      label:   'Total P&L',
      value:   `${isUp ? '+' : ''}$${Math.abs(pnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      sub:     `${formatChange(pnlPct)} from starting balance`,
      icon:    isUp ? TrendingUp : TrendingDown,
      color:   isUp ? '#00E676' : '#FF3B5C',
      bg:      isUp ? 'rgba(0,230,118,0.08)' : 'rgba(255,59,92,0.08)',
      border:  isUp ? 'rgba(0,230,118,0.2)' : 'rgba(255,59,92,0.2)',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {CARDS.map(({ label, value, sub, icon: Icon, color, bg, border }) => (
        <div key={label} className="bg-[#13151C] border border-[#252836] rounded-xl p-5
                                    hover:border-[#2E3246] transition-colors">
          <div className="flex items-start justify-between mb-4">
            <p className="text-[#5A6478] text-xs font-medium">{label}</p>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                 style={{ background: bg, border: `1px solid ${border}` }}>
              <Icon size={15} style={{ color }} />
            </div>
          </div>
          <p className="font-display font-bold text-xl text-[#E2E8F0] mb-1" style={{ color }}>
            {value}
          </p>
          <p className="text-[#5A6478] text-xs">{sub}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Holdings Table ───────────────────────────────────────────
export function HoldingsTable({ holdings = [], loading = false }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1,2,3].map(i => <div key={i} className="h-16 bg-[#1A1D27] rounded-lg animate-pulse" />)}
      </div>
    )
  }

  if (holdings.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-14 h-14 rounded-2xl bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.15)]
                        flex items-center justify-center mx-auto mb-4">
          <Wallet size={22} className="text-[#00D4FF]" />
        </div>
        <h3 className="font-display font-semibold text-[#E2E8F0] mb-2">No holdings yet</h3>
        <p className="text-[#5A6478] text-sm">
          Start paper trading to see your positions here.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-[#252836]">
            {['Asset', 'Amount', 'Avg Buy Price', 'Current Price', 'P&L', 'Value', 'Action'].map(h => (
              <th key={h} className={`pb-3 px-3 text-xs text-[#5A6478] font-medium
                                      ${h === 'Asset' ? 'text-left' : 'text-right'}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {holdings.map(h => {
            const pnl    = (parseFloat(h.currentPrice) - parseFloat(h.avgBuyPrice)) * parseFloat(h.amount)
            const pnlPct = ((parseFloat(h.currentPrice) - parseFloat(h.avgBuyPrice)) / parseFloat(h.avgBuyPrice)) * 100
            const isUp   = pnl >= 0
            return (
              <tr key={h.symbol} className="border-b border-[#252836]/50 hover:bg-[#13151C] transition-colors">
                <td className="py-4 px-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.15)]
                                    flex items-center justify-center">
                      <span className="text-[#00D4FF] text-[10px] font-mono font-bold">
                        {h.symbol.replace('USDT','').slice(0,3)}
                      </span>
                    </div>
                    <div>
                      <p className="font-display font-semibold text-sm text-[#E2E8F0]">
                        {h.symbol.replace('USDT','')}
                      </p>
                      <p className="text-[#5A6478] text-xs">{h.symbol}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-3 text-right font-mono text-sm text-[#E2E8F0]">{h.amount}</td>
                <td className="py-4 px-3 text-right font-mono text-xs text-[#7E8BA0]">${formatPrice(h.avgBuyPrice)}</td>
                <td className="py-4 px-3 text-right font-mono text-sm text-[#E2E8F0]">${formatPrice(h.currentPrice)}</td>
                <td className="py-4 px-3 text-right">
                  <div>
                    <p className={`font-mono text-sm font-medium ${isUp ? 'text-[#00E676]' : 'text-[#FF3B5C]'}`}>
                      {isUp ? '+' : ''}${Math.abs(pnl).toFixed(2)}
                    </p>
                    <p className={`font-mono text-xs ${isUp ? 'text-[#00E676]' : 'text-[#FF3B5C]'}`}>
                      {isUp ? '+' : ''}{pnlPct.toFixed(2)}%
                    </p>
                  </div>
                </td>
                <td className="py-4 px-3 text-right font-mono text-sm text-[#E2E8F0]">
                  ${(parseFloat(h.amount) * parseFloat(h.currentPrice)).toFixed(2)}
                </td>
                <td className="py-4 px-3 text-right">
                  <button className="text-xs text-[#00D4FF] font-display hover:underline">Trade</button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
