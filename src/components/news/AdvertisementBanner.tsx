import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

type AdSize = '970x90' | '728x90' | '300x250' | 'mobile' | 'in-feed' | 'article'

interface AdvertisementBannerProps {
  size: AdSize
  className?: string
}

const sizeStyles: Record<AdSize, string> = {
  '970x90': 'h-[90px] w-full max-w-[970px]',
  '728x90': 'h-[90px] w-full max-w-[728px]',
  '300x250': 'h-[250px] w-full max-w-[300px]',
  'mobile': 'h-[60px] w-full sm:h-[90px]',
  'in-feed': 'h-[100px] w-full sm:h-[120px]',
  'article': 'h-[100px] w-full sm:h-[140px]',
}

export function AdvertisementBanner({ size, className }: AdvertisementBannerProps) {
  const { t } = useTranslation()

  return (
    <div className={cn('mx-auto', className)}>
      <div
        className={cn(
          'flex items-center justify-center border border-ink-200 bg-ink-50',
          sizeStyles[size],
        )}
      >
        <div className="text-center">
          <span className="text-[10px] font-medium uppercase tracking-wider text-ink-400">
            {t('ads.label')}
          </span>
          <p className="mt-1 text-xs text-ink-400">
            {size === '970x90' && '970 × 90'}
            {size === '728x90' && '728 × 90'}
            {size === '300x250' && '300 × 250'}
            {size === 'mobile' && 'Responsive'}
            {size === 'in-feed' && 'In-Feed'}
            {size === 'article' && 'Article Ad'}
          </p>
        </div>
      </div>
    </div>
  )
}
