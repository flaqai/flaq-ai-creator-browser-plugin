type CreatorVideoHistoryItem = {
  status: 'pending' | 'processing' | 'completed' | 'fail';
  coverImage?: string;
  videoThumbnailUrl: string;
  imageUrl: string;
  videoUrl: string;
};

export type CreatorVideoPresentation = {
  state: 'processing' | 'completed' | 'failed';
  cover?: string;
  href?: string;
  showSpinner: boolean;
  showPlay: boolean;
};

export function getCreatorVideoPresentation(item: CreatorVideoHistoryItem): CreatorVideoPresentation {
  const cover = [item.coverImage, item.videoThumbnailUrl, item.imageUrl].find(Boolean);

  if (item.status === 'pending' || item.status === 'processing') {
    return { state: 'processing', cover, href: undefined, showSpinner: true, showPlay: false };
  }
  if (item.status === 'completed' && item.videoUrl) {
    return { state: 'completed', cover, href: item.videoUrl, showSpinner: false, showPlay: true };
  }
  return { state: 'failed', cover, href: undefined, showSpinner: false, showPlay: false };
}
