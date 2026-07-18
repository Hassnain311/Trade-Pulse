import axios from 'axios'
import { API_BASE_URL, STORAGE_KEYS, ROUTES } from '../utils/constants'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials:true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})




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
