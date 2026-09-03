import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { uploadsApi } from '@/lib/services'

const ACCEPTED = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml']
const MAX_BYTES = 5 * 1024 * 1024

interface ImageUploaderProps {
  dest: 'avatar' | 'article-image'
  onUploaded: (url: string) => void
  value?: string | null
  className?: string
}

export function ImageUploader({ dest, onUploaded, value, className }: ImageUploaderProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError(null)
    if (!ACCEPTED.includes(file.type)) {
      setError(t('media.unsupportedType'))
      return
    }
    if (file.size > MAX_BYTES) {
      setError(t('media.tooLarge'))
      return
    }
    setUploading(true)
    try {
      const { url } = await uploadsApi.upload(file, dest)
      onUploaded(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-3">
        {value && (
          <img
            src={value}
            alt=""
            className={
              dest === 'avatar'
                ? 'h-16 w-16 rounded-full object-cover ring-1 ring-ink-200'
                : 'h-16 w-28 rounded-md object-cover ring-1 ring-ink-200'
            }
          />
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading && <Spinner className="h-4 w-4 text-brand-800" />}
          {value ? t('media.replace') : t('media.choose')}
        </Button>
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-red-700">{error}</p>}
    </div>
  )
}