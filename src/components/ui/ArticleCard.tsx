import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import type { Article } from '@/types'
import { formatDate } from '@/lib/utils'
import { CoverImage } from './CoverImage'
import { AuthorByline } from './AuthorByline'

interface ArticleCardProps {
  article: Article
  featured?: boolean
}

export function ArticleCard({ article, featured }: ArticleCardProps) {
  const { t, i18n } = useTranslation()

  return (
    <article
      className={`flex flex-col overflow-hidden border border-ink-200 bg-white transition-colors hover:border-ink-300 ${
        featured ? '' : 'h-full'
      }`}
    >
      <Link
        to={`/news/${article.slug}`}
        className="group relative block shrink-0"
        aria-label={article.title}
      >
        <CoverImage
          src={article.featured_image}
          alt={article.title}
          className="h-auto w-full"
        />
        {article.category && (
          <span className="absolute left-3 top-3 bg-brand-800 px-2 py-1 font-brand text-[10px] font-bold uppercase tracking-wider text-white">
            {t(`categories.${article.category.name_key}.name`, { defaultValue: article.category.name_key })}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link
          to={`/news/${article.slug}`}
          className={`font-serif font-bold leading-snug text-ink-950 hover:text-brand-800 transition-colors ${
            featured ? 'text-xl sm:text-2xl' : 'text-base'
          }`}
        >
          {article.title}
        </Link>
        {featured && (
          <p className="line-clamp-3 text-[15px] leading-relaxed text-ink-600">{article.content}</p>
        )}
        <div className="mt-auto pt-2">
          <AuthorByline
            author={article.author}
            showDate
            date={formatDate(article.published_at, i18n.resolvedLanguage)}
          />
        </div>
      </div>
    </article>
  )
}
