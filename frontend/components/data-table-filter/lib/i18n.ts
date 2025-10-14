import en from '../locales/en.json'
import pt from '../locales/pt.json'

export type Locale = 'en' | 'pt'

type Translations = Record<string, string>

const translations: Record<Locale, Translations> = {
  en,
  pt,
}

export function t(key: string, locale: Locale): string {
  return translations[locale][key] ?? key
}
