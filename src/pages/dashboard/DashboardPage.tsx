import { useParams } from 'react-router-dom'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import type { UserRole } from '@/types'
import { PanelSwitcher } from './Panels'

const SECTIONS: Record<UserRole, string[]> = {
  admin: [
    'overview',
    'managers',
    'journalists',
    'articles',
    'categories',
    'media',
    'ads',
    'activity',
    'settings',
  ],
  manager: [
    'overview',
    'journalists',
    'articles',
    'categories',
    'media',
    'ads',
    'activity',
  ],
  journalist: [
    'overview',
    'my-articles',
    'create-article',
    'drafts',
    'published',
    'media',
    'my-profile',
  ],
}

export function DashboardPage({ role }: { role: UserRole }) {
  const params = useParams<{ section?: string }>()
  const section = params.section ?? 'overview'
  const sections = SECTIONS[role]
  const activeKey = sections.includes(section) ? section : 'overview'

  return (
    <DashboardLayout
      role={role}
      navItems={sections.map((key) => ({ key }))}
      activeKey={activeKey}
    >
      <PanelSwitcher role={role} activeKey={activeKey} />
    </DashboardLayout>
  )
}