import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { ErrorState } from '@/components/ui/ErrorState'
import { Seo } from '@/components/ui/Seo'
import { Spinner } from '@/components/ui/Spinner'
import { useAsync } from '@/hooks/useAsync'
import { categoriesApi } from '@/lib/services'

export function CategoriesPage() {
  const { t } = useTranslation()
  const { data, loading, error, reload } = useAsync(() => categoriesApi.list(), [])

  return (
    <>
      <Seo title={t('categories.title')} description={t('categories.subtitle')} />

      {/* Page Header */}
      <div className="mb-6 border-b-[3px] border-brand-800 pb-4">
        <h1 className="font-display text-3xl tracking-wide text-brand-800 sm:text-4xl">
          {t('categories.title')}
        </h1>
        <p className="mt-2 text-ink-500">{t('categories.subtitle')}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8 text-brand-800" />
        </div>
      ) : error || !data ? (
        <ErrorState message={error ?? undefined} onRetry={reload} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.categories.map((category) => (
            <Link
              key={category.id}
              to={`/categories/${category.slug}`}
              className="group border border-ink-200 p-5 transition-colors hover:border-brand-800"
            >
              <h2 className="font-serif text-xl font-bold text-ink-950 group-hover:text-brand-800">
                {t(`categories.${category.name_key}.name`, { defaultValue: category.name_key })}
              </h2>
              <p className="mt-2 text-sm text-ink-600 line-clamp-2">
                {t(`categories.${category.name_key}.description`, { defaultValue: category.description_key ?? '' })}
              </p>
              <p className="mt-4 text-[12px] font-semibold text-brand-800">
                {t('journalists.articlesCount_other', { count: category.publishedCount })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
