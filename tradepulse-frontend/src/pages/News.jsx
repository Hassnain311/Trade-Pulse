import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Newspaper, Wifi, WifiOff, TrendingUp } from 'lucide-react'
import Navbar from '../components/common/Navbar'
import TickerBar from '../components/common/TickerBar'
import PostCard from '../components/news/PostCard'
import CreatePost from '../components/news/CreatePost'
import NewsSidebar from '../components/news/NewsSidebar'
import { newsAPI } from '../api/news.api'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'
import { formatTimeAgo } from '../utils/formatters'

const NAV_ITEMS = ['Discover', 'News', 'Notifications']

export default function News() {
  const { user }                = useAuth()
  const { on, connected }       = useSocket()
  const [searchParams]          = useSearchParams()

  const initialTab = searchParams.get('tab') === 'notifications' ? 'Notifications' : 'Discover'

  const [activeNav,     setActiveNav]     = useState(initialTab)
  const [posts,         setPosts]         = useState([])
  const [cryptoNews,    setCryptoNews]    = useState([])
  const [newsLoading,   setNewsLoading]   = useState(false)
  const [newsError,     setNewsError]     = useState(false)
  const [posting,       setPosting]       = useState(false)
  const [loading,       setLoading]       = useState(true)

  const [highlightedId, setHighlightedId] = useState(null)
  const postRefs = useRef({})

  // ── Trending refresh trigger ────────────────────────────────────
  const [trendingRefreshKey, setTrendingRefreshKey] = useState(0)

  useEffect(() => {
    newsAPI.getPosts()
      .then(res => setPosts(res.data?.posts || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (activeNav === 'News' || activeNav === 'Notifications') {
      setNewsLoading(true)
      setNewsError(false)
      newsAPI.getCryptoNews()
        .then(res => setCryptoNews(res.data?.news || []))
        .catch((err) => {
          console.error('getCryptoNews FAILED:', err.response?.data || err.message)
          setCryptoNews([])
          setNewsError(true)
        })
        .finally(() => setNewsLoading(false))
    }
  }, [activeNav])

  useEffect(() => {
    const removeNewPost = on('new_post', (post) => {
      setPosts(prev => [post, ...prev])
      setTrendingRefreshKey(k => k + 1)
    })

    const removeLikes = on('likes_updated', ({ postId, likes }) => {
      setPosts(prev => prev.map(p =>
        p._id === postId ? { ...p, likes } : p
      ))
    })

    const removeComment = on('new_comment', ({ postId, comment }) => {
      setPosts(prev => prev.map(p =>
        p._id === postId ? { ...p, comments: [...(p.comments || []), comment] } : p
      ))
    })

    const removeDelete = on('post_deleted', ({ postId }) => {
      setPosts(prev => prev.filter(p => p._id !== postId))
      setTrendingRefreshKey(k => k + 1)
    })

    return () => {
      removeNewPost?.()
      removeLikes?.()
      removeComment?.()
      removeDelete?.()
    }
  }, [on])

  const handlePost = useCallback(async ({ content, sentiment }) => {
    setPosting(true)
    try {
      await newsAPI.createPost({ content, sentiment })
    } catch (err) {
      console.error('Failed to create post:', err)
    } finally {
      setPosting(false)
    }
  }, [])

  const handleLike = useCallback(async (postId) => {
    try { await newsAPI.likePost(postId) } catch {}
  }, [])

  const handleUnlike = useCallback(async (postId) => {
    try { await newsAPI.unlikePost(postId) } catch {}
  }, [])

  const handleComment = useCallback(async (postId, text) => {
    try { await newsAPI.addComment(postId, { text }) } catch {}
  }, [])

  const handleDelete = useCallback(async (postId) => {
    try { await newsAPI.deletePost(postId) } catch {}
  }, [])

  const handleSearchResultClick = useCallback((clickedPost) => {
    setPosts(prev => {
      const exists = prev.some(p => p._id === clickedPost._id)
      return exists ? prev : [clickedPost, ...prev]
    })

    setActiveNav('Discover')

    setTimeout(() => {
      const el = postRefs.current[clickedPost._id]
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      setHighlightedId(clickedPost._id)
      setTimeout(() => setHighlightedId(null), 2000)
    }, 100)
  }, [])

  const last24hPosts = posts.filter(p =>
    Date.now() - new Date(p.createdAt).getTime() < 24 * 60 * 60 * 1000
  )
  const last24hNews = cryptoNews.filter(n =>
    Date.now() - (n.publishedOn * 1000) < 24 * 60 * 60 * 1000
  )

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#E2E8F0]">
      <Navbar />
      <div className="pt-16"><TickerBar /></div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        <div className="flex gap-4 py-4">

          <div className="w-[200px] shrink-0 hidden lg:flex flex-col gap-1 sticky top-[105px] self-start">
            <div className="flex items-center gap-2 px-4 py-3 mb-2">
              <div className="w-7 h-7 rounded-lg bg-[#00D4FF] flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                  <path d="M3 12h3l3-6 4 12 3-9 2 3h3" stroke="#0B0C10" strokeWidth="2.2"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-display font-bold text-sm">
                Trade<span className="text-[#00D4FF]">Pulse</span>
              </span>
            </div>

            {NAV_ITEMS.map(item => (
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

            <div className={`flex items-center gap-2 px-4 py-2 mt-4 rounded-xl text-xs
                             ${connected
                               ? 'text-[#00E676] bg-[rgba(0,230,118,0.05)]'
                               : 'text-[#FF3B5C] bg-[rgba(255,59,92,0.05)]'}`}>
              {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
              {connected ? 'Connected' : 'Disconnected'}
            </div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {activeNav === 'Discover' && (
              <>
                <CreatePost onSubmit={handlePost} loading={posting} />
                {loading && <p className="text-center py-10 text-[#5A6478] text-sm">Loading posts...</p>}
                {!loading && posts.length === 0 && (
                  <p className="text-center py-16 text-[#5A6478] text-sm">No posts yet. Be the first!</p>
                )}
                <div className="flex flex-col gap-3">
                  {posts.map(post => (
                    <div
                      key={post._id}
                      ref={el => { postRefs.current[post._id] = el }}
                      className={`rounded-xl transition-all duration-500
                                  ${highlightedId === post._id
                                    ? 'ring-2 ring-[#00D4FF] ring-offset-2 ring-offset-[#0B0C10]'
                                    : ''}`}
                    >
                      <PostCard
                        post={post}
                        onLike={handleLike}
                        onUnlike={handleUnlike}
                        onComment={handleComment}
                        onDelete={handleDelete}
                        currentUserId={user?._id}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeNav === 'News' && (
              <div className="flex flex-col gap-3">
                {newsLoading && (
                  <p className="text-center py-16 text-[#5A6478] text-sm">Loading crypto news...</p>
                )}
                {!newsLoading && newsError && (
                  <p className="text-center py-16 text-[#FF3B5C] text-sm">
                    Failed to load crypto news. Check backend console for details.
                  </p>
                )}
                {!newsLoading && !newsError && cryptoNews.length === 0 && (
                  <p className="text-center py-16 text-[#5A6478] text-sm">No news available right now.</p>
                )}
                {cryptoNews.map((article, i) => (
                  <a key={i} href={article.url} target="_blank" rel="noreferrer"
                     className="bg-[#13151C] border border-[#252836] rounded-xl p-4 hover:border-[#2E3246] transition-colors flex gap-3">
                    {article.imageurl && (
                      <img src={article.imageurl} alt="" className="w-24 h-24 object-cover rounded-lg shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-sm text-[#E2E8F0] mb-1 line-clamp-2">
                        {article.title}
                      </p>
                      <p className="text-[#5A6478] text-xs line-clamp-2 mb-1">{article.body}</p>
                      <span className="text-[#5A6478] text-[10px]">
                        {article.source} · {formatTimeAgo(article.publishedOn * 1000)}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {activeNav === 'Notifications' && (
              <div className="flex flex-col gap-3">
                <h2 className="font-display font-semibold text-sm text-[#7E8BA0] flex items-center gap-2">
                  <TrendingUp size={14} /> Last 24 hours
                </h2>
                {last24hPosts.length === 0 && last24hNews.length === 0 && (
                  <p className="text-center py-16 text-[#5A6478] text-sm">Nothing in the last 24 hours.</p>
                )}
                {last24hPosts.map(post => (
                  <PostCard
                    key={post._id}
                    post={post}
                    readOnly={true}
                    currentUserId={user?._id}
                  />
                ))}
                {last24hNews.map((article, i) => (
                  <a key={i} href={article.url} target="_blank" rel="noreferrer"
                     className="bg-[#13151C] border border-[#252836] rounded-xl px-4 py-3
                                hover:border-[#2E3246] transition-colors flex items-center justify-between">
                    <p className="font-display font-medium text-sm text-[#E2E8F0] line-clamp-1">
                      {article.title}
                    </p>
                    <span className="text-[#5A6478] text-[10px] shrink-0 ml-3">
                      {article.source} · {formatTimeAgo(article.publishedOn * 1000)}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="w-[300px] shrink-0 hidden xl:block sticky top-[105px] self-start">
            <NewsSidebar onSearch={handleSearchResultClick} refreshKey={trendingRefreshKey} />
          </div>
        </div>
      </div>
    </div>
  )
}