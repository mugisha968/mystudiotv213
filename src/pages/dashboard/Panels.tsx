import { useTranslation } from 'react-i18next'

import { useAsync } from '@/hooks/useAsync'
import {
  isAdminStats,
  isManagerStats,
  statsApi,
} from '@/lib/services'
import type { UserRole } from '@/types'
import { LoadingBlock, PanelError, StatCard } from './panels/common'
import { ManagersPanel, JournalistsPanel } from './panels/people'
import { ArticlesPanel, MyArticlesPanel, DraftsPanel, PublishedPanel, RecentsPanel } from './panels/articles'
import { CategoriesPanel } from './panels/categories'
import { MediaPanel } from './panels/media'
import { SettingsPanel, MyProfilePanel } from './panels/settings'
import { CreateArticlePanel } from './panels/editor'
import { AdsPanel } from './panels/ads'

export function PanelSwitcher({
  role,
  activeKey,
}: {
  role: UserRole
  activeKey: string
}) {
  return (
    <div className="space-y-8">
      {activeKey === 'overview' && <OverviewPanel role={role} />}
      {activeKey === 'managers' && <ManagersPanel />}
      {activeKey === 'journalists' && <JournalistsPanel />}
      {activeKey === 'articles' && <ArticlesPanel />}
      {activeKey === 'categories' && <CategoriesPanel />}
      {activeKey === 'activity' && <RecentsPanel />}
      {activeKey === 'settings' && <SettingsPanel />}
      {activeKey === 'media' && <MediaPanel />}
      {activeKey === 'ads' && <AdsPanel />}
      {activeKey === 'create-article' && <CreateArticlePanel />}
      {activeKey === 'my-articles' && <MyArticlesPanel />}
      {activeKey === 'drafts' && <DraftsPanel />}
      {activeKey === 'published' && <PublishedPanel />}
      {activeKey === 'my-profile' && <MyProfilePanel />}
    </div>
  )
}

export function OverviewPanel({ role }: { role: UserRole }) {
  const { t } = useTranslation()
  const { data, loading, error, reload } = useAsync(() => statsApi.get(), [role])

  if (loading) return <LoadingBlock />
  if (error || !data) return <PanelError error={error} onRetry={reload} />

  const stats = data.stats
  const cards: Array<{ label: string; value: number }> = []

  if (isAdminStats(stats)) {
    cards.push(
      { label: t('dashboard.managers'), value: stats.managers },
      { label: t('dashboard.journalists'), value: stats.journalists },
      { label: t('dashboard.statArticles'), value: stats.articles },
      { label: t('dashboard.statCategories'), value: stats.categories },
      { label: t('status.published'), value: stats.publishedArticles },
      { label: t('status.draft'), value: stats.draftArticles },
      { label: t('status.archived'), value: stats.archivedArticles },
      { label: t('dashboard.activeSessions'), value: stats.activeSessions },
    )
  } else if (isManagerStats(stats)) {
    cards.push(
      { label: t('dashboard.journalists'), value: stats.journalists },
      { label: t('dashboard.statArticles'), value: stats.articles },
      { label: t('dashboard.statCategories'), value: stats.categories },
      { label: t('status.published'), value: stats.publishedArticles },
      { label: t('status.draft'), value: stats.draftArticles },
      { label: t('status.archived'), value: stats.archivedArticles },
    )
  } else {
    cards.push(
      { label: t('status.published'), value: stats.publishedArticles },
      { label: t('status.draft'), value: stats.draftArticles },
      { label: t('status.archived'), value: stats.archivedArticles },
      { label: t('dashboard.statArticles'), value: stats.articles },
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.label} label={card.label} value={card.value} />
      ))}
    </div>
  )
}