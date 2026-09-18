export type MediaType = 'image' | 'video';
export type TaskStatus = 'submitted' | 'processing' | 'succeed' | 'failed';

export interface ModelConfig {
  id: string;
  label: string;
  mediaType: MediaType;
  modelName: string;
  referenceLabel?: string;
  referenceRequired?: boolean;
  ratios: string[];
  resolutions: string[];
  durations?: number[];
}

export interface PageContext {
  title: string;
  url: string;
  selection?: string;
  imageUrl?: string;
  capturedAt?: number;
}

export interface Settings {
  baseUrl: string;
  clientKey: string;
}

export interface HistoryItem {
  id: string;
  mediaType: MediaType;
  modelLabel: string;
  prompt: string;
  status: TaskStatus;
  createdAt: number;
  resultUrl?: string;
  thumbnailUrl?: string;
  error?: string;
}

export interface OpenApiSubmitResponse {
  code: number;
  message: string;
  data?: {
    task_id: string;
    task_status: TaskStatus;
    response_url: string;
  };
}

export interface OpenApiPollResponse {
  code: number;
  message: string;
  data?: {
    task_id: string;
    task_status: TaskStatus;
    task_status_msg?: string | null;
    task_result?: {
      images?: Array<{ url?: string; thumbnail_url?: string }>;
      videos?: Array<{ url?: string; cover_url?: string }>;
    } | null;
  };
}
