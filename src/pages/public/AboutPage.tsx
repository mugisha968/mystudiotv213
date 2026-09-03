import { useTranslation } from 'react-i18next'

import { Seo } from '@/components/ui/Seo'

export function AboutPage() {
  const { t } = useTranslation()

  return (
    <>
      <Seo title={t('about.title')} />

      {/* Page Header */}
      <div className="mb-8 border-b-[3px] border-brand-800 pb-4">
        <h1 className="font-display text-3xl tracking-wide text-brand-800 sm:text-4xl">
          {t('about.title')}
        </h1>
      </div>

      <div className="mx-auto max-w-3xl space-y-6">
        <p className="text-lg leading-[1.75] text-ink-800">
          {t('about.paragraphOne')}
        </p>
        <p className="text-lg leading-[1.75] text-ink-800">
          {t('about.paragraphTwo')}
        </p>
        <p className="text-lg leading-[1.75] text-ink-800">
          {t('about.paragraphThree')}
        </p>
      </div>
    </>
  )
}
