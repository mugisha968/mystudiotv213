import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import type { Article, Category } from '@/types'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { CoverImage } from '@/components/ui/CoverImage'
import { formatDate } from '@/lib/utils'

interface CategorySectionProps {
  category: Category
  articles: Article[]
  layout?: '3-col' | 'list' | 'compact'
}

export function CategorySection({
  category,
  articles,
  layout = '3-col',
}: CategorySectionProps) {
  const { t, i18n } = useTranslation()

  if (articles.length === 0) return null

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between border-b-[3px] border-brand-800 pb-2">
        <h2 className="font-display text-lg tracking-wide text-brand-800">
          {t(`categories.${category.name_key}.name`, {
            defaultValue: category.name_key,
          })}
        </h2>
        <Link
          to={`/categories/${category.slug}`}
          className="text-[11px] font-bold uppercase tracking-wider text-amber-600 hover:text-amber-700"
        >
          {t('common.viewAll')}
        </Link>
      </div>

      {layout === '3-col' && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.slice(0, 3).map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {layout === 'list' && (
        <div className="grid gap-5 sm:grid-cols-2">
          {articles.slice(0, 4).map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {layout === 'compact' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.slice(0, 6).map((article) => (
            <Link
              key={article.id}
              to={`/news/${article.slug}`}
              className="group flex gap-3"
            >
              {article.featured_image && (
                <div className="h-16 w-20 shrink-0 overflow-hidden bg-ink-100">
                  <CoverImage
                    src={article.featured_image}
                    alt={article.title}
                    fit="contain"
                    className="h-full w-full"
                  />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[13px] font-bold leading-snug text-ink-950 group-hover:text-brand-800 line-clamp-2">
                  {article.title}
                </p>
                <p className="mt-1 text-[10px] text-ink-400">
                  {formatDate(article.published_at, i18n.resolvedLanguage)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
