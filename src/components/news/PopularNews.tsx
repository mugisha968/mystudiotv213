import { useTranslation } from 'react-i18next'

import type { Article } from '@/types'
import { CompactArticleCard } from './CompactArticleCard'

interface PopularNewsProps {
  articles: Article[]
}

export function PopularNews({ articles }: PopularNewsProps) {
  const { t } = useTranslation()

  if (articles.length === 0) return null

  return (
    <aside>
      <div className="mb-1 border-b-[3px] border-brand-800 pb-2">
        <h3 className="font-display text-lg tracking-wide text-brand-800">
          {t('trending.title')}
        </h3>
        <p className="text-[11px] text-ink-500">{t('trending.subtitle')}</p>
      </div>
      <div>
        {articles.slice(0, 8).map((article, index) => (
          <CompactArticleCard
            key={article.id}
            article={article}
            index={index + 1}
          />
        ))}
      </div>
    </aside>
  )
}
