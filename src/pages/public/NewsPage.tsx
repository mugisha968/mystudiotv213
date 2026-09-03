import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ArticleCard } from '@/components/ui/ArticleCard'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Seo } from '@/components/ui/Seo'
import { Spinner } from '@/components/ui/Spinner'
import { useAsync } from '@/hooks/useAsync'
import { articlesApi } from '@/lib/services'
import { AdSlot } from '@/components/news/AdSlot'

const PAGE_SIZE = 12

export function NewsPage() {
  const { t } = useTranslation()
  const [offset, setOffset] = useState(0)
  const { data, loading, error, reload } = useAsync(
    () => articlesApi.list({ limit: PAGE_SIZE, offset }),
    [offset],
  )

  const articles = data?.articles ?? []

  return (
    <>
      <Seo title={t('news.title')} description={t('news.subtitle')} />

      {/* Page Header */}
      <div className="mb-6 border-b-[3px] border-brand-800 pb-4">
        <h1 className="font-display text-3xl tracking-wide text-brand-800 sm:text-4xl">
          {t('news.title')}
        </h1>
        <p className="mt-2 text-ink-500">{t('news.subtitle')}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8 text-brand-800" />
        </div>
      ) : error || !data ? (
        <ErrorState message={error ?? undefined} onRetry={reload} />
      ) : articles.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* First article large */}
          {articles[0] && (
            <div className="mb-6">
              <ArticleCard article={articles[0]} featured />
            </div>
          )}

          {/* In-feed Ad */}
          <div className="mb-6">
            <AdSlot slot="in-feed-1" />
          </div>

          {/* Grid */}
          {articles.length > 1 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.slice(1).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {offset + articles.length < data.total && (
            <div className="mt-10 flex justify-center">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setOffset((value) => value + PAGE_SIZE)}
              >
                {t('common.loadMore')}
              </Button>
            </div>
          )}
        </>
      )}
    </>
  )
}
