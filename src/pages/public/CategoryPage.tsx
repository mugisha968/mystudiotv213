import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { ArticleCard } from '@/components/ui/ArticleCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Seo } from '@/components/ui/Seo'
import { Spinner } from '@/components/ui/Spinner'
import { useAsync } from '@/hooks/useAsync'
import { articlesApi, categoriesApi } from '@/lib/services'
import { AdSlot } from '@/components/news/AdSlot'

export function CategoryPage() {
  const { t } = useTranslation()
  const { slug } = useParams<{ slug: string }>()

  const categoryQuery = useAsync(() => categoriesApi.list(), [])
  const articlesQuery = useAsync(
    () => articlesApi.list({ category: slug, limit: 50 }),
    [slug],
  )

  if (categoryQuery.loading || articlesQuery.loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-8 w-8 text-brand-800" />
      </div>
    )
  }

  if (categoryQuery.error || articlesQuery.error || !categoryQuery.data || !articlesQuery.data) {
    return (
      <ErrorState
        message={categoryQuery.error ?? articlesQuery.error ?? undefined}
        onRetry={articlesQuery.reload}
      />
    )
  }

  const category = categoryQuery.data.categories.find((item) => item.slug === slug)

  if (!category) {
    return <ErrorState message={t('notFound.description')} />
  }

  const articles = articlesQuery.data.articles

  return (
    <>
      <Seo
        title={t(`categories.${category.name_key}.name`, { defaultValue: category.name_key })}
        description={t(`categories.${category.name_key}.description`, { defaultValue: category.description_key ?? '' })}
      />

      {/* Category Header */}
      <div className="mb-6 border-b-[3px] border-brand-800 pb-4">
        <h1 className="font-display text-3xl tracking-wide text-brand-800 sm:text-4xl">
          {t(`categories.${category.name_key}.name`, { defaultValue: category.name_key })}
        </h1>
        <p className="mt-2 text-ink-500">
          {t(`categories.${category.name_key}.description`, { defaultValue: category.description_key ?? '' })}
        </p>
      </div>

      {articles.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* First article large */}
          {articles[0] && (
            <div className="mb-8">
              <ArticleCard article={articles[0]} featured />
            </div>
          )}

          {/* In-feed Ad */}
          <div className="mb-6">
            <AdSlot slot="in-feed-1" />
          </div>

          {/* Rest in grid */}
          {articles.length > 1 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.slice(1).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
