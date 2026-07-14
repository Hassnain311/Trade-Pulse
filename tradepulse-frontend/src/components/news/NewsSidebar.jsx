import { useState } from 'react'
import { Search, Hash, TrendingUp } from 'lucide-react'

const TRENDING = [
  { tag: 'Bitcoin',   posts: '12.4K', change: '+2.4%',  up: true  },
  { tag: 'Ethereum',  posts: '8.9K',  change: '-1.2%',  up: false },
  { tag: 'Solana',    posts: '6.2K',  change: '+5.1%',  up: true  },
  { tag: 'Altseason', posts: '4.8K',  change: null,      up: null  },
  { tag: 'DOGE',      posts: '3.1K',  change: '-0.6%',  up: false },
  { tag: 'BullRun',   posts: '2.7K',  change: null,      up: null  },
]

export default function NewsSidebar({ onSearch }) {
  const [query, setQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    onSearch?.(query)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6478] pointer-events-none" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search posts or coins..."
          className="w-full bg-[#13151C] border border-[#252836] rounded-xl
                     pl-9 pr-4 py-2.5 text-sm text-[#E2E8F0] placeholder:text-[#5A6478]
                     focus:outline-none focus:border-[#00D4FF] transition-colors"
        />
      </form>

      {/* Trending topics */}
      <div className="bg-[#13151C] border border-[#252836] rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#252836]">
          <TrendingUp size={14} className="text-[#00D4FF]" />
          <h3 className="font-display font-semibold text-sm text-[#E2E8F0]">Trending Topics</h3>
        </div>
        <div className="divide-y divide-[#252836]">
          {TRENDING.map((t, i) => (
            <button
              key={t.tag}
              className="w-full flex items-center justify-between px-4 py-3
                         hover:bg-[#1A1D27] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-[#5A6478] text-xs font-mono">{i + 1}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <Hash size={10} className="text-[#00D4FF]" />
                    <span className="text-[#E2E8F0] text-sm font-display font-medium">{t.tag}</span>
                  </div>
                  <span className="text-[#5A6478] text-xs">{t.posts} posts</span>
                </div>
              </div>
              {t.change && (
                <span className={`font-mono text-xs font-medium ${t.up ? 'text-[#00E676]' : 'text-[#FF3B5C]'}`}>
                  {t.change}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Join box */}
      <div className="bg-[#13151C] border border-[#252836] rounded-xl p-4">
        <h3 className="font-display font-bold text-sm text-[#E2E8F0] mb-1.5">
          Join the conversation
        </h3>
        <div className="space-y-1.5 mb-3">
          {['Get live market insights', 'Share analysis with traders', 'Real-time Socket.io updates'].map(t => (
            <div key={t} className="flex items-center gap-2 text-xs text-[#5A6478]">
              <span className="w-1 h-1 rounded-full bg-[#00D4FF] shrink-0" />
              {t}
            </div>
          ))}
        </div>
        <p className="text-[#5A6478] text-[10px]">
          Posts update in real-time via Socket.io for all connected users.
        </p>
      </div>
    </div>
  )
}
