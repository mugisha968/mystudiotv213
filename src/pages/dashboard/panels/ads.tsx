import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Field, TextInput, Select, TextArea } from '@/components/ui/Field'
import { ImageUploader } from '@/components/ui/ImageUploader'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { useAction } from '@/hooks/useAction'
import { useAsync } from '@/hooks/useAsync'
import { advertisementsApi } from '@/lib/services'
import type { Advertisement, AdvertisementInput, AdSlot, AdType } from '@/types'
import { AD_SLOTS, AD_TYPES } from '@/types'
import { InlineError, LoadingBlock, PanelError, Section } from './common'

const SLOT_LABELS: Record<AdSlot, string> = {
  'top-banner': 'Top Banner (970×90)',
  'sidebar-top': 'Sidebar Top (300×250)',
  'sidebar-bottom': 'Sidebar Bottom (300×250)',
  'in-feed-1': 'In-Feed #1',
  'in-feed-2': 'In-Feed #2',
  'article-top': 'Article Top (728×90)',
  'article-mid': 'Article Mid',
  'mobile-banner': 'Mobile Banner',
  'footer-above': 'Footer Above',
}

const TYPE_LABELS: Record<AdType, string> = {
  image: 'Image / GIF',
  html: 'HTML / Animated',
}

export function AdsPanel() {
  const { t } = useTranslation()

  const { data, loading, error, reload } = useAsync(
    () => advertisementsApi.staffAll(),
    [],
  )
  const action = useAction<unknown>()
  const [editing, setEditing] = useState<Advertisement | null>(null)
  const [creating, setCreating] = useState(false)
  const [removing, setRemoving] = useState<Advertisement | null>(null)
  const [draft, setDraft] = useState<AdvertisementInput>({
    title: '',
    image_url: '',
    link_url: '',
    slot: 'top-banner',
    ad_type: 'image',
    html_content: '',
    is_active: true,
    sort_order: 0,
  })
  const [notice, setNotice] = useState<string | null>(null)

  function openCreate() {
    setCreating(true)
    setDraft({
      title: '',
      image_url: '',
      link_url: '',
      slot: 'top-banner',
      ad_type: 'image',
      html_content: '',
      is_active: true,
      sort_order: 0,
    })
  }

  function openEdit(ad: Advertisement) {
    setEditing(ad)
    setDraft({
      title: ad.title,
      image_url: ad.image_url,
      link_url: ad.link_url,
      slot: ad.slot,
      ad_type: ad.ad_type,
      html_content: ad.html_content,
      is_active: ad.is_active,
      sort_order: ad.sort_order,
    })
  }

  async function save() {
    const result = await action.run(() =>
      editing
        ? advertisementsApi.update(editing.id, draft)
        : advertisementsApi.create(draft),
    )
    if (result !== null) {
      setEditing(null)
      setCreating(false)
      setNotice(editing ? t('ads.updatedNotice') : t('ads.createdNotice'))
      reload()
    }
  }

  async function remove() {
    if (!removing) return
    const result = await action.run(() => advertisementsApi.remove(removing.id))
    if (result !== null) {
      setRemoving(null)
      setNotice(t('ads.deletedNotice'))
      reload()
    }
  }

  if (loading) return <LoadingBlock />
  if (error || !data) return <PanelError error={error} onRetry={reload} />

  const ads = data.ads

  return (
    <Section
      title={t('ads.managerTitle')}
      action={
        <Button onClick={openCreate}>
          <span aria-hidden="true">+</span> {t('ads.create')}
        </Button>
      }
    >
      {notice && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          {notice}
        </div>
      )}
      <InlineError message={action.error} />

      {ads.length === 0 ? (
        <EmptyState message={t('ads.empty')} />
      ) : (
        <div className="space-y-8">
          {AD_SLOTS.map((slot) => {
            const slotAds = ads.filter((ad) => ad.slot === slot)
            if (slotAds.length === 0) return null
            return (
              <div key={slot}>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-600">
                  {SLOT_LABELS[slot]}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {slotAds.map((ad) => (
                    <Card key={ad.id} className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate font-semibold text-ink-950">
                          {ad.title}
                        </p>
                        <div className="flex shrink-0 gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(ad)}
                          >
                            {t('common.edit')}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRemoving(ad)}
                          >
                            {t('common.delete')}
                          </Button>
                        </div>
                      </div>
                      {ad.ad_type === 'html' && ad.html_content ? (
                        <div className="relative mt-2 h-16 w-full overflow-hidden rounded border border-dashed border-ink-200 bg-ink-50">
                          <div
                            className="ad-container absolute left-0 top-0 origin-top-left"
                            style={{
                              width: '333%',
                              height: '333%',
                              transform: 'scale(0.3)',
                            }}
                            dangerouslySetInnerHTML={{ __html: ad.html_content }}
                          />
                        </div>
                      ) : ad.image_url ? (
                        <img
                          src={ad.image_url}
                          alt={ad.title}
                          className="mt-2 h-16 w-full rounded object-contain bg-ink-50"
                        />
                      ) : null}
                      <div className="mt-2 flex items-center gap-2 text-xs text-ink-500">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                            ad.is_active
                              ? 'bg-brand-100 text-brand-800'
                              : 'bg-ink-200 text-ink-700'
                          }`}
                        >
                          {ad.is_active ? t('ads.active') : t('ads.inactive')}
                        </span>
                        <span className="rounded bg-ink-100 px-1.5 py-0.5 text-[10px] font-medium text-ink-600">
                          {TYPE_LABELS[ad.ad_type]}
                        </span>
                        <span>Order: {ad.sort_order}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={creating || editing !== null}
        title={editing ? t('ads.edit') : t('ads.create')}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
        size="lg"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setCreating(false)
                setEditing(null)
              }}
              disabled={action.busy}
            >
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
          <Field label={t('ads.titleLabel')}>
            <TextInput
              value={draft.title ?? ''}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder={t('ads.titlePlaceholder')}
            />
          </Field>

          <Field label={t('ads.slotLabel')} hint={t('ads.slotHint')}>
            <Select
              value={draft.slot}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  slot: event.target.value as AdSlot,
                }))
              }
            >
              {AD_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {SLOT_LABELS[slot]}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={t('ads.typeLabel')} hint={t('ads.typeHint')}>
            <Select
              value={draft.ad_type ?? 'image'}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  ad_type: event.target.value as AdType,
                }))
              }
            >
              {AD_TYPES.map((type) => (
                <option key={type} value={type}>
                  {TYPE_LABELS[type]}
                </option>
              ))}
            </Select>
          </Field>

          {draft.ad_type === 'image' && (
            <Field label={t('ads.imageLabel')} hint={t('ads.imageHint')}>
              <ImageUploader
                dest="article-image"
                value={draft.image_url}
                onUploaded={(url) =>
                  setDraft((prev) => ({ ...prev, image_url: url }))
                }
              />
            </Field>
          )}

          {draft.ad_type === 'html' && (
            <Field label={t('ads.htmlLabel')} hint={t('ads.htmlHint')}>
              <TextArea
                value={draft.html_content ?? ''}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    html_content: event.target.value,
                  }))
                }
                placeholder='<div style="...">Your HTML ad</div>'
                className="min-h-40 font-mono text-xs"
              />
            </Field>
          )}

          <Field label={t('ads.linkLabel')} hint={t('ads.linkHint')}>
            <TextInput
              value={draft.link_url ?? ''}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  link_url: event.target.value || null,
                }))
              }
              placeholder="https://..."
            />
          </Field>

          <Field label={t('ads.sortOrderLabel')}>
            <TextInput
              type="number"
              value={String(draft.sort_order ?? 0)}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  sort_order: Number(event.target.value) || 0,
                }))
              }
            />
          </Field>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={draft.is_active ?? true}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  is_active: event.target.checked,
                }))
              }
              className="h-4 w-4 accent-brand-800"
            />
            <span className="text-sm font-medium text-ink-800">
              {t('ads.activeLabel')}
            </span>
          </label>
        </div>
      </Modal>

      <ConfirmDialog
        open={removing !== null}
        title={t('ads.deleteTitle')}
        description={t('ads.deleteDescription', {
          name: removing?.title ?? '',
        })}
        confirmLabel={t('common.delete')}
        busy={action.busy}
        onConfirm={remove}
        onClose={() => setRemoving(null)}
      />
    </Section>
  )
}
