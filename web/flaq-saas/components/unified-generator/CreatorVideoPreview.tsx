'use client';

import { useEffect, useMemo, useState } from 'react';
import { CircleAlert, Loader2, Play } from 'lucide-react';

import type { VideoHistoryItem } from '@/network/video/history';

import { getCreatorVideoPresentation } from './creator-video-presentation';

export default function CreatorVideoPreview({
  item,
  noPreviewLabel,
  processingLabel,
  completedLabel,
  failedLabel,
}: {
  item: VideoHistoryItem;
  noPreviewLabel: string;
  processingLabel: string;
  completedLabel: string;
  failedLabel: string;
}) {
  const covers = useMemo(() => Array.from(new Set([
    item.coverImage,
    item.videoThumbnailUrl,
    item.imageUrl,
  ].filter((value): value is string => Boolean(value)))), [item.coverImage, item.imageUrl, item.videoThumbnailUrl]);
  const [coverIndex, setCoverIndex] = useState(0);
  const presentation = getCreatorVideoPresentation(item);

  useEffect(() => {
    setCoverIndex(0);
  }, [item.coverImage, item.id, item.imageUrl, item.videoThumbnailUrl]);

  const cover = covers[coverIndex];
  if (cover) {
    return (
      <>
        <img
          src={cover}
          alt={item.prompt}
          loading='lazy'
          className='h-full w-full object-cover'
          onError={() => setCoverIndex((index) => index + 1)}
        />
        {presentation.showSpinner ? (
          <div className='absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 text-sm font-medium text-white'>
            <Loader2 className='size-6 animate-spin' />
            <span>{processingLabel}</span>
          </div>
        ) : null}
        {presentation.showPlay ? (
          <div className='absolute inset-0 flex items-center justify-center bg-black/15 transition-colors group-hover:bg-black/35'>
            <span className='flex size-11 items-center justify-center rounded-full bg-black/65 text-white shadow-lg' title={completedLabel}>
              <Play className='ml-0.5 size-5 fill-current' />
            </span>
          </div>
        ) : null}
        {presentation.state === 'failed' ? (
          <div className='absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/65 px-3 text-center text-sm font-medium text-red-200'>
            <CircleAlert className='size-6' />
            <span>{failedLabel}</span>
          </div>
        ) : null}
      </>
    );
  }

  if (item.videoUrl) {
    return (
      <video
        src={item.videoUrl}
        muted
        playsInline
        preload='metadata'
        className='h-full w-full object-cover'
        onMouseEnter={(event) => void event.currentTarget.play()}
        onMouseLeave={(event) => {
          event.currentTarget.pause();
          event.currentTarget.currentTime = 0;
        }}
      >
        <track kind='captions' />
      </video>
    );
  }

  return (
    <div className='flex h-full items-center justify-center text-white/30'>
      {presentation.showSpinner ? (
        <span className='flex flex-col items-center gap-2'>
          <Loader2 className='animate-spin' />
          <span>{processingLabel}</span>
        </span>
      ) : presentation.state === 'failed' ? (
        <span className='flex flex-col items-center gap-2 text-red-200'>
          <CircleAlert />
          <span>{failedLabel}</span>
        </span>
      ) : noPreviewLabel}
    </div>
  );
}
