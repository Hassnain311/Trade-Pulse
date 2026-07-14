import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react'
import OtpInput from '../components/auth/OtpInput'
import Button from '../components/common/Button'
import { authAPI } from '../api/auth.api'
import { validateOtp } from '../utils/validators'
import { ROUTES, STORAGE_KEYS, OTP_PURPOSE, OTP_RESEND_SECONDS } from '../utils/constants'
import { useAuth } from '../context/AuthContext'

export default function OtpVerify() {
  const navigate  = useNavigate()
  const { saveAuth } = useAuth()

  const email   = localStorage.getItem(STORAGE_KEYS.OTP_EMAIL)   || ''
  const purpose = localStorage.getItem(STORAGE_KEYS.OTP_PURPOSE) || OTP_PURPOSE.REGISTER

  const [otp,       setOtp]       = useState('')
  const [loading,   setLoading]   = useState(false)
  const [resending, setResending] = useState(false)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState('')
  const [countdown, setCountdown] = useState(OTP_RESEND_SECONDS)
  const [canResend, setCanResend] = useState(false)

  // Redirect if no email saved (user came here directly)
  useEffect(() => {
    if (!email) navigate(ROUTES.REGISTER)
  }, [email, navigate])

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return }
    const id = setInterval(() => setCountdown(p => p - 1), 1000)
    return () => clearInterval(id)
  }, [countdown])

  const handleVerify = useCallback(async () => {
    if (!validateOtp(otp)) { setError('Enter the 6-digit code'); return }
    setLoading(true)
    setError('')
    try {
      // ── API CALL: varies by purpose ────────────────────────────
      //
      // REGISTER purpose → POST /api/auth/verify-register-otp
      //   Sends { email, otp } to the backend.
      //   Backend checks the OTP from its database/cache, marks the
      //   user's email as verified, then returns { success: true }.
      //   No tokens issued yet — user still needs to log in.
      //
      // LOGIN purpose → POST /api/auth/verify-login-otp
      //   Sends { email, otp } to the backend.
      //   Backend checks the OTP, then issues BOTH tokens:
      //   { accessToken, refreshToken, user }
      //   accessToken  → short-lived JWT (e.g. 15 min) used on every request.
      //   refreshToken → long-lived token (e.g. 7 days) used ONLY to get
      //                  a new accessToken when the old one expires.
      //
      // Both are public routes — no Bearer token needed.
      const apiCall = purpose === OTP_PURPOSE.REGISTER
        ? authAPI.verifyRegisterOtp({ email, otp })
        : authAPI.verifyLoginOtp({ email, otp })

      const res = await apiCall

      if (purpose === OTP_PURPOSE.REGISTER) {
        // ── REGISTRATION FLOW ──────────────────────────────────
        // Email verified — no tokens yet.
        // Clean up OTP storage keys and send to login page.
        setSuccess('Email verified! Redirecting to login...')
        localStorage.removeItem(STORAGE_KEYS.OTP_EMAIL)
        localStorage.removeItem(STORAGE_KEYS.OTP_PURPOSE)
        setTimeout(() => navigate(ROUTES.LOGIN), 1500)
      } else {
        // ── LOGIN FLOW ─────────────────────────────────────────
        // OTP verified — backend returns both tokens.
        // saveAuth() stores them in localStorage AND updates
        // AuthContext so the app immediately treats the user
        // as authenticated (ProtectedRoute will let them through).
        const { accessToken, refreshToken, user } = res.data
        saveAuth(accessToken, refreshToken, user)
        localStorage.removeItem(STORAGE_KEYS.OTP_EMAIL)
        localStorage.removeItem(STORAGE_KEYS.OTP_PURPOSE)
        navigate(ROUTES.DASHBOARD)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.')
      setOtp('')
    } finally {
      setLoading(false)
    }
  }, [otp, email, purpose, saveAuth, navigate])

  const handleResend = async () => {
    if (!canResend) return
    setResending(true)
    setError('')
    try {
      // ── API CALL: POST /api/auth/resend-otp ───────────────────
      // Sends { email, purpose } to the backend.
      // Backend generates a NEW 6-digit OTP, saves it (overwriting
      // the old one), and emails it to the user again.
      // The old OTP is immediately invalidated on the backend.
      // No auth token needed — public route.
      await authAPI.resendOtp({ email, purpose })
      setSuccess('New OTP sent to your email!')
      setCountdown(OTP_RESEND_SECONDS)
      setCanResend(false)
      setOtp('')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.')
    } finally {
      setResending(false)
    }
  }

  const isRegister = purpose === OTP_PURPOSE.REGISTER

  return (
    <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center p-6 bg-grid">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_40%,rgba(0,212,255,0.06),transparent)]" />

      <div className="relative w-full max-w-md">

        {/* Back link */}
        <Link
          to={isRegister ? ROUTES.REGISTER : ROUTES.LOGIN}
          className="inline-flex items-center gap-2 text-[#7E8BA0] hover:text-[#E2E8F0]
                     text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to {isRegister ? 'Register' : 'Login'}
        </Link>

        <div className="tp-card p-8 md:p-10">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)]
                          flex items-center justify-center mx-auto mb-6">
            <Mail size={24} className="text-[#00D4FF]" />
          </div>

          <h1 className="font-display font-bold text-2xl text-[#E2E8F0] text-center mb-2">
            Verify your email
          </h1>
          <p className="text-[#7E8BA0] text-sm text-center mb-8">
            We sent a 6-digit code to{' '}
            <span className="text-[#00D4FF] font-medium">{email}</span>
          </p>

          {/* OTP boxes */}
          <div className="flex justify-center mb-6">
            <OtpInput
              length={6}
              value={otp}
              onChange={setOtp}
              error={!!error}
              disabled={loading}
            />
          </div>

          {/* Error / Success messages */}
          {error && (
            <div className="bg-[rgba(255,59,92,0.08)] border border-[#FF3B5C] rounded-lg px-4 py-3 mb-4">
              <p className="text-[#FF3B5C] text-sm text-center">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-[rgba(0,230,118,0.08)] border border-[#00E676] rounded-lg px-4 py-3 mb-4">
              <p className="text-[#00E676] text-sm text-center">{success}</p>
            </div>
          )}

          {/* Verify button */}
          <Button
            fullWidth size="lg" loading={loading}
            disabled={otp.length < 6}
            onClick={handleVerify}
          >
            {isRegister ? 'Verify & Continue' : 'Verify & Log In'}
          </Button>

          {/* Resend */}
          <div className="mt-6 text-center">
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center gap-2 text-[#00D4FF] text-sm hover:underline disabled:opacity-50"
              >
                <RefreshCw size={13} className={resending ? 'animate-spin' : ''} />
                Resend code
              </button>
            ) : (
              <p className="text-[#5A6478] text-sm">
                Resend code in{' '}
                <span className="text-[#E2E8F0] font-mono font-medium">
                  {String(Math.floor(countdown / 60)).padStart(2, '0')}:{String(countdown % 60).padStart(2, '0')}
                </span>
              </p>
            )}
          </div>

          <p className="text-[#5A6478] text-xs text-center mt-4">
            Check your spam folder if you don't see the email within a minute.
          </p>
        </div>
      </div>
    </div>
  )
}
