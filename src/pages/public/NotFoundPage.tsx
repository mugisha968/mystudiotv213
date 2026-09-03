import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Seo } from '@/components/ui/Seo'

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <>
      <Seo title={t('notFound.title')} />
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <p className="font-display text-8xl text-brand-800">404</p>
        <h1 className="mt-4 font-serif text-2xl font-bold text-ink-950">
          {t('notFound.title')}
        </h1>
        <p className="mt-2 text-ink-600">{t('notFound.description')}</p>
        <Link
          to="/"
          className="mt-6 bg-brand-800 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {t('notFound.home')}
        </Link>
      </div>
    </>
  )
}
