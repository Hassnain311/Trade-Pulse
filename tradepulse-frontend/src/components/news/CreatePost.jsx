import { useState, useRef } from 'react'
import { Image, TrendingUp, TrendingDown, Minus, Send, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const SENTIMENTS = [
  { label: 'Bullish',  value: 'BULLISH',  icon: TrendingUp,   color: '#00E676' },
  { label: 'Bearish',  value: 'BEARISH',  icon: TrendingDown, color: '#FF3B5C' },
  { label: 'Neutral',  value: 'NEUTRAL',  icon: Minus,        color: '#FFD166' },
]

export default function CreatePost({ onSubmit, loading = false }) {
  const { user } = useAuth()
  const [content,   setContent]   = useState('')
  const [sentiment, setSentiment] = useState('')
  const [focused,   setFocused]   = useState(false)
  const MAX = 500

  const handleSubmit = () => {
    if (!content.trim()) return
    onSubmit?.({ content: content.trim(), sentiment })
    setContent('')
    setSentiment('')
  }

  const remaining = MAX - content.length
  const initial = user?.fullName?.[0]?.toUpperCase() || 'U'

  return (
    <div className={`bg-[#13151C] border rounded-xl p-4 transition-colors
                     ${focused ? 'border-[#2E3246]' : 'border-[#252836]'}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)]
                        flex items-center justify-center shrink-0">
          <span className="text-[#00D4FF] text-sm font-bold">{initial}</span>
        </div>

        <div className="flex-1 flex flex-col gap-3">
          {/* Text area */}
          <textarea
            value={content}
            onChange={e => setContent(e.target.value.slice(0, MAX))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Share your market thoughts... Use $BTC, $ETH to tag coins"
            rows={focused ? 3 : 2}
            className="w-full bg-transparent text-[#E2E8F0] text-sm placeholder:text-[#5A6478]
                       resize-none focus:outline-none leading-relaxed transition-all"
          />

          {/* Expanded toolbar */}
          {(focused || content) && (
            <div className="flex items-center justify-between pt-2 border-t border-[#252836] animate-fade-in">
              {/* Sentiment buttons */}
              <div className="flex items-center gap-1.5">
                {SENTIMENTS.map(({ label, value, icon: Icon, color }) => (
                  <button
                    key={value}
                    onClick={() => setSentiment(s => s === value ? '' : value)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-display font-medium
                                border transition-colors
                                ${sentiment === value
                                  ? `border-[${color}]/40 text-[${color}]`
                                  : 'border-[#252836] text-[#5A6478] hover:text-[#E2E8F0]'}`}
                    style={sentiment === value
                      ? { color, borderColor: `${color}40`, background: `${color}12` }
                      : {}}
                  >
                    <Icon size={10} />
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                {/* Character count */}
                <span className={`text-xs font-mono ${remaining < 50 ? 'text-[#FFD166]' : 'text-[#5A6478]'}`}>
                  {remaining}
                </span>
                {/* Post button */}
                <button
                  onClick={handleSubmit}
                  disabled={!content.trim() || loading}
                  className="flex items-center gap-1.5 bg-[#00D4FF] hover:bg-[#0096BE] text-[#0B0C10]
                             font-display font-semibold text-xs px-4 py-2 rounded-lg transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  <Send size={12} />
                  {loading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
