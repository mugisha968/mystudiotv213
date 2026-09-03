import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, useNavigate } from 'react-router-dom'

import { useAuth } from '@/auth/AuthContext'
import { BrandMark } from '@/components/brand/BrandMark'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { Avatar } from '@/components/ui/Avatar'
import { ROLE_LABEL_KEYS, type UserRole } from '@/types'
import { cn } from '@/lib/utils'

export interface DashboardNavItem {
  key: string
}

interface DashboardLayoutProps {
  role: UserRole
  navItems: DashboardNavItem[]
  activeKey: string
  children: React.ReactNode
}

export function DashboardLayout({
  role,
  navItems,
  activeKey,
  children,
}: DashboardLayoutProps) {
  const { t } = useTranslation()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [activeKey])

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const sidebar = (
    <aside className="flex h-full flex-col bg-brand-950 text-white">
      <div className="border-b border-brand-800 px-5 py-5">
        <Link to="/" className="inline-block">
          <BrandMark />
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label={t('nav.dashboard')}>
        {navItems.map((item) => (
          <NavLink
            key={item.key}
            to={`/dashboard/${role}/${item.key}`}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                isActive || item.key === activeKey
                  ? 'bg-brand-800 text-white'
                  : 'text-brand-100/80 hover:bg-brand-900 hover:text-white',
              )
            }
          >
            {t(`dashboard.${item.key}`)}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-brand-800 p-4">
        <div className="flex items-center gap-3">
          <Avatar
            src={user?.avatar_path}
            name={user?.full_name ?? ''}
            size="sm"
            className="border border-brand-700"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user?.full_name}</p>
            <p className="truncate text-xs text-brand-200/80">
              {t(ROLE_LABEL_KEYS[user?.role ?? 'journalist'])}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )

  return (
    <div className="flex min-h-screen bg-ink-50">
      <div className="sticky top-0 hidden h-screen w-64 shrink-0 md:block">
        {sidebar}
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-ink-950/60"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative h-full w-64 bg-brand-950">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-ink-200 bg-white px-4 py-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-ink-200 text-ink-700 md:hidden"
            aria-label={t('nav.more')}
            onClick={() => setMobileOpen(true)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <div className="hidden text-sm text-ink-500 sm:block">
            {t('nav.dashboard')} · {t(ROLE_LABEL_KEYS[role])}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden lg:block">
              <LanguageSwitcher />
            </div>
            <Link
              to="/"
              className="hidden rounded-md border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-100 sm:block"
            >
              {t('nav.backToSite')}
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-md bg-ink-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-ink-800"
            >
              {t('nav.logout')}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}