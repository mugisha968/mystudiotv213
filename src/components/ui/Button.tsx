import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md'
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-brand-800 text-white hover:bg-brand-700 focus-visible:outline-brand-800',
  secondary:
    'bg-brand-100 text-brand-900 hover:bg-brand-200 focus-visible:outline-brand-800',
  ghost:
    'bg-transparent text-ink-700 hover:bg-ink-100 focus-visible:outline-ink-700',
  danger: 'bg-red-700 text-white hover:bg-red-600 focus-visible:outline-red-700',
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled}
      {...props}
    />
  )
}