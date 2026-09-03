import { useTranslation } from 'react-i18next'

import { VerifiedBadge } from './VerifiedBadge'
import { cn } from '@/lib/utils'

interface VerificationStatusProps {
  verified: boolean
  blueBadge: boolean
  compact?: boolean
  className?: string
}

export function VerificationStatus({
  verified,
  blueBadge,
  compact,
  className,
}: VerificationStatusProps) {
  const { t } = useTranslation()

  if (!verified) return null

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium text-brand-800',
        compact ? 'text-xs' : 'text-sm',
        className,
      )}
    >
      {blueBadge && <VerifiedBadge size={compact ? 14 : 18} />}
      {t('journalists.verifiedJournalist')}
    </span>
  )
}