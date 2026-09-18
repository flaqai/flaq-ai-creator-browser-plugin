import type { HistoryItem, PageContext, Settings } from './types';

const SETTINGS_KEY = 'flaq-settings';
const HISTORY_KEY = 'flaq-history';
export const CONTEXT_KEY = 'flaq-pending-page-context';

const defaults: Settings = { baseUrl: 'https://api.flaq.ai', clientKey: '' };
const hasChromeStorage = () => typeof chrome !== 'undefined' && Boolean(chrome.storage?.local);

async function read<T>(key: string, fallback: T): Promise<T> {
  if (!hasChromeStorage()) {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  }
  const value = await chrome.storage.local.get(key);
  return (value[key] as T | undefined) ?? fallback;
}

async function write<T>(key: string, value: T) {
  if (!hasChromeStorage()) {
    localStorage.setItem(key, JSON.stringify(value));
    return;
  }
  await chrome.storage.local.set({ [key]: value });
}

export const loadSettings = () => read(SETTINGS_KEY, defaults);
export const saveSettings = (settings: Settings) => write(SETTINGS_KEY, settings);
export const loadHistory = () => read<HistoryItem[]>(HISTORY_KEY, []);
export const saveHistory = (items: HistoryItem[]) => write(HISTORY_KEY, items.slice(0, 30));
export const loadPendingContext = () => read<PageContext | null>(CONTEXT_KEY, null);

export async function clearPendingContext() {
  if (!hasChromeStorage()) {
    localStorage.removeItem(CONTEXT_KEY);
    return;
  }
  await chrome.storage.local.remove(CONTEXT_KEY);
}
