import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

export function BrandMark({ className, variant = 'full' }: { className?: string; variant?: 'full' | 'compact' | 'wordmark' }) {
  if (variant === 'compact') {
    return (
      <span className={cn('inline-flex items-center gap-2', className)}>
        <span className="flex h-8 w-8 items-center justify-center rounded bg-brand-800">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
            <path d="M4 19V5l8 9 8-9v14" stroke="#f2e3b0" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="19" cy="17" r="1.8" fill="#f2b043" />
          </svg>
        </span>
        <span className="font-serif text-lg font-black tracking-tight text-ink-950">
          MyStudio<span className="text-brand-800">TV</span>
          <span className="text-amber-500">231</span>
        </span>
      </span>
    )
  }

  if (variant === 'wordmark') {
    return (
      <span className={cn('inline-flex flex-col', className)}>
        <span className="font-serif text-2xl font-black leading-none tracking-tight text-ink-950 sm:text-3xl">
          MyStudio<span className="text-brand-800">TV</span>
          <span className="text-amber-500">231</span>
        </span>
      </span>
    )
  }

  return (
    <span className={cn('inline-flex flex-col items-center gap-1', className)}>
      <span className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded bg-brand-800">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
            <path d="M4 19V5l8 9 8-9v14" stroke="#f2e3b0" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="19" cy="17" r="1.8" fill="#f2b043" />
          </svg>
        </span>
        <span className="font-serif text-2xl font-black tracking-tight text-ink-950 sm:text-3xl">
          MyStudio<span className="text-brand-800">TV</span>
          <span className="text-amber-500">231</span>
        </span>
      </span>
      <span className="font-brand text-[10px] font-bold uppercase tracking-[0.35em] text-brand-800">
        News&nbsp;·&nbsp;Media&nbsp;·&nbsp;Broadcasting
      </span>
    </span>
  )
}

export function BrandLink({ className, variant = 'full' }: { className?: string; variant?: 'full' | 'compact' | 'wordmark' }) {
  return (
    <Link to="/" aria-label="MyStudioTV231" className="inline-flex">
      <BrandMark className={className} variant={variant} />
    </Link>
  )
}
