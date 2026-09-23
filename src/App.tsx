import { useEffect, useMemo, useState } from 'react';

import { buildCreatorUrl, getBundledSiteUrl, getUiLanguage } from './config';

type FrameStatus = 'loading' | 'ready' | 'error';

function message(key: string, fallback: string) {
  if (typeof chrome === 'undefined' || !chrome.i18n?.getMessage) return fallback;
  return chrome.i18n.getMessage(key) || fallback;
}

export default function App() {
  const isBundledSite = import.meta.env.VITE_EMBEDDED_SITE === 'true';
  const targetUrl = useMemo(
    () => buildCreatorUrl(
      isBundledSite ? getBundledSiteUrl() : import.meta.env.VITE_SIDEPANEL_SITE_URL,
      getUiLanguage(),
      {
        includeDefaultLocale: isBundledSite,
        includeIndexDocument: isBundledSite,
      },
    ),
    [isBundledSite],
  );
  const [frameKey, setFrameKey] = useState(0);
  const [status, setStatus] = useState<FrameStatus>('loading');
  const [isReachable, setIsReachable] = useState(false);

  useEffect(() => {
    if (isBundledSite) {
      setIsReachable(true);
      return undefined;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12_000);

    fetch(targetUrl, {
      cache: 'no-store',
      credentials: 'omit',
      mode: 'no-cors',
      signal: controller.signal,
    })
      .then(() => setIsReachable(true))
      .catch(() => setStatus('error'))
      .finally(() => window.clearTimeout(timeout));

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [frameKey, isBundledSite, targetUrl]);

  const retry = () => {
    setStatus('loading');
    setIsReachable(false);
    setFrameKey((value) => value + 1);
  };

  return (
    <main className="sidepanel-shell">
      {isReachable && (
        <iframe
          key={frameKey}
          className="site-frame"
          src={targetUrl}
          title={message('frameTitle', 'FLAQ AI Creator')}
          allow="clipboard-read; clipboard-write"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setStatus('ready')}
          onError={() => setStatus('error')}
        />
      )}

      {status !== 'ready' && (
        <section className={`frame-state frame-state-${status}`} aria-live="polite">
          <div className="brand-mark" aria-hidden="true">
            <img src="/icons/icon-128.png" alt="" />
            {status === 'loading' && <span className="loading-orbit" />}
          </div>

          {status === 'loading' ? (
            <p>{message('loadingMessage', 'Loading FLAQ…')}</p>
          ) : (
            <div className="error-copy">
              <h1>{message('loadErrorTitle', 'FLAQ could not be loaded')}</h1>
              <p>{message('loadErrorDescription', 'Check that the site is running and allows browser extension embedding.')}</p>
              <div className="error-actions">
                <button type="button" onClick={retry}>{message('retryButton', 'Retry')}</button>
                <a href={targetUrl} target="_blank" rel="noreferrer">
                  {message('openButton', 'Open in a new tab')}
                </a>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
