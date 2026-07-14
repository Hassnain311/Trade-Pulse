import Loader from './Loader'

export default function Button({
  children, variant = 'primary', size = 'md',
  loading = false, disabled = false,
  fullWidth = false, onClick, type = 'button', className = '',
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-display font-semibold rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const variants = {
    primary:   'bg-[#00D4FF] hover:bg-[#0096BE] text-[#0B0C10]',
    secondary: 'border border-[#252836] hover:border-[#00D4FF] text-[#E2E8F0] hover:bg-[rgba(0,212,255,0.08)]',
    ghost:     'text-[#7E8BA0] hover:text-[#E2E8F0] hover:bg-[#1A1D27]',
    danger:    'border border-[#FF3B5C] text-[#FF3B5C] hover:bg-[rgba(255,59,92,0.12)]',
    success:   'bg-[#00E676] hover:opacity-90 text-[#0B0C10]',
  }
  const sizes = {
    xs: 'text-xs px-3 py-1.5',
    sm: 'text-sm px-4 py-2',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-7 py-3',
    xl: 'text-lg px-8 py-4',
  }

  return (
    <button
      type={type} onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading ? <Loader size="sm" /> : children}
    </button>
  )
}
