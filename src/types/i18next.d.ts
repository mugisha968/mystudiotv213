import 'i18next'

export {}

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
  }
}