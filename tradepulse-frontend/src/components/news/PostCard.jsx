import { useState , useEffect } from 'react'
import { Heart, MessageCircle, Share2, MoreHorizontal, TrendingUp, TrendingDown, Trash2, Send } from 'lucide-react'
import { formatTimeAgo } from '../../utils/formatters'

export default function PostCard({ post, onLike, onUnlike, onComment, onDelete, currentUserId, readOnly = false }) {

  // post.likes is array of user IDs from backend
  const likesArray = post.likes || []
  const isLiked    = likesArray.some(id => id?.toString() === currentUserId?.toString())
  const likeCount  = likesArray.length

  const [liked,        setLiked]        = useState(isLiked)
  const [localCount,   setLocalCount]   = useState(likeCount)
  const [showMenu,     setShowMenu]     = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentText,  setCommentText]  = useState('')


  useEffect(() => {
    setLiked(isLiked)
    setLocalCount(likeCount)
  }, [isLiked, likeCount])

  // post.user.name (not post.userId.fullName)
  const authorName   = post.user?.name || 'Anonymous'
  const authorAvatar = post.user?.profilepic
  const isOwn         = currentUserId === post.user?._id?.toString()

  console.log('DEBUG isOwn check:', {
    currentUserId,
    'currentUserId type': typeof currentUserId,
    'post.user._id': post.user?._id,
    'post.user._id type': typeof post.user?._id,
    isOwn
  })

  const handleLike = () => {
    if (readOnly) return
    if (liked) {
      setLiked(false)
      setLocalCount(c => c - 1)
      onUnlike?.(post._id)
    } else {
      setLiked(true)
      setLocalCount(c => c + 1)
      onLike?.(post._id)
    }
  }

  const handleCommentSubmit = () => {
    if (readOnly) return
    if (!commentText.trim()) return
    onComment?.(post._id, commentText.trim())
    setCommentText('')
  }

  const handleDelete = () => {
    setShowMenu(false)
    onDelete?.(post._id)
  }

  // Highlight $BTC $ETH etc
  const renderContent = (text) => {
    return text.split(/(\$[A-Z]+)/g).map((part, i) =>
      part.startsWith('$')
        ? <span key={i} className="text-[#00D4FF] font-medium cursor-pointer hover:underline">{part}</span>
        : part
    )
  }

  // sentiment values from backend: "Bullish" "Bearish" "Neutral"
  const sentimentColor = {
    Bullish: 'bg-[rgba(0,230,118,0.1)] text-[#00E676] border-[rgba(0,230,118,0.2)]',
    Bearish: 'bg-[rgba(255,59,92,0.1)] text-[#FF3B5C] border-[rgba(255,59,92,0.2)]',
    Neutral: 'bg-[rgba(255,209,102,0.1)] text-[#FFD166] border-[rgba(255,209,102,0.2)]',
  }

  return (
    <article className="bg-[#13151C] border border-[#252836] rounded-xl p-4 hover:border-[#2E3246] transition-colors">

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)]
                          flex items-center justify-center shrink-0 overflow-hidden">
            {authorAvatar
              ? <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
              : <span className="text-[#00D4FF] text-sm font-bold">{authorName[0]?.toUpperCase()}</span>
            }
          </div>
          <div>
            <span className="font-display font-semibold text-sm text-[#E2E8F0]">
              {authorName}
            </span>
            <p className="text-[#5A6478] text-xs">{formatTimeAgo(post.createdAt)}</p>
          </div>
        </div>

        {/* More menu — hidden entirely in read-only mode */}
        {!readOnly && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(p => !p)}
              className="text-[#5A6478] hover:text-[#E2E8F0] p-1 rounded-lg hover:bg-[#1A1D27] transition-colors"
            >
              <MoreHorizontal size={15} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-7 w-40 bg-[#1A1D27] border border-[#252836]
                              rounded-xl shadow-xl overflow-hidden z-10">
                <button className="w-full px-3 py-2 text-xs text-[#7E8BA0] hover:text-[#E2E8F0]
                                   hover:bg-[#252836] text-left transition-colors">
                  Copy link
                </button>
                {isOwn && (
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#FF3B5C]
                               hover:bg-[rgba(255,59,92,0.08)] text-left transition-colors"
                  >
                    <Trash2 size={12} />
                    Delete post
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sentiment badge — backend uses "Bullish" "Bearish" "Neutral" */}
      {post.sentiment && (
        <div className={`inline-flex items-center gap-1 text-[10px] font-display font-semibold
                         px-2 py-1 rounded-full mb-2 border
                         ${sentimentColor[post.sentiment] || sentimentColor.Neutral}`}>
          {post.sentiment === 'Bullish' && <TrendingUp size={10} />}
          {post.sentiment === 'Bearish' && <TrendingDown size={10} />}
          {post.sentiment}
        </div>
      )}

      {/* Content */}
      <p className="text-[#C8D0DC] text-sm leading-relaxed mb-3">
        {renderContent(post.content)}
      </p>

      {/* Actions — hidden entirely in read-only mode, no icons, no separator line */}
      {!readOnly && (
        <div className="flex items-center gap-5 pt-2 border-t border-[#252836]">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-xs transition-colors
                        ${liked ? 'text-[#FF3B5C]' : 'text-[#5A6478] hover:text-[#FF3B5C]'}`}
          >
            <Heart size={13} className={liked ? 'fill-[#FF3B5C]' : ''} />
            <span>{localCount}</span>
          </button>

          <button
            onClick={() => setShowComments(p => !p)}
            className={`flex items-center gap-1.5 text-xs transition-colors
                        ${showComments ? 'text-[#00D4FF]' : 'text-[#5A6478] hover:text-[#00D4FF]'}`}
          >
            <MessageCircle size={13} />
            <span>{post.comments?.length || 0}</span>
          </button>

          <button className="flex items-center gap-1.5 text-xs text-[#5A6478] hover:text-[#00D4FF] transition-colors ml-auto">
            <Share2 size={13} />
          </button>
        </div>
      )}

      {/* Comments section — shown when user clicks the comment icon, never in read-only mode */}
      {showComments && !readOnly && (
        <div className="mt-3 pt-3 border-t border-[#252836] flex flex-col gap-2">
          {(post.comments || []).map((c, i) => (
            <div key={i} className="flex gap-2 text-xs">
              <span className="font-semibold text-[#E2E8F0] shrink-0">
                {c.user?.name || 'User'}:
              </span>
              <span className="text-[#7E8BA0]">{c.text}</span>
            </div>
          ))}

          <div className="flex items-center gap-2 mt-1">
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCommentSubmit()}
              placeholder="Add a comment..."
              className="flex-1 bg-[#1A1D27] border border-[#252836] rounded-lg px-3 py-1.5
                         text-xs text-[#E2E8F0] placeholder:text-[#5A6478]
                         focus:outline-none focus:border-[#00D4FF] transition-colors"
            />
            <button
              onClick={handleCommentSubmit}
              className="text-[#00D4FF] hover:text-[#0096BE] transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </article>
  )
}