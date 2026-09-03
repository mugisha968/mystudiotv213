import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { authApi } from '@/lib/services'
import { ApiError } from '@/lib/api'
import { cn } from '@/lib/utils'

export function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const value = email.trim()
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError(t('auth.invalidEmail'))
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await authApi.requestReset(value)
      setSent(true)
    } catch (err) {
      setError(
        err instanceof ApiError && err.message
          ? err.message
          : t('common.error'),
      )
      setSent(false)
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (hasError: boolean) =>
    cn(
      'w-full rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm placeholder:text-ink-400 focus:outline-none focus:ring-2',
      hasError
        ? 'border-red-400 focus:ring-red-200'
        : 'focus:border-brand-700 focus:ring-brand-200',
    )

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-ink-200 bg-white p-8 shadow-sm">
        <h1 className="font-serif text-2xl font-bold text-ink-950">
          {t('auth.resetPasswordTitle')}
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          {t('auth.resetPasswordDescription')}
        </p>

        {sent ? (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {t('auth.resetSent')}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="reset-email" className="mb-1.5 block text-sm font-medium text-ink-800">
                {t('auth.email')}
              </label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClass(Boolean(error))}
                placeholder="you@mystudio.rw"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-lg bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? t('auth.sending') : t('auth.sendResetLink')}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm">
          <Link to="/login" className="font-medium text-brand-800 hover:underline">
            {t('nav.login')}
          </Link>
        </p>
      </div>
    </div>
  )
}