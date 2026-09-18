import type { ModelConfig } from './types';

export const MODELS: ModelConfig[] = [
  {
    id: 'nano-banana-2',
    label: 'Nano Banana 2',
    mediaType: 'image',
    modelName: 'nano-banana-2',
    ratios: ['1:1', '16:9', '9:16', '4:3', '3:4'],
    resolutions: ['1k', '2k', '4k'],
  },
  {
    id: 'gpt-image-2',
    label: 'GPT Image 2',
    mediaType: 'image',
    modelName: 'gpt-image-2',
    ratios: ['1:1', '16:9', '9:16', '3:2', '2:3'],
    resolutions: ['1k', '2k'],
  },
  {
    id: 'seedream-5.0-pro',
    label: 'Seedream 5.0 Pro',
    mediaType: 'image',
    modelName: 'seedream-v5.0-pro',
    ratios: ['1:1', '16:9', '9:16', '4:3', '3:4', '21:9'],
    resolutions: ['1k', '2k'],
  },
  {
    id: 'nano-banana-2-edit',
    label: 'Nano Banana 2 Edit',
    mediaType: 'image',
    modelName: 'nano-banana-2-edit',
    referenceLabel: '参考图片 URL',
    referenceRequired: true,
    ratios: ['1:1', '16:9', '9:16', '4:3', '3:4'],
    resolutions: ['1k', '2k', '4k'],
  },
  {
    id: 'seedance-2.5-text-to-video',
    label: 'Seedance 2.5',
    mediaType: 'video',
    modelName: 'seedance-v2.5-text-to-video',
    ratios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
    resolutions: ['720p', '1080p'],
    durations: [5, 10, 15],
  },
  {
    id: 'kling-3.0-text-to-video',
    label: 'Kling 3.0',
    mediaType: 'video',
    modelName: 'kling-v3.0-std-text-to-video',
    ratios: ['16:9', '9:16', '1:1'],
    resolutions: ['720p', '1080p'],
    durations: [5, 10, 15],
  },
  {
    id: 'seedance-2.5-image-to-video',
    label: 'Seedance 2.5 Image to Video',
    mediaType: 'video',
    modelName: 'seedance-v2.5-image-to-video',
    referenceLabel: '首帧图片 URL',
    referenceRequired: true,
    ratios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
    resolutions: ['720p', '1080p'],
    durations: [5, 10, 15],
  },
];

export const modelsFor = (type: ModelConfig['mediaType']) => MODELS.filter((model) => model.mediaType === type);

export function getImageDimensions(ratio: string, resolution: string) {
  const base = resolution.toLowerCase() === '4k' ? 4096 : resolution.toLowerCase() === '2k' ? 2048 : 1024;
  const [widthRatio, heightRatio] = ratio.split(':').map(Number);
  if (!widthRatio || !heightRatio) return { width: base, height: base };
  if (widthRatio >= heightRatio) return { width: base, height: Math.round((base * heightRatio) / widthRatio) };
  return { width: Math.round((base * widthRatio) / heightRatio), height: base };
}
