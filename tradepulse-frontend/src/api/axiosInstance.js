import axios from 'axios'
import { API_BASE_URL, STORAGE_KEYS, ROUTES } from '../utils/constants'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials:true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ── REQUEST INTERCEPTOR: Attach access token to every request ──
// Every API call made through axiosInstance will automatically
// have the Authorization header set to: Bearer <access_token>
// The token is read from localStorage on EACH request so that
// if a new token was saved (after a refresh), it's picked up immediately.
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
//     if (token) config.headers.Authorization = `Bearer ${token}`
//     return config
//   },
//   (error) => Promise.reject(error)
// )

// ── RESPONSE INTERCEPTOR: Auto-refresh access token on 401 ─────
//
// Flow when access token is expired:
// 1. Any API call returns 401 Unauthorized.
// 2. This interceptor catches it (before the calling component sees it).
// 3. It marks the original request with _retry = true (prevents loops).
// 4. It reads the refresh token from localStorage.
// 5. ── API CALL: POST /api/auth/refresh ─────────────────────────
//    Sends { refreshToken } directly via raw axios (NOT axiosInstance,
//    to avoid infinite loops through this same interceptor).
//    Backend verifies the refresh token, checks its tokenVersion
//    hasn't been invalidated (logout-all), then returns a new accessToken.
// 6. The new access token is saved to localStorage.
// 7. The original failed request is retried automatically with the new token.
// 8. The calling component never knows any of this happened.
//
// If the refresh token is also expired or invalid:
// 9. localStorage is cleared (both tokens + user data removed).
// 10. User is redirected to /login.
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const original = error.config
//     if (error.response?.status === 401 && !original._retry) {
//       original._retry = true
//       const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
//       if (!refreshToken) {
//         // No refresh token at all → clear everything and force re-login
//         localStorage.clear()
//         window.location.href = ROUTES.LOGIN
//         return Promise.reject(error)
//       }
//       try {
//         // ── API CALL: POST /api/auth/refresh ───────────────────
//         // Uses raw axios (bypasses this interceptor to avoid loops).
//         // Backend validates the refresh token and issues a new access token.
//         const res = await axios.post(
//           `${API_BASE_URL}/api/auth/refresh`,
//           { refreshToken }
//         )
//         const newToken = res.data.accessToken
//         // Save new access token so all future requests use it
//         localStorage.setItem(STORAGE_KEYS.TOKEN, newToken)
//         // Retry the original request with the new token
//         original.headers.Authorization = `Bearer ${newToken}`
//         return axiosInstance(original)
//       } catch {
//         // Refresh token is also invalid (expired, revoked, or logout-all was called)
//         // → clear everything and force the user to log in again
//         localStorage.clear()
//         window.location.href = ROUTES.LOGIN
//         return Promise.reject(error)
//       }
//     }
//     return Promise.reject(error)
//   }
// )

//new

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        )
        return axiosInstance(original)
      } catch {
        // localStorage.removeItem(STORAGE_KEYS.OTP_EMAIL)
        // localStorage.removeItem(STORAGE_KEYS.OTP_PURPOSE)
        // window.location.href = ROUTES.LOGIN
        // return Promise.reject(error)

        localStorage.removeItem(STORAGE_KEYS.OTP_EMAIL)
        localStorage.removeItem(STORAGE_KEYS.OTP_PURPOSE)
        if (!original.skipAuthRedirect) {
          window.location.href = ROUTES.LOGIN
        }
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
