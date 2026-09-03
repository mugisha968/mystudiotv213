import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Field, TextArea, TextInput } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { useAction } from '@/hooks/useAction'
import { useAsync } from '@/hooks/useAsync'
import { categoriesApi } from '@/lib/services'
import { slugify } from '@/lib/utils'
import type { Category } from '@/types'
import { InlineError, LoadingBlock, PanelError, Section } from './common'

export function CategoriesPanel() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const { data, loading, error, reload } = useAsync(() => categoriesApi.list(), [])
  const action = useAction<unknown>()
  const [editing, setEditing] = useState<Category | null>(null)
  const [creating, setCreating] = useState(false)
  const [removing, setRemoving] = useState<Category | null>(null)
  const [draft, setDraft] = useState<{ name: string; slug: string; description: string }>({
    name: '',
    slug: '',
    description: '',
  })
  const [notice, setNotice] = useState<string | null>(null)

  function openCreate() {
    setCreating(true)
    setDraft({ name: '', slug: '', description: '' })
  }

  function openEdit(category: Category) {
    setEditing(category)
    setDraft({
      name: category.name_key,
      slug: category.slug,
      description: category.description_key ?? '',
    })
  }

  async function save() {
    const payload = {
      name: draft.name.trim(),
      slug: draft.slug.trim(),
      description: draft.description.trim(),
    }
    const result = await action.run(() =>
      editing
        ? categoriesApi.update(editing.id, payload).then(() => undefined)
        : categoriesApi.create(payload).then(() => undefined),
    )
    if (result !== null) {
      setEditing(null)
      setCreating(false)
      setNotice(t('categories.savedNotice'))
      reload()
    }
  }

  async function remove() {
    if (!removing) return
    const result = await action.run(() => categoriesApi.remove(removing.id))
    if (result !== null) {
      setRemoving(null)
      setNotice(t('categories.deletedNotice'))
      reload()
    }
  }

  if (loading) return <LoadingBlock />
  if (error || !data) return <PanelError error={error} onRetry={reload} />

  return (
    <Section
      title={t('dashboard.categories')}
      action={
        isAdmin ? (
          <Button onClick={openCreate}>
            <span aria-hidden="true">+</span> {t('categories.create')}
          </Button>
        ) : undefined
      }
    >
      {notice && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          {notice}
        </div>
      )}
      <InlineError message={action.error} />
      {data.categories.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.categories.map((category) => (
            <Card key={category.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-ink-950">
                  {t(`categories.${category.name_key}.name`, {
                    defaultValue: category.name_key,
                  })}
                </p>
                {isAdmin && (
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(category)}>
                      {t('common.edit')}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setRemoving(category)}>
                      {t('common.delete')}
                    </Button>
                  </div>
                )}
              </div>
              <p className="mt-1 text-sm text-ink-500">
                {t(`categories.${category.name_key}.description`, {
                  defaultValue: category.description_key ?? '',
                })}
              </p>
              <p className="mt-2 text-xs font-medium text-brand-800">
                {t('journalists.articlesCount_other', { count: category.publishedCount })}
              </p>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={creating || editing !== null}
        title={editing ? t('categories.edit') : t('categories.create')}
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
        <div className="space-y-4">
          <Field label={t('categories.name')}>
            <TextInput
              value={draft.name}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, name: event.target.value, slug: prev.slug || slugify(event.target.value) }))
              }
            />
          </Field>
          <Field label={t('categories.slug')}>
            <TextInput
              value={draft.slug}
              onChange={(event) => setDraft((prev) => ({ ...prev, slug: slugify(event.target.value) }))}
            />
          </Field>
          <Field label={t('categories.description')}>
            <TextArea
              value={draft.description}
              onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
            />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={removing !== null}
        title={t('categories.deleteTitle')}
        description={t('categories.deleteDescription', { name: removing?.name_key ?? '' })}
        confirmLabel={t('common.delete')}
        busy={action.busy}
        onConfirm={remove}
        onClose={() => setRemoving(null)}
      />
    </Section>
  )
}