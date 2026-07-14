import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { STORAGE_KEYS } from '../utils/constants'
import { authAPI } from '../api/auth.api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [token,   setToken]   = useState(() => localStorage.getItem(STORAGE_KEYS.TOKEN))
  const [loading, setLoading] = useState(true)

  // On mount: verify saved token and load user
  // useEffect(() => {
  //   const init = async () => {
  //     const saved = localStorage.getItem(STORAGE_KEYS.TOKEN)
  //     if (saved) {
  //       try {
  //         // ── API CALL: GET /api/auth/profile ───────────────────
  //         // Uses the saved access token from localStorage.
  //         // axiosInstance attaches it as: Authorization: Bearer <token>
  //         // Backend decodes the JWT, finds the user, and returns their data.
  //         //
  //         // If the access token is EXPIRED the backend returns 401.
  //         // axiosInstance's response interceptor catches the 401 and
  //         // automatically calls POST /api/auth/refresh with the
  //         // refresh token. If the refresh succeeds, it retries this
  //         // profile call with the new access token — completely transparent.
  //         //
  //         // If the refresh token is also expired (or missing), the
  //         // interceptor clears localStorage and redirects to /login.
  //         const res = await authAPI.getProfile()
  //         setUser(res.data.user)
  //         setToken(saved)
  //       } catch {
  //         // Token is invalid and refresh also failed → clear everything
  //         clearAuth()
  //       }
  //     }
  //     setLoading(false)
  //   }
  //   init()
  // }, [])

  //New 
   // On mount: ask the backend who we are, if anyone.
  // No need to check localStorage first — the httpOnly accessToken
  // cookie (if valid) is sent automatically by the browser because
  // axiosInstance uses withCredentials: true.

  useEffect(() => {
    const init = async () => {
      try {
        // const res = await authAPI.getProfile()
        const res = await authAPI.getProfile({ skipAuthRedirect: true })
        setUser(res.data.user)
      } catch {
        setUser(null)
      }
      setLoading(false)
    }
    init()
  }, [])

  // Save tokens + user to localStorage and state
  // const saveAuth = useCallback((accessToken, refreshToken, userData) => {
  //   localStorage.setItem(STORAGE_KEYS.TOKEN,         accessToken)
  //   localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
  //   localStorage.setItem(STORAGE_KEYS.USER,          JSON.stringify(userData))
  //   setToken(accessToken)
  //   setUser(userData)
  // }, [])

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
