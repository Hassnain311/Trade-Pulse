// import { useState, useRef, useEffect } from 'react'
// import { Link, NavLink, useNavigate } from 'react-router-dom'
// import { Search, Bell, ChevronDown, LogOut, Settings, Shield, User, Menu, X, Zap } from 'lucide-react'
// import { useAuth } from '../../context/AuthContext'
// import { ROUTES } from '../../utils/constants'

import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, Bell, ChevronDown, LogOut, Settings, Shield, User, Menu, X, Zap, Camera } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../api/auth.api'
import { ROUTES } from '../../utils/constants'

const NAV_LINKS = [
  { label: 'Markets',   to: ROUTES.DASHBOARD },
  { label: 'Trade',     to: `${ROUTES.TRADE}/BTCUSDT` },
  { label: 'AI Agents', to: ROUTES.AGENTS   },
  { label: 'News',      to: ROUTES.NEWS      },
  { label: 'Portfolio', to: ROUTES.PORTFOLIO },
]

// export default function Navbar() {
//   const { user, isAuthenticated, logout, logoutAll } = useAuth()
//   const navigate = useNavigate()
//   const [profileOpen, setProfileOpen] = useState(false)
//   const [mobileOpen,  setMobileOpen]  = useState(false)
//   const profileRef = useRef(null)

export default function Navbar() {
  const { user, isAuthenticated, logout, logoutAll, setUser } = useAuth()   // ← added setUser
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [uploading,   setUploading]   = useState(false)   // ← new
  const profileRef = useRef(null)
  const fileInputRef = useRef(null)   // ← new

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handlePicClick = (e) => {
    e.stopPropagation()
    fileInputRef.current?.click()
  }

  const handlePicChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('image', file)
    setUploading(true)
    try {
      const res = await authAPI.updateProfile(formData)
      setUser(res.data.user)
    } catch (err) {
      console.error('Profile picture upload failed:', err)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleLogout = async () => {
    setProfileOpen(false)
    await logout()
    navigate(ROUTES.HOME)
  }

  const handleLogoutAll = async () => {
    setProfileOpen(false)
    await logoutAll()
    navigate(ROUTES.HOME)
  }

  const initial = user?.fullName?.[0]?.toUpperCase() || 'U'

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0C10]/80 backdrop-blur-md border-b border-[#252836]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-16 flex items-center gap-4">

        {/* ── Logo ── */}
        <Link to={ROUTES.HOME} className="flex items-center gap-2 shrink-0 mr-2">
          <div className="w-8 h-8 rounded-lg bg-[#00D4FF] flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M3 12h3l3-6 4 12 3-9 2 3h3"
                stroke="#0B0C10" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-display font-bold text-[#E2E8F0] text-lg leading-none">
            Trade<span className="text-[#00D4FF]">Pulse</span>
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <div className="hidden md:flex items-center gap-0.5 flex-1">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-display font-medium rounded-lg transition-colors whitespace-nowrap
                 ${isActive
                   ? 'text-[#00D4FF] bg-[rgba(0,212,255,0.08)]'
                   : 'text-[#7E8BA0] hover:text-[#E2E8F0] hover:bg-[#13151C]'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* ── Right Side ── */}
        <div className="flex items-center gap-2 ml-auto">

          {/* Search (desktop) */}
          <button className="hidden lg:flex items-center gap-2 bg-[#13151C] border border-[#252836]
                             rounded-lg px-3 py-2 text-[#5A6478] text-xs hover:border-[#2E3246] transition-colors">
            <Search size={13} />
            <span>Search coins...</span>
            <kbd className="bg-[#1A1D27] text-[10px] px-1.5 py-0.5 rounded border border-[#252836]">⌘K</kbd>
          </button>

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <button className="relative w-9 h-9 flex items-center justify-center rounded-lg
                                 hover:bg-[#13151C] text-[#7E8BA0] hover:text-[#E2E8F0] transition-colors">
                <Bell size={17} />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#00D4FF] rounded-full" />
              </button>

              {/* Profile dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(p => !p)}
                  className="flex items-center gap-2 bg-[#13151C] border border-[#252836]
                             rounded-lg px-3 py-2 hover:border-[#2E3246] transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.3)]
                                  flex items-center justify-center overflow-hidden">
                    {user?.profilePic
                      ? <img src={user.profilePic} alt="" className="w-full h-full object-cover" />
                      : <span className="text-[#00D4FF] text-xs font-bold">{initial}</span>}
                  </div>
                  <span className="text-[#E2E8F0] text-sm font-display hidden sm:block">
                    {user?.fullName?.split(' ')[0]}
                  </span>
                  <ChevronDown size={13} className="text-[#7E8BA0]" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#13151C] border border-[#252836]
                                  rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-[#252836] flex items-center gap-3">
                      <button
                        onClick={handlePicClick}
                        disabled={uploading}
                        className="relative w-11 h-11 rounded-full bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.3)]
                                   flex items-center justify-center overflow-hidden shrink-0 group"
                        title="Change profile picture"
                      >
                        {user?.profilePic
                          ? <img src={user.profilePic} alt="" className="w-full h-full object-cover" />
                          : <span className="text-[#00D4FF] text-base font-bold">{initial}</span>}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
                                        flex items-center justify-center transition-opacity">
                          <Camera size={14} className="text-white" />
                        </div>
                        {uploading && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          </div>
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePicChange}
                      />
                      <div className="min-w-0">
                        <p className="text-[#E2E8F0] text-sm font-medium truncate">{user?.fullName}</p>
                        <p className="text-[#5A6478] text-xs truncate">{user?.email}</p>
                      </div>
                    </div>
                    <div className="py-1">
                      {[
                        { icon: User,     label: 'Profile',           action: () => navigate(ROUTES.PORTFOLIO) },
                        { icon: Settings, label: 'Settings',           action: () => navigate('/settings') },
                        { icon: Zap,      label: 'Paper Balance',      action: () => navigate(ROUTES.PORTFOLIO) },
                      ].map(({ icon: Icon, label, action }) => (
                        <button key={label} onClick={() => { action(); setProfileOpen(false) }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                                     text-[#7E8BA0] hover:text-[#E2E8F0] hover:bg-[#1A1D27] transition-colors">
                          <Icon size={14} /> {label}
                        </button>
                      ))}
                    </div>
                    <div className="py-1 border-t border-[#252836]">
                      <button onClick={handleLogoutAll}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                                   text-[#7E8BA0] hover:text-[#FF3B5C] hover:bg-[rgba(255,59,92,0.08)] transition-colors">
                        <Shield size={14} /> Logout all devices
                      </button>
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                                   text-[#FF3B5C] hover:bg-[rgba(255,59,92,0.08)] transition-colors">
                        <LogOut size={14} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to={ROUTES.LOGIN}
                className="text-[#7E8BA0] hover:text-[#E2E8F0] text-sm font-display
                           px-4 py-2 rounded-lg hover:bg-[#13151C] transition-colors">
                Log In
              </Link>
              <Link to={ROUTES.REGISTER} className="tp-btn-primary text-sm px-5 py-2">
                Get Started
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(p => !p)}
            className="md:hidden w-9 h-9 flex items-center justify-center
                       rounded-lg hover:bg-[#13151C] text-[#7E8BA0]"
          >
            {mobileOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#252836] bg-[#0B0C10] px-4 py-2 flex flex-col gap-0.5">
          {NAV_LINKS.map(link => (
            <NavLink key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2.5 text-sm font-display rounded-lg transition-colors
                 ${isActive ? 'text-[#00D4FF] bg-[rgba(0,212,255,0.08)]' : 'text-[#7E8BA0] hover:text-[#E2E8F0]'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  )
}
