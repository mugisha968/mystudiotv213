import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAuth } from '@/auth/AuthContext'
import { VerificationStatus } from '@/components/badges/VerificationStatus'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Field, Select, TextArea, TextInput } from '@/components/ui/Field'
import { ImageUploader } from '@/components/ui/ImageUploader'
import { Modal } from '@/components/ui/Modal'
import { AccountStatusPill } from '@/components/ui/StatusPill'
import { Spinner } from '@/components/ui/Spinner'
import { useAction } from '@/hooks/useAction'
import { useAsync } from '@/hooks/useAsync'
import { journalistsApi, managersApi } from '@/lib/services'
import { formatDate } from '@/lib/utils'
import type { AccountStatus, PersonInput, Profile } from '@/types'
import { InlineError, LoadingBlock, PanelError, Section, SuccessBanner } from './common'

interface PersonDraft extends PersonInput {
  password?: string
}

function PersonFields({
  kind,
  adminOnly,
  draft,
  onChange,
  includesPassword,
}: {
  kind: 'journalist' | 'manager'
  adminOnly: boolean
  draft: PersonDraft
  onChange: (draft: PersonDraft) => void
  includesPassword: boolean
}) {
  const { t } = useTranslation()

  function set<K extends keyof PersonDraft>(key: K, value: PersonDraft[K]) {
    onChange({ ...draft, [key]: value })
  }

  return (
    <div className="space-y-4">
      <Field label={t('journalists.fullName')}>
        <TextInput
          value={draft.full_name ?? ''}
          onChange={(event) => set('full_name', event.target.value)}
          required
        />
      </Field>
      <Field label={t('auth.email')}>
        <TextInput
          type="email"
          value={draft.email ?? ''}
          onChange={(event) => set('email', event.target.value)}
          required
        />
      </Field>
      {includesPassword && (
        <Field label={t('auth.password')} hint={t('auth.newPasswordHint')}>
          <TextInput
            type="password"
            autoComplete="new-password"
            value={draft.password ?? ''}
            onChange={(event) => set('password', event.target.value)}
          />
        </Field>
      )}
      <Field label={t('journalists.avatar')}>
        <ImageUploader
          dest="avatar"
          value={draft.avatar_path}
          onUploaded={(url) => set('avatar_path', url)}
        />
      </Field>
      <Field label={t('journalists.biography')}>
        <TextArea
          value={draft.bio ?? ''}
          onChange={(event) => set('bio', event.target.value)}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('journalists.accountStatus')}>
          <Select
            value={draft.status ?? 'pending'}
            onChange={(event) => set('status', event.target.value as AccountStatus)}
          >
            <option value="pending">{t('journalists.statusPending')}</option>
            <option value="active">{t('journalists.statusActive')}</option>
            <option value="inactive">{t('journalists.statusInactive')}</option>
          </Select>
        </Field>
        <Field label={t('languages.languageLabel')}>
          <Select
            value={draft.preferred_language ?? 'en'}
            onChange={(event) => set('preferred_language', event.target.value as typeof draft.preferred_language)}
          >
            <option value="rw">{t('languages.rw')}</option>
            <option value="en">{t('languages.en')}</option>
            <option value="fr">{t('languages.fr')}</option>
          </Select>
        </Field>
      </div>

      {kind === 'journalist' && (
        <div className="space-y-3 rounded-lg border border-ink-200 bg-ink-50 p-4">
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm text-ink-700">{t('journalists.verifiedSetting')}</span>
            <input
              type="checkbox"
              checked={draft.verified ?? false}
              onChange={(event) => set('verified', event.target.checked)}
              className="h-4 w-4 accent-brand-800"
            />
          </label>
          {adminOnly ? (
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm text-ink-700">{t('journalists.blueBadgeSetting')}</span>
              <input
                type="checkbox"
                checked={draft.blue_badge ?? false}
                onChange={(event) => set('blue_badge', event.target.checked)}
                className="h-4 w-4 accent-brand-800"
              />
            </label>
          ) : (
            <p className="text-xs text-ink-500">{t('journalists.blueBadgeHint')}</p>
          )}
          <p className="text-xs text-ink-500">{t('journalists.verificationHint')}</p>
        </div>
      )}
    </div>
  )
}


export function ManagersPanel() {
  const { t, i18n } = useTranslation()
  const { data, loading, error, reload } = useAsync(() => managersApi.list(), [])
  const action = useAction<unknown>()
  const [editing, setEditing] = useState<Profile | null>(null)
  const [creating, setCreating] = useState(false)
  const [removing, setRemoving] = useState<Profile | null>(null)
  const [draft, setDraft] = useState<PersonDraft>({})

  function openCreate() {
    setCreating(true)
    setDraft({ status: 'active', preferred_language: 'en' })
  }

  function openEdit(manager: Profile) {
    setEditing(manager)
    setDraft({
      full_name: manager.full_name,
      email: manager.email,
      bio: manager.bio ?? '',
      avatar_path: manager.avatar_path,
      status: manager.status,
      preferred_language: manager.preferred_language,
    })
  }

  async function save() {
    const payload: PersonInput = {
      full_name: draft.full_name?.trim(),
      email: draft.email?.trim().toLowerCase(),
      bio: draft.bio,
      avatar_path: draft.avatar_path,
      status: draft.status,
      preferred_language: draft.preferred_language,
    }
    if (draft.password) payload.password = draft.password

    const success = await action.run(() =>
      editing
        ? managersApi.update(editing.id, payload).then(() => undefined)
        : managersApi.create({ ...payload, password: draft.password ?? '' }).then(() => undefined),
    )
    if (success !== null) {
      setEditing(null)
      setCreating(false)
      reload()
    }
  }

  async function remove() {
    if (!removing) return
    const success = await action.run(() => managersApi.remove(removing.id))
    if (success !== null) {
      setRemoving(null)
      reload()
    }
  }

  if (loading) return <LoadingBlock />
  if (error || !data) return <PanelError error={error} onRetry={reload} />

  return (
    <Section
      title={t('dashboard.managers')}
      action={
        <Button onClick={openCreate}>
          <span aria-hidden="true">+</span> {t('managers.create')}
        </Button>
      }
    >
      <InlineError message={action.error} />
      {data.managers.length === 0 ? (
        <EmptyState />
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-ink-100">
            {data.managers.map((manager) => (
              <li key={manager.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar src={manager.avatar_path} name={manager.full_name} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink-950">{manager.full_name}</p>
                    <p className="truncate text-sm text-ink-500">{manager.email}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <AccountStatusPill status={manager.status} />
                      <span className="text-xs text-ink-500">
                        {formatDate(manager.created_at, i18n.resolvedLanguage)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => openEdit(manager)}>
                    {t('common.edit')}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setRemoving(manager)}>
                    {t('common.delete')}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Modal
        open={creating || editing !== null}
        title={editing ? t('managers.edit') : t('managers.create')}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
        footer={
          <>
            <Button variant="ghost" onClick={() => { setCreating(false); setEditing(null) }} disabled={action.busy}>
              {t('common.cancel')}
            </Button>
            <Button onClick={save} disabled={action.busy}>
              {action.busy && <Spinner className="h-4 w-4 text-white" />}
              {t('common.save')}
            </Button>
          </>
        }
      >
        <PersonFields
          kind="manager"
          adminOnly
          draft={draft}
          onChange={setDraft}
          includesPassword={!editing}
        />
      </Modal>

      <ConfirmDialog
        open={removing !== null}
        title={t('managers.deleteTitle')}
        description={t('managers.deleteDescription', { name: removing?.full_name ?? '' })}
        confirmLabel={t('common.delete')}
        busy={action.busy}
        onConfirm={remove}
        onClose={() => setRemoving(null)}
      />
    </Section>
  )
}

export function JournalistsPanel() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const adminOnly = user?.role === 'admin'
  const { data, loading, error, reload } = useAsync(() => journalistsApi.staffList(), [])
  const action = useAction<unknown>()
  const [editing, setEditing] = useState<JournalistRow | null>(null)
  const [creating, setCreating] = useState(false)
  const [removing, setRemoving] = useState<JournalistRow | null>(null)
  const [draft, setDraft] = useState<PersonDraft>({})
  const [notice, setNotice] = useState<string | null>(null)

  function refresh() {
    reload()
    setNotice(null)
  }

  function openCreate() {
    setCreating(true)
    setDraft({ status: 'pending', preferred_language: 'en' })
  }

  function openEdit(journalist: JournalistRow) {
    setEditing(journalist)
    setDraft({
      full_name: journalist.full_name,
      email: journalist.email,
      bio: journalist.bio ?? '',
      avatar_path: journalist.avatar_path,
      status: journalist.status,
      verified: journalist.verified,
      blue_badge: journalist.blue_badge,
      preferred_language: journalist.preferred_language,
    })
  }

  async function save() {
    const payload: PersonInput = {
      full_name: draft.full_name?.trim(),
      email: draft.email?.trim().toLowerCase(),
      bio: draft.bio,
      avatar_path: draft.avatar_path,
      status: draft.status,
      preferred_language: draft.preferred_language,
    }
    if (draft.password) payload.password = draft.password
    if (editing) {
      const result = await action.run(() => journalistsApi.update(editing.id, payload))
      if (result !== null) {
        setEditing(null)
        refresh()
      }
    } else {
      const result = await action.run(() =>
        journalistsApi.create({ ...payload, password: draft.password ?? '' }),
      )
      if (result !== null) {
        setCreating(false)
        setNotice(t('journalists.createdNotice'))
        refresh()
      }
    }
  }

  async function quickUpdate(id: number, patch: PersonInput, noticeKey: string) {
    const result = await action.run(() => journalistsApi.update(id, patch))
    if (result !== null) {
      setNotice(t(noticeKey))
      refresh()
    }
  }

  async function remove() {
    if (!removing) return
    const success = await action.run(() => journalistsApi.remove(removing.id))
    if (success !== null) {
      setRemoving(null)
      setNotice(t('journalists.deletedNotice'))
      refresh()
    }
  }

  if (loading) return <LoadingBlock />
  if (error || !data) return <PanelError error={error} onRetry={reload} />

  return (
    <Section
      title={t('dashboard.journalists')}
      action={
        <Button onClick={openCreate}>
          <span aria-hidden="true">+</span> {t('journalists.createJournalist')}
        </Button>
      }
    >
      <SuccessBanner message={notice} />
      <InlineError message={action.error} />
      {data.journalists.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {data.journalists.map((journalist) => (
            <Card key={journalist.id} className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <Avatar src={journalist.avatar_path} name={journalist.full_name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink-950">{journalist.full_name}</p>
                    <p className="truncate text-sm text-ink-500">{journalist.email}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <AccountStatusPill status={journalist.status} />
                      <VerificationStatus
                        verified={journalist.verified}
                        blueBadge={journalist.blue_badge}
                        compact
                      />
                      <span className="text-xs text-ink-500">
                        {t('journalists.articlesCount_other', { count: journalist.articleCount })}
                      </span>
                      <span className="text-xs text-ink-500">
                        {formatDate(journalist.created_at, i18n.resolvedLanguage)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => openEdit(journalist)}>
                    {t('common.edit')}
                  </Button>
                  {journalist.verified ? (
                    <Button variant="ghost" size="sm" onClick={() => quickUpdate(journalist.id, { verified: false }, 'journalists.unverifiedNotice')}>
                      {t('journalists.unverify')}
                    </Button>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={() => quickUpdate(journalist.id, { verified: true }, 'journalists.verifiedNotice')}>
                      {t('journalists.verify')}
                    </Button>
                  )}
                  {adminOnly && (
                    journalist.blue_badge ? (
                      <Button variant="ghost" size="sm" onClick={() => quickUpdate(journalist.id, { blue_badge: false }, 'journalists.badgeRemovedNotice')}>
                        {t('journalists.removeBadge')}
                      </Button>
                    ) : (
                      <Button variant="secondary" size="sm" onClick={() => quickUpdate(journalist.id, { blue_badge: true }, 'journalists.badgeGrantedNotice')}>
                        {t('journalists.grantBadge')}
                      </Button>
                    )
                  )}
                  {journalist.status === 'active' ? (
                    <Button variant="ghost" size="sm" onClick={() => quickUpdate(journalist.id, { status: 'inactive' }, 'journalists.deactivatedNotice')}>
                      {t('journalists.deactivate')}
                    </Button>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={() => quickUpdate(journalist.id, { status: 'active' }, 'journalists.activatedNotice')}>
                      {t('journalists.activate')}
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setRemoving(journalist)}>
                    {t('common.delete')}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={creating || editing !== null}
        title={editing ? t('journalists.editJournalist') : t('journalists.createJournalist')}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
        footer={
          <>
            <Button variant="ghost" onClick={() => { setCreating(false); setEditing(null) }} disabled={action.busy}>
              {t('common.cancel')}
            </Button>
            <Button onClick={save} disabled={action.busy}>
              {action.busy && <Spinner className="h-4 w-4 text-white" />}
              {t('common.save')}
            </Button>
          </>
        }
      >
        <PersonFields
          kind="journalist"
          adminOnly={adminOnly}
          draft={draft}
          onChange={setDraft}
          includesPassword={!editing}
        />
      </Modal>

      <ConfirmDialog
        open={removing !== null}
        title={t('journalists.deleteTitle')}
        description={t('journalists.deleteDescription', { name: removing?.full_name ?? '' })}
        confirmLabel={t('common.delete')}
        busy={action.busy}
        onConfirm={remove}
        onClose={() => setRemoving(null)}
      />
    </Section>
  )
}

interface JournalistRow extends Profile {
  articleCount: number
}