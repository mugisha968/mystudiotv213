import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '@/auth/AuthContext'
import { ApiError } from '@/lib/api'
import { cn } from '@/lib/utils'

const PAGE = '/dashboard'

export function LoginPage() {
  const { t } = useTranslation()
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const nextErrors: typeof errors = {}
    if (!email.trim()) nextErrors.email = t('auth.requiredField')
    if (!password) nextErrors.password = t('auth.requiredField')
    setErrors(nextErrors)
    if (nextErrors.email || nextErrors.password) return

    setSubmitting(true)
    try {
      await signIn(email.trim(), password)
      navigate(PAGE)
    } catch (err) {
      const code = err instanceof ApiError ? err.code : undefined
      setErrors({
        form:
          code === 'invalid_credentials'
            ? t('auth.invalidCredentials')
            : err instanceof Error
              ? err.message
              : t('common.error'),
      })
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
          {t('auth.loginTitle')}
        </h1>
        <p className="mt-1 text-sm text-ink-500">{t('auth.loginSubtitle')}</p>

        {errors.form && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-ink-800">
              {t('auth.email')}
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass(Boolean(errors.email))}
              placeholder="you@mystudio.rw"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="login-password" className="block text-sm font-medium text-ink-800">
                {t('auth.password')}
              </label>
              <Link
                to="/reset-password"
                className="text-xs font-medium text-brand-800 hover:underline"
              >
                {t('auth.resetPassword')}
              </Link>
            </div>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass(Boolean(errors.password))}
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-lg bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? t('auth.signingIn') : t('auth.signIn')}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-500">{t('auth.noAccount')}</p>
      </div>
    </div>
  )
}