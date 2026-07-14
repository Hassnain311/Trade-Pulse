import { useState, useEffect, useCallback } from 'react'
import { Newspaper, Users, Wifi, WifiOff } from 'lucide-react'
import Navbar from '../components/common/Navbar'
import TickerBar from '../components/common/TickerBar'
import PostCard from '../components/news/PostCard'
import CreatePost from '../components/news/CreatePost'
import NewsSidebar from '../components/news/NewsSidebar'
import { newsAPI } from '../api/news.api'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'

const LEFT_NAV = [
  { icon: Newspaper, label: 'Discover'  },
  { icon: Newspaper, label: 'News'      },
  { icon: Users,     label: 'Following' },
]

// ── MOCK POSTS (shown while backend isn't connected yet) ──
const MOCK_POSTS = [
  {
    _id: '1',
    userId: { fullName: 'Crypto Analyst', _id: 'u1' },
    content: '$BTC looking very strong above 63K. The 200-day MA is acting as strong support. MACD is crossing bullish on the weekly. Target: $72K by end of month. 🚀',
    sentiment: 'BULLISH',
    coinTag: 'BTC/USDT',
    coinChange: '+2.44',
    likes: 247,
    comments: 38,
    isLiked: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: '2',
    userId: { fullName: 'DeFi Trader', _id: 'u2' },
    content: 'ETH gas fees are through the roof again. Layer 2 solutions are the future. $ETH might struggle short term but long-term thesis is intact. The merge was just the beginning.',
    sentiment: 'NEUTRAL',
    coinTag: 'ETH/USDT',
    coinChange: '+1.66',
    likes: 183,
    comments: 25,
    isLiked: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    _id: '3',
    userId: { fullName: 'SOL Maxi', _id: 'u3' },
    content: '$SOL is quietly outperforming. TPS is back above 2000, NFT volume is surging, and the developer ecosystem is growing faster than ever. Sub $80 is a steal. Load up.',
    sentiment: 'BULLISH',
    coinTag: 'SOL/USDT',
    coinChange: '+1.19',
    likes: 156,
    comments: 17,
    isLiked: false,
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    _id: '4',
    userId: { fullName: 'Bear Market Bob', _id: 'u4' },
    content: 'Macro environment is still uncertain. FED rate decisions coming up. $BTC correlation with NASDAQ remains high. Be careful out there, risk management is everything.',
    sentiment: 'BEARISH',
    coinTag: null,
    coinChange: null,
    likes: 89,
    comments: 31,
    isLiked: false,
    createdAt: new Date(Date.now() - 18000000).toISOString(),
  },
]

export default function News() {
  const { user }       = useAuth()
  const { on, emit, connected } = useSocket()
  const [posts,     setPosts]     = useState(MOCK_POSTS)
  const [posting,   setPosting]   = useState(false)
  const [activeNav, setActiveNav] = useState('Discover')
  const [onlineCount, setOnlineCount] = useState(1)

  // Join news room on mount and listen for real-time posts
  useEffect(() => {
    // Join the news Socket.io room
    emit('join_room', 'news')

    // Listen for new posts from other users via Socket.io
    const removeNewPost = on('new_post', (post) => {
      setPosts(prev => [post, ...prev])
    })

    // Listen for like updates
    const removeLike = on('post_liked', ({ postId, likes }) => {
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes } : p))
    })

    // Track online users
    const removeOnline = on('room_users', (count) => {
      setOnlineCount(count)
    })

    // Fetch existing posts from API (uses access token via axiosInstance)
    newsAPI.getPosts()
      .then(res => {
        if (res.data?.posts?.length > 0) {
          setPosts(res.data.posts)
        }
      })
      .catch(() => {}) // Keep mock posts on error

    return () => {
      removeNewPost?.()
      removeLike?.()
      removeOnline?.()
      emit('leave_room', 'news')
    }
  }, [])

  const handlePost = useCallback(async ({ content, sentiment }) => {
    setPosting(true)
    try {
      // API call uses axiosInstance → access token attached automatically
      // If expired → refresh token used → retried → success
      const res = await newsAPI.createPost({ content, sentiment })
      const newPost = res.data.post

      // Optimistic update
      setPosts(prev => [newPost, ...prev])

      // Broadcast to other users via Socket.io
      emit('broadcast_post', newPost)
    } catch {
      // If API fails, create a local-only post so UX doesn't break
      const localPost = {
        _id: Date.now().toString(),
        userId: { fullName: user?.fullName, _id: user?._id },
        content,
        sentiment,
        likes: 0,
        comments: 0,
        isLiked: false,
        createdAt: new Date().toISOString(),
      }
      setPosts(prev => [localPost, ...prev])
    } finally {
      setPosting(false)
    }
  }, [user, emit])

  const handleLike = useCallback(async (postId) => {
    try {
      await newsAPI.likePost(postId)
    } catch { /* optimistic update already applied in PostCard */ }
  }, [])

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#E2E8F0]">
      <Navbar />
      <div className="pt-16">
        <TickerBar />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        <div className="flex gap-4 py-4">

          {/* ── Left sidebar nav ── */}
          <div className="w-[200px] shrink-0 hidden lg:flex flex-col gap-1 sticky top-[105px] self-start">
            <div className="flex items-center gap-2 px-4 py-3 mb-2">
              <div className="w-7 h-7 rounded-lg bg-[#00D4FF] flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                  <path d="M3 12h3l3-6 4 12 3-9 2 3h3" stroke="#0B0C10" strokeWidth="2.2"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-display font-bold text-sm text-[#E2E8F0]">
                Trade<span className="text-[#00D4FF]">Pulse</span>
              </span>
            </div>

            {['Discover', 'News', 'Notifications', 'Profile', 'Bookmarks', 'Settings'].map(item => (
              <button
                key={item}
                onClick={() => setActiveNav(item)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-display
                            font-medium transition-colors text-left
                            ${activeNav === item
                              ? 'bg-[rgba(0,212,255,0.08)] text-[#00D4FF]'
                              : 'text-[#7E8BA0] hover:text-[#E2E8F0] hover:bg-[#13151C]'}`}
              >
                <Newspaper size={15} />
                {item}
              </button>
            ))}

            {/* Socket connection status */}
            <div className={`flex items-center gap-2 px-4 py-2 mt-4 rounded-xl text-xs
                             ${connected
                               ? 'text-[#00E676] bg-[rgba(0,230,118,0.05)]'
                               : 'text-[#FF3B5C] bg-[rgba(255,59,92,0.05)]'}`}>
              {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
              {connected ? `${onlineCount} online` : 'Disconnected'}
            </div>
          </div>

          {/* ── Main feed ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Create post */}
            <CreatePost onSubmit={handlePost} loading={posting} />

            {/* Live indicator */}
            {connected && (
              <div className="flex items-center gap-2 px-3 py-2 bg-[rgba(0,230,118,0.05)]
                              border border-[rgba(0,230,118,0.15)] rounded-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
                <span className="text-xs text-[#00E676]">
                  Live feed — new posts appear instantly via Socket.io
                </span>
              </div>
            )}

            {/* Posts */}
            <div className="flex flex-col gap-3">
              {posts.map(post => (
                <PostCard
                  key={post._id}
                  post={post}
                  onLike={handleLike}
                  currentUserId={user?._id}
                />
              ))}
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <div className="w-[300px] shrink-0 hidden xl:block sticky top-[105px] self-start">
            <NewsSidebar />
          </div>
        </div>
      </div>
    </div>
  )
}
