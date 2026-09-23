export const FLAQ_PRESIGNED_URL_PATH = '/api/v1/files/presignedUrl';
export const MAX_FLAQ_UPLOAD_FILES = 10;

export interface FlaqPresignedUrlResponse {
  code: number;
  message?: string;
  data?: Array<{
    signed_url?: string;
    url?: string;
  }>;
}

export function createFlaqPresignedUrlBody(mimeTypes: string[]) {
  return {
    files: mimeTypes.map((mimeType) => ({ mime_type: mimeType })),
  };
}

export function validateFlaqUploadCount(count: number) {
  if (count > MAX_FLAQ_UPLOAD_FILES) {
    throw new Error(`Flaq storage accepts at most ${MAX_FLAQ_UPLOAD_FILES} files per upload request.`);
  }
}
