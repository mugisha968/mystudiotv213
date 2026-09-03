import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAuth } from '@/auth/AuthContext'
import { VerificationStatus } from '@/components/badges/VerificationStatus'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field, Select, TextArea, TextInput } from '@/components/ui/Field'
import { ImageUploader } from '@/components/ui/ImageUploader'
import { Spinner } from '@/components/ui/Spinner'
import { AccountStatusPill } from '@/components/ui/StatusPill'
import { useAction } from '@/hooks/useAction'
import { authApi } from '@/lib/services'
import { formatDate } from '@/lib/utils'
import { ROLE_LABEL_KEYS, type LanguageCode, type Profile } from '@/types'
import { InlineError, Section, SuccessBanner } from './common'

export function ProfileEditor({
  user,
  onUpdated,
}: {
  user: Profile
  onUpdated: (profile: Profile) => void
}) {
  const { t } = useTranslation()
  const saveAction = useAction<{ user: Profile }>()
  const passwordAction = useAction<unknown>()
  const [profile, setProfile] = useState({
    full_name: user.full_name,
    email: user.email,
    bio: user.bio ?? '',
    avatar_path: user.avatar_path ?? '',
    preferred_language: user.preferred_language,
  })
  const [password, setPassword] = useState({
    current: '',
    next: '',
    confirm: '',
  })
  const [notice, setNotice] = useState<string | null>(null)

  async function saveProfile() {
    const result = await saveAction.run(() =>
      authApi.updateMe({
        full_name: profile.full_name.trim(),
        email: profile.email.trim(),
        bio: profile.bio,
        avatar_path: profile.avatar_path || null,
        preferred_language: profile.preferred_language,
      }),
    )
    if (result) {
      onUpdated(result.user)
      setNotice(t('settings.profileSaved'))
    }
  }

  async function savePassword() {
    if (!password.current || !password.next) return
    if (password.next !== password.confirm) return
    const result = await passwordAction.run(() =>
      authApi.changePassword(password.current, password.next),
    )
    if (result) {
      setPassword({ current: '', next: '', confirm: '' })
      setNotice(t('settings.passwordSaved'))
    }
  }

  return (
    <div className="space-y-6">
      <SuccessBanner message={notice} />

      <Card className="p-6">
        <h2 className="mb-4 font-serif text-lg font-bold text-ink-950">
          {t('settings.profile')}
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-4">
            <Field label={t('journalists.fullName')}>
              <TextInput
                value={profile.full_name}
                onChange={(event) => setProfile((prev) => ({ ...prev, full_name: event.target.value }))}
              />
            </Field>
            <Field label={t('auth.email')}>
              <TextInput
                type="email"
                value={profile.email}
                onChange={(event) => setProfile((prev) => ({ ...prev, email: event.target.value }))}
              />
            </Field>
            <Field label={t('languages.languageLabel')}>
              <Select
                value={profile.preferred_language}
                onChange={(event) =>
                  setProfile((prev) => ({
                    ...prev,
                    preferred_language: event.target.value as LanguageCode,
                  }))
                }
              >
                <option value="rw">{t('languages.rw')}</option>
                <option value="en">{t('languages.en')}</option>
                <option value="fr">{t('languages.fr')}</option>
              </Select>
            </Field>
          </div>
          <div className="space-y-4">
            <Field label={t('journalists.avatar')}>
              <ImageUploader
                dest="avatar"
                value={profile.avatar_path || null}
                onUploaded={(url) => setProfile((prev) => ({ ...prev, avatar_path: url }))}
              />
            </Field>
            <Field label={t('journalists.biography')}>
              <TextArea
                value={profile.bio}
                onChange={(event) => setProfile((prev) => ({ ...prev, bio: event.target.value }))}
              />
            </Field>
          </div>
        </div>
        <InlineError message={saveAction.error} />
        <div className="mt-5 flex justify-end">
          <Button onClick={saveProfile} disabled={saveAction.busy}>
            {saveAction.busy && <Spinner className="h-4 w-4 text-white" />}
            {t('common.save')}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 font-serif text-lg font-bold text-ink-950">
          {t('settings.changePassword')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={t('auth.currentPassword')}>
            <TextInput
              type="password"
              autoComplete="current-password"
              value={password.current}
              onChange={(event) => setPassword((prev) => ({ ...prev, current: event.target.value }))}
            />
          </Field>
          <Field label={t('auth.newPassword')} hint={t('auth.newPasswordHint')}>
            <TextInput
              type="password"
              autoComplete="new-password"
              value={password.next}
              onChange={(event) => setPassword((prev) => ({ ...prev, next: event.target.value }))}
            />
          </Field>
          <Field
            label={t('auth.confirmPassword')}
            error={
              password.confirm && password.next !== password.confirm
                ? t('auth.passwordMismatch')
                : undefined
            }
          >
            <TextInput
              type="password"
              autoComplete="new-password"
              value={password.confirm}
              onChange={(event) => setPassword((prev) => ({ ...prev, confirm: event.target.value }))}
            />
          </Field>
        </div>
        <InlineError message={passwordAction.error} />
        <div className="mt-5 flex justify-end">
          <Button
            onClick={savePassword}
            disabled={
              passwordAction.busy ||
              !password.current ||
              !password.next ||
              !password.confirm ||
              password.next !== password.confirm
            }
          >
            {passwordAction.busy && <Spinner className="h-4 w-4 text-white" />}
            {t('settings.updatePassword')}
          </Button>
        </div>
      </Card>
    </div>
  )
}

export function SettingsPanel() {
  const { t, i18n } = useTranslation()
  const { user, refresh } = useAuth()
  if (!user) return null
  return (
    <Section title={t('dashboard.settings')}>
      <ProfileEditor user={user} onUpdated={refresh} />
      <div className="mt-4 text-xs text-ink-500">
        {t('settings.memberSince', {
          date: formatDate(user.created_at, i18n.resolvedLanguage),
        })}
      </div>
    </Section>
  )
}

export function MyProfilePanel() {
  const { t, i18n } = useTranslation()
  const { user, refresh } = useAuth()
  if (!user) return null

  return (
    <Section title={t('dashboard.myProfile')}>
      <Card className="max-w-2xl p-6">
        <div className="flex items-start gap-4">
          <Avatar src={user.avatar_path} name={user.full_name} size="lg" />
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-ink-950">{user.full_name}</h2>
            <p className="text-sm text-ink-500">{t(ROLE_LABEL_KEYS[user.role])}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <AccountStatusPill status={user.status} />
              <VerificationStatus
                verified={user.verified}
                blueBadge={user.blue_badge}
              />
            </div>
          </div>
        </div>
        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-ink-500">{t('auth.email')}</dt>
            <dd className="font-medium text-ink-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-ink-500">{t('journalists.memberSince')}</dt>
            <dd className="font-medium text-ink-900">
              {formatDate(user.created_at, i18n.resolvedLanguage)}
            </dd>
          </div>
        </dl>
      </Card>
      <ProfileEditor user={user} onUpdated={refresh} />
    </Section>
  )
}