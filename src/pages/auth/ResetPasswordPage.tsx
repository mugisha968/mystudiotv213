import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'

import { authApi } from '@/lib/services'
import { ApiError } from '@/lib/api'
import { cn } from '@/lib/utils'

export function ResetPasswordPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; form?: string }>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const nextErrors: typeof errors = {}
    if (!password) nextErrors.password = t('auth.requiredField')
    else if (password.length < 8) nextErrors.password = t('auth.newPasswordHint')
    if (confirm !== password) nextErrors.confirm = t('auth.passwordMismatch')
    setErrors(nextErrors)
    if (nextErrors.password || nextErrors.confirm) return

    setSubmitting(true)
    try {
      await authApi.confirmReset(token, password)
      setDone(true)
    } catch (err) {
      const code = err instanceof ApiError ? err.code : undefined
      setErrors({
        form:
          code === 'invalid_token'
            ? t('auth.resetTokenInvalid')
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
          {t('auth.resetPasswordTitle')}
        </h1>

        {done ? (
          <>
            <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {t('auth.passwordChanged')}
            </div>
            <Link
              to="/login"
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              {t('auth.continueToLogin')}
            </Link>
          </>
        ) : !token ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {t('auth.resetTokenInvalid')}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            {errors.form && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {errors.form}
              </div>
            )}
            <div>
              <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-ink-800">
                {t('auth.newPassword')}
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClass(Boolean(errors.password))}
              />
              <p className="mt-1 text-xs text-ink-500">{t('auth.newPasswordHint')}</p>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-ink-800">
                {t('auth.confirmPassword')}
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                className={inputClass(Boolean(errors.confirm))}
              />
              {errors.confirm && (
                <p className="mt-1 text-xs text-red-600">{errors.confirm}</p>
              )}
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
      </div>
    </div>
  )
}