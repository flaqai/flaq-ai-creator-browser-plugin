import {
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  ExternalLink,
  FileText,
  GalleryVerticalEnd,
  History,
  Image as ImageIcon,
  LoaderCircle,
  Plus,
  RefreshCw,
  Settings as SettingsIcon,
  Sparkles,
  Trash2,
  Video,
  WandSparkles,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { pollTask, submitTask } from './api';
import { captureActivePage } from './browser';
import { MODELS, modelsFor } from './models';
import {
  clearPendingContext,
  CONTEXT_KEY,
  loadHistory,
  loadPendingContext,
  loadSettings,
  saveHistory,
  saveSettings,
} from './storage';
import type { HistoryItem, MediaType, PageContext, Settings } from './types';

type View = 'create' | 'history';

const time = new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit' });

function safeHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function statusLabel(status: HistoryItem['status']) {
  return { submitted: '已提交', processing: '生成中', succeed: '已完成', failed: '失败' }[status];
}

function Logo({ size = 28 }: { size?: number }) {
  return <img className="logo" src="/icons/icon-128.png" width={size} height={size} alt="FLAQ" />;
}

function IconButton({ label, children, onClick }: { label: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <button className="icon-button" type="button" aria-label={label} title={label} onClick={onClick}>
      {children}
    </button>
  );
}

function SettingsDialog({
  settings,
  onClose,
  onSave,
}: {
  settings: Settings;
  onClose: () => void;
  onSave: (value: Settings) => Promise<void>;
}) {
  const [draft, setDraft] = useState(settings);
  const [saved, setSaved] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSave({ baseUrl: draft.baseUrl.trim(), clientKey: draft.clientKey.trim() });
    setSaved(true);
    window.setTimeout(onClose, 500);
  };

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="dialog-header">
          <div>
            <span className="eyebrow">连接</span>
            <h2 id="settings-title">FLAQ API 设置</h2>
          </div>
          <IconButton label="关闭设置" onClick={onClose}><X size={18} /></IconButton>
        </div>
        <form className="settings-form" onSubmit={submit}>
          <label>
            <span>Client Key</span>
            <input
              type="password"
              autoComplete="off"
              placeholder="输入你的 FLAQ Client Key"
              value={draft.clientKey}
              onChange={(event) => setDraft({ ...draft, clientKey: event.target.value })}
            />
          </label>
          <label>
            <span>API 地址</span>
            <input
              type="url"
              readOnly
              aria-readonly="true"
              value={draft.baseUrl}
            />
          </label>
          <p className="settings-note">密钥只保存在当前浏览器扩展的本地存储中，不会写入网页。</p>
          <a className="text-link" href="https://flaq.ai" target="_blank" rel="noreferrer">
            获取 Client Key <ArrowUpRight size={14} />
          </a>
          <button className="primary-button" type="submit">
            {saved ? <Check size={17} /> : <Sparkles size={17} />}
            {saved ? '已保存' : '保存设置'}
          </button>
        </form>
      </section>
    </div>
  );
}

function ContextCard({ context, onRefresh, onClear }: { context: PageContext; onRefresh: () => void; onClear: () => void }) {
  return (
    <section className="context-card">
      <div className="context-icon"><FileText size={17} /></div>
      <div className="context-copy">
        <div className="context-domain">{safeHostname(context.url) || '当前页面'}</div>
        <div className="context-title">{context.selection || context.title || '未读取到页面标题'}</div>
      </div>
      <IconButton label="重新读取当前页面" onClick={onRefresh}><RefreshCw size={16} /></IconButton>
      <IconButton label="移除页面上下文" onClick={onClear}><X size={16} /></IconButton>
    </section>
  );
}

function ResultCard({ item }: { item: HistoryItem }) {
  const isBusy = item.status === 'submitted' || item.status === 'processing';
  return (
    <article className="result-card">
      <div className="result-preview">
        {item.resultUrl && item.mediaType === 'image' ? (
          <img src={item.resultUrl} alt={item.prompt} />
        ) : item.resultUrl && item.mediaType === 'video' ? (
          <video src={item.resultUrl} poster={item.thumbnailUrl} controls playsInline />
        ) : item.thumbnailUrl ? (
          <img src={item.thumbnailUrl} alt="参考素材" />
        ) : (
          <div className="result-placeholder">
            {isBusy ? <LoaderCircle className="spin" size={26} /> : item.status === 'failed' ? <CircleAlert size={26} /> : <WandSparkles size={26} />}
          </div>
        )}
        <span className={`status status-${item.status}`}>
          {isBusy && <span className="status-dot" />}{statusLabel(item.status)}
        </span>
      </div>
      <div className="result-body">
        <div className="result-meta"><span>{item.modelLabel}</span><span>{time.format(item.createdAt)}</span></div>
        <p>{item.error || item.prompt}</p>
        {item.resultUrl && (
          <a className="result-action" href={item.resultUrl} target="_blank" rel="noreferrer">
            查看原文件 <ExternalLink size={14} />
          </a>
        )}
      </div>
    </article>
  );
}

export default function App() {
  const [view, setView] = useState<View>('create');
  const [mediaType, setMediaType] = useState<MediaType>('image');
  const [modelId, setModelId] = useState('nano-banana-2');
  const [prompt, setPrompt] = useState('');
  const [ratio, setRatio] = useState('1:1');
  const [resolution, setResolution] = useState('2k');
  const [duration, setDuration] = useState(5);
  const [referenceUrl, setReferenceUrl] = useState('');
  const [context, setContext] = useState<PageContext | null>(null);
  const [settings, setSettingsState] = useState<Settings>({ baseUrl: 'https://api.flaq.ai', clientKey: '' });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  const model = useMemo(() => MODELS.find((item) => item.id === modelId) ?? MODELS[0], [modelId]);
  const typeModels = useMemo(() => modelsFor(mediaType), [mediaType]);

  const updateHistory = useCallback(async (next: HistoryItem[]) => {
    setHistory(next);
    await saveHistory(next);
  }, []);

  const applyContext = useCallback((next: PageContext | null) => {
    setContext(next);
    if (next?.selection) setPrompt((current) => current || next.selection || '');
    if (next?.imageUrl) {
      setMediaType('image');
      setModelId('nano-banana-2-edit');
      setReferenceUrl(next.imageUrl);
    }
  }, []);

  const refreshContext = useCallback(async () => applyContext(await captureActivePage()), [applyContext]);

  useEffect(() => {
    void Promise.all([loadSettings(), loadHistory(), loadPendingContext()]).then(([storedSettings, storedHistory, pending]) => {
      setSettingsState(storedSettings);
      setHistory(storedHistory);
      if (pending) {
        applyContext(pending);
        void clearPendingContext();
      } else {
        void refreshContext();
      }
    });
  }, [applyContext, refreshContext]);

  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.storage?.onChanged) return;
    const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
      const next = changes[CONTEXT_KEY]?.newValue as PageContext | undefined;
      if (next) {
        applyContext(next);
        void clearPendingContext();
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, [applyContext]);

  useEffect(() => {
    const pending = history.filter((item) => item.status === 'submitted' || item.status === 'processing');
    if (!pending.length || !settings.clientKey) return;
    const timer = window.setInterval(() => {
      void Promise.all(pending.map(async (item) => {
        try {
          return await pollTask(settings, item);
        } catch (error) {
          return { ...item, error: error instanceof Error ? error.message : '状态更新失败' };
        }
      })).then((polled) => {
        const updates = new Map(polled.map((item) => [item.id, item]));
        void updateHistory(history.map((item) => updates.get(item.id) || item));
      });
    }, 3500);
    return () => window.clearInterval(timer);
  }, [history, settings, updateHistory]);

  const selectMediaType = (next: MediaType) => {
    const first = modelsFor(next)[0];
    setMediaType(next);
    setModelId(first.id);
    setRatio(first.ratios[0]);
    setResolution(first.resolutions[0]);
    setReferenceUrl('');
  };

  const selectModel = (nextId: string) => {
    const next = MODELS.find((item) => item.id === nextId);
    if (!next) return;
    setModelId(nextId);
    setRatio(next.ratios.includes(ratio) ? ratio : next.ratios[0]);
    setResolution(next.resolutions.includes(resolution) ? resolution : next.resolutions[0]);
    if (next.durations && !next.durations.includes(duration)) setDuration(next.durations[0]);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!prompt.trim()) {
      setMessage({ type: 'error', text: '先描述你想生成的内容' });
      promptRef.current?.focus();
      return;
    }
    if (!settings.clientKey) {
      setSettingsOpen(true);
      setMessage({ type: 'error', text: '连接 FLAQ API 后即可开始生成' });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      const item = await submitTask(settings, { model, prompt: prompt.trim(), ratio, resolution, duration, referenceUrl: referenceUrl.trim() });
      await updateHistory([item, ...history]);
      setPrompt('');
      setView('history');
      setMessage({ type: 'success', text: '任务已提交，正在生成' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '任务提交失败' });
    } finally {
      setSubmitting(false);
    }
  };

  const saveConfig = async (next: Settings) => {
    await saveSettings(next);
    setSettingsState(next);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand"><Logo /><div><strong>FLAQ</strong><span>AI Creator</span></div></div>
        <div className="header-actions">
          <IconButton label="设置" onClick={() => setSettingsOpen(true)}><SettingsIcon size={18} /></IconButton>
          <IconButton label="关闭侧边栏" onClick={() => window.close()}><X size={19} /></IconButton>
        </div>
      </header>

      <nav className="view-tabs" aria-label="主导航">
        <button className={view === 'create' ? 'active' : ''} type="button" onClick={() => setView('create')}><Plus size={16} />创作</button>
        <button className={view === 'history' ? 'active' : ''} type="button" onClick={() => setView('history')}><History size={16} />记录<span className="count">{history.length}</span></button>
      </nav>

      <main className="main-content">
        {view === 'create' ? (
          <form className="creator" onSubmit={submit}>
            <div className="intro">
              <span className="eyebrow">CREATE FROM ANYWHERE</span>
              <h1>灵感不必离开<br />当前页面。</h1>
              <p>选取网页文字或图片，在右侧直接生成。</p>
            </div>

            {context ? (
              <ContextCard context={context} onRefresh={() => void refreshContext()} onClear={() => setContext(null)} />
            ) : (
              <button className="context-empty" type="button" onClick={() => void refreshContext()}><GalleryVerticalEnd size={17} />读取当前页面</button>
            )}

            {!settings.clientKey && (
              <button className="connect-banner" type="button" onClick={() => setSettingsOpen(true)}>
                <span><CircleAlert size={17} /><span><strong>还差一步</strong><small>连接 FLAQ API 后开始创作</small></span></span>
                <ArrowUpRight size={17} />
              </button>
            )}

            <div className="media-switch" role="group" aria-label="生成类型">
              <button className={mediaType === 'image' ? 'active' : ''} type="button" onClick={() => selectMediaType('image')}><ImageIcon size={17} />图片</button>
              <button className={mediaType === 'video' ? 'active' : ''} type="button" onClick={() => selectMediaType('video')}><Video size={17} />视频</button>
            </div>

            <label className="field">
              <span>模型</span>
              <div className="select-wrap">
                <select value={modelId} onChange={(event) => selectModel(event.target.value)}>
                  {typeModels.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
                <ChevronDown size={16} />
              </div>
            </label>

            {model.referenceLabel && (
              <label className="field">
                <span>{model.referenceLabel}</span>
                <input
                  type="url"
                  required={model.referenceRequired}
                  placeholder="https://..."
                  value={referenceUrl}
                  onChange={(event) => setReferenceUrl(event.target.value)}
                />
              </label>
            )}

            <label className="prompt-field">
              <span className="sr-only">提示词</span>
              <textarea
                ref={promptRef}
                rows={6}
                maxLength={3000}
                placeholder={mediaType === 'image' ? '描述画面、风格、光线和构图…' : '描述镜头、动作、节奏和氛围…'}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
              />
              <div className="prompt-footer"><span>{prompt.length} / 3000</span><WandSparkles size={17} /></div>
            </label>

            <div className="option-grid">
              <label className="field compact"><span>画幅</span><div className="select-wrap"><select value={ratio} onChange={(event) => setRatio(event.target.value)}>{model.ratios.map((value) => <option key={value}>{value}</option>)}</select><ChevronDown size={15} /></div></label>
              <label className="field compact"><span>清晰度</span><div className="select-wrap"><select value={resolution} onChange={(event) => setResolution(event.target.value)}>{model.resolutions.map((value) => <option key={value}>{value}</option>)}</select><ChevronDown size={15} /></div></label>
              {model.durations && <label className="field compact"><span>时长</span><div className="select-wrap"><select value={duration} onChange={(event) => setDuration(Number(event.target.value))}>{model.durations.map((value) => <option key={value} value={value}>{value} 秒</option>)}</select><ChevronDown size={15} /></div></label>}
            </div>

            {message && <div className={`form-message ${message.type}`} role="status">{message.type === 'error' ? <CircleAlert size={16} /> : <Check size={16} />}{message.text}</div>}

            <button className="generate-button" type="submit" disabled={submitting}>
              <span className="button-glow" />
              {submitting ? <LoaderCircle className="spin" size={19} /> : <Sparkles size={19} />}
              {submitting ? '正在提交…' : `生成${mediaType === 'image' ? '图片' : '视频'}`}
            </button>
          </form>
        ) : (
          <section className="history-view">
            <div className="section-heading">
              <div><span className="eyebrow">RECENT CREATIONS</span><h1>创作记录</h1></div>
              {history.length > 0 && <IconButton label="清空记录" onClick={() => void updateHistory([])}><Trash2 size={17} /></IconButton>}
            </div>
            {message && <div className={`form-message ${message.type}`} role="status">{message.type === 'error' ? <CircleAlert size={16} /> : <Check size={16} />}{message.text}</div>}
            {history.length ? (
              <div className="result-list">{history.map((item) => <ResultCard key={item.id} item={item} />)}</div>
            ) : (
              <div className="empty-state"><div><Clock3 size={26} /></div><h2>这里还很安静</h2><p>完成的图片和视频会保存在这里。</p><button className="secondary-button" type="button" onClick={() => setView('create')}><Plus size={16} />开始创作</button></div>
            )}
          </section>
        )}
      </main>

      <footer className="app-footer">
        <span><span className={settings.clientKey ? 'connection-dot connected' : 'connection-dot'} />{settings.clientKey ? 'API 已连接' : 'API 未连接'}</span>
        <a href="https://flaq.ai/docs" target="_blank" rel="noreferrer">文档 <ArrowUpRight size={12} /></a>
      </footer>

      {settingsOpen && <SettingsDialog settings={settings} onClose={() => setSettingsOpen(false)} onSave={saveConfig} />}
    </div>
  );
}
