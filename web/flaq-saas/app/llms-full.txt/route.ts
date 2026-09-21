import { getLlmsFullTxt } from '@/lib/seo/llms';

export const revalidate = 86400;
export const dynamic = 'force-static';

export function GET() {
  return new Response(getLlmsFullTxt(), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
