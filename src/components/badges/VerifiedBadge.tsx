import { useTranslation } from 'react-i18next'

interface VerifiedBadgeProps {
  size?: number
  className?: string
}

export function VerifiedBadge({ size = 18, className }: VerifiedBadgeProps) {
  const { t } = useTranslation()

  return (
    <span
      role="img"
      aria-label={t('journalists.blueBadgeLabel')}
      title={t('journalists.blueBadgeLabel')}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-[#1269d4] shadow-sm ${className ?? ''}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        width={Math.round(size * 0.62)}
        height={Math.round(size * 0.62)}
        fill="none"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  )
}