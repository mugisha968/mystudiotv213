import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { ArticleCard } from '@/components/ui/ArticleCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Seo } from '@/components/ui/Seo'
import { Spinner } from '@/components/ui/Spinner'
import { useAsync } from '@/hooks/useAsync'
import { articlesApi } from '@/lib/services'
import { cn } from '@/lib/utils'

export function SearchPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const activeQuery = searchParams.get('q') ?? ''

  const { data, loading, error, reload } = useAsync(
    () => articlesApi.list({ q: activeQuery, limit: 50 }),
    [activeQuery],
  )

  function submitSearch(event: React.FormEvent) {
    event.preventDefault()
    const value = query.trim()
    if (value) {
      setSearchParams({ q: value })
    }
  }

  const hasQuery = activeQuery.trim().length > 0
  const articles = data?.articles ?? []

  return (
    <>
      <Seo title={t('search.title')} description={t('search.subtitle')} />

      {/* Page Header */}
      <div className="mb-6 border-b-[3px] border-brand-800 pb-4">
        <h1 className="font-display text-3xl tracking-wide text-brand-800 sm:text-4xl">
          {t('search.title')}
        </h1>
        <p className="mt-2 text-ink-500">{t('search.subtitle')}</p>
      </div>

      <form
        onSubmit={submitSearch}
        className="mx-auto mb-10 flex max-w-2xl gap-3"
        role="search"
      >
        <input
          type="search"
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('common.searchPlaceholder')}
          className={cn(
            'w-full border border-ink-300 bg-white px-4 py-2.5 text-sm',
            'placeholder:text-ink-400 focus:border-brand-800 focus:outline-none',
          )}
        />
        <button
          type="submit"
          className="shrink-0 bg-brand-800 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {t('nav.search')}
        </button>
      </form>

      {!hasQuery ? (
        <p className="text-center text-sm text-ink-500">{t('search.prompt')}</p>
      ) : loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8 text-brand-800" />
        </div>
      ) : error || !data ? (
        <ErrorState message={error ?? undefined} onRetry={reload} />
      ) : (
        <>
          <p className="mb-6 text-[13px] font-medium text-ink-600">
            {t('search.resultsFor', { query: activeQuery })}
          </p>
          {articles.length === 0 ? (
            <EmptyState message={t('search.noResults')} />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
