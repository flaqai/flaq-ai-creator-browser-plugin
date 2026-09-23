import { getClientContentLanguage, getClientOpenApiConfigAsync, openApiFetchJson } from '@/network/clientFetch';

import {
  createFlaqPresignedUrlBody,
  FLAQ_PRESIGNED_URL_PATH,
  type FlaqPresignedUrlResponse,
  validateFlaqUploadCount,
} from './flaq-storage-contract';

export interface CreateSignedUrlRequest {
  mimeTypes: string[];
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

export interface UploadAdapter {
  createSignedUrl(input: CreateSignedUrlRequest): Promise<SignedUrlItem[]>;
}

export async function createSignedUrl(
  mimeTypes: string[],
  isForever?: boolean,
): Promise<CreateSignedUrlResponse> {
  if (typeof window === 'undefined') {
    throw new Error('createSignedUrl can only be called from the browser.');
  }
  if (mimeTypes.length === 0) return { rows: [] };

  validateFlaqUploadCount(mimeTypes.length);
  // Retention is controlled by the Flaq storage service. Keep this argument for
  // compatibility with existing upload callers without sending it to the API.
  void isForever;

  const config = await getClientOpenApiConfigAsync();
  const response = await openApiFetchJson<FlaqPresignedUrlResponse>(config, FLAQ_PRESIGNED_URL_PATH, {
    method: 'POST',
    headers: { 'content-language': getClientContentLanguage() },
    body: JSON.stringify(createFlaqPresignedUrlBody(mimeTypes)),
  });

  if (![0, 200].includes(response.code)) {
    throw new Error(response.message || 'Flaq upload authorization failed.');
  }
  if (
    !Array.isArray(response.data) ||
    response.data.length !== mimeTypes.length ||
    response.data.some((row) => !row.signed_url || !row.url)
  ) {
    throw new Error('Flaq upload service returned incomplete upload URLs.');
  }

  return {
    rows: response.data.map((row, index) => ({
      signedUrl: row.signed_url,
      url: row.url,
      mimeType: mimeTypes[index],
    })),
  };
}
