import { cn } from '@/lib/utils'

export function CoverImage({
  src,
  alt,
  className,
  fit = 'cover',
}: {
  src?: string | null
  alt: string
  className?: string
  fit?: 'cover' | 'contain'
}) {
  if (!src) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-brand-800 via-brand-700 to-amber-600',
          className,
        )}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-1/3 w-1/3 text-white/70"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="4" cy="16" r="2" />
          <circle cx="20" cy="12" r="2" />
          <circle cx="4" cy="4" r="2" />
          <path d="M19 18.5l-10-10" />
          <path d="M15 20l-6-6" />
          <path d="M6 7l4-2" />
        </svg>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn(
        fit === 'contain' ? 'object-contain' : 'object-cover',
        className,
      )}
    />
  )
}
