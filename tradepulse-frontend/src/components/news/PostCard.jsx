import { useState } from 'react'
import { Heart, MessageCircle, Share2, MoreHorizontal, TrendingUp, TrendingDown } from 'lucide-react'
import { formatTimeAgo } from '../../utils/formatters'

export default function PostCard({ post, onLike, currentUserId }) {
  const [liked,     setLiked]     = useState(post.isLiked || false)
  const [likeCount, setLikeCount] = useState(post.likes || 0)
  const [showMenu,  setShowMenu]  = useState(false)

  const handleLike = () => {
    setLiked(p => !p)
    setLikeCount(c => liked ? c - 1 : c + 1)
    onLike?.(post._id)
  }

  const isOwn = currentUserId === post.userId?._id

  // Extract coin mentions like $BTC, $ETH
  const renderContent = (text) => {
    return text.split(/(\$[A-Z]+)/g).map((part, i) =>
      part.startsWith('$')
        ? <span key={i} className="text-[#00D4FF] font-medium cursor-pointer hover:underline">{part}</span>
        : part
    )
  }

  return (
    <article className="bg-[#13151C] border border-[#252836] rounded-xl p-4 hover:border-[#2E3246] transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)]
                          flex items-center justify-center shrink-0">
            <span className="text-[#00D4FF] text-sm font-bold">
              {post.userId?.fullName?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold text-sm text-[#E2E8F0]">
                {post.userId?.fullName || 'Anonymous'}
              </span>
              {post.userId?.verified && (
                <span className="text-[10px] bg-[rgba(0,212,255,0.1)] text-[#00D4FF] px-1.5 py-0.5 rounded-full">
                  ✓
                </span>
              )}
            </div>
            <span className="text-[#5A6478] text-xs">{formatTimeAgo(post.createdAt)}</span>
          </div>
        </div>

        {/* More menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(p => !p)}
            className="text-[#5A6478] hover:text-[#E2E8F0] p-1 rounded-lg hover:bg-[#1A1D27] transition-colors"
          >
            <MoreHorizontal size={15} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-7 w-40 bg-[#1A1D27] border border-[#252836] rounded-xl
                            shadow-xl overflow-hidden z-10">
              <button className="w-full px-3 py-2 text-xs text-[#7E8BA0] hover:text-[#E2E8F0]
                                 hover:bg-[#252836] text-left transition-colors">
                Copy link
              </button>
              {isOwn && (
                <button className="w-full px-3 py-2 text-xs text-[#FF3B5C] hover:bg-[rgba(255,59,92,0.08)]
                                   text-left transition-colors">
                  Delete post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sentiment badge */}
      {post.sentiment && (
        <div className={`inline-flex items-center gap-1 text-[10px] font-display font-semibold
                         px-2 py-1 rounded-full mb-2
                         ${post.sentiment === 'BULLISH'
                           ? 'bg-[rgba(0,230,118,0.1)] text-[#00E676] border border-[rgba(0,230,118,0.2)]'
                           : post.sentiment === 'BEARISH'
                           ? 'bg-[rgba(255,59,92,0.1)] text-[#FF3B5C] border border-[rgba(255,59,92,0.2)]'
                           : 'bg-[rgba(255,209,102,0.1)] text-[#FFD166] border border-[rgba(255,209,102,0.2)]'}`}>
          {post.sentiment === 'BULLISH' ? <TrendingUp size={10} />
           : post.sentiment === 'BEARISH' ? <TrendingDown size={10} /> : null}
          {post.sentiment}
        </div>
      )}

      {/* Content */}
      <p className="text-[#C8D0DC] text-sm leading-relaxed mb-3">
        {renderContent(post.content)}
      </p>

      {/* Attached image */}
      {post.image && (
        <img src={post.image} alt="post" className="w-full rounded-xl border border-[#252836] mb-3 object-cover max-h-64" />
      )}

      {/* Coin tag */}
      {post.coinTag && (
        <div className={`inline-flex items-center gap-1.5 text-xs font-mono font-medium mb-3 px-3 py-1.5 rounded-lg border
                         ${parseFloat(post.coinChange) >= 0
                           ? 'bg-[rgba(0,230,118,0.08)] border-[rgba(0,230,118,0.2)] text-[#00E676]'
                           : 'bg-[rgba(255,59,92,0.08)] border-[rgba(255,59,92,0.2)] text-[#FF3B5C]'}`}>
          <span className="font-display font-semibold text-[#E2E8F0]">{post.coinTag}</span>
          {post.coinChange && <span>{parseFloat(post.coinChange) >= 0 ? '+' : ''}{post.coinChange}%</span>}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-5 pt-2 border-t border-[#252836]">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-xs transition-colors
                      ${liked ? 'text-[#FF3B5C]' : 'text-[#5A6478] hover:text-[#FF3B5C]'}`}
        >
          <Heart size={13} className={liked ? 'fill-[#FF3B5C]' : ''} />
          <span>{likeCount}</span>
        </button>

        <button className="flex items-center gap-1.5 text-xs text-[#5A6478] hover:text-[#00D4FF] transition-colors">
          <MessageCircle size={13} />
          <span>{post.comments || 0}</span>
        </button>

        <button className="flex items-center gap-1.5 text-xs text-[#5A6478] hover:text-[#00D4FF] transition-colors ml-auto">
          <Share2 size={13} />
        </button>
      </div>
    </article>
  )
}
