// import { useState, useEffect } from 'react'
// import { RefreshCw, LogOut } from 'lucide-react'
// import Navbar from '../components/common/Navbar'
// import TickerBar from '../components/common/TickerBar'
// import { PortfolioStats } from '../components/portfolio/HoldingsTable'
// import { HoldingsTable }  from '../components/portfolio/HoldingsTable'
// import { tradeAPI } from '../api/trade.api'
// import { formatPrice, formatTimeAgo, isPositiveChange, formatChange } from '../utils/formatters'
// import { useAuth } from '../context/AuthContext'
// import { INITIAL_PAPER_BALANCE } from '../utils/constants'

// const TABS = ['Holdings', 'Open Orders', 'Trade History']

// // Mock data for when backend isn't connected yet
// const MOCK_HOLDINGS = [
//   { symbol: 'BTCUSDT',   amount: '0.12',  avgBuyPrice: '61500',  currentPrice: '63021' },
//   { symbol: 'ETHUSDT',   amount: '1.5',   avgBuyPrice: '3200',   currentPrice: '3456'  },
//   { symbol: 'SOLUSDT',   amount: '15',    avgBuyPrice: '75',     currentPrice: '80.79' },
// ]

// const MOCK_HISTORY = [
//   { _id:'1', symbol:'BTCUSDT', side:'BUY',  amount:0.05, price:62500, total:3125, createdAt: new Date(Date.now()-86400000).toISOString() },
//   { _id:'2', symbol:'ETHUSDT', side:'BUY',  amount:1.0,  price:3200,  total:3200, createdAt: new Date(Date.now()-172800000).toISOString() },
//   { _id:'3', symbol:'SOLUSDT', side:'SELL', amount:5,    price:82,    total:410,  createdAt: new Date(Date.now()-259200000).toISOString() },
// ]

// export default function Portfolio() {
//   const { user, logout, logoutAll } = useAuth()
//   const [tab,      setTab]      = useState('Holdings')
//   const [portfolio, setPortfolio] = useState(null)
//   const [history,   setHistory]   = useState(MOCK_HISTORY)
//   const [loading,   setLoading]   = useState(true)
//   const [refreshing, setRefreshing] = useState(false)

//   const fetchData = async (silent = false) => {
//     if (!silent) setLoading(true)
//     else setRefreshing(true)
//     try {
//       // Both calls use axiosInstance → access token auto-attached
//       // If 401 → interceptor uses refresh token → retries
//       const [portRes, histRes] = await Promise.allSettled([
//         tradeAPI.getPortfolio(),
//         tradeAPI.getTradeHistory(),
//       ])
//       if (portRes.status === 'fulfilled') setPortfolio(portRes.value.data)
//       if (histRes.status === 'fulfilled') setHistory(histRes.value.data.trades || MOCK_HISTORY)
//     } catch {
//       // Keep mock data on error — backend not connected yet
//     } finally {
//       setLoading(false)
//       setRefreshing(false)
//     }
//   }

//   useEffect(() => { fetchData() }, [])

//   // Calculate values from mock or real data
//   const holdings   = portfolio?.holdings || MOCK_HOLDINGS
//   const usdtBal    = portfolio?.balance?.USDT || 83265
//   const totalValue = holdings.reduce((sum, h) =>
//     sum + parseFloat(h.amount) * parseFloat(h.currentPrice), 0) + usdtBal
//   const pnl    = totalValue - INITIAL_PAPER_BALANCE
//   const pnlPct = (pnl / INITIAL_PAPER_BALANCE) * 100

//   return (
//     <div className="min-h-screen bg-[#0B0C10] text-[#E2E8F0]">
//       <Navbar />
//       <div className="pt-16">
//         <TickerBar />
//       </div>

//       <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6">

//         {/* Page header */}
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h1 className="font-display font-bold text-xl text-[#E2E8F0]">Portfolio</h1>
//             <p className="text-[#5A6478] text-sm mt-0.5">
//               {user?.fullName} · Paper trading account
//             </p>
//           </div>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => fetchData(true)}
//               disabled={refreshing}
//               className="flex items-center gap-2 bg-[#13151C] border border-[#252836]
//                          text-[#7E8BA0] hover:text-[#E2E8F0] px-3 py-2 rounded-lg text-sm
//                          font-display transition-colors disabled:opacity-50"
//             >
//               <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
//               Refresh
//             </button>

//             {/* Logout from all devices */}
//             <button
//               onClick={logoutAll}
//               className="flex items-center gap-2 bg-[rgba(255,59,92,0.08)] border border-[rgba(255,59,92,0.2)]
//                          text-[#FF3B5C] hover:bg-[rgba(255,59,92,0.15)] px-3 py-2 rounded-lg text-sm
//                          font-display transition-colors"
//             >
//               <LogOut size={13} />
//               Logout All Devices
//             </button>
//           </div>
//         </div>

//         {/* Stats cards */}
//         <div className="mb-6">
//           <PortfolioStats
//             balance={{ USDT: usdtBal }}
//             totalValue={totalValue}
//             pnl={pnl}
//             pnlPct={pnlPct}
//           />
//         </div>

//         {/* Main card */}
//         <div className="bg-[#13151C] border border-[#252836] rounded-xl">
//           {/* Tabs */}
//           <div className="flex items-center gap-1 px-4 border-b border-[#252836]">
//             {TABS.map(t => (
//               <button
//                 key={t}
//                 onClick={() => setTab(t)}
//                 className={`px-4 py-3.5 text-sm font-display font-medium border-b-2 transition-colors whitespace-nowrap
//                             ${tab === t
//                               ? 'text-[#00D4FF] border-[#00D4FF]'
//                               : 'text-[#5A6478] border-transparent hover:text-[#E2E8F0]'}`}
//               >
//                 {t}
//               </button>
//             ))}
//           </div>

//           <div className="p-4">
//             {/* Holdings tab */}
//             {tab === 'Holdings' && (
//               <HoldingsTable holdings={holdings} loading={loading} />
//             )}

//             {/* Open Orders tab */}
//             {tab === 'Open Orders' && (
//               <div className="py-16 text-center">
//                 <div className="w-12 h-12 rounded-xl bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.15)]
//                                 flex items-center justify-center mx-auto mb-4">
//                   <span className="text-xl">📋</span>
//                 </div>
//                 <h3 className="font-display font-semibold text-[#E2E8F0] mb-2">No open orders</h3>
//                 <p className="text-[#5A6478] text-sm">Limit and stop orders will appear here.</p>
//               </div>
//             )}

//             {/* Trade History tab */}
//             {tab === 'Trade History' && (
//               <div className="overflow-x-auto">
//                 <table className="w-full min-w-[600px]">
//                   <thead>
//                     <tr className="border-b border-[#252836]">
//                       {['Symbol', 'Side', 'Amount', 'Price', 'Total', 'Date'].map(h => (
//                         <th key={h} className={`pb-3 px-3 text-xs text-[#5A6478] font-medium
//                                                 ${h === 'Symbol' ? 'text-left' : 'text-right'}`}>
//                           {h}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {history.map(trade => (
//                       <tr key={trade._id}
//                           className="border-b border-[#252836]/50 hover:bg-[#1A1D27] transition-colors">
//                         <td className="py-3.5 px-3">
//                           <span className="font-display font-semibold text-sm text-[#E2E8F0]">
//                             {trade.symbol.replace('USDT','')} / USDT
//                           </span>
//                         </td>
//                         <td className="py-3.5 px-3 text-right">
//                           <span className={`font-display font-bold text-xs px-2.5 py-1 rounded-lg
//                                           ${trade.side === 'BUY'
//                                             ? 'bg-[rgba(0,230,118,0.1)] text-[#00E676]'
//                                             : 'bg-[rgba(255,59,92,0.1)] text-[#FF3B5C]'}`}>
//                             {trade.side}
//                           </span>
//                         </td>
//                         <td className="py-3.5 px-3 text-right font-mono text-sm text-[#E2E8F0]">
//                           {trade.amount}
//                         </td>
//                         <td className="py-3.5 px-3 text-right font-mono text-xs text-[#7E8BA0]">
//                           ${formatPrice(trade.price)}
//                         </td>
//                         <td className="py-3.5 px-3 text-right font-mono text-sm text-[#E2E8F0]">
//                           ${trade.total?.toFixed(2)}
//                         </td>
//                         <td className="py-3.5 px-3 text-right text-xs text-[#5A6478]">
//                           {formatTimeAgo(trade.createdAt)}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

import { useState, useEffect } from 'react'
import { RefreshCw, LogOut } from 'lucide-react'
import Navbar from '../components/common/Navbar'
import TickerBar from '../components/common/TickerBar'
import { PortfolioStats } from '../components/portfolio/HoldingsTable'
import { HoldingsTable }  from '../components/portfolio/HoldingsTable'
import { tradeAPI } from '../api/trade.api'
import { formatPrice, formatTimeAgo, formatChange } from '../utils/formatters'
import { useAuth } from '../context/AuthContext'
import { INITIAL_PAPER_BALANCE } from '../utils/constants'

const TABS = ['Holdings', 'Open Orders', 'Trade History']

const MOCK_HOLDINGS = [
  { symbol: 'BTCUSDT', amount: '0.12', avgBuyPrice: '61500', currentPrice: '63021' },
  { symbol: 'ETHUSDT', amount: '1.5',  avgBuyPrice: '3200',  currentPrice: '3456'  },
  { symbol: 'SOLUSDT', amount: '15',   avgBuyPrice: '75',    currentPrice: '80.79' },
]

const MOCK_HISTORY = [
  { _id:'1', symbol:'BTCUSDT', side:'Buy',  amount:0.05, price:62500, total:3125, createdAt: new Date(Date.now()-86400000).toISOString() },
  { _id:'2', symbol:'ETHUSDT', side:'Buy',  amount:1.0,  price:3200,  total:3200, createdAt: new Date(Date.now()-172800000).toISOString() },
  { _id:'3', symbol:'SOLUSDT', side:'Sell', amount:5,    price:82,    total:410,  createdAt: new Date(Date.now()-259200000).toISOString() },
]

export default function Portfolio() {
  const { user, logoutAll } = useAuth()
  const [tab,        setTab]        = useState('Holdings')
  const [portfolio,  setPortfolio]  = useState(null)
  const [history,    setHistory]    = useState(MOCK_HISTORY)
  const [openOrders, setOpenOrders] = useState([])
  const [usdtBal,    setUsdtBal]    = useState(83265)
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const [portRes, histRes, balRes, ordersRes] = await Promise.allSettled([
        tradeAPI.getPortfolio(),
        tradeAPI.getTradeHistory(),
        tradeAPI.getBalance(),
        tradeAPI.getOpenOrders(),
      ])
      if (portRes.status   === 'fulfilled') setPortfolio(portRes.value.data)
      if (histRes.status   === 'fulfilled') setHistory(histRes.value.data.trades || MOCK_HISTORY)
      if (balRes.status    === 'fulfilled') setUsdtBal(balRes.value.data.USDT || 83265)
      if (ordersRes.status === 'fulfilled') setOpenOrders(ordersRes.value.data.trades || [])
    } catch {
      // keep mock data on error
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const holdings   = portfolio?.holdings || MOCK_HOLDINGS
  const totalValue = holdings.reduce((sum, h) =>
    sum + parseFloat(h.amount) * parseFloat(h.currentPrice), 0) + usdtBal
  const pnl    = totalValue - INITIAL_PAPER_BALANCE
  const pnlPct = (pnl / INITIAL_PAPER_BALANCE) * 100

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#E2E8F0]">
      <Navbar />
      <div className="pt-16">
        <TickerBar />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-xl text-[#E2E8F0]">Portfolio</h1>
            <p className="text-[#5A6478] text-sm mt-0.5">
              {user?.fullName} · Paper trading account
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 bg-[#13151C] border border-[#252836]
                         text-[#7E8BA0] hover:text-[#E2E8F0] px-3 py-2 rounded-lg text-sm
                         font-display transition-colors disabled:opacity-50"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={logoutAll}
              className="flex items-center gap-2 bg-[rgba(255,59,92,0.08)] border border-[rgba(255,59,92,0.2)]
                         text-[#FF3B5C] hover:bg-[rgba(255,59,92,0.15)] px-3 py-2 rounded-lg text-sm
                         font-display transition-colors"
            >
              <LogOut size={13} />
              Logout All Devices
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="mb-6">
          <PortfolioStats
            balance={{ USDT: usdtBal }}
            totalValue={totalValue}
            pnl={pnl}
            pnlPct={pnlPct}
          />
        </div>

        {/* Main card */}
        <div className="bg-[#13151C] border border-[#252836] rounded-xl">
          {/* Tabs */}
          <div className="flex items-center gap-1 px-4 border-b border-[#252836]">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-3.5 text-sm font-display font-medium border-b-2 transition-colors whitespace-nowrap
                            ${tab === t
                              ? 'text-[#00D4FF] border-[#00D4FF]'
                              : 'text-[#5A6478] border-transparent hover:text-[#E2E8F0]'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="p-4">

            {/* Holdings tab */}
            {tab === 'Holdings' && (
              <HoldingsTable holdings={holdings} loading={loading} />
            )}

            {/* Open Orders tab */}
            {tab === 'Open Orders' && (
              openOrders.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.15)]
                                  flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl">📋</span>
                  </div>
                  <h3 className="font-display font-semibold text-[#E2E8F0] mb-2">No open orders</h3>
                  <p className="text-[#5A6478] text-sm">Limit orders will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-[#252836]">
                        {['Symbol','Side','Type','Amount','Price','Total','Action'].map(h => (
                          <th key={h} className={`pb-3 px-3 text-xs text-[#5A6478] font-medium
                                                  ${h === 'Symbol' ? 'text-left' : 'text-right'}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {openOrders.map(order => (
                        <tr key={order._id}
                            className="border-b border-[#252836]/50 hover:bg-[#1A1D27] transition-colors">
                          <td className="py-3.5 px-3">
                            <span className="font-display font-semibold text-sm text-[#E2E8F0]">
                              {order.symbol.replace('USDT', '')} / USDT
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <span className={`font-display font-bold text-xs px-2.5 py-1 rounded-lg
                                            ${order.side === 'Buy'
                                              ? 'bg-[rgba(0,230,118,0.1)] text-[#00E676]'
                                              : 'bg-[rgba(255,59,92,0.1)] text-[#FF3B5C]'}`}>
                              {order.side}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right text-xs text-[#7E8BA0]">{order.type}</td>
                          <td className="py-3.5 px-3 text-right font-mono text-sm text-[#E2E8F0]">{order.amount}</td>
                          <td className="py-3.5 px-3 text-right font-mono text-xs text-[#7E8BA0]">${formatPrice(order.price)}</td>
                          <td className="py-3.5 px-3 text-right font-mono text-sm text-[#E2E8F0]">${order.total?.toFixed(2)}</td>
                          <td className="py-3.5 px-3 text-right">
                            <button
                              onClick={async () => {
                                try {
                                  await tradeAPI.cancelOrder(order._id)
                                  fetchData(true)
                                } catch {
                                  // silently fail
                                }
                              }}
                              className="text-xs text-[#FF3B5C] font-display hover:underline"
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* Trade History tab */}
            {tab === 'Trade History' && (
              history.length === 0 ? (
                <div className="py-16 text-center">
                  <h3 className="font-display font-semibold text-[#E2E8F0] mb-2">No trades yet</h3>
                  <p className="text-[#5A6478] text-sm">Your completed trades will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-[#252836]">
                        {['Symbol', 'Side', 'Amount', 'Price', 'Total', 'Date'].map(h => (
                          <th key={h} className={`pb-3 px-3 text-xs text-[#5A6478] font-medium
                                                  ${h === 'Symbol' ? 'text-left' : 'text-right'}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {history.map(trade => (
                        <tr key={trade._id}
                            className="border-b border-[#252836]/50 hover:bg-[#1A1D27] transition-colors">
                          <td className="py-3.5 px-3">
                            <span className="font-display font-semibold text-sm text-[#E2E8F0]">
                              {trade.symbol.replace('USDT', '')} / USDT
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <span className={`font-display font-bold text-xs px-2.5 py-1 rounded-lg
                                            ${trade.side === 'Buy'
                                              ? 'bg-[rgba(0,230,118,0.1)] text-[#00E676]'
                                              : 'bg-[rgba(255,59,92,0.1)] text-[#FF3B5C]'}`}>
                              {trade.side}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono text-sm text-[#E2E8F0]">
                            {trade.amount}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono text-xs text-[#7E8BA0]">
                            ${formatPrice(trade.price)}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono text-sm text-[#E2E8F0]">
                            ${trade.total?.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-3 text-right text-xs text-[#5A6478]">
                            {formatTimeAgo(trade.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
