import { getImageDimensions } from './models';
import type {
  HistoryItem,
  ModelConfig,
  OpenApiPollResponse,
  OpenApiSubmitResponse,
  Settings,
} from './types';

interface SubmitInput {
  model: ModelConfig;
  prompt: string;
  ratio: string;
  resolution: string;
  duration?: number;
  referenceUrl?: string;
}

function apiUrl(settings: Settings, path: string) {
  return `${settings.baseUrl.replace(/\/+$/, '')}${path}`;
}

async function request<T>(settings: Settings, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(settings, path), {
    ...init,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${settings.clientKey}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  const data = (await response.json().catch(() => null)) as T | { error?: { message?: string } } | null;
  if (!response.ok) {
    const message = data && typeof data === 'object' && 'error' in data ? data.error?.message : undefined;
    throw new Error(message || response.statusText || 'FLAQ API 请求失败');
  }
  return data as T;
}

export async function submitTask(settings: Settings, input: SubmitInput): Promise<HistoryItem> {
  if (!settings.clientKey) throw new Error('请先在设置中填写 FLAQ Client Key');
  if (input.model.referenceRequired && !input.referenceUrl) throw new Error(`请填写${input.model.referenceLabel}`);

  const dimensions = getImageDimensions(input.ratio, input.resolution);
  const isImage = input.model.mediaType === 'image';
  const body = isImage
    ? {
        model_name: input.model.modelName,
        prompt: input.prompt,
        width: dimensions.width,
        height: dimensions.height,
        resolution: input.resolution,
        image_url_list: input.referenceUrl ? [input.referenceUrl] : undefined,
      }
    : {
        model_name: input.model.modelName,
        prompt: input.prompt,
        aspect_ratio: input.ratio,
        resolution: input.resolution,
        duration: input.duration,
        image_url: input.referenceUrl || undefined,
      };

  const response = await request<OpenApiSubmitResponse>(
    settings,
    `/api/v1/${input.model.mediaType}/task`,
    { method: 'POST', body: JSON.stringify(body) },
  );
  if (response.code !== 0 || !response.data?.task_id) throw new Error(response.message || '任务提交失败');

  return {
    id: response.data.task_id,
    mediaType: input.model.mediaType,
    modelLabel: input.model.label,
    prompt: input.prompt,
    status: response.data.task_status,
    createdAt: Date.now(),
    thumbnailUrl: input.referenceUrl,
  };
}

export async function pollTask(settings: Settings, item: HistoryItem): Promise<HistoryItem> {
  const response = await request<OpenApiPollResponse>(settings, `/api/v1/${item.mediaType}/${item.id}`, {
    method: 'GET',
  });
  if (response.code !== 0 || !response.data) throw new Error(response.message || '任务状态读取失败');

  const image = response.data.task_result?.images?.[0];
  const video = response.data.task_result?.videos?.[0];
  return {
    ...item,
    status: response.data.task_status,
    resultUrl: image?.url || video?.url || item.resultUrl,
    thumbnailUrl: image?.thumbnail_url || video?.cover_url || item.thumbnailUrl,
    error: response.data.task_status === 'failed' ? response.data.task_status_msg || '生成失败' : undefined,
  };
}
