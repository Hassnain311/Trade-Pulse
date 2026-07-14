import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { KeyRound, Lock, ArrowRight, ArrowLeft } from 'lucide-react'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { authAPI } from '../api/auth.api'
import { validateResetPasswordForm } from '../utils/validators'
import { ROUTES, STORAGE_KEYS } from '../utils/constants'

export default function ResetPassword() {
  const navigate = useNavigate()
  const email = localStorage.getItem(STORAGE_KEYS.RESET_EMAIL)

  const [form, setForm]       = useState({ otp: '', newPassword: '', confirmPassword: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [apiErr, setApiErr]   = useState('')

  // If someone lands here directly without going through Forgot Password
  // first, there's no email to reset — send them back to start that flow.
  useEffect(() => {
    if (!email) navigate(ROUTES.FORGOT_PASSWORD, { replace: true })
  }, [email, navigate])

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setErrors(p => ({ ...p, [e.target.name]: '' }))
    setApiErr('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { isValid, errors: ve } = validateResetPasswordForm(form)
    if (!isValid) { setErrors(ve); return }

    setLoading(true)
    try {
      await authAPI.resetPassword({ email, otp: form.otp, newPassword: form.newPassword })
      localStorage.removeItem(STORAGE_KEYS.RESET_EMAIL)
      navigate(ROUTES.LOGIN, { replace: true })
    } catch (err) {
      setApiErr(err.response?.data?.message || 'Invalid or expired code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!email) return null

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

        <h1 className="font-display font-bold text-2xl text-[#E2E8F0] mb-1">Reset your password</h1>
        <p className="text-[#7E8BA0] text-sm mb-8">
          Enter the code sent to <span className="text-[#E2E8F0]">{email}</span> and choose a new password.
        </p>

        {apiErr && (
          <div className="bg-[rgba(255,59,92,0.08)] border border-[#FF3B5C] rounded-lg px-4 py-3 mb-6">
            <p className="text-[#FF3B5C] text-sm">{apiErr}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Reset Code"
            name="otp"
            type="text"
            placeholder="123456"
            icon={KeyRound}
            value={form.otp}
            onChange={handleChange}
            error={errors.otp}
            maxLength={6}
            autoComplete="one-time-code"
          />
          <Input
            label="New Password"
            name="newPassword"
            type="password"
            placeholder="Choose a new password"
            icon={Lock}
            value={form.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
            autoComplete="new-password"
          />
          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter your new password"
            icon={Lock}
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <Button type="submit" fullWidth loading={loading} size="lg">
            Reset Password
            <ArrowRight size={16} />
          </Button>
        </form>

        <Link to={ROUTES.LOGIN} className="mt-6 flex items-center justify-center gap-1.5 text-[#7E8BA0] text-sm hover:text-[#E2E8F0] transition-colors">
          <ArrowLeft size={14} />
          Back to log in
        </Link>
      </div>
    </div>
  )
}