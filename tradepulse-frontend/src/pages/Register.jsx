import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { authAPI } from '../api/auth.api'
import { validateRegisterForm } from '../utils/validators'
import { ROUTES, STORAGE_KEYS, OTP_PURPOSE } from '../utils/constants'

const PERKS = [
  'Real-time crypto market data',
  '$100,000 paper trading balance',
  'AI-powered price predictions',
  'Live social trading feed',
]

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
  })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [apiErr,  setApiErr]  = useState('')

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setErrors(p => ({ ...p, [e.target.name]: '' }))
    setApiErr('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { isValid, errors: ve } = validateRegisterForm(form)
    if (!isValid) { setErrors(ve); return }

    setLoading(true)
    try {
      // ── API CALL: POST /api/auth/register ──────────────────────
      // Sends { fullName, email, password } to the backend.
      // Backend hashes the password with bcrypt, saves the user to
      // MongoDB, and sends a 6-digit OTP to the provided email.
      // No auth token is needed here — this is a public route.
      await authAPI.register({
        fullName: form.fullName,
        email:    form.email,
        password: form.password,
      })

      // Save email so the OTP page knows where the code was sent.
      // Also save purpose ('register') so OTP page calls the correct
      // verify endpoint (verify-register-otp vs verify-login-otp).
      localStorage.setItem(STORAGE_KEYS.OTP_EMAIL,   form.email)
      localStorage.setItem(STORAGE_KEYS.OTP_PURPOSE, OTP_PURPOSE.REGISTER)
      navigate(ROUTES.OTP)
    } catch (err) {
      setApiErr(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0C10] flex">

      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex w-[45%] flex-col justify-between p-12 bg-[#0F1116] border-r border-[#252836]
                      bg-grid relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_50%,rgba(0,212,255,0.07),transparent)]" />

        {/* Logo */}
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

        {/* Center content */}
        <div className="relative">
          <h2 className="font-display font-bold text-3xl text-[#E2E8F0] leading-tight mb-3">
            Your crypto trading journey starts here.
          </h2>
          <p className="text-[#7E8BA0] text-sm mb-8 leading-relaxed">
            Practice with real market data, no real money required. Learn, predict, and grow.
          </p>
          <div className="space-y-3">
            {PERKS.map(p => (
              <div key={p} className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-[#00E676] shrink-0" />
                <span className="text-[#7E8BA0] text-sm">{p}</span>
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

          <h1 className="font-display font-bold text-2xl text-[#E2E8F0] mb-1">Create your account</h1>
          <p className="text-[#7E8BA0] text-sm mb-8">
            Already have one?{' '}
            <Link to={ROUTES.LOGIN} className="text-[#00D4FF] hover:underline">Log in</Link>
          </p>

          {apiErr && (
            <div className="bg-[rgba(255,59,92,0.08)] border border-[#FF3B5C] rounded-lg px-4 py-3 mb-6">
              <p className="text-[#FF3B5C] text-sm">{apiErr}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="fullName"
              type="text"
              placeholder="Hassnain Arain"
              icon={User}
              value={form.fullName}
              onChange={handleChange}
              error={errors.fullName}
              autoComplete="name"
            />
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
              placeholder="Min. 8 chars, uppercase, number, symbol"
              icon={Lock}
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              autoComplete="new-password"
            />
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              icon={Lock}
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />

            <p className="text-[#5A6478] text-xs leading-relaxed">
              By registering, you agree that this is a paper trading platform for educational use only.
            </p>

            <Button type="submit" fullWidth loading={loading} size="lg" className="mt-2">
              Create Account
              <ArrowRight size={16} />
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-[#252836]" />
            <span className="text-[#5A6478] text-xs">We'll send a 6-digit OTP to verify your email</span>
            <div className="flex-1 h-px bg-[#252836]" />
          </div>
        </div>
      </div>
    </div>
  )
}
