import { useTranslation } from 'react-i18next'

import type { LanguageCode } from '@/types'
import { getYouTubeVideoId } from '@/lib/utils'
import { cn } from '@/lib/utils'

const THUMBNAIL_URL = 'https://i.ytimg.com/vi'

export function YouTubeEmbed({
  url,
  title,
  className,
}: {
  url: string
  title?: string
  className?: string
}) {
  const videoId = getYouTubeVideoId(url)
  const { t } = useTranslation()

  if (!videoId) return null

  return (
    <div
      className={cn(
        'aspect-video overflow-hidden rounded-xl bg-ink-950',
        className,
      )}
    >
      <iframe
        className="h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title={title ?? t('article.video')}
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  )
}

export function YouTubeThumbnail({
  url,
  languageId,
  className,
}: {
  url: string
  languageId: LanguageCode
  className?: string
}) {
  const videoId = getYouTubeVideoId(url)
  if (!videoId) return null

  return (
    <div
      className={cn(
        'relative aspect-video overflow-hidden rounded-lg bg-ink-950',
        className,
      )}
    >
      <img
        src={`${THUMBNAIL_URL}/${videoId}/hqdefault.jpg`}
        alt={languageId}
        loading="lazy"
        className="h-full w-full object-cover"
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-700 text-white shadow-lg">
          <svg
            viewBox="0 0 24 24"
            className="ml-0.5 h-5 w-5"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </div>
  )
}