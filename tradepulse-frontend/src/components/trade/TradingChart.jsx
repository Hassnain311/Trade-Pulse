import { useEffect, useRef } from 'react'

const INTERVALS = ['1m', '5m', '15m', '1H', '4H', '1D', '1W']

export default function TradingChart({ symbol = 'BTCUSDT', interval = '1D', onIntervalChange }) {
  const containerRef = useRef(null)
  const widgetRef    = useRef(null)

  // TradingView interval mapping
  const TV_INTERVAL = {
    '1m': '1', '5m': '5', '15m': '15',
    '1H': '60', '4H': '240', '1D': 'D', '1W': 'W'
  }

  useEffect(() => {
    if (!containerRef.current) return

    // Clear previous widget
    containerRef.current.innerHTML = ''
    const containerId = `tv_${symbol}_${Date.now()}`
    containerRef.current.id = containerId

    const initWidget = () => {
      if (!window.TradingView) return
      widgetRef.current = new window.TradingView.widget({
        autosize:          true,
        symbol:            `BINANCE:${symbol}`,
        interval:          TV_INTERVAL[interval] || 'D',
        timezone:          'Etc/UTC',
        theme:             'dark',
        style:             '1',          // candlestick
        locale:            'en',
        container_id:      containerId,
        toolbar_bg:        '#13151C',
        backgroundColor:   '#13151C',
        gridColor:         'rgba(37,40,54,0.4)',
        enable_publishing: false,
        hide_top_toolbar:  false,
        hide_legend:       false,
        allow_symbol_change: false,
        save_image:        false,
        studies:           ['RSI@tv-basicstudies', 'MACD@tv-basicstudies'],
        overrides: {
          'paneProperties.background':         '#13151C',
          'paneProperties.backgroundType':     'solid',
          'paneProperties.vertGridProperties.color': 'rgba(37,40,54,0.4)',
          'paneProperties.horzGridProperties.color': 'rgba(37,40,54,0.4)',
          'scalesProperties.textColor':        '#7E8BA0',
          'scalesProperties.lineColor':        '#252836',
          'mainSeriesProperties.candleStyle.upColor':       '#00E676',
          'mainSeriesProperties.candleStyle.downColor':     '#FF3B5C',
          'mainSeriesProperties.candleStyle.borderUpColor': '#00E676',
          'mainSeriesProperties.candleStyle.borderDownColor': '#FF3B5C',
          'mainSeriesProperties.candleStyle.wickUpColor':   '#00E676',
          'mainSeriesProperties.candleStyle.wickDownColor': '#FF3B5C',
        }
      })
    }

    if (window.TradingView) {
      initWidget()
    } else {
      // Load TradingView script if not already loaded
      const existing = document.getElementById('tv-script')
      if (!existing) {
        const script = document.createElement('script')
        script.id    = 'tv-script'
        script.src   = 'https://s3.tradingview.com/tv.js'
        script.async = true
        script.onload = initWidget
        document.head.appendChild(script)
      } else {
        // Script is loading, wait for it
        existing.addEventListener('load', initWidget)
      }
    }

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = ''
    }
  }, [symbol, interval])

  return (
    <div className="flex flex-col h-full bg-[#13151C] border border-[#252836] rounded-xl overflow-hidden">
      {/* Interval tabs */}
      <div className="flex items-center gap-0.5 px-4 py-2 border-b border-[#252836]">
        {INTERVALS.map(iv => (
          <button
            key={iv}
            onClick={() => onIntervalChange?.(iv)}
            className={`px-3 py-1.5 text-xs font-display font-medium rounded-md transition-colors
                        ${interval === iv
                          ? 'bg-[rgba(0,212,255,0.1)] text-[#00D4FF]'
                          : 'text-[#5A6478] hover:text-[#E2E8F0] hover:bg-[#1A1D27]'}`}
          >
            {iv}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse" />
          <span className="text-[10px] text-[#5A6478]">Live</span>
        </div>
      </div>

      {/* TradingView container */}
      <div ref={containerRef} className="flex-1 min-h-0" />
    </div>
  )
}
