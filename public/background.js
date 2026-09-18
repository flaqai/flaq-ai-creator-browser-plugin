const CONTEXT_KEY = 'flaq-pending-page-context';

async function configurePanel() {
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
}

chrome.runtime.onInstalled.addListener(() => {
  void configurePanel();
  chrome.contextMenus.create({
    id: 'flaq-use-selection',
    title: '用 FLAQ 创作选中的内容',
    contexts: ['selection'],
  });
  chrome.contextMenus.create({
    id: 'flaq-use-image',
    title: '用 FLAQ 创作这张图片',
    contexts: ['image'],
  });
});

chrome.runtime.onStartup.addListener(() => void configurePanel());

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;

  const payload = {
    title: tab.title || '',
    url: tab.url || '',
    selection: info.menuItemId === 'flaq-use-selection' ? info.selectionText || '' : '',
    imageUrl: info.menuItemId === 'flaq-use-image' ? info.srcUrl || '' : '',
    capturedAt: Date.now(),
  };

  await Promise.all([
    chrome.storage.local.set({ [CONTEXT_KEY]: payload }),
    chrome.sidePanel.open({ tabId: tab.id }),
  ]);
});
