import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
}

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-ink-200 bg-white shadow-sm',
        className,
      )}
    >
      {children}
    </div>
  )
}

interface CardLinkProps extends CardProps {
  to: string
}

export function CardLink({ className, children, to }: CardLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        'rounded-xl border border-ink-200 bg-white shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
    >
      {children}
    </Link>
  )
}