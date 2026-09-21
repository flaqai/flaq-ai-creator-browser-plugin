import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import Footer from '@/components/home/Footer';
import Navigation from '@/components/home/Navigation';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata.home' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Navigation />
      <main className='mx-auto flex w-full flex-1'>{children}</main>
      <Footer />
    </>
  );
}
