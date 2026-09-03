import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

import { VerificationStatus } from '@/components/badges/VerificationStatus'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { CoverImage } from '@/components/ui/CoverImage'
import { ErrorState } from '@/components/ui/ErrorState'
import { Seo } from '@/components/ui/Seo'
import { Spinner } from '@/components/ui/Spinner'
import { YouTubeEmbed } from '@/components/ui/YouTubeEmbed'
import { useAsync } from '@/hooks/useAsync'
import { articlesApi } from '@/lib/services'
import { formatDate } from '@/lib/utils'
import { AdSlot } from '@/components/news/AdSlot'
import { PopularNews } from '@/components/news/PopularNews'
import { RelatedArticles } from '@/components/news/RelatedArticles'

function ShareControls() {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button variant="secondary" size="sm" onClick={copyLink}>
        <svg viewBox="0 0 24 24" className="mr-1 h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        {copied ? t('article.linkCopied') : t('article.copyLink')}
      </Button>
    </div>
  )
}

function Paragraphs({ content }: { content: string }) {
  const blocks = content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)

  return (
    <div className="space-y-5">
      {blocks.map((block, index) => (
        <p key={index} className={`text-lg leading-[1.75] text-ink-800 ${index === 0 ? 'drop-cap' : ''}`}>
          {block}
        </p>
      ))}
    </div>
  )
}

export function ArticlePage() {
  const { t, i18n } = useTranslation()
  const { slug } = useParams<{ slug: string }>()
  const { data, loading, error, reload } = useAsync(
    () => articlesApi.bySlug(slug ?? ''),
    [slug],
  )
  const popularQuery = useAsync(() => articlesApi.popular(8), [])

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-8 w-8 text-brand-800" />
      </div>
    )
  }

  if (error || !data) {
    return <ErrorState message={error ?? undefined} onRetry={reload} />
  }

  const article = data.article
  const locale = i18n.resolvedLanguage
  const popular = popularQuery.data?.articles ?? []

  return (
    <article>
      <Seo title={article.title} description={article.content.slice(0, 200)} />

      {/* Article Layout */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Main Content */}
        <div className="lg:col-span-8">
          {/* Breadcrumb */}
          <div className="mb-4 flex flex-wrap items-center gap-1.5 text-[12px] text-ink-500">
            <Link to="/" className="font-medium text-brand-800 hover:underline">{t('nav.home')}</Link>
            <span aria-hidden="true" className="text-ink-300">/</span>
            <Link to="/news" className="font-medium text-brand-800 hover:underline">{t('nav.news')}</Link>
            {article.category && (
              <>
                <span aria-hidden="true" className="text-ink-300">/</span>
                <Link
                  to={`/categories/${article.category.slug}`}
                  className="font-medium text-brand-800 hover:underline"
                >
                  {t(`categories.${article.category.name_key}.name`, { defaultValue: article.category.name_key })}
                </Link>
              </>
            )}
          </div>

          {/* Category Badge */}
          {article.category && (
            <span className="mb-3 inline-block bg-brand-800 px-2.5 py-1 font-brand text-[11px] font-bold uppercase tracking-wider text-white">
              {t(`categories.${article.category.name_key}.name`, { defaultValue: article.category.name_key })}
            </span>
          )}

          {/* Headline */}
          <h1 className="font-serif text-3xl font-bold leading-[1.1] tracking-tight text-ink-950 sm:text-4xl lg:text-[2.75rem]">
            {article.title}
          </h1>

          {/* Subheadline */}
          {article.content && (
            <p className="mt-3 text-lg font-medium italic leading-relaxed text-ink-600 sm:text-xl">
              {article.content.slice(0, 200)}{article.content.length > 200 ? '…' : ''}
            </p>
          )}

          {/* Author + Meta Bar */}
          <div className="mt-5 flex flex-wrap items-center gap-4 border-t-[3px] border-brand-800 pt-4">
            <Link
              to={`/journalists/${article.author.id}`}
              className="flex items-center gap-3"
            >
              <Avatar src={article.author.avatar_path} name={article.author.full_name} size="md" />
              <div className="flex flex-col">
                <span className="flex items-center gap-2">
                  <span className="font-serif font-semibold text-ink-900">
                    {article.author.full_name}
                  </span>
                  <VerificationStatus
                    verified={article.author.verified}
                    blueBadge={article.author.blue_badge}
                  />
                </span>
                <span className="text-[12px] text-ink-500">
                  {t('news.publishedOn', { date: formatDate(article.published_at, locale) })}
                </span>
              </div>
            </Link>
            <div className="ml-auto">
              <ShareControls />
            </div>
          </div>

          {/* Hero Image */}
          {article.featured_image && (
            <div className="mt-6">
              <CoverImage
                src={article.featured_image}
                alt={article.title}
                className="w-full"
              />
            </div>
          )}

          {/* Top Ad */}
          <div className="mt-6">
            <AdSlot slot="article-top" />
          </div>

          {/* YouTube Video */}
          {article.youtube_url && (
            <div className="mt-6">
              <YouTubeEmbed url={article.youtube_url} title={article.title} />
            </div>
          )}

          {/* Article Body */}
          <div className="mx-auto mt-8 max-w-3xl">
            <Paragraphs content={article.content} />

            {/* In-article Ad */}
            <div className="my-8">
              <AdSlot slot="article-mid" />
            </div>

            {/* Updated Date */}
            {article.updated_at && article.published_at && (
              <p className="mt-8 border-t border-ink-100 pt-4 text-[12px] text-ink-500">
                {t('news.updatedOn', { date: formatDate(article.updated_at, locale) })}
              </p>
            )}

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-ink-200 bg-ink-50 px-2.5 py-1 font-brand text-[11px] font-medium text-ink-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Author Card */}
          <div className="mt-8 border border-ink-200 bg-ink-50 p-5">
            <Link
              to={`/journalists/${article.author.id}`}
              className="flex items-start gap-4"
            >
              <Avatar src={article.author.avatar_path} name={article.author.full_name} size="lg" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-bold text-ink-950">
                    {article.author.full_name}
                  </h3>
                  <VerificationStatus
                    verified={article.author.verified}
                    blueBadge={article.author.blue_badge}
                  />
                </div>
                {article.author.bio && (
                  <p className="mt-2 text-sm leading-relaxed text-ink-600 line-clamp-3">
                    {article.author.bio}
                  </p>
                )}
              </div>
            </Link>
          </div>

          {/* Related Stories */}
          <div className="mt-8 border-t-[3px] border-brand-800 pt-6">
            <RelatedArticles articles={popular.slice(0, 4)} title={t('article.relatedStories')} />
          </div>
        </div>

        {/* ===== SIDEBAR ===== */}
        <aside className="lg:col-span-4">
          <div className="sticky top-36 space-y-6">
            {/* Sidebar Ad */}
            <AdSlot slot="sidebar-top" />

            {/* Popular Stories */}
            {popular.length > 0 && (
              <PopularNews articles={popular} />
            )}

            {/* Sidebar Ad 2 */}
            <AdSlot slot="sidebar-bottom" />
          </div>
        </aside>
      </div>
    </article>
  )
}
