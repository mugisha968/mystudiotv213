import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Card } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Spinner } from '@/components/ui/Spinner'
import type { ArticleStatus } from '@/types'
import { cn } from '@/lib/utils'

export function LoadingBlock() {
  return (
    <div className="flex justify-center py-16">
      <Spinner className="h-8 w-8 text-brand-700" />
    </div>
  )
}

export function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="space-y-5">
      <PageHeader title={title} subtitle={subtitle} action={action} />
      {children}
    </div>
  )
}

export function PanelError({
  error,
  onRetry,
}: {
  error?: string | null
  onRetry?: () => void
}) {
  return <ErrorState message={error ?? undefined} onRetry={onRetry} />
}

export function StatusTabs({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (value: string) => void
  options?: Array<{ value: string; label: string }>
}) {
  const { t } = useTranslation()
  const defaultOptions: Array<{ value: string; label: string }> = [
    { value: 'all', label: t('common.viewAll') },
    { value: 'draft', label: t('status.draft') },
    { value: 'published', label: t('status.published') },
    { value: 'archived', label: t('status.archived') },
  ]

  return (
    <div className="inline-flex max-w-full flex-wrap rounded-lg border border-ink-200 bg-white p-0.5">
      {(options ?? defaultOptions).map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            value === option.value
              ? 'bg-brand-800 text-white'
              : 'text-ink-600 hover:bg-ink-100',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function SuccessBanner({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
      {message}
    </div>
  )
}

export function InlineError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
    >
      {message}
    </div>
  )
}

export function StatCard({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <Card className="p-5">
      <p className="text-sm text-ink-500">{label}</p>
      <p className="mt-1 font-serif text-3xl font-bold text-ink-950">{value}</p>
    </Card>
  )
}

export type { ArticleStatus }