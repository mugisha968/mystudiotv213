import { useTranslation } from 'react-i18next'

import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ImageUploader } from '@/components/ui/ImageUploader'
import { useAsync } from '@/hooks/useAsync'
import { useAction } from '@/hooks/useAction'
import { uploadsApi } from '@/lib/services'
import { resolveMediaUrl } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import type { MediaItem } from '@/types'
import { InlineError, LoadingBlock, PanelError, Section } from './common'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MediaPanel() {
  const { t, i18n } = useTranslation()
  const { data, loading, error, reload } = useAsync(() => uploadsApi.list(), [])
  const action = useAction<unknown>()

  const media: MediaItem[] = data?.media ?? []

  return (
    <Section title={t('dashboard.media')} subtitle={t('media.subtitle')}>
      <Card className="p-5">
        <p className="mb-3 text-sm font-semibold text-ink-800">{t('media.uploadNew')}</p>
        <ImageUploader
          dest="article-image"
          onUploaded={async () => {
            await action.run(() => Promise.resolve(undefined))
            reload()
          }}
        />
        <InlineError message={action.error} />
      </Card>

      {loading ? (
        <LoadingBlock />
      ) : error || !data ? (
        <PanelError error={error} onRetry={reload} />
      ) : media.length === 0 ? (
        <EmptyState message={t('media.empty')} />
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-ink-100">
            {media.map((item) => (
              <li key={item.url} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                <img
                  src={resolveMediaUrl(item.url)}
                  alt=""
                  className="h-14 w-20 shrink-0 rounded-md object-cover ring-1 ring-ink-200"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{item.url}</p>
                  <p className="text-xs text-ink-500">
                    {item.kind === 'avatar' ? t('media.avatar') : t('media.articleImage')} ·{' '}
                    {formatBytes(item.size_bytes)} · {formatDate(item.modified_at, i18n.resolvedLanguage)}
                    {item.user_id ? ` · ${t('media.byUserId', { id: item.user_id })}` : ''}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </Section>
  )
}