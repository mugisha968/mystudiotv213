import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import type { Article } from '@/types'
import { CoverImage } from '@/components/ui/CoverImage'
import { formatDate } from '@/lib/utils'

interface CompactArticleCardProps {
  article: Article
  index?: number
}

export function CompactArticleCard({ article, index }: CompactArticleCardProps) {
  const { t, i18n } = useTranslation()

  return (
    <article className="flex gap-3 border-b border-ink-100 py-3 last:border-b-0">
      {article.featured_image && (
        <Link
          to={`/news/${article.slug}`}
          className="relative h-16 w-20 shrink-0 overflow-hidden bg-ink-100 sm:h-20 sm:w-24"
        >
          <CoverImage
            src={article.featured_image}
            alt={article.title}
            fit="contain"
            className="h-full w-full"
          />
        </Link>
      )}
      <div className="min-w-0 flex-1">
        {article.category && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-800">
            {t(`categories.${article.category.name_key}.name`, {
              defaultValue: article.category.name_key,
            })}
          </span>
        )}
        <Link
          to={`/news/${article.slug}`}
          className="mt-0.5 block font-serif text-[13px] font-bold leading-snug text-ink-950 hover:text-brand-800 line-clamp-2"
        >
          {article.title}
        </Link>
        <p className="mt-0.5 text-[10px] text-ink-400">
          {formatDate(article.published_at, i18n.resolvedLanguage)}
        </p>
      </div>
      {index !== undefined && (
        <span className="shrink-0 self-start pt-1 text-2xl font-black text-ink-200">
          {index}
        </span>
      )}
    </article>
  )
}
