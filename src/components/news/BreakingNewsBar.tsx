import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import type { Article } from '@/types'
import { formatDate } from '@/lib/utils'

interface BreakingNewsBarProps {
  articles: Article[]
}

export function BreakingNewsBar({ articles }: BreakingNewsBarProps) {
  const { t, i18n } = useTranslation()

  if (articles.length === 0) return null

  return (
    <div className="relative border-b border-red-800 bg-live text-white">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-1.5">
        <span className="shrink-0 inline-flex items-center gap-1.5 rounded-sm bg-white px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-live">
          <span className="inline-block h-1.5 w-1.5 animate-[pulse-live_1.5s_ease-in-out_infinite] rounded-full bg-live" />
          {t('breaking.label')}
        </span>
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex animate-[ticker-scroll_40s_linear_infinite] gap-10 whitespace-nowrap">
            {articles.map((article) => (
              <Link
                key={article.id}
                to={`/news/${article.slug}`}
                className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
              >
                <span>{article.title}</span>
                <span className="text-[10px] text-red-200">
                  {formatDate(article.published_at, i18n.resolvedLanguage)}
                </span>
              </Link>
            ))}
            {articles.map((article) => (
              <Link
                key={`dup-${article.id}`}
                to={`/news/${article.slug}`}
                className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                aria-hidden="true"
              >
                <span>{article.title}</span>
                <span className="text-[10px] text-red-200">
                  {formatDate(article.published_at, i18n.resolvedLanguage)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
