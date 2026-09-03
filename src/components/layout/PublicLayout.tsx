import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '@/auth/AuthContext'
import { BrandLink, BrandMark } from '@/components/brand/BrandMark'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { useAsync } from '@/hooks/useAsync'
import { articlesApi } from '@/lib/services'
import { BreakingNewsBar } from '@/components/news/BreakingNewsBar'
import { AdSlot } from '@/components/news/AdSlot'
import { cn } from '@/lib/utils'

const mainNavItems: Array<{ to: string; key: string; end?: boolean }> = [
  { to: '/', key: 'home', end: true },
  { to: '/categories/rwanda', key: 'rwanda' },
  { to: '/categories/politics', key: 'politics' },
  { to: '/categories/business', key: 'business' },
  { to: '/categories/sports', key: 'sports' },
  { to: '/categories/international', key: 'world' },
  { to: '/categories/technology', key: 'technology' },
  { to: '/videos', key: 'videos' },
]

function CurrentDate() {
  const [date, setDate] = useState(() => new Date())
  useEffect(() => {
    const interval = window.setInterval(() => setDate(new Date()), 60_000)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <span className="hidden text-xs text-ink-500 lg:inline">
      {date.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}
    </span>
  )
}

export function PublicLayout() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const breakingQuery = useAsync(() => articlesApi.breaking(5), [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.search])

  const breakingArticles = breakingQuery.data?.articles ?? []

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Breaking News Strip */}
      {breakingArticles.length > 0 && <BreakingNewsBar articles={breakingArticles} />}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-ink-200 bg-white">
        {/* Utility Bar */}
        <div className="border-b border-ink-100 bg-ink-50">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1">
            <nav className="hidden items-center gap-4 lg:flex">
              <Link to="/about" className="text-[11px] font-semibold uppercase tracking-wide text-ink-500 hover:text-brand-800">
                {t('nav.about')}
              </Link>
              <Link to="/about#contact" className="text-[11px] font-semibold uppercase tracking-wide text-ink-500 hover:text-brand-800">
                {t('nav.contact')}
              </Link>
              <Link to="/journalists" className="text-[11px] font-semibold uppercase tracking-wide text-ink-500 hover:text-brand-800">
                {t('nav.journalists')}
              </Link>
              <Link to="/categories" className="text-[11px] font-semibold uppercase tracking-wide text-ink-500 hover:text-brand-800">
                {t('nav.categories')}
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <span className="hidden h-3 w-px bg-ink-300 lg:inline" />
              <CurrentDate />
              {user ? (
                <Link
                  to="/dashboard"
                  className="text-[11px] font-semibold text-brand-800 hover:underline"
                >
                  {t('nav.dashboard')}
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="text-[11px] font-semibold text-ink-600 hover:text-ink-900"
                >
                  {t('nav.login')}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Masthead */}
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-5 sm:py-6">
          <BrandLink />
          <span className="font-brand text-[10px] font-bold uppercase tracking-[0.3em] text-ink-500">
            Online Edition
          </span>
        </div>

        {/* Main Navigation */}
        <nav className="hidden border-t border-ink-200 bg-white md:block">
          <ul className="mx-auto flex max-w-7xl items-center justify-between gap-0 px-4">
            {mainNavItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className="block border-b-[3px] border-transparent px-3 py-2.5 font-brand text-[13px] font-bold uppercase tracking-wide text-ink-700 transition-colors hover:border-amber-500 hover:text-ink-950 aria-[current=page]:border-brand-800 aria-[current=page]:text-brand-800"
                >
                  {t(`nav.${item.key}`)}
                </NavLink>
              </li>
            ))}
            <li className="ml-1">
              <NavLink
                to="/search"
                className="flex items-center gap-1.5 border border-ink-300 px-3 py-1.5 font-brand text-[12px] font-semibold text-ink-600 transition-colors hover:border-brand-800 hover:text-brand-800"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                {t('nav.search')}
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="fixed right-4 bottom-4 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-800 text-white shadow-lg md:hidden"
          aria-expanded={menuOpen}
          aria-label={t('nav.more')}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" aria-hidden="true">
            {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>

        {/* Mobile menu overlay */}
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-ink-950/50 md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <nav className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-white shadow-xl md:hidden">
              <div className="flex items-center justify-between border-b border-ink-200 px-4 py-4">
                <BrandMark variant="compact" />
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center text-ink-500 hover:text-ink-800"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
              <ul className="space-y-0.5 px-3 py-3">
                {mainNavItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        cn(
                          'block px-3 py-2.5 font-brand text-sm font-semibold',
                          isActive
                            ? 'bg-brand-800 text-white'
                            : 'text-ink-700 hover:bg-ink-50',
                        )
                      }
                    >
                      {t(`nav.${item.key}`)}
                    </NavLink>
                  </li>
                ))}
                <li>
                  <NavLink
                    to="/search"
                    className="block px-3 py-2.5 font-brand text-sm font-semibold text-ink-700 hover:bg-ink-50"
                  >
                    {t('nav.search')}
                  </NavLink>
                </li>
              </ul>
              <div className="border-t border-ink-200 px-4 py-4">
                <LanguageSwitcher className="w-full justify-center" />
                <div className="mt-3">
                  {user ? (
                    <Link
                      to="/dashboard"
                      className="block w-full bg-brand-800 px-3 py-2 text-center text-sm font-semibold text-white"
                    >
                      {t('nav.dashboard')}
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="block w-full border border-ink-300 px-3 py-2 text-center text-sm font-semibold text-ink-800"
                    >
                      {t('nav.login')}
                    </Link>
                  )}
                </div>
              </div>
            </nav>
          </>
        )}
      </header>

      {/* Top advertisement banner */}
      <div className="hidden justify-center bg-ink-50 py-2 sm:flex">
        <AdSlot slot="top-banner" />
      </div>

      <main className="mx-auto w-full flex-1 px-4 py-6 sm:py-8" style={{ maxWidth: '80rem' }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-brand-800 bg-ink-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="inline-flex flex-col gap-1">
                <span className="font-serif text-xl font-black tracking-tight text-white">
                  MyStudio<span className="text-brand-400">TV</span>
                  <span className="text-amber-400">231</span>
                </span>
                <span className="font-brand text-[9px] font-bold uppercase tracking-[0.3em] text-white/50">
                  News&nbsp;·&nbsp;Media&nbsp;·&nbsp;Broadcasting
                </span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-400">
                {t('footer.tagline')}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <a
                  href="https://www.youtube.com/@MyStudioTV231"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center bg-ink-800 text-ink-400 transition-colors hover:bg-live hover:text-white"
                  aria-label="YouTube"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Sections */}
            <div>
              <h4 className="font-brand text-xs font-bold uppercase tracking-wider text-amber-400">
                {t('footer.sections')}
              </h4>
              <ul className="mt-3 space-y-2">
                {mainNavItems.filter(i => i.key !== 'videos').map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="text-sm text-ink-400 transition-colors hover:text-white"
                    >
                      {t(`nav.${item.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-brand text-xs font-bold uppercase tracking-wider text-amber-400">
                {t('categories.title')}
              </h4>
              <ul className="mt-3 space-y-2">
                {['rwanda', 'politics', 'business', 'sports', 'technology', 'entertainment'].map(
                  (key) => (
                    <li key={key}>
                      <Link
                        to={`/categories/${key}`}
                        className="text-sm text-ink-400 transition-colors hover:text-white"
                      >
                        {t(`categories.${key}.name`)}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* About & Contact */}
            <div>
              <h4 className="font-brand text-xs font-bold uppercase tracking-wider text-amber-400">
                {t('footer.about')}
              </h4>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link to="/about" className="text-sm text-ink-400 transition-colors hover:text-white">
                    {t('nav.about')}
                  </Link>
                </li>
                <li>
                  <Link to="/journalists" className="text-sm text-ink-400 transition-colors hover:text-white">
                    {t('nav.journalists')}
                  </Link>
                </li>
                <li>
                  <Link to="/videos" className="text-sm text-ink-400 transition-colors hover:text-white">
                    {t('nav.videos')}
                  </Link>
                </li>
                <li>
                  <Link to="/search" className="text-sm text-ink-400 transition-colors hover:text-white">
                    {t('nav.search')}
                  </Link>
                </li>
                <li className="pt-2">
                  <span className="text-sm text-ink-500">{t('footer.contactEmail')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-ink-800">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-4 sm:flex-row sm:justify-between">
            <p className="text-xs text-ink-500">
              &copy; {new Date().getFullYear()} MyStudioTV231. {t('footer.rights')}
            </p>
            <div className="flex items-center gap-4">
              <Link to="/about" className="text-xs text-ink-500 hover:text-white">{t('nav.about')}</Link>
              <Link to="/about#contact" className="text-xs text-ink-500 hover:text-white">{t('nav.contact')}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
