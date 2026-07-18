import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { STORAGE_KEYS } from '../utils/constants'
import { authAPI } from '../api/auth.api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [token,   setToken]   = useState(() => localStorage.getItem(STORAGE_KEYS.TOKEN))
  const [loading, setLoading] = useState(true)

  

  useEffect(() => {
    const init = async () => {
      try {
        
        const res = await authAPI.getProfile({ skipAuthRedirect: true })
        setUser(res.data.user)
      } catch {
        setUser(null)
      }
      setLoading(false)
    }
    init()
  }, [])

 

  const saveAuth = useCallback((userData) => {
  // Tokens are in httpOnly cookies — browser handles them automatically
  // Only save non-sensitive user info
  setUser(userData)
}, [])

  // Clear everything
  const clearAuth = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k))
    setToken(null)
    setUser(null)
  }, [])

  // Logout from this device only
  const logout = useCallback(async () => {
    try {
      // ── API CALL: POST /api/auth/logout ───────────────────────
      // Sends the current access token (auto-attached by axiosInstance).
      // Backend adds this specific refresh token to a blacklist/revokes it,
      // so it can't be used to generate new access tokens even if someone
      // still has it. Only THIS device's session is invalidated.
      await authAPI.logout()
    } catch { /* ignore — we clear locally regardless of network failure */ }
    clearAuth()
  }, [clearAuth])

  // Logout from ALL devices (backend invalidates all refresh tokens)
  const logoutAll = useCallback(async () => {
    try {
      // ── API CALL: POST /api/auth/logout-all ───────────────────
      // Sends the current access token (auto-attached by axiosInstance).
      // Backend increments the user's tokenVersion field in the database.
      // Any existing refresh token with an older tokenVersion is now
      // invalid — effectively logging out ALL sessions on ALL devices.
      // This is how "logout from all devices" works without maintaining
      // a huge blacklist of every token ever issued.
      await authAPI.logoutAll()
    } catch { /* ignore */ }
    clearAuth()
  }, [clearAuth])

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      // isAuthenticated: !!token && !!user,
      //new
      isAuthenticated: !!user,
      saveAuth,
      clearAuth,
      logout,
      logoutAll,
      setUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
