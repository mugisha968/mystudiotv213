import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import type { Article } from '@/types'
import { CoverImage } from '@/components/ui/CoverImage'
import { formatDate } from '@/lib/utils'

interface RelatedArticlesProps {
  articles: Article[]
  title?: string
}

export function RelatedArticles({ articles, title }: RelatedArticlesProps) {
  const { t, i18n } = useTranslation()

  if (articles.length === 0) return null

  return (
    <aside>
      <h3 className="mb-4 font-display text-lg tracking-wide text-brand-800">
        {title ?? t('article.relatedStories')}
      </h3>
      <div className="space-y-4">
        {articles.slice(0, 5).map((article) => (
          <article key={article.id} className="flex gap-3">
            {article.featured_image && (
              <Link
                to={`/news/${article.slug}`}
                className="relative h-16 w-24 shrink-0 overflow-hidden bg-ink-100"
              >
                <CoverImage
                  src={article.featured_image}
                  alt={article.title}
                  fit="contain"
                  className="h-full w-full"
                />
              </Link>
            )}
            <div className="min-w-0">
              <Link
                to={`/news/${article.slug}`}
                className="text-[13px] font-bold leading-snug text-ink-950 hover:text-brand-800 line-clamp-2"
              >
                {article.title}
              </Link>
              <p className="mt-1 text-[10px] text-ink-400">
                {formatDate(article.published_at, i18n.resolvedLanguage)}
              </p>
            </div>
          </article>
        ))}
      </div>
    </aside>
  )
}
