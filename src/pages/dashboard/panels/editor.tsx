import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field, Select, TextArea, TextInput } from '@/components/ui/Field'
import { ImageUploader } from '@/components/ui/ImageUploader'
import { Spinner } from '@/components/ui/Spinner'
import { useAction } from '@/hooks/useAction'
import { useAsync } from '@/hooks/useAsync'
import { articlesApi, categoriesApi } from '@/lib/services'
import { resolveMediaUrl } from '@/lib/api'
import { slugify } from '@/lib/utils'
import type {
  Article,
  ArticleInput,
  ArticleStatus,
  Category,
  LanguageCode,
} from '@/types'
import { InlineError } from './common'

interface ArticleFormProps {
  article?: Article | null
  onSaved: () => void
  submitLabel: string
}

function buildFormState(article?: Article | null) {
  return {
    title: article?.title ?? '',
    category_id: article?.category_id ? String(article.category_id) : '',
    language: (article?.article_language ?? 'en') as LanguageCode,
    featured_image: article?.featured_image ?? '',
    images: article?.images ?? [],
    youtube_url: article?.youtube_url ?? '',
    tags: (article?.tags ?? []).join(', '),
    content: article?.content ?? '',
    status: (article?.status ?? 'draft') as ArticleStatus,
  }
}

export function ArticleForm({ article, onSaved, submitLabel }: ArticleFormProps) {
  const { t } = useTranslation()
  const action = useAction<{ article: Article }>()
  const [form, setForm] = useState(() => buildFormState(article))
  const categoriesQuery = useAsync(() => categoriesApi.list(), [])

  const categories: Category[] = categoriesQuery.data?.categories ?? []

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function submit() {
    const input: ArticleInput = {
      title: form.title.trim(),
      content: form.content,
      article_language: form.language,
      category_id: form.category_id ? Number(form.category_id) : null,
      featured_image: form.featured_image.trim() || null,
      images: form.images,
      youtube_url: form.youtube_url.trim() || null,
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    }
    if (article) {
      const result = await action.run(() => articlesApi.update(article.id, input))
      if (result) onSaved()
    } else {
      input.status = form.status
      const result = await action.run(() => articlesApi.create(input))
      if (result) onSaved()
    }
  }

  return (
    <div className="space-y-5">
      <InlineError message={action.error} />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Field label={t('articles.title')}>
            <TextInput
              value={form.title}
              onChange={(event) => set('title', event.target.value)}
              placeholder={t('articles.titlePlaceholder')}
            />
          </Field>
          <Field label={t('articles.content')} hint={t('articles.contentHint')}>
            <TextArea
              value={form.content}
              onChange={(event) => set('content', event.target.value)}
              className="min-h-56"
            />
          </Field>
        </div>

        <div className="space-y-4">
          <Field label={t('articles.coverImage')}>
            <ImageUploader
              dest="article-image"
              value={form.featured_image || null}
              onUploaded={(url) => set('featured_image', url)}
            />
          </Field>
          <Field label={t('articles.coverImageUrl')}>
            <TextInput
              value={form.featured_image}
              onChange={(event) => set('featured_image', event.target.value)}
              placeholder="/uploads/article-images/…"
            />
          </Field>

          {form.images.length > 0 && (
            <div className="space-y-2">
              {form.images.map((image, index) => (
                <div key={`${image}-${index}`} className="flex items-center gap-2">
                  <img src={resolveMediaUrl(image)} alt="" className="h-10 w-10 shrink-0 rounded object-cover" />
                  <span className="truncate text-xs text-ink-500">{image}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      set(
                        'images',
                        form.images.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                  >
                    {t('common.remove')}
                  </Button>
                </div>
              ))}
            </div>
          )}
          <Field label={t('articles.additionalImages')}>
            <ImageUploader
              dest="article-image"
              onUploaded={(url) => set('images', [...form.images, url])}
            />
          </Field>

          <Field label={t('articles.youtubeUrl')} hint={t('articles.youtubeHint')}>
            <TextInput
              value={form.youtube_url}
              onChange={(event) => set('youtube_url', event.target.value)}
              placeholder="https://www.youtube.com/watch?v=…"
            />
          </Field>

          <Field label={t('articles.tags')} hint={t('articles.tagsHint')}>
            <TextInput
              value={form.tags}
              onChange={(event) => set('tags', event.target.value)}
            />
          </Field>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label={t('articles.category')}>
          <Select
            value={form.category_id}
            onChange={(event) => set('category_id', event.target.value)}
          >
            <option value="">{t('articles.noCategory')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {t(`categories.${category.name_key}.name`, {
                  defaultValue: category.name_key,
                })}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t('articles.language')}>
          <Select
            value={form.language}
            onChange={(event) => set('language', event.target.value as LanguageCode)}
          >
            <option value="rw">{t('languages.rw')}</option>
            <option value="en">{t('languages.en')}</option>
            <option value="fr">{t('languages.fr')}</option>
          </Select>
        </Field>
        {!article && (
          <Field label={t('articles.initialStatus')}>
            <Select
              value={form.status}
              onChange={(event) => set('status', event.target.value as ArticleStatus)}
            >
              <option value="draft">{t('status.draft')}</option>
              <option value="published">{t('status.published')}</option>
            </Select>
          </Field>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-ink-200 pt-4">
        <p className="mr-auto text-xs text-ink-500">
          {t('articles.slugPreview', { slug: slugify(form.title) || '…' })}
        </p>
        <Button onClick={submit} disabled={action.busy}>
          {action.busy && <Spinner className="h-4 w-4 text-white" />}
          {submitLabel}
        </Button>
      </div>
    </div>
  )
}

export function CreateArticlePanel() {
  const { t } = useTranslation()
  const [notice, setNotice] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  return (
    <Card className="p-6">
      <h2 className="mb-4 font-serif text-xl font-bold text-ink-950">
        {t('dashboard.createArticle')}
      </h2>
      {notice && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          {notice}
        </div>
      )}
      <ArticleForm
        key={version}
        submitLabel={t('articles.saveArticle')}
        onSaved={() => {
          setVersion((value) => value + 1)
          setNotice(t('articles.savedNotice'))
        }}
      />
    </Card>
  )
}