async function configurePanel() {
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
}

chrome.runtime.onInstalled.addListener(() => {
  void configurePanel();
});

chrome.runtime.onStartup.addListener(() => void configurePanel());
