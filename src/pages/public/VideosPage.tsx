import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { YouTubeThumbnail } from '@/components/ui/YouTubeEmbed'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Seo } from '@/components/ui/Seo'
import { Spinner } from '@/components/ui/Spinner'
import { useAsync } from '@/hooks/useAsync'
import { articlesApi } from '@/lib/services'
import { formatDate } from '@/lib/utils'
import { AdSlot } from '@/components/news/AdSlot'
import { CoverImage } from '@/components/ui/CoverImage'
import type { Article } from '@/types'

function LiveStudioBanner() {
  const { t } = useTranslation()
  return (
    <div className="relative overflow-hidden">
      <div
        className="relative flex flex-col items-center gap-4 p-8 sm:flex-row sm:items-center sm:p-10"
        style={{
          background: 'linear-gradient(135deg, #071e28 0%, #0d3b4a 50%, #15495c 100%)',
        }}
      >
        {/* Glow effect */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(90% 120% at 20% 30%, rgba(242,176,67,0.4) 0%, transparent 55%)',
          }}
        />

        {/* Studio identity */}
        <div className="relative flex items-center gap-5">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full sm:h-20 sm:w-20"
            style={{
              background: 'radial-gradient(circle at 30% 28%, #1f5c72 0%, #0d3b4a 55%, #08232e 100%)',
              boxShadow: 'inset 0 0 0 2px rgba(242,176,67,0.5), 0 8px 24px rgba(0,0,0,0.5)',
            }}
          >
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
              <path d="M4 19V5l8 9 8-9v14" stroke="#f2e3b0" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="19" cy="17" r="1.8" fill="#f2b043" />
            </svg>
          </div>
          <div>
            <p className="font-serif text-xl font-black tracking-tight text-white sm:text-2xl">
              MyStudio<span className="text-brand-400">TV</span>
              <span className="text-amber-400">231</span>
            </p>
            <p className="font-brand text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">
              {t('brand.subline')}
            </p>
          </div>
        </div>

        {/* Live indicator */}
        <div className="relative sm:ml-auto">
          <Link
            to="https://www.youtube.com/@MyStudioTV231"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-live px-5 py-2.5 font-brand text-sm font-black uppercase tracking-wider text-white shadow-lg transition hover:brightness-110"
          >
            <span className="inline-block h-2 w-2 animate-[pulse-live_1.5s_ease-in-out_infinite] rounded-full bg-white" />
            {t('videos.watchLive')}
          </Link>
        </div>

        {/* Bottom strip */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-white/10 px-4 py-2 backdrop-blur-sm" style={{ background: 'rgba(7,20,30,0.7)' }}>
          <span className="flex items-center gap-1.5 font-brand text-[10px] font-black uppercase tracking-widest text-white">
            <span className="inline-block h-1.5 w-1.5 animate-[pulse-live_1.5s_ease-in-out_infinite] rounded-full bg-live" />
            {t('videos.onAir')}
          </span>
          <span className="font-brand text-[10px] font-semibold uppercase tracking-widest text-white/60">
            Kigali · 24/7
          </span>
        </div>
      </div>
    </div>
  )
}

function VideoCardLarge({ video }: { video: Article }) {
  const { t, i18n } = useTranslation()
  return (
    <article className="group">
      <Link to={`/news/${video.slug}`} className="block overflow-hidden border border-ink-200">
        {video.youtube_url ? (
          <YouTubeThumbnail
            url={video.youtube_url}
            languageId={video.article_language}
          />
        ) : video.featured_image ? (
          <CoverImage src={video.featured_image} alt={video.title} className="h-auto w-full" />
        ) : null}
      </Link>
      <div className="mt-3">
        {video.category && (
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand-800">
            {t(`categories.${video.category.name_key}.name`, { defaultValue: video.category.name_key })}
          </p>
        )}
        <h2 className="mt-1 font-serif text-xl font-bold leading-snug text-ink-950">
          <Link to={`/news/${video.slug}`} className="hover:text-brand-800 transition-colors">
            {video.title}
          </Link>
        </h2>
        <p className="mt-2 text-[12px] text-ink-500">
          {video.author.full_name} · {formatDate(video.published_at ?? video.created_at, i18n.resolvedLanguage)}
        </p>
      </div>
    </article>
  )
}

function VideoCard({ video }: { video: Article }) {
  const { i18n } = useTranslation()
  return (
    <article className="group">
      <Link to={`/news/${video.slug}`} className="block overflow-hidden border border-ink-200">
        {video.youtube_url ? (
          <YouTubeThumbnail
            url={video.youtube_url}
            languageId={video.article_language}
          />
        ) : video.featured_image ? (
          <CoverImage src={video.featured_image} alt={video.title} className="h-auto w-full" />
        ) : null}
      </Link>
      <div className="mt-2.5">
        <h3 className="font-serif text-sm font-bold leading-snug text-ink-950">
          <Link to={`/news/${video.slug}`} className="hover:text-brand-800 transition-colors line-clamp-2">
            {video.title}
          </Link>
        </h3>
        <p className="mt-1.5 text-[11px] text-ink-500">
          {video.author.full_name} · {formatDate(video.published_at ?? video.created_at, i18n.resolvedLanguage)}
        </p>
      </div>
    </article>
  )
}

export function VideosPage() {
  const { t } = useTranslation()
  const { data, loading, error, reload } = useAsync(
    () => articlesApi.videos(50),
    [],
  )

  return (
    <>
      <Seo title={t('videos.title')} description={t('videos.subtitle')} />

      {/* Live Studio Banner */}
      <LiveStudioBanner />

      {/* Top Ad */}
      <div className="my-6">
        <AdSlot slot="top-banner" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8 text-brand-800" />
        </div>
      ) : error || !data ? (
        <ErrorState message={error ?? undefined} onRetry={reload} />
      ) : data.articles.length === 0 ? (
        <EmptyState message={t('videos.noVideos')} />
      ) : (
        <>
          {/* First video large */}
          {data.articles[0] && (
            <div className="mb-8">
              <VideoCardLarge video={data.articles[0]} />
            </div>
          )}

          {/* Video Grid */}
          {data.articles.length > 1 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.articles.slice(1).map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}

          {/* In-feed Ad */}
          <div className="mt-8">
            <AdSlot slot="in-feed-2" />
          </div>
        </>
      )}
    </>
  )
}
