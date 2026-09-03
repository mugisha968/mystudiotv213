export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function formatDate(
  input: string | null | undefined,
  locale = 'en',
): string {
  if (!input) return ''
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return ''
  const resolvedLocale = resolveDateLocale(locale)
  try {
    return new Intl.DateTimeFormat(resolvedLocale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  } catch {
    return new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }
}

function resolveDateLocale(locale: string): string {
  if (locale === 'rw') {
    try {
      new Intl.DateTimeFormat('rw-RW')
      return 'rw-RW'
    } catch {
      return 'en'
    }
  }
  return locale
}

export function getYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/,
    /youtube\.com\/watch\?.*[?&]v=([\w-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match) return match[1]
  }

  if (/^[\w-]{11}$/.test(trimmed)) return trimmed
  return null
}

export function buildYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}