import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { VerifiedBadge } from '@/components/badges/VerifiedBadge'
import { VerificationStatus } from '@/components/badges/VerificationStatus'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Seo } from '@/components/ui/Seo'
import { Spinner } from '@/components/ui/Spinner'
import { useAsync } from '@/hooks/useAsync'
import { journalistsApi } from '@/lib/services'

export function JournalistsPage() {
  const { t } = useTranslation()
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const { data, loading, error, reload } = useAsync(
    () => journalistsApi.list(verifiedOnly),
    [verifiedOnly],
  )

  return (
    <>
      <Seo title={t('journalists.title')} description={t('journalists.subtitle')} />

      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="border-b-[3px] border-brand-800 pb-4">
          <h1 className="font-display text-3xl tracking-wide text-brand-800 sm:text-4xl">
            {t('journalists.title')}
          </h1>
          <p className="mt-2 text-ink-500">{t('journalists.subtitle')}</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-ink-700">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(event) => setVerifiedOnly(event.target.checked)}
            className="h-4 w-4 accent-brand-800"
          />
          {t('journalists.verifiedOnly')}
        </label>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8 text-brand-800" />
        </div>
      ) : error || !data ? (
        <ErrorState message={error ?? undefined} onRetry={reload} />
      ) : data.journalists.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.journalists.map((journalist) => (
            <Link
              key={journalist.id}
              to={`/journalists/${journalist.id}`}
              className="group border border-ink-200 p-5 transition-colors hover:border-brand-800"
            >
              <div className="flex items-start gap-4">
                <Avatar
                  src={journalist.avatar_path}
                  name={journalist.full_name}
                  size="lg"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate font-serif text-lg font-bold text-ink-950 group-hover:text-brand-800">
                      {journalist.full_name}
                    </h2>
                    {journalist.blue_badge && (
                      <span className="inline-flex shrink-0">
                        <VerifiedBadge />
                      </span>
                    )}
                  </div>
                  <div className="mt-1">
                    <VerificationStatus
                      verified={journalist.verified}
                      blueBadge={false}
                      compact
                    />
                  </div>
                  <p className="mt-3 text-[12px] text-ink-500">
                    {t('journalists.articlesCount_other', { count: journalist.articleCount })}
                  </p>
                </div>
              </div>
              {journalist.bio && (
                <p className="mt-4 line-clamp-3 text-sm text-ink-600">
                  {journalist.bio}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
