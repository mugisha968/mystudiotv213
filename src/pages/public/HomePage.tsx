import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { CoverImage } from '@/components/ui/CoverImage'
import { ErrorState } from '@/components/ui/ErrorState'
import { Seo } from '@/components/ui/Seo'
import { Spinner } from '@/components/ui/Spinner'
import { useAsync } from '@/hooks/useAsync'
import { articlesApi, categoriesApi } from '@/lib/services'
import { formatDate } from '@/lib/utils'
import { AdSlot } from '@/components/news/AdSlot'
import { PopularNews } from '@/components/news/PopularNews'
import type { Article } from '@/types'

function HeroStory({ article }: { article: Article }) {
  const { t, i18n } = useTranslation()
  return (
    <article className="group">
      <Link to={`/news/${article.slug}`} className="relative block overflow-hidden">
        <CoverImage
          src={article.featured_image}
          alt={article.title}
          className="h-auto w-full transition-transform duration-300 group-hover:scale-[1.02]"
        />
        {article.category && (
          <span className="absolute left-4 top-4 rounded-sm bg-brand-800 px-2.5 py-1 font-brand text-[11px] font-bold uppercase tracking-wider text-white">
            {t(`categories.${article.category.name_key}.name`, { defaultValue: article.category.name_key })}
          </span>
        )}
        {article.breaking_news && (
          <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-sm bg-live px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white">
            <span className="inline-block h-1.5 w-1.5 animate-[pulse-live_1.5s_ease-in-out_infinite] rounded-full bg-white" />
            Live
          </span>
        )}
      </Link>
      <div className="mt-3">
        <h2 className="font-display text-2xl leading-[1.1] tracking-wide text-ink-950 sm:text-3xl lg:text-4xl">
          <Link to={`/news/${article.slug}`} className="hover:text-brand-800 transition-colors">
            {article.title}
          </Link>
        </h2>
        {article.content && (
          <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-ink-600">
            {article.content.slice(0, 280)}{article.content.length > 280 ? '…' : ''}
          </p>
        )}
        <div className="mt-3 flex items-center gap-2 text-[12px]">
          {article.author && (
            <span className="font-semibold text-brand-800">{article.author.full_name}</span>
          )}
          <span className="text-ink-300">|</span>
          <span className="text-ink-500">
            {formatDate(article.published_at, i18n.resolvedLanguage)}
          </span>
        </div>
      </div>
    </article>
  )
}

function SecondaryStory({ article }: { article: Article }) {
  const { t, i18n } = useTranslation()
  return (
    <article className="group">
      <Link to={`/news/${article.slug}`} className="block overflow-hidden border border-ink-200">
        <CoverImage src={article.featured_image} alt={article.title} className="h-auto w-full" />
      </Link>
      <div className="mt-2.5">
        {article.category && (
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand-800">
            {t(`categories.${article.category.name_key}.name`, { defaultValue: article.category.name_key })}
          </p>
        )}
        <h3 className="mt-1 font-serif text-base font-bold leading-snug text-ink-950">
          <Link to={`/news/${article.slug}`} className="hover:text-brand-800 transition-colors">
            {article.title}
          </Link>
        </h3>
        <p className="mt-1 text-[11px] text-ink-500">
          {formatDate(article.published_at, i18n.resolvedLanguage)}
        </p>
      </div>
    </article>
  )
}

function LatestStoryItem({ article }: { article: Article }) {
  const { t, i18n } = useTranslation()
  return (
    <article className="flex items-start gap-3 border-b border-ink-100 py-3.5 last:border-b-0">
      {article.featured_image && (
        <Link to={`/news/${article.slug}`} className="block w-28 shrink-0 overflow-hidden sm:w-32">
          <CoverImage src={article.featured_image} alt={article.title} fit="contain" className="h-20 w-full bg-ink-100" />
        </Link>
      )}
      <div className="min-w-0 flex-1">
        {article.category && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand-800">
            {t(`categories.${article.category.name_key}.name`, { defaultValue: article.category.name_key })}
          </p>
        )}
        <h4 className="mt-0.5 font-serif text-sm font-bold leading-snug text-ink-950">
          <Link to={`/news/${article.slug}`} className="hover:text-brand-800 transition-colors">
            {article.title}
          </Link>
        </h4>
        <p className="mt-1 text-[11px] text-ink-400">
          {formatDate(article.published_at, i18n.resolvedLanguage)}
        </p>
      </div>
    </article>
  )
}

function SectionHeader({ title, viewAllLink }: { title: string; viewAllLink?: string }) {
  return (
    <div className="mb-4 flex items-center gap-3 border-b-[3px] border-brand-800 pb-2">
      <h2 className="font-display text-lg tracking-wide text-brand-800">
        {title}
      </h2>
      {viewAllLink && (
        <Link to={viewAllLink} className="ml-auto font-brand text-[11px] font-bold uppercase tracking-wider text-amber-600 hover:text-amber-700">
          View all →
        </Link>
      )}
    </div>
  )
}

function CategoryBrief({ article }: { article: Article }) {
  const { t, i18n } = useTranslation()
  return (
    <article className="group border-l-[3px] border-brand-800 pl-3">
      {article.category && (
        <p className="text-[10px] font-bold uppercase tracking-wider text-brand-800">
          {t(`categories.${article.category.name_key}.name`, { defaultValue: article.category.name_key })}
        </p>
      )}
      <h4 className="mt-0.5 font-serif text-sm font-bold leading-snug text-ink-950">
        <Link to={`/news/${article.slug}`} className="hover:text-brand-800 transition-colors">
          {article.title}
        </Link>
      </h4>
      <p className="mt-1 text-[10px] text-ink-400">
        {formatDate(article.published_at, i18n.resolvedLanguage)}
      </p>
    </article>
  )
}

export function HomePage() {
  const { t } = useTranslation()
  const breakingQuery = useAsync(() => articlesApi.breaking(6), [])
  const latestQuery = useAsync(() => articlesApi.list({ limit: 20 }), [])
  const popularQuery = useAsync(() => articlesApi.popular(8), [])
  const categoriesQuery = useAsync(() => categoriesApi.list(), [])

  if (breakingQuery.loading || latestQuery.loading || categoriesQuery.loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-8 w-8 text-brand-800" />
      </div>
    )
  }

  const error =
    breakingQuery.error || latestQuery.error || categoriesQuery.error
  if (error || !latestQuery.data || !categoriesQuery.data) {
    return (
      <ErrorState
        message={error ?? undefined}
        onRetry={latestQuery.reload}
      />
    )
  }

  const articles = latestQuery.data.articles
  const categories = categoriesQuery.data.categories
  const popular = popularQuery.data?.articles ?? []
  const hero = articles[0] ?? null
  const secondary = articles.slice(1, 3)
  const latest = articles.slice(3, 12)
  const briefs = articles.slice(12, 18)

  return (
    <>
      <Seo description={t('brand.tagline')} />

      <div className="grid gap-8 lg:grid-cols-12">
        {/* ===== MAIN CONTENT ===== */}
        <div className="lg:col-span-8">
          {/* Hero Section */}
          {hero && (
            <section>
              <HeroStory article={hero} />
            </section>
          )}

          {/* Secondary Stories */}
          {secondary.length > 0 && (
            <section className="mt-8 grid gap-6 sm:grid-cols-2">
              {secondary.map((article) => (
                <SecondaryStory key={article.id} article={article} />
              ))}
            </section>
          )}

          {/* In-feed Ad */}
          <div className="mt-8">
            <AdSlot slot="in-feed-1" />
          </div>

          {/* Latest News */}
          <section className="mt-8">
            <SectionHeader title={t('home.latestNews')} viewAllLink="/news" />
            {latest.length === 0 ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 border-b border-ink-100 py-3.5">
                    <div className="h-20 w-28 shrink-0 animate-pulse bg-ink-100 sm:w-32" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-16 animate-pulse bg-ink-100" />
                      <div className="h-4 w-full animate-pulse bg-ink-100" />
                      <div className="h-3 w-24 animate-pulse bg-ink-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {latest.map((article) => (
                  <LatestStoryItem key={article.id} article={article} />
                ))}
              </div>
            )}
          </section>

          {/* In-feed Ad 2 */}
          <div className="mt-8">
            <AdSlot slot="in-feed-2" />
          </div>

          {/* News in Brief */}
          {briefs.length > 0 && (
            <section className="mt-8">
              <SectionHeader title={t('home.newsInBrief')} />
              <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                {briefs.map((article) => (
                  <CategoryBrief key={article.id} article={article} />
                ))}
              </div>
            </section>
          )}

          {/* Category Sections */}
          {categories.length > 0 && (
            <section className="mt-10">
              <SectionHeader title={t('home.latestFromCategories')} viewAllLink="/categories" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.slice(0, 6).map((category) => (
                  <Link
                    key={category.id}
                    to={`/categories/${category.slug}`}
                    className="group border border-ink-200 p-4 transition-colors hover:border-brand-800"
                  >
                    <h3 className="font-brand text-sm font-bold uppercase tracking-wide text-ink-950 group-hover:text-brand-800">
                      {t(`categories.${category.name_key}.name`, { defaultValue: category.name_key })}
                    </h3>
                    <p className="mt-1 text-[11px] text-ink-500 line-clamp-2">
                      {t(`categories.${category.name_key}.description`, { defaultValue: category.description_key ?? '' })}
                    </p>
                    <p className="mt-2 text-[11px] font-semibold text-brand-800">
                      {category.publishedCount} {t('articles.title').toLowerCase()}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ===== SIDEBAR ===== */}
        <aside className="lg:col-span-4">
          <div className="sticky top-36 space-y-6">
            {/* Popular/Trending */}
            {popular.length > 0 && (
              <PopularNews articles={popular} />
            )}

            {/* Sidebar Ad */}
            <AdSlot slot="sidebar-top" />

            {/* Latest Videos Teaser */}
            <div>
              <SectionHeader title={t('videos.title')} viewAllLink="/videos" />
              <Link
                to="/videos"
                className="flex items-center gap-3 rounded border border-ink-200 p-4 transition-colors hover:border-brand-800"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-live">
                  <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 text-white" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-brand text-sm font-bold text-ink-950">{t('videos.latestVideos')}</p>
                  <p className="text-[11px] text-ink-500">{t('videos.subtitle')}</p>
                </div>
              </Link>
            </div>

            {/* Sidebar Ad 2 */}
            <AdSlot slot="sidebar-bottom" />
          </div>
        </aside>
      </div>
    </>
  )
}
