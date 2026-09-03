import { useTranslation } from 'react-i18next'

import type { AdSlot as AdSlotType } from '@/types'
import { useAsync } from '@/hooks/useAsync'
import { advertisementsApi } from '@/lib/services'
import { resolveMediaUrl } from '@/lib/api'
import { cn } from '@/lib/utils'

interface AdSlotProps {
  slot: AdSlotType
  className?: string
  label?: boolean
}

const slotSizes: Record<AdSlotType, string> = {
  'top-banner': 'h-[90px] w-full max-w-[970px]',
  'sidebar-top': 'h-[250px] w-full max-w-[300px]',
  'sidebar-bottom': 'h-[250px] w-full max-w-[300px]',
  'in-feed-1': 'h-[120px] w-full sm:h-[140px]',
  'in-feed-2': 'h-[120px] w-full sm:h-[140px]',
  'article-top': 'h-[90px] w-full max-w-[728px]',
  'article-mid': 'h-[140px] w-full sm:h-[160px]',
  'mobile-banner': 'h-[60px] w-full sm:h-[90px]',
  'footer-above': 'h-[90px] w-full max-w-[728px]',
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/\son\w+\s*=/gi, ' data-blocked=')
}

function HtmlAdContent({ html }: { html: string }) {
  return (
    <div
      className="ad-container flex h-full w-full items-center justify-center overflow-hidden"
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  )
}

function AdPlaceholder({ slot }: { slot: AdSlotType }) {
  const sizeLabels: Record<AdSlotType, string> = {
    'top-banner': '970 × 90',
    'sidebar-top': '300 × 250',
    'sidebar-bottom': '300 × 250',
    'in-feed-1': 'Responsive',
    'in-feed-2': 'Responsive',
    'article-top': '728 × 90',
    'article-mid': 'Responsive',
    'mobile-banner': 'Responsive',
    'footer-above': '728 × 90',
  }
  const isSquare = slot === 'sidebar-top' || slot === 'sidebar-bottom'

  return (
    <div className="flex h-full w-full items-center justify-center border border-dashed border-ink-300 bg-ink-50">
      <div className="text-center">
        <svg viewBox="0 0 24 24" className={cn('mx-auto text-ink-300', isSquare ? 'h-8 w-8' : 'h-6 w-6')} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
        <p className={cn('mt-1 font-brand font-medium uppercase tracking-wider text-ink-400', isSquare ? 'text-[11px]' : 'text-[10px]')}>
          {sizeLabels[slot]}
        </p>
      </div>
    </div>
  )
}

export function AdSlot({ slot, className, label = true }: AdSlotProps) {
  const { t } = useTranslation()
  const { data } = useAsync(() => advertisementsApi.activeBySlot(slot), [slot])

  const ads = data?.ads ?? []

  if (ads.length === 0) {
    return (
      <div className={cn('mx-auto', className)}>
        {label && (
          <p className="mb-1 text-center text-[10px] font-medium uppercase tracking-wider text-ink-400">
            {t('ads.label')}
          </p>
        )}
        <div className={cn('mx-auto overflow-hidden', slotSizes[slot])}>
          <AdPlaceholder slot={slot} />
        </div>
      </div>
    )
  }

  const ad = ads[Math.floor(Math.random() * ads.length)]

  if (ad.ad_type === 'html' && ad.html_content) {
    return (
      <div className={cn('mx-auto', className)}>
        {label && (
          <p className="mb-1 text-center text-[10px] font-medium uppercase tracking-wider text-ink-400">
            {t('ads.label')}
          </p>
        )}
        <div className={cn('mx-auto overflow-hidden', slotSizes[slot])}>
          <HtmlAdContent html={ad.html_content} />
        </div>
      </div>
    )
  }

  if (!ad.image_url) return null

  return (
    <div className={cn('mx-auto', className)}>
      {label && (
        <p className="mb-1 text-center text-[10px] font-medium uppercase tracking-wider text-ink-400">
          {t('ads.label')}
        </p>
      )}
      {ad.link_url ? (
        <a
          href={ad.link_url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className={cn(
            'mx-auto block overflow-hidden',
            slotSizes[slot],
          )}
        >
          <img
            src={resolveMediaUrl(ad.image_url)}
            alt={ad.title}
            className="h-full w-full object-contain"
          />
        </a>
      ) : (
        <div
          className={cn(
            'mx-auto overflow-hidden',
            slotSizes[slot],
          )}
        >
          <img
            src={resolveMediaUrl(ad.image_url)}
            alt={ad.title}
            className="h-full w-full object-contain"
          />
        </div>
      )}
    </div>
  )
}
