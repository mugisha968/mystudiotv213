import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import type { Article } from '@/types'
import { CoverImage } from '@/components/ui/CoverImage'
import { AuthorByline } from '@/components/ui/AuthorByline'
import { formatDate } from '@/lib/utils'

interface HorizontalArticleCardProps {
  article: Article
  showAuthor?: boolean
}

export function HorizontalArticleCard({
  article,
  showAuthor = true,
}: HorizontalArticleCardProps) {
  const { t, i18n } = useTranslation()

  return (
    <article className="flex gap-4 border border-ink-200 bg-white p-3 transition-colors hover:border-ink-300 sm:p-4">
      <Link
        to={`/news/${article.slug}`}
        className="relative h-24 w-32 shrink-0 overflow-hidden bg-ink-100 sm:h-28 sm:w-40"
      >
        <CoverImage
          src={article.featured_image}
          alt={article.title}
          fit="contain"
          className="h-full w-full"
        />
      </Link>
      <div className="min-w-0 flex-1">
        {article.category && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-800">
            {t(`categories.${article.category.name_key}.name`, {
              defaultValue: article.category.name_key,
            })}
          </span>
        )}
        <Link
          to={`/news/${article.slug}`}
          className="mt-1 block font-serif text-base font-bold leading-snug text-ink-950 hover:text-brand-800 line-clamp-2"
        >
          {article.title}
        </Link>
        {showAuthor && (
          <div className="mt-2">
            <AuthorByline
              author={article.author}
              showDate
              date={formatDate(article.published_at, i18n.resolvedLanguage)}
            />
          </div>
        )}
      </div>
    </article>
  )
}
