import { useTranslation } from 'react-i18next'

import type { AppLocale } from '@/i18n'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  className?: string
}

const options: Array<{ code: AppLocale; label: string }> = [
  { code: 'rw', label: 'RW' },
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
]

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { i18n } = useTranslation()

  function switchLanguage(code: AppLocale) {
    i18n.changeLanguage(code)
    localStorage.setItem('mystudio_lang', code)
  }

  const current = i18n.resolvedLanguage as AppLocale

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn('inline-flex border border-ink-200 bg-white p-0.5', className)}
    >
      {options.map((option) => {
        const active = option.code === current || option.code === i18n.language
        return (
          <button
            key={option.code}
            type="button"
            onClick={() => switchLanguage(option.code)}
            aria-pressed={active}
            className={cn(
              'px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider transition-colors',
              active
                ? 'bg-brand-800 text-white'
                : 'text-ink-500 hover:bg-ink-100 hover:text-ink-900',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
