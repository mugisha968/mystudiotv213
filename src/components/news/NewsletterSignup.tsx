import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export function NewsletterSignup() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (email.trim()) {
      setSubmitted(true)
    }
  }

  return (
    <section className="border-t border-b border-ink-200 bg-ink-50">
      <div className="mx-auto max-w-3xl px-4 py-10 text-center sm:py-14">
        <h3 className="font-display text-2xl tracking-wide text-brand-800 sm:text-3xl">
          {t('newsletter.title')}
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink-600">
          {t('newsletter.description')}
        </p>

        {submitted ? (
          <p className="mt-6 text-sm font-semibold text-brand-800">
            {t('newsletter.subscribed')}
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-6 flex max-w-md gap-2"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('newsletter.emailPlaceholder')}
              required
              className="min-w-0 flex-1 border border-ink-300 bg-white px-4 py-2.5 text-sm placeholder:text-ink-400 focus:border-brand-800 focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 bg-brand-800 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              {t('newsletter.subscribe')}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
