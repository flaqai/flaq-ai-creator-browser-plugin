'use client';

import { useEffect, useState } from 'react';
import {
  buildOpenApiUrl,
  createOpenApiHeaders,
  DEFAULT_OPEN_API_BASE_URL,
  OPEN_API_BASE_URL_STORAGE_KEY,
  OPEN_API_CLIENT_KEY_STORAGE_KEY,
} from '@/network/clientFetch';
import { Check, ChevronDown, ChevronRight, ExternalLink, KeyRound, PlugZap, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import {
  clearAllSecureStorage,
  getSecureItem,
  isRememberMeEnabled,
  setSecureItem,
} from '@/lib/utils/secureStorage';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const FLAQ_REGISTER_URL = 'https://flaq.ai/';

async function requestApiOriginAccess(baseUrl: string) {
  if (typeof chrome === 'undefined' || !chrome.permissions?.request) return true;
  const origin = `${new URL(baseUrl).origin}/*`;
  if (await chrome.permissions.contains({ origins: [origin] })) return true;
  return chrome.permissions.request({ origins: [origin] });
}

function isAuthError(status: number, message: string) {
  const normalizedMessage = message.toLowerCase();
  return (
    status === 401 ||
    status === 403 ||
    normalizedMessage.includes('unauthorized') ||
    normalizedMessage.includes('authentication') ||
    normalizedMessage.includes('authenticate') ||
    normalizedMessage.includes('invalid client key') ||
    normalizedMessage.includes('invalid api key') ||
    normalizedMessage.includes('invalid key') ||
    normalizedMessage.includes('forbidden') ||
    normalizedMessage.includes('未认证') ||
    normalizedMessage.includes('鉴权') ||
    normalizedMessage.includes('认证') ||
    normalizedMessage.includes('无效的client key') ||
    normalizedMessage.includes('client key无效')
  );
}

type OpenApiSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function OpenApiSettingsDialog({ open, onOpenChange }: OpenApiSettingsDialogProps) {
  const t = useTranslations('components.open-api-settings');
  const tHosting = useTranslations('components.image-hosting');
  const tCommon = useTranslations('Common');
  const [baseUrl, setBaseUrl] = useState(DEFAULT_OPEN_API_BASE_URL);
  const [clientKey, setClientKey] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [securityNoticeExpanded, setSecurityNoticeExpanded] = useState(false);
  const [hostingExpanded, setHostingExpanded] = useState(true);

  useEffect(() => {
    if (!open || typeof window === 'undefined') return;

    setSecurityNoticeExpanded(false);
    setHostingExpanded(true);
    const loadSettings = async () => {
      const savedBaseUrl = await getSecureItem(OPEN_API_BASE_URL_STORAGE_KEY);
      const savedClientKey = await getSecureItem(OPEN_API_CLIENT_KEY_STORAGE_KEY);

      setBaseUrl(savedBaseUrl || DEFAULT_OPEN_API_BASE_URL);
      setClientKey(savedClientKey || '');
      setRememberMe(isRememberMeEnabled());
    };

    loadSettings();
  }, [open]);

  const handleReset = () => {
    setBaseUrl(DEFAULT_OPEN_API_BASE_URL);
    setClientKey('');
    setRememberMe(false);
  };

  const handleClearAll = () => {
    if (window.confirm(t('clear-data-confirm'))) {
      clearAllSecureStorage();
      handleReset();
      toast.success(t('data-cleared'));
    }
  };

  const handleSave = async () => {
    const normalizedBaseUrl = baseUrl.trim() || DEFAULT_OPEN_API_BASE_URL;
    const normalizedClientKey = clientKey.trim();

    if (!normalizedClientKey) {
      toast.error(t('required'));
      return;
    }

    if (!(await requestApiOriginAccess(normalizedBaseUrl))) {
      toast.error(t('test-failed'));
      return;
    }

    await setSecureItem(OPEN_API_BASE_URL_STORAGE_KEY, normalizedBaseUrl, rememberMe);
    await setSecureItem(OPEN_API_CLIENT_KEY_STORAGE_KEY, normalizedClientKey, rememberMe);

    toast.success(t('saved'));
    onOpenChange(false);
  };

  const handleTestConnection = async () => {
    const normalizedBaseUrl = baseUrl.trim() || DEFAULT_OPEN_API_BASE_URL;
    const normalizedClientKey = clientKey.trim();

    if (!normalizedClientKey) {
      toast.error(t('required'));
      return;
    }

    setIsTesting(true);

    try {
      if (!(await requestApiOriginAccess(normalizedBaseUrl))) {
        toast.error(t('test-failed'));
        return;
      }

      const response = await fetch(
        buildOpenApiUrl(normalizedBaseUrl, '/api/v1/image/00000000-0000-0000-0000-000000000000'),
        {
          method: 'GET',
          headers: createOpenApiHeaders(normalizedClientKey),
        },
      );

      const payload = (await response.json().catch(() => null)) as {
        error?: { message?: string };
        message?: string;
        msg?: string;
      } | null;
      const message = payload?.error?.message || payload?.message || payload?.msg || response.statusText;

      if (response.ok) {
        toast.success(t('test-success'));
        return;
      }

      if (isAuthError(response.status, message)) {
        toast.error(`${t('test-failed')} ${message}`);
        return;
      }

      toast.success(t('test-success-validation'));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('test-failed');
      toast.error(`${t('test-failed')} ${message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hiddenTitle={t('title')}
        className='max-h-[90vh] overflow-y-auto border-white/10 bg-[#111214] text-white sm:max-w-[600px]'
      >
        <DialogHeader className='space-y-2 text-left'>
          <DialogTitle className='text-xl font-semibold text-white'>{t('title')}</DialogTitle>
          <DialogDescription className='text-sm text-white/60'>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='rounded-xl border border-white/10 bg-white/[0.035] p-4'>
            <div className='grid gap-3 min-[480px]:grid-cols-3'>
              {[
                { icon: UserRound, text: t('step-account') },
                { icon: KeyRound, text: t('step-key') },
                { icon: PlugZap, text: t('step-create') },
              ].map(({ icon: Icon, text }, index) => (
                <div key={text} className='flex gap-2.5 text-xs leading-5 text-white/55'>
                  <span className='flex size-6 shrink-0 items-center justify-center rounded-md bg-white/8 text-white/70'>
                    <Icon className='size-3.5' aria-hidden='true' />
                  </span>
                  <span>
                    <b className='me-1 text-white/35'>{index + 1}.</b>
                    {text}
                  </span>
                </div>
              ))}
            </div>
            <a
              href={FLAQ_REGISTER_URL}
              target='_blank'
              rel='noreferrer'
              className='mt-4 flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
            >
              {t('register')}
              <ExternalLink className='size-3.5' aria-hidden='true' />
            </a>
          </div>

          <div className='space-y-2'>
            <label htmlFor='open-api-base-url' className='text-sm font-medium text-white/80'>
              {t('base-url')}
            </label>
            <Input
              id='open-api-base-url'
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
              placeholder={DEFAULT_OPEN_API_BASE_URL}
              className='h-11 border-white/10 bg-white/5 text-white placeholder:text-white/30'
            />
            <p className='text-xs text-white/45'>{t('base-url-hint')}</p>
          </div>

          <div className='space-y-2'>
            <label htmlFor='open-api-client-key' className='text-sm font-medium text-white/80'>
              {t('client-key')}
            </label>
            <Input
              id='open-api-client-key'
              type='password'
              value={clientKey}
              onChange={(event) => setClientKey(event.target.value)}
              className='h-11 border-white/10 bg-white/5 text-white placeholder:text-white/30'
            />

            <div className='flex flex-wrap items-center gap-x-2 gap-y-1 pt-2'>
              <Checkbox
                id='remember-me'
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <label htmlFor='remember-me' className='cursor-pointer text-sm text-white/70'>
                {t('remember-me')}
              </label>
              <button
                type='button'
                aria-expanded={securityNoticeExpanded}
                aria-controls='client-key-security-notice'
                onClick={() => setSecurityNoticeExpanded((previous) => !previous)}
                className='text-sm font-medium text-blue-400 underline decoration-blue-400/35 underline-offset-4 transition-colors hover:text-blue-300 hover:decoration-blue-300 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400'
              >
                {t('security-notice')}
              </button>
            </div>
            <p className='text-xs text-white/45'>{t('remember-me-hint')}</p>

            {securityNoticeExpanded ? (
              <div
                id='client-key-security-notice'
                role='note'
                className='mt-3 rounded-md border border-[#735c28] bg-[#292211] p-3'
              >
                <p className='text-xs leading-5 text-[#fde68a]'>⚠️ {t('security-warning')}</p>
                <button
                  type='button'
                  onClick={handleClearAll}
                  className='mt-2 text-xs text-red-300 underline underline-offset-2 hover:text-red-200'
                >
                  {t('clear-data')}
                </button>
              </div>
            ) : null}
          </div>

          <div className='rounded-xl border border-white/10'>
            <button
              type='button'
              onClick={() => setHostingExpanded((previous) => !previous)}
              className='flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-white/75 transition hover:text-white'
              aria-expanded={hostingExpanded}
              aria-controls='image-hosting-settings'
            >
              <span>{tHosting('title')}</span>
              {hostingExpanded ? (
                <ChevronDown className='size-4' aria-hidden='true' />
              ) : (
                <ChevronRight className='size-4' aria-hidden='true' />
              )}
            </button>

            {hostingExpanded ? (
              <div id='image-hosting-settings' className='space-y-3 border-t border-white/10 p-4'>
                <div className='flex gap-3 rounded-lg border border-primary bg-primary/5 p-3'>
                  <span className='mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-primary bg-primary text-white'>
                    <Check className='size-2.5' strokeWidth={3} aria-hidden='true' />
                  </span>
                  <span>
                    <span className='block text-sm font-medium text-white'>{tHosting('builtin')}</span>
                    <span className='mt-1 block text-xs leading-5 text-white/50'>
                      {tHosting('builtin-description')}
                    </span>
                  </span>
                </div>
                <p className='rounded-lg bg-white/[0.035] px-3 py-2.5 text-xs leading-5 text-white/55'>
                  {tHosting('builtin-hint')}
                </p>
              </div>
            ) : null}
          </div>

        </div>

        <DialogFooter className='flex-col gap-2 sm:flex-row sm:justify-between'>
          <Button
            type='button'
            variant='outline'
            onClick={handleReset}
            className='border-white/10 bg-transparent text-white hover:bg-white/8 hover:text-white'
          >
            {tCommon('reset')}
          </Button>
          <div className='flex gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={handleTestConnection}
              disabled={isTesting}
              className='border-white/10 bg-transparent text-white hover:bg-white/8 hover:text-white'
            >
              {isTesting ? t('testing') : t('test')}
            </Button>
            <Button
              type='button'
              variant='ghost'
              onClick={() => onOpenChange(false)}
              className='text-white/70 hover:bg-white/8 hover:text-white'
            >
              {t('cancel')}
            </Button>
            <Button type='button' onClick={handleSave} className='bg-white text-black hover:bg-white/90'>
              {t('save')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
