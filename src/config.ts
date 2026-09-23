export const SITE_LOCALES = [
  'en', 'ja', 'id', 'it', 'pt', 'es', 'de', 'ru', 'fr', 'zh', 'tw', 'ko', 'th', 'vi', 'ar',
] as const;

export type SiteLocale = (typeof SITE_LOCALES)[number];

const LANGUAGE_ALIASES: Record<string, SiteLocale> = {
  en: 'en',
  ja: 'ja',
  id: 'id',
  it: 'it',
  pt: 'pt',
  es: 'es',
  de: 'de',
  ru: 'ru',
  fr: 'fr',
  ko: 'ko',
  th: 'th',
  vi: 'vi',
  ar: 'ar',
};

export function resolveSiteLocale(language: string): SiteLocale {
  const normalized = language.trim().toLowerCase().replace('_', '-');
  if (['zh-tw', 'zh-hk', 'zh-mo'].includes(normalized)) return 'tw';
  if (normalized === 'zh' || normalized.startsWith('zh-')) return 'zh';
  return LANGUAGE_ALIASES[normalized.split('-')[0]] || 'en';
}

export function getUiLanguage() {
  if (typeof chrome !== 'undefined' && chrome.i18n?.getUILanguage) {
    return chrome.i18n.getUILanguage();
  }
  return navigator.language || 'en';
}

export function buildCreatorUrl(
  siteUrl: string,
  uiLanguage: string,
  options: { includeDefaultLocale?: boolean; includeIndexDocument?: boolean } = {},
) {
  const base = new URL(siteUrl);
  const locale = resolveSiteLocale(uiLanguage);
  const localePath = locale === 'en' && !options.includeDefaultLocale ? '' : `${locale}/`;
  const creatorPath = `${base.pathname.replace(/\/?$/, '/')}${localePath}ai-media-creator/`;
  base.pathname = options.includeIndexDocument ? `${creatorPath}index.html` : creatorPath;
  base.search = '';
  base.hash = '';
  return base.toString();
}

export function getBundledSiteUrl() {
  if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
    return chrome.runtime.getURL('site/');
  }
  return new URL('/site/', window.location.href).toString();
}
