import { useState } from 'react'
import Navbar from '../components/common/Navbar'
import TickerBar from '../components/common/TickerBar'
import MarketStats from '../components/market/MarketStats'
import CoinTable from '../components/market/CoinTable'
import { useAllTickers } from '../hooks/useMarketData'

const TABS = ['Overview', 'Top Gainers', 'Top Losers', 'New Listings', 'AI Select']

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Overview')
  const { tickers, loading } = useAllTickers()

  // Filter tickers per tab
  const getFiltered = () => {
    switch (activeTab) {
      case 'Top Gainers':
        return [...tickers].sort((a,b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent)).slice(0, 50)
      case 'Top Losers':
        return [...tickers].sort((a,b) => parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent)).slice(0, 50)
      case 'New Listings':
        return tickers.slice(-30).reverse()
      default:
        return tickers
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#E2E8F0]">
      <Navbar />
      <div className="pt-16">
        <TickerBar />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="font-display font-bold text-xl text-[#E2E8F0]">Markets</h1>
          <p className="text-[#5A6478] text-sm mt-0.5">Live crypto market data from Binance</p>
        </div>

        {/* Stats cards */}
        <div className="mb-6">
          <MarketStats tickers={tickers} />
        </div>

        {/* Main card */}
        <div className="bg-[#13151C] border border-[#252836] rounded-xl">
          {/* Tabs */}
          <div className="flex items-center gap-1 px-4 border-b border-[#252836] overflow-x-auto scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3.5 text-sm font-display font-medium whitespace-nowrap
                            border-b-2 transition-colors duration-200
                            ${activeTab === tab
                              ? 'text-[#00D4FF] border-[#00D4FF]'
                              : 'text-[#5A6478] border-transparent hover:text-[#E2E8F0]'}`}
              >
                {tab}
                {tab === 'AI Select' && (
                  <span className="ml-1.5 bg-[rgba(167,139,250,0.15)] text-[#A78BFA] text-[9px] px-1.5 py-0.5 rounded-full">
                    AI
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-4">
            {activeTab === 'AI Select' ? (
              <div className="py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[rgba(167,139,250,0.1)] border border-[rgba(167,139,250,0.2)]
                                flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="font-display font-semibold text-[#E2E8F0] mb-2">AI Market Select</h3>
                <p className="text-[#5A6478] text-sm max-w-sm mx-auto">
                  AI-curated coin recommendations based on momentum, volume, and prediction models.
                  Available after AI/ML integration.
                </p>
              </div>
            ) : (
              <CoinTable tickers={getFiltered()} loading={loading} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
