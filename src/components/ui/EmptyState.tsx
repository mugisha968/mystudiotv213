import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

export function EmptyState({
  message,
  className,
}: {
  message?: string
  className?: string
}) {
  const { t } = useTranslation()
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-300 px-6 py-14 text-center',
        className,
      )}
    >
      <p className="text-sm text-ink-500">{message || t('common.empty')}</p>
    </div>
  )
}