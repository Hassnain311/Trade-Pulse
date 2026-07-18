import { useState, useEffect, useRef } from 'react'
import { Search, Hash, TrendingUp, X, Loader2 } from 'lucide-react'
import { newsAPI } from '../../api/news.api'
import { formatTimeAgo } from '../../utils/formatters'

export default function NewsSidebar({ onSearch, refreshKey }) {
  const [query,      setQuery]      = useState('')
  const [results,    setResults]    = useState([])
  const [searching,  setSearching]  = useState(false)
  const [showResults, setShowResults] = useState(false)
  const debounceRef  = useRef(null)
  const wrapperRef   = useRef(null)

  const [trending,        setTrending]        = useState([])
  const [trendingLoading, setTrendingLoading] = useState(true)

  useEffect(() => {
    newsAPI.getTrending()
      .then(res => setTrending(res.data?.trending || []))
      .catch(() => setTrending([]))
      .finally(() => setTrendingLoading(false))
  }, [refreshKey])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!query.trim()) {
      setResults([])
      setShowResults(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await newsAPI.searchPosts(query.trim())
        setResults(res.data?.post || [])
        setShowResults(true)
      } catch (err) {
        console.error('Search failed:', err)
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 400)

    return () => clearTimeout(debounceRef.current)
  }, [query])

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleClear = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
  }

  const handleResultClick = (post) => {
    onSearch?.(post)
    setShowResults(false)
  }

  return (
    <div className="flex flex-col gap-4">

      <div className="relative" ref={wrapperRef}>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6478] pointer-events-none" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => query.trim() && setShowResults(true)}
            placeholder="Search posts or coins..."
            className="w-full bg-[#13151C] border border-[#252836] rounded-xl
                       pl-9 pr-9 py-2.5 text-sm text-[#E2E8F0] placeholder:text-[#5A6478]
                       focus:outline-none focus:border-[#00D4FF] transition-colors"
          />
          {searching && (
            <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00D4FF] animate-spin" />
          )}
          {!searching && query && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6478] hover:text-[#E2E8F0] transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {showResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#13151C] border border-[#252836]
                          rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto animate-fade-in">
            {searching && results.length === 0 && (
              <p className="px-4 py-6 text-center text-[#5A6478] text-xs">Searching...</p>
            )}

            {!searching && results.length === 0 && (
              <p className="px-4 py-6 text-center text-[#5A6478] text-xs">
                No posts found for "{query}"
              </p>
            )}

            {results.map(post => (
              <button
                key={post._id}
                onClick={() => handleResultClick(post)}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[#1A1D27]
                           transition-colors text-left border-b border-[#252836]/50 last:border-0"
              >
                <div className="w-7 h-7 rounded-full bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.15)]
                                flex items-center justify-center shrink-0 overflow-hidden">
                  {post.user?.profilepic
                    ? <img src={post.user.profilepic} alt="" className="w-full h-full object-cover" />
                    : <span className="text-[#00D4FF] text-[10px] font-bold">
                        {post.user?.name?.[0]?.toUpperCase() || 'U'}
                      </span>
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-[#E2E8F0] text-xs font-display font-medium">
                    {post.user?.name || 'Anonymous'}
                  </p>
                  <p className="text-[#7E8BA0] text-xs line-clamp-2 mt-0.5">
                    {post.content}
                  </p>
                  <p className="text-[#5A6478] text-[10px] mt-1">
                    {formatTimeAgo(post.createdAt)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[#13151C] border border-[#252836] rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#252836]">
          <TrendingUp size={14} className="text-[#00D4FF]" />
          <h3 className="font-display font-semibold text-sm text-[#E2E8F0]">Trending Topics</h3>
          <span className="ml-auto text-[10px] text-[#5A6478]">Last 24h</span>
        </div>

        {trendingLoading && (
          <div className="px-4 py-6 text-center text-[#5A6478] text-xs">
            Loading trending coins...
          </div>
        )}

        {!trendingLoading && trending.length === 0 && (
          <div className="px-4 py-6 text-center text-[#5A6478] text-xs">
            No trending coins yet. Be the first to post about one!
          </div>
        )}

        {!trendingLoading && trending.length > 0 && (
          <div className="divide-y divide-[#252836]">
            {trending.map((t, i) => (
              <button
                key={t.coin}
                onClick={() => setQuery(t.coin)}
                className="w-full flex items-center justify-between px-4 py-3
                           hover:bg-[#1A1D27] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#5A6478] text-xs font-mono">{i + 1}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Hash size={10} className="text-[#00D4FF]" />
                      <span className="text-[#E2E8F0] text-sm font-display font-medium">
                        {t.coin.replace('$', '')}
                      </span>
                    </div>
                    <span className="text-[#5A6478] text-xs">
                      {Math.round(t.count)} mention{Math.round(t.count) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

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