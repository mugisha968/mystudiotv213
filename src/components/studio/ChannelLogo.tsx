import { cn } from '@/lib/utils'

export function ChannelLogo({
  className,
  showName = true,
}: {
  className?: string
  showName?: boolean
}) {
  return (
    <div className={cn('inline-flex flex-col items-center gap-2', className)}>
      <div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: '9.5rem',
          height: '9.5rem',
          background:
            'radial-gradient(circle at 30% 28%, #1f5c72 0%, #0d3b4a 55%, #08232e 100%)',
          boxShadow:
            'inset 0 0 0 3px rgba(247,232,189,0.55), 0 12px 30px rgba(0,0,0,0.5), 0 0 30px rgba(201,164,92,0.35)',
        }}
      >
        {/* Globe */}
        <svg
          viewBox="0 0 120 120"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <circle cx="60" cy="60" r="52" fill="#0d3b4a" />
          <ellipse cx="60" cy="60" rx="52" ry="20" fill="none" stroke="#4fb370" strokeWidth="1.4" opacity="0.5" />
          <ellipse cx="60" cy="60" rx="20" ry="52" fill="none" stroke="#4fb370" strokeWidth="1.4" opacity="0.5" />
          <circle cx="60" cy="60" r="30" fill="none" stroke="#f2e3b0" strokeWidth="1.2" opacity="0.6" />
          <path d="M30 60h60M60 30v60" stroke="#f2e3b0" strokeWidth="1.2" opacity="0.4" />
        </svg>

        {/* Play button badge */}
        <div
          className="absolute flex items-center justify-center rounded-full"
          style={{
            width: '3.4rem',
            height: '3.4rem',
            background: 'linear-gradient(150deg,#f8ecc4 0%,#e2ac47 55%,#b87423 100%)',
            boxShadow: '0 5px 14px rgba(0,0,0,0.45), inset 0 -2px 4px rgba(0,0,0,0.3)',
          }}
        >
          <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6" fill="#7a3f0c" aria-hidden="true">
            <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86a1 1 0 0 0-1.5.86z" />
          </svg>
        </div>

        {/* Camera aperture notch */}
        <div
          className="absolute rounded-sm"
          style={{
            width: '1rem',
            height: '1rem',
            right: '1.4rem',
            top: '1.8rem',
            background: 'rgba(13,59,74,0.9)',
            boxShadow: '0 0 0 2px #f2e3b0',
          }}
        />
      </div>
      {showName && (
        <div className="text-center">
          <p className="font-brand text-sm font-black uppercase tracking-tight text-white">
            MyStudio<span className="text-gold-400">TV</span>
            <span className="text-gold-200">231</span>
          </p>
          <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-white/60">
            YouTube Channel
          </p>
        </div>
      )}
    </div>
  )
}
