import { useRef, useEffect } from 'react'

export default function OtpInput({ length = 6, value = '', onChange, error = false, disabled = false }) {
  const refs   = useRef([])
  const digits = Array.from({ length }, (_, i) => value[i] || '')

  useEffect(() => { refs.current[0]?.focus() }, [])

  const update = (arr) => onChange(arr.join(''))

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, '')
    if (!val) return
    const next = [...digits]
    next[idx] = val[val.length - 1]
    update(next)
    if (idx < length - 1) refs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const next = [...digits]
      if (next[idx]) {
        next[idx] = ''
        update(next)
      } else if (idx > 0) {
        next[idx - 1] = ''
        update(next)
        refs.current[idx - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft'  && idx > 0)           refs.current[idx - 1]?.focus()
      else if (e.key === 'ArrowRight' && idx < length - 1)  refs.current[idx + 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    const next   = Array.from({ length }, (_, i) => pasted[i] || '')
    update(next)
    refs.current[Math.min(pasted.length, length - 1)]?.focus()
  }

  return (
    <div className="flex items-center gap-2.5">
      {Array.from({ length }, (_, idx) => (
        <input
          key={idx}
          ref={el => refs.current[idx] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[idx]}
          onChange={e => handleChange(e, idx)}
          onKeyDown={e => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`
            otp-box
            w-11 h-13 text-center text-xl font-mono font-bold
            bg-[#1A1D27] rounded-xl border-2 transition-all duration-200
            text-[#E2E8F0] caret-[#00D4FF]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error
              ? 'border-[#FF3B5C]'
              : digits[idx]
                ? 'border-[#00D4FF] shadow-[0_0_12px_rgba(0,212,255,0.2)]'
                : 'border-[#252836] focus:border-[#00D4FF]'
            }
          `}
          style={{ width: '48px', height: '56px' }}
        />
      ))}
    </div>
  )
}
