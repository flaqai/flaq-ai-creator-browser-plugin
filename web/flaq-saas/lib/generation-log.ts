'use client';

export type GenerationLogPhase =
  | 'submit.started'
  | 'submit.accepted'
  | 'submit.failed'
  | 'history.pending-written'
  | 'polling.started'
  | 'polling.status'
  | 'polling.retry'
  | 'polling.completed'
  | 'polling.failed'
  | 'polling.timeout';

type GenerationLogEvent = {
  phase: GenerationLogPhase;
  operationId: string;
  mediaType: 'image' | 'video';
  taskId?: string;
  model?: string;
  status?: string;
  attempt?: number;
  elapsedMs?: number;
  error?: unknown;
};

const LOG_PREFIX = '[FLAQ generation]';

function redactMessage(message: string) {
  return message
    .replace(/https?:\/\/\S+/gi, '<redacted-url>')
    .replace(/(client[_ -]?key|authorization|secret|token)\s*[:=]\s*\S+/gi, '$1=<redacted>')
    .slice(0, 240);
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return { name: error.name, message: redactMessage(error.message) };
  }
  return { name: 'UnknownError', message: redactMessage(String(error)) };
}

export function createGenerationOperationId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `generation-${Date.now().toString(36)}`;
}

export function logGenerationEvent(event: GenerationLogEvent) {
  const { taskId, error, ...fields } = event;
  const payload = {
    timestamp: new Date().toISOString(),
    ...fields,
    taskRef: taskId ? taskId.slice(0, 8) : undefined,
    error: error === undefined ? undefined : serializeError(error),
  };
  const method =
    event.phase === 'submit.failed' || event.phase === 'polling.failed' || event.phase === 'polling.timeout'
      ? 'error'
      : event.phase === 'polling.retry'
        ? 'warn'
        : 'info';
  console[method](LOG_PREFIX, payload);
}
