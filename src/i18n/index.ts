import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import fr from './locales/fr.json'
import rw from './locales/rw.json'

export const locales = {
  en: { translation: en },
  fr: { translation: fr },
  rw: { translation: rw },
} as const

export type AppLocale = keyof typeof locales

export function getSupportedLanguages(): AppLocale[] {
  return ['en', 'fr', 'rw']
}

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources: locales,
  fallbackLng: 'en',
  supportedLngs: getSupportedLanguages(),
  load: 'languageOnly',
  interpolation: { escapeValue: false },
  detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage'],
    lookupLocalStorage: 'mystudio_lang',
  },
})

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
})

export default i18n