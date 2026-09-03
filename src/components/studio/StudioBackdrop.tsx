import { cn } from '@/lib/utils'

function Monitor({
  heading,
  kicker,
  live = true,
  className,
}: {
  heading: string
  kicker: string
  live?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden border border-ink-950/40 shadow-lg',
        className,
      )}
      style={{
        background:
          'linear-gradient(160deg,#071a26 0%,#0d3b4a 60%,#0a2430 100%)',
        borderRadius: '8px',
        boxShadow:
          'inset 0 0 0 1px rgba(255,255,255,0.06), 0 10px 24px rgba(0,0,0,0.55)',
      }}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-2 py-1">
        <span className="text-[9px] font-bold uppercase tracking-widest text-white/60">
          {kicker}
        </span>
        {live && (
          <span className="flex items-center gap-1 rounded-sm bg-live px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-white">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            Live
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 px-2 py-1.5">
        <span className="whitespace-nowrap font-brand text-[9px] font-black uppercase tracking-tight text-white">
          MyStudio<span className="text-gold-400">TV</span>
          <span className="text-gold-200">231</span>
        </span>
        <svg viewBox="0 0 24 24" className="ml-auto h-3 w-3" fill="none" aria-hidden="true">
          <path d="M4 19V5l8 9 8-9v14" stroke="#f2dda5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="mx-2 mb-1.5 h-6 overflow-hidden rounded-sm border border-white/10 bg-[#06121c] p-1">
        <div className="h-full w-full rounded-sm bg-gradient-to-r from-[#0d3b4a] via-[#15495c] to-[#0d3b4a]" />
      </div>
      <p className="truncate px-2 pb-2 text-[8px] font-semibold uppercase tracking-wider text-gold-300/80">
        {heading}
      </p>
    </div>
  )
}

function LiveFeed({
  label,
  className,
}: {
  label: string
  className?: string
}) {
  return (
    <div className={cn('relative overflow-hidden border border-ink-950/50 shadow-lg', className)}>
      <div
        className="h-full w-full animate-pulse"
        style={{
          background:
            'linear-gradient(120deg,#0a2a38 0%,#1a5f77 40%,#113e50 70%,#0a2a38 100%)',
          backgroundSize: '200% 100%',
        }}
      />
      <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-sm bg-live px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-white">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
        Live
      </span>
      <span className="absolute bottom-1.5 left-1.5 truncate rounded-sm bg-ink-950/70 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white/90 backdrop-blur">
        {label}
      </span>
    </div>
  )
}

export function StudioBackdrop({ className }: { className?: string }) {
  return (
    <div
      className={cn('relative isolate h-full w-full overflow-hidden', className)}
      style={{ background: 'linear-gradient(180deg,#1b2430 0%,#101822 45%,#0a0e16 100%)' }}
      aria-hidden="true"
    >
      {/* Wall gradient + studio glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 0%, rgba(37,71,89,0.55) 0%, rgba(20,32,44,0.35) 45%, transparent 75%)',
        }}
      />

      {/* Wall logo panel (large, well-lit) */}
      <div className="absolute left-1/2 top-[7%] -translate-x-1/2 text-center">
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl"
          style={{
            background:
              'linear-gradient(150deg,#f7e8bd 0%,#e2ac47 45%,#b87423 100%)',
            boxShadow:
              '0 0 40px rgba(226,172,71,0.55), inset 0 -2px 6px rgba(0,0,0,0.3)',
          }}
        >
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
            <path d="M4 19V5l8 9 8-9v14" stroke="#2e1c05" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="19" cy="17" r="1.8" fill="#7a3f0c" />
          </svg>
        </div>
        <p className="mt-2 font-display text-xl tracking-wide text-white">
          MyStudio<span className="text-gold-400">TV</span>
          <span className="text-gold-200">231</span>
        </p>
        <p className="text-[8px] font-semibold uppercase tracking-[0.35em] text-white/60">
          News · Media · Broadcasting
        </p>
      </div>

      {/* Monitors on studio wall */}
      <div className="absolute left-6 right-6 top-[30%] grid grid-cols-3 gap-2.5 sm:gap-3">
        <Monitor heading="International Desk" kicker="World" className="aspect-[4/3]" />
        <Monitor heading="Business Markets" kicker="Markets" className="aspect-[4/3]" />
        <Monitor heading="Breaking · Headlines" kicker="Urgent" className="aspect-[4/3]" />
      </div>

      {/* Small live video feed behind desk */}
      <LiveFeed label="Studio Cam 2" className="absolute right-6 top-[58%] aspect-video w-32 sm:w-40" />

      {/* Lighting truss (out of focus) */}
      <div className="absolute inset-x-0 top-0 h-3 opacity-40 blur-[2px]" style={{ background: '#0a0d12' }}>
        <div className="mx-auto flex h-full max-w-2xl items-center justify-around">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-2 w-9 rounded-sm bg-ink-800/80" />
          ))}
        </div>
      </div>
      <div className="absolute left-1/2 top-2 h-1.5 w-24 -translate-x-1/2 rounded bg-studio-gold/40 blur-[1px]" />

      {/* Desk, chair, camera, lighting (out of focus) */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
        {/* Camera on tripod */}
        <div className="absolute bottom-6 left-8 rotate-[-3deg] opacity-70 blur-[2px]">
          <div className="h-10 w-16 rounded bg-ink-900/80" style={{ boxShadow: '0 6px 14px rgba(0,0,0,0.5)' }}>
            <div className="relative left-1/2 top-1 h-2 w-2 -translate-x-1/2 rounded-full bg-[#2e4657] ring-2 ring-[#141b26]" />
          </div>
          <div className="mx-auto mt-1 h-2 w-20 rounded-t bg-ink-800/70" />
          <div className="mx-auto h-2 w-16 bg-ink-900/70" />
        </div>

        {/* Chair */}
        <div className="absolute bottom-12 right-16 hidden h-20 w-12 rotate-2 opacity-60 blur-[3px] sm:block">
          <div className="h-4 w-12 rounded-t-lg bg-ink-800/70" />
          <div className="mx-auto h-14 w-2 bg-ink-900/70" />
        </div>

        {/* Desk */}
        <div className="relative h-10 rounded-t-xl bg-studio-wood/70 opacity-70 blur-[1px]" style={{ boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.08), 0 10px 22px rgba(0,0,0,0.5)' }}>
          <div className="absolute -bottom-1 left-0 right-0 h-2 rounded-b-xl bg-[#402a1b]/80" />
        </div>

        {/* Bokeh light dots */}
        <div className="pointer-events-none absolute -top-16 left-1/4 h-6 w-6 rounded-full bg-gold-300/25 blur-[3px]" />
        <div className="pointer-events-none absolute -top-10 right-1/3 h-8 w-8 rounded-full bg-teal-deep-2/40 blur-[5px]" />
        <div className="pointer-events-none absolute top-6 left-2 h-4 w-4 rounded-full bg-gold-400/30 blur-[2px]" />
        <div className="pointer-events-none absolute right-2 top-10 h-5 w-5 rounded-full bg-white/20 blur-[4px]" />
      </div>

      {/* Bottom vignette */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink-950/70 to-transparent" />
    </div>
  )
}
