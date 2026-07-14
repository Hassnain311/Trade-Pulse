import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, ArrowRight, BarChart2, Bot, Zap } from 'lucide-react'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { authAPI } from '../api/auth.api'
import { validateLoginForm } from '../utils/validators'
import { ROUTES, STORAGE_KEYS, OTP_PURPOSE } from '../utils/constants'
import { useAuth } from '../context/AuthContext'

const HIGHLIGHTS = [
  { icon: BarChart2, text: 'Live market data'       },
  { icon: Bot,       text: 'AI prediction agents'   },
  { icon: Zap,       text: '$100K paper balance'    },
]

export default function Login() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const { saveAuth } = useAuth()
  const from = location.state?.from?.pathname || ROUTES.DASHBOARD

  const [form, setForm]     = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiErr, setApiErr]  = useState('')

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setErrors(p => ({ ...p, [e.target.name]: '' }))
    setApiErr('')
  }

  // const handleSubmit = async (e) => {
  //   e.preventDefault()
  //   const { isValid, errors: ve } = validateLoginForm(form)
  //   if (!isValid) { setErrors(ve); return }

  //   setLoading(true)
  //   try {
  //     // ── API CALL: POST /api/auth/login ────────────────────────
  //     // Sends { email, password } to the backend.
  //     // Backend verifies credentials using bcrypt.compare().
  //     // Two possible responses:
  //     //   A) { requiresOtp: true }
  //     //      → Backend sent an OTP to the email for 2-step verification.
  //     //      → We redirect to the OTP page to complete login.
  //     //   B) { accessToken, refreshToken, user }
  //     //      → Login succeeded without OTP (e.g. dev/testing mode).
  //     //      → We save both tokens and go straight to the dashboard.
  //     // No auth token needed here — this is a public route.
  //     const res = await authAPI.login({ email: form.email, password: form.password })

  //     if (res.data.requiresOtp) {
  //       // ── CASE A: OTP required ───────────────────────────────
  //       // Save email + purpose so OtpVerify page knows:
  //       //   - which email the code was sent to (for display)
  //       //   - which verify endpoint to call (verify-login-otp)
  //       localStorage.setItem(STORAGE_KEYS.OTP_EMAIL,   form.email)
  //       localStorage.setItem(STORAGE_KEYS.OTP_PURPOSE, OTP_PURPOSE.LOGIN)
  //       navigate(ROUTES.OTP)
  //     } else {
  //       // ── CASE B: Direct login (no OTP) ─────────────────────
  //       // saveAuth() stores both tokens in localStorage AND updates
  //       // AuthContext state so ProtectedRoute immediately sees the user
  //       // as authenticated without requiring a page reload.
  //       // const { accessToken, refreshToken, user } = res.data
  //       // saveAuth(accessToken, refreshToken, user)
  //       saveAuth(res.data.user);
  //       navigate(from, { replace: true })
  //     }
  //   } catch (err) {
  //     setApiErr(err.response?.data?.message || 'Invalid email or password.')
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  //new function with change:
  const handleSubmit = async (e) => {
  e.preventDefault()
  const { isValid, errors: ve } = validateLoginForm(form)
  if (!isValid) { setErrors(ve); return }

  setLoading(true)
  try {
    const res = await authAPI.login({ email: form.email, password: form.password })

    if (res.data.requiresOtp) {
      localStorage.setItem(STORAGE_KEYS.OTP_EMAIL,   form.email)
      localStorage.setItem(STORAGE_KEYS.OTP_PURPOSE, OTP_PURPOSE.LOGIN)
      navigate(ROUTES.OTP)
    } else {
      saveAuth(res.data.user)
      navigate(from, { replace: true })
    }
  } catch (err) {
    // Backend responds 403 (not 2xx) when the account exists but
    // isn't verified yet — axios routes that to catch, not the
    // `if (res.data.requiresOtp)` branch above. Handle it here.
    if (err.response?.status === 403 && err.response?.data?.requiresOtp) {
      localStorage.setItem(STORAGE_KEYS.OTP_EMAIL,   err.response.data.email || form.email)
      localStorage.setItem(STORAGE_KEYS.OTP_PURPOSE, err.response.data.otpPurpose || OTP_PURPOSE.REGISTER)
      navigate(ROUTES.OTP)
      return
    }
    setApiErr(err.response?.data?.message || 'Invalid email or password.')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-[#0B0C10] flex">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex w-[45%] flex-col justify-between p-12 bg-[#0F1116]
                      border-r border-[#252836] bg-grid relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_50%,rgba(0,212,255,0.07),transparent)]" />

        <Link to={ROUTES.HOME} className="flex items-center gap-2.5 relative">
          <div className="w-9 h-9 rounded-xl bg-[#00D4FF] flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M3 12h3l3-6 4 12 3-9 2 3h3" stroke="#0B0C10" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-display font-bold text-xl text-[#E2E8F0]">
            Trade<span className="text-[#00D4FF]">Pulse</span>
          </span>
        </Link>

        <div className="relative">
          <h2 className="font-display font-bold text-3xl text-[#E2E8F0] leading-tight mb-3">
            Welcome back, trader.
          </h2>
          <p className="text-[#7E8BA0] text-sm mb-8 leading-relaxed">
            Pick up right where you left off. Your portfolio, trades, and predictions are waiting.
          </p>
          <div className="space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 bg-[#13151C] border border-[#252836]
                                        rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-[rgba(0,212,255,0.08)] flex items-center justify-center">
                  <Icon size={15} className="text-[#00D4FF]" />
                </div>
                <span className="text-[#E2E8F0] text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[#5A6478] text-xs relative">
          © 2025 TradePulse — Paper trading only
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-[#00D4FF] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                <path d="M3 12h3l3-6 4 12 3-9 2 3h3" stroke="#0B0C10" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-display font-bold text-[#E2E8F0]">
              Trade<span className="text-[#00D4FF]">Pulse</span>
            </span>
          </Link>

          <h1 className="font-display font-bold text-2xl text-[#E2E8F0] mb-1">Log in to TradePulse</h1>
          <p className="text-[#7E8BA0] text-sm mb-8">
            Don't have an account?{' '}
            <Link to={ROUTES.REGISTER} className="text-[#00D4FF] hover:underline">Create one free</Link>
          </p>

          {apiErr && (
            <div className="bg-[rgba(255,59,92,0.08)] border border-[#FF3B5C] rounded-lg px-4 py-3 mb-6">
              <p className="text-[#FF3B5C] text-sm">{apiErr}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              autoComplete="email"
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Your password"
              icon={Lock}
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-[#00D4FF] w-3.5 h-3.5" />
                <span className="text-[#7E8BA0] text-xs">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-[#00D4FF] text-xs hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg">
              Log In
              <ArrowRight size={16} />
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-[#252836]" />
            <span className="text-[#5A6478] text-xs">OTP verification will be required</span>
            <div className="flex-1 h-px bg-[#252836]" />
          </div>
        </div>
      </div>
    </div>
  )
}
