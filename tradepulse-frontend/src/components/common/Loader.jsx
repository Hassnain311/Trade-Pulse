export default function Loader({ fullScreen = false, size = 'md', text = '' }) {
  const sizes = { sm: 'w-4 h-4 border', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-2' }

  const Spinner = () => (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizes[size]} rounded-full border-[#252836] border-t-[#00D4FF] animate-spin`} />
      {text && <p className="text-[#7E8BA0] text-sm font-body">{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#0B0C10] flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-5">
          <div className="w-12 h-12 rounded-full border-2 border-[#252836] border-t-[#00D4FF] animate-spin" />
          <span className="font-display font-bold text-xl text-[#E2E8F0]">
            Trade<span className="text-[#00D4FF]">Pulse</span>
          </span>
        </div>
      </div>
    )
  }
  return <Spinner />
}
