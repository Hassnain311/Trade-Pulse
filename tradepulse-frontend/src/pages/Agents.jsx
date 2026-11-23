import { useState } from 'react'
import Navbar from '../components/common/Navbar'
import TickerBar from '../components/common/TickerBar'
import TradingChart from '../components/trade/TradingChart'
import AgentPanel from '../components/agents/AgentPanel'

export default function Agents() {
  const [symbol,   setSymbol]   = useState('BTCUSDT')
  const [interval, setInterval] = useState('1D')

  return (
    <div className="h-screen bg-[#0B0C10] text-[#E2E8F0] flex flex-col overflow-hidden">
      <Navbar />
      <div className="pt-16 shrink-0">
        <TickerBar />
      </div>

      {/* Page header */}
      <div className="shrink-0 px-4 md:px-6 py-3 border-b border-[#252836] bg-[#13151C]
                      flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-sm text-[#E2E8F0]">
            AI Prediction Agents
          </h1>
          <p className="text-[#5A6478] text-xs mt-0.5">
            LSTM model trained on historical price data • For learning purposes only
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#A78BFA] animate-pulse" />
          <span className="text-xs text-[#A78BFA] font-display">LSTM Active</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden min-h-0 p-3 gap-3">
        {/* Chart (takes most space) */}
        <div className="flex-1 min-w-0">
          <TradingChart
            key={symbol}
            symbol={symbol}
            interval={interval}
            onIntervalChange={setInterval}
          />
        </div>

        {/* Agent panel (right sidebar) */}
        <div className="w-[300px] shrink-0 hidden lg:block">
          <AgentPanel
            symbol={symbol}
            onSymbolChange={(s) => setSymbol(s)}
          />
        </div>
      </div>

      {/* Mobile agent panel */}
      <div className="lg:hidden shrink-0 p-3 pt-0 max-h-[300px]">
        <AgentPanel symbol={symbol} onSymbolChange={setSymbol} />
      </div>
    </div>
  )
}
