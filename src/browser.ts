import type { PageContext } from './types';

export async function captureActivePage(): Promise<PageContext | null> {
  if (typeof chrome === 'undefined' || !chrome.tabs?.query) {
    return {
      title: 'FLAQ AI Creator — 浏览器侧边栏预览',
      url: window.location.href,
      selection: '',
    };
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://')) {
    return tab ? { title: tab.title || '', url: tab.url || '' } : null;
  }

  let selection = '';
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection()?.toString().trim() || '',
    });
    selection = typeof result?.result === 'string' ? result.result : '';
  } catch {
    // Restricted pages still provide title and URL.
  }

  return { title: tab.title || '', url: tab.url, selection };
}
