import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { VerificationStatus } from '@/components/badges/VerificationStatus'
import { Avatar } from '@/components/ui/Avatar'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Seo } from '@/components/ui/Seo'
import { Spinner } from '@/components/ui/Spinner'
import { useAsync } from '@/hooks/useAsync'
import { articlesApi, journalistsApi } from '@/lib/services'
import { formatDate } from '@/lib/utils'

export function JournalistProfilePage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()

  const profileQuery = useAsync(() => journalistsApi.byId(id ?? ''), [id])
  const articlesQuery = useAsync(
    () => articlesApi.list({ author: id ?? '', limit: 50 }),
    [id],
  )

  if (profileQuery.loading || articlesQuery.loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-8 w-8 text-brand-800" />
      </div>
    )
  }

  if (profileQuery.error || !profileQuery.data) {
    return <ErrorState message={profileQuery.error ?? undefined} />
  }

  const journalist = profileQuery.data.journalist
  const articles = articlesQuery.data?.articles ?? []
  const locale = i18n.resolvedLanguage

  return (
    <>
      <Seo title={journalist.full_name} description={journalist.bio ?? undefined} />

      {/* Profile Header */}
      <div className="mb-8 border-b-[3px] border-brand-800 pb-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <Avatar src={journalist.avatar_path} name={journalist.full_name} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl tracking-wide text-brand-800 sm:text-4xl">
              {journalist.full_name}
            </h1>
            <div className="mt-2">
              <VerificationStatus
                verified={journalist.verified}
                blueBadge={journalist.blue_badge}
              />
            </div>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-ink-500">{t('journalists.publishedArticles')}</dt>
                <dd className="font-semibold text-ink-900">{articles.length}</dd>
              </div>
              <div>
                <dt className="text-ink-500">
                  {t('journalists.memberSince', { date: formatDate(journalist.created_at, locale) })}
                </dt>
              </div>
            </dl>
          </div>
        </div>
        {journalist.bio ? (
          <p className="mt-4 max-w-2xl leading-relaxed text-ink-700">{journalist.bio}</p>
        ) : (
          <p className="mt-4 text-sm text-ink-500">{t('journalists.noBio')}</p>
        )}
      </div>

      <h2 className="mb-5 font-display text-xl tracking-wide text-brand-800">
        {t('journalists.publishedArticles')}
      </h2>
      {articles.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </>
  )
}
