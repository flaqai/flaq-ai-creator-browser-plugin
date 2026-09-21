import { defineRouting } from 'next-intl/routing';

import { defaultLocale, locales } from './languages';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: locales,

  // Used when no locale matches
  defaultLocale: defaultLocale,
  localePrefix: process.env.NEXT_PUBLIC_EXTENSION_EXPORT === 'true' ? 'always' : 'as-needed',
});
