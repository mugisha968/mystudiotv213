import { useTranslation } from 'react-i18next'

import { STATUS_LABEL_KEYS, type ArticleStatus } from '@/types'
import { cn } from '@/lib/utils'

const palette: Record<ArticleStatus, string> = {
  draft: 'bg-gold-100 text-gold-800',
  published: 'bg-brand-100 text-brand-800',
  archived: 'bg-ink-200 text-ink-700',
}

export function StatusPill({ status }: { status: ArticleStatus }) {
  const { t } = useTranslation()
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
        palette[status],
      )}
    >
      {t(STATUS_LABEL_KEYS[status])}
    </span>
  )
}

export function AccountStatusPill({ status }: { status: string }) {
  const palette: Record<string, string> = {
    active: 'bg-brand-100 text-brand-800',
    inactive: 'bg-red-100 text-red-800',
    pending: 'bg-gold-100 text-gold-800',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize',
        palette[status] ?? 'bg-ink-200 text-ink-700',
      )}
    >
      {status}
    </span>
  )
}