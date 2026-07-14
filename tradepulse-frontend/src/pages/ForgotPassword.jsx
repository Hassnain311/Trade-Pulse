import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { authAPI } from '../api/auth.api'
import { validateForgotPasswordForm } from '../utils/validators'
import { ROUTES, STORAGE_KEYS } from '../utils/constants'

export default function ForgotPassword() {
  const navigate = useNavigate()

  const [email, setEmail]     = useState('')
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [apiErr, setApiErr]   = useState('')
  const [sent, setSent]       = useState(false)

  const handleChange = (e) => {
    setEmail(e.target.value)
    setErrors({})
    setApiErr('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { isValid, errors: ve } = validateForgotPasswordForm({ email })
    if (!isValid) { setErrors(ve); return }

    setLoading(true)
    try {
      // Backend always responds with the same generic message whether or
      // not the email is registered, so we treat any success the same way.
      await authAPI.forgotPassword({ email })
      localStorage.setItem(STORAGE_KEYS.RESET_EMAIL, email)
      setSent(true)
    } catch (err) {
      setApiErr(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        <Link to={ROUTES.HOME} className="flex items-center gap-2 mb-8 justify-center">
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

        {!sent ? (
          <>
            <h1 className="font-display font-bold text-2xl text-[#E2E8F0] mb-1">Forgot your password?</h1>
            <p className="text-[#7E8BA0] text-sm mb-8">
              Enter the email on your account and we'll send you a reset code.
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
                value={email}
                onChange={handleChange}
                error={errors.email}
                autoComplete="email"
              />

              <Button type="submit" fullWidth loading={loading} size="lg">
                Send Reset Code
                <ArrowRight size={16} />
              </Button>
            </form>
          </>
        ) : (
          <>
            <h1 className="font-display font-bold text-2xl text-[#E2E8F0] mb-1">Check your email</h1>
            <p className="text-[#7E8BA0] text-sm mb-8">
              If an account exists for <span className="text-[#E2E8F0]">{email}</span>, a reset code is on its way.
            </p>
            <Button fullWidth size="lg" onClick={() => navigate(ROUTES.RESET_PASSWORD)}>
              Enter Reset Code
              <ArrowRight size={16} />
            </Button>
          </>
        )}

        <Link to={ROUTES.LOGIN} className="mt-6 flex items-center justify-center gap-1.5 text-[#7E8BA0] text-sm hover:text-[#E2E8F0] transition-colors">
          <ArrowLeft size={14} />
          Back to log in
        </Link>
      </div>
    </div>
  )
}