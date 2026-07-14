import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const Input = forwardRef(function Input(
  { label, error, hint, type = 'text', icon: Icon, rightElement, className = '', ...props },
  ref
) {
  const [showPass, setShowPass] = useState(false)
  const isPassword = type === 'password'
  const inputType  = isPassword ? (showPass ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="tp-label">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A6478] pointer-events-none">
            <Icon size={16} />
          </div>
        )}
        <input
          ref={ref}
          type={inputType}
          className={`
            tp-input
            ${Icon ? 'pl-10' : ''}
            ${(isPassword || rightElement) ? 'pr-10' : ''}
            ${error ? '!border-[#FF3B5C] focus:!ring-[rgba(255,59,92,0.2)]' : ''}
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass(p => !p)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5A6478] hover:text-[#E2E8F0] transition-colors"
          >
            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
        {rightElement && !isPassword && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      {error && <p className="text-[#FF3B5C] text-xs">{error}</p>}
      {hint && !error && <p className="text-[#5A6478] text-xs">{hint}</p>}
    </div>
  )
})

export default Input
