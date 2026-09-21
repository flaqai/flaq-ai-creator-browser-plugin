import { redirect } from '@/i18n/navigation';
import { locales } from '@/i18n/languages';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale, rest: ['not-found'] }));
}

export default async function CatchAllPage({ params }: { params: Promise<{ locale: string; rest: string[] }> }) {
  const { locale } = await params;
  // Redirect to /404 route, using /404 page's metadata
  redirect({ href: '/404', locale });
}
