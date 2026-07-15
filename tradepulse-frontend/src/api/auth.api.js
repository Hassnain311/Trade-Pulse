import axiosInstance from './axiosInstance'

const AUTH = '/api/auth'

export const authAPI = {
  // Registration
  register:           (data) => axiosInstance.post(`${AUTH}/register`, data),
  verifyRegisterOtp:  (data) => axiosInstance.post(`${AUTH}/verify-register-otp`, data),

  // Login (2-step: credentials → OTP)
  login:              (data) => axiosInstance.post(`${AUTH}/login`, data),
  verifyLoginOtp:     (data) => axiosInstance.post(`${AUTH}/verify-login-otp`, data),

  // OTP utilities
  resendOtp:          (data) => axiosInstance.post(`${AUTH}/resend-otp`, data),

  // Session management
  logout:             ()     => axiosInstance.post(`${AUTH}/logout`),
  logoutAll:          ()     => axiosInstance.post(`${AUTH}/logout-all`),  // invalidates ALL sessions
  refreshToken:       (data) => axiosInstance.post(`${AUTH}/refresh`, data),

  // Profile
  // getProfile:         ()     => axiosInstance.get(`${AUTH}/profile`),
  // getProfile:         (config) => axiosInstance.get(`${AUTH}/profile`, config),
  getProfile: (config = {}) => axiosInstance.get(`${AUTH}/profile`, config),
  // updateProfile:      (data) => axiosInstance.put(`${AUTH}/profile`, data),
  updateProfile: (data) => axiosInstance.put(`${AUTH}/profile`, data, {
  headers: { 'Content-Type': 'multipart/form-data' }
}),
  // changePassword:     (data) => axiosInstance.put(`${AUTH}/change-password`, data),

  // Password reset
  forgotPassword:     (data) => axiosInstance.post(`${AUTH}/forgot-password`, data),
  resetPassword:      (data) => axiosInstance.post(`${AUTH}/reset-password`, data),
}
