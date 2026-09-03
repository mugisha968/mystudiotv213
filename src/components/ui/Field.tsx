import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface FieldProps {
  label: string
  error?: string | null
  hint?: string
  className?: string
  children: ReactNode
}

export function Field({ label, error, hint, className, children }: FieldProps) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block text-sm font-medium text-ink-800">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-red-700">{error}</span>}
    </label>
  )
}

const baseClass =
  'w-full rounded-md border border-ink-300 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-700/20 disabled:cursor-not-allowed disabled:bg-ink-100'

export function TextInput({
  error,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string | null }) {
  return (
    <input
      {...props}
      className={cn(
        baseClass,
        error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
        className,
      )}
    />
  )
}

export function TextArea({
  error,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string | null }) {
  return (
    <textarea
      {...props}
      className={cn(baseClass, 'min-h-28', error && 'border-red-400', className)}
    />
  )
}

export function Select({
  error,
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string | null }) {
  return (
    <select
      {...props}
      className={cn(baseClass, 'pr-8', error && 'border-red-400', className)}
    >
      {children}
    </select>
  )
}