import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { useAuth } from '@/auth/AuthContext'
import { VerificationStatus } from '@/components/badges/VerificationStatus'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { CoverImage } from '@/components/ui/CoverImage'
import { Modal } from '@/components/ui/Modal'
import { StatusPill } from '@/components/ui/StatusPill'
import { useAction } from '@/hooks/useAction'
import { useAsync } from '@/hooks/useAsync'
import { articlesApi } from '@/lib/services'
import { formatDate } from '@/lib/utils'
import type { Article, ArticleStatus } from '@/types'
import {
  InlineError,
  LoadingBlock,
  PanelError,
  Section,
  StatusTabs,
} from './common'
import { ArticleForm } from './editor'

interface RowProps {
  article: Article
  isStaff: boolean
  locale: string
  onChanged: () => void
}

function ArticleActions({ article, isStaff, onChanged }: RowProps) {
  const { t } = useTranslation()
  const action = useAction<unknown>()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editing, setEditing] = useState(false)

  async function run(fn: () => Promise<unknown>, thenClose?: boolean) {
    const result = await action.run(() => fn())
    if (result !== null) {
      if (thenClose) setConfirmDelete(false)
      onChanged()
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <InlineError message={action.error} />
      <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
        {t('common.edit')}
      </Button>
      {article.status === 'published' ? (
        <Button variant="ghost" size="sm" onClick={() => run(() => articlesApi.unpublish(article.id))}>
          {t('articles.unpublish')}
        </Button>
      ) : (
        <Button variant="secondary" size="sm" onClick={() => run(() => articlesApi.publish(article.id))}>
          {t('articles.publish')}
        </Button>
      )}
      {article.status !== 'archived' && (
        <Button variant="ghost" size="sm" onClick={() => run(() => articlesApi.archive(article.id))}>
          {t('articles.archive')}
        </Button>
      )}
      {isStaff && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => run(() => articlesApi.setFeatured(article.id, !article.featured))}
        >
          {article.featured ? t('articles.unfeature') : t('articles.feature')}
        </Button>
      )}
      <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
        {t('common.delete')}
      </Button>

      <Modal
        open={editing}
        title={t('articles.editTitle')}
        onClose={() => setEditing(false)}
        size="lg"
      >
        <ArticleForm
          article={article}
          submitLabel={t('common.save')}
          onSaved={() => {
            setEditing(false)
            onChanged()
          }}
        />
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        title={t('articles.deleteTitle')}
        description={t('articles.deleteDescription', { title: article.title })}
        confirmLabel={t('common.delete')}
        busy={action.busy}
        onConfirm={() => run(() => articlesApi.remove(article.id), true)}
        onClose={() => setConfirmDelete(false)}
      />
    </div>
  )
}

function ArticleRow({
  article,
  isStaff,
  locale,
  onChanged,
  compact,
}: RowProps & { compact?: boolean }) {
  const { t } = useTranslation()
  return (
    <li className="flex flex-col gap-3 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <CoverImage
          src={article.featured_image}
          alt={article.title}
          className="h-20 w-full shrink-0 rounded-md sm:w-28"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={article.status} />
            {article.featured && (
              <span className="inline-flex items-center rounded-full bg-gold-100 px-2 py-0.5 text-xs font-semibold text-gold-800">
                {t('articles.featuredLabel')}
              </span>
            )}
            <span className="text-xs text-ink-500">
              {t('articles.views', { count: article.views })}
            </span>
          </div>
          <Link
            to={`/news/${article.slug}`}
            className="mt-1 line-clamp-2 font-semibold text-ink-950 hover:text-brand-800"
          >
            {article.title}
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
            <span className="flex items-center gap-1">
              {article.author.full_name || t('journalists.title')}
              <VerificationStatus
                verified={article.author.verified}
                blueBadge={article.author.blue_badge}
                compact
              />
            </span>
            {article.category && (
              <span>
                {t(`categories.${article.category.name_key}.name`, {
                  defaultValue: article.category.name_key,
                })}
              </span>
            )}
            <span>{formatDate(article.published_at ?? article.created_at, locale)}</span>
            {!compact && (
              <span>
                {t('articles.updated')} {formatDate(article.updated_at, locale)}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-ink-100 pt-3">
        <ArticleActions
          article={article}
          isStaff={isStaff}
          locale={locale}
          onChanged={onChanged}
        />
      </div>
    </li>
  )
}

interface ListProps {
  articles: Article[]
  locale: string
  isStaff: boolean
  onChanged: () => void
  compact?: boolean
}

function ArticleList({ articles, locale, isStaff, onChanged, compact }: ListProps) {
  if (articles.length === 0) return <EmptyState />
  return (
    <Card className="overflow-hidden">
      <ul className="divide-y divide-ink-100">
        {articles.map((article) => (
          <ArticleRow
            key={article.id}
            article={article}
            isStaff={isStaff}
            locale={locale}
            onChanged={onChanged}
            compact={compact}
          />
        ))}
      </ul>
    </Card>
  )
}

export function ArticlesPanel() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const isStaff = user?.role === 'admin' || user?.role === 'manager'
  const [status, setStatus] = useState<string>('all')
  const { data, loading, error, reload } = useStaffArticles(status)

  return (
    <Section
      title={t('dashboard.articles')}
      action={<StatusTabs value={status} onChange={setStatus} />}
    >
      {loading ? (
        <LoadingBlock />
      ) : error || !data ? (
        <PanelError error={error} onRetry={reload} />
      ) : (
        <ArticleList
          articles={data.articles}
          locale={i18n.resolvedLanguage ?? 'en'}
          isStaff={isStaff}
          onChanged={reload}
        />
      )}
    </Section>
  )
}

function useStaffArticles(status: string) {
  return useAsync(
    () => articlesApi.staffAll(status === 'all' ? undefined : (status as ArticleStatus)),
    [status],
  )
}

export function MyArticlesPanel() {
  const { t, i18n } = useTranslation()
  const [status, setStatus] = useState<string>('all')
  const query = useMyArticles(status)

  return (
    <Section
      title={t('dashboard.myArticles')}
      action={<StatusTabs value={status} onChange={setStatus} />}
    >
      <MyArticlesList query={query} locale={i18n.resolvedLanguage ?? 'en'} />
    </Section>
  )
}

export function DraftsPanel() {
  const { t, i18n } = useTranslation()
  return (
    <Section title={t('dashboard.drafts')}>
      <MyArticlesList query={useMyArticles('draft')} locale={i18n.resolvedLanguage ?? 'en'} />
    </Section>
  )
}

export function PublishedPanel() {
  const { t, i18n } = useTranslation()
  return (
    <Section title={t('dashboard.published')}>
      <MyArticlesList query={useMyArticles('published')} locale={i18n.resolvedLanguage ?? 'en'} />
    </Section>
  )
}

function useMyArticles(status: string) {
  return useAsync(
    () => articlesApi.journalistMine(status === 'all' ? undefined : (status as ArticleStatus)),
    [status],
  )
}

function MyArticlesList({
  query,
  locale,
}: {
  query: ReturnType<typeof useMyArticles>
  locale: string
}) {
  if (query.loading) return <LoadingBlock />
  if (query.error || !query.data) {
    return <PanelError error={query.error} onRetry={query.reload} />
  }
  return (
    <ArticleList
      articles={query.data.articles}
      locale={locale}
      isStaff={false}
      onChanged={query.reload}
    />
  )
}

export function RecentsPanel() {
  const { t, i18n } = useTranslation()
  const query = useAsync(() => articlesApi.staffAll(undefined), [])

  if (query.loading) return <LoadingBlock />
  if (query.error || !query.data) {
    return <PanelError error={query.error} onRetry={query.reload} />
  }
  const recents = [...query.data.articles]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 10)
  return (
    <Section title={t('dashboard.recentArticles')}>
      <ArticleList
        articles={recents}
        locale={i18n.resolvedLanguage ?? 'en'}
        isStaff
        onChanged={query.reload}
        compact
      />
    </Section>
  )
}