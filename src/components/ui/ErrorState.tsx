import { useTranslation } from 'react-i18next'

import { Button } from './Button'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  const { t } = useTranslation()
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center ${className ?? ''}`}
    >
      <p className="text-sm font-medium text-red-800">
        {message || t('common.error')}
      </p>
      {onRetry && (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>
          {t('common.retry')}
        </Button>
      )}
    </div>
  )
}