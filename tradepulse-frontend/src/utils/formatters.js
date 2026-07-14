export function formatPrice(price, decimals = 2) {
  const num = parseFloat(price)
  if (isNaN(num)) return '—'
  if (num >= 10000) return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (num >= 1)     return num.toFixed(decimals)
  if (num >= 0.01)  return num.toFixed(4)
  return num.toFixed(8)
}

export function formatChange(change) {
  const num = parseFloat(change)
  if (isNaN(num)) return '0.00%'
  const sign = num >= 0 ? '+' : ''
  return `${sign}${num.toFixed(2)}%`
}

export function isPositiveChange(change) {
  return parseFloat(change) >= 0
}

export function formatVolume(vol) {
  const num = parseFloat(vol)
  if (isNaN(num)) return '—'
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
  if (num >= 1e9)  return `$${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6)  return `$${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3)  return `$${(num / 1e3).toFixed(2)}K`
  return `$${num.toFixed(2)}`
}

export function formatMarketCap(cap) {
  return formatVolume(cap)
}

export function formatBalance(amount, symbol = 'USDT') {
  const num = parseFloat(amount)
  if (isNaN(num)) return `0.00 ${symbol}`
  return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`
}

export function formatPnl(pnl) {
  const num = parseFloat(pnl)
  if (isNaN(num)) return { display: '—', isPositive: false }
  return {
    display:    `${num >= 0 ? '+' : ''}${formatVolume(num)}`,
    isPositive: num >= 0,
  }
}

export function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('en-US', { hour12: false })
}

export function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatTimeAgo(ts) {
  const diff = (Date.now() - new Date(ts).getTime()) / 1000
  if (diff < 60)   return `${Math.floor(diff)}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function formatQuantity(qty, symbol = '') {
  const num = parseFloat(qty)
  if (isNaN(num)) return '—'
  const str = num < 1 ? num.toFixed(8) : num.toFixed(4)
  return symbol ? `${str} ${symbol}` : str
}
