import { getClientContentLanguage, getClientOpenApiConfigAsync, openApiFetchJson } from '@/network/clientFetch';

export interface CreateSignedUrlRequest {
  mineType: string[];
  isForever?: boolean;
}

export interface SignedUrlItem {
  signedUrl?: string;
  uploadUrl?: string;
  fileUrl?: string;
  url?: string;
  fileName?: string;
  mimeType?: string;
}

export interface CreateSignedUrlResponse {
  rows: SignedUrlItem[];
}

/**
 * Generic upload interface placeholder:
 * Currently using createSignedUrl naming, will switch to image hosting or backend proxy later.
 */
export interface UploadAdapter {
  createSignedUrl(input: CreateSignedUrlRequest): Promise<SignedUrlItem[]>;
}

export async function createSignedUrl(
  mineType: string[],
  isForever?: boolean,
): Promise<CreateSignedUrlResponse> {
  if (typeof window === 'undefined') {
    throw new Error('createSignedUrl can only be called from the browser.');
  }

  const config = await getClientOpenApiConfigAsync();
  const response = await openApiFetchJson<{
    code: number;
    msg?: string;
    rows?: SignedUrlItem[];
  }>(config, '/image/presignedUrl', {
    method: 'POST',
    headers: { 'content-language': getClientContentLanguage() },
    body: JSON.stringify({
      mineType,
      site: process.env.SITE_ID?.trim() || 'browser-extension',
      isForever: Boolean(isForever),
    }),
  });

  if (![0, 200].includes(response.code)) {
    throw new Error(response.msg || 'Flaq upload authorization failed.');
  }
  if (
    !Array.isArray(response.rows) ||
    response.rows.length !== mineType.length ||
    response.rows.some((row) => !row.signedUrl || !row.url)
  ) {
    throw new Error('Flaq upload service returned incomplete upload URLs.');
  }

  return { rows: response.rows };
}
