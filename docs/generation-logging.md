# Generation Logging Standard

Generation diagnostics use structured browser-console events prefixed with `[FLAQ generation]`.

## Required lifecycle events

Every submission must emit `submit.started`, `submit.accepted`, `history.pending-written`, and `polling.started`. Polling emits `polling.status` only when the remote status changes, then exactly one terminal event: `polling.completed`, `polling.failed`, or `polling.timeout`. Recoverable request errors emit `polling.retry` with an incrementing attempt number.

Use `operationId` to correlate submission events. After acceptance, include only the first eight characters of the provider task ID as `taskRef`. Include media type, model name, status, attempt, and elapsed milliseconds where applicable.

## Privacy and severity

Never log prompts, uploaded media, result URLs, request or response bodies, headers, Client Keys, R2 credentials, authorization values, or tokens. Errors are limited to name and a redacted 240-character message.

- `info`: expected lifecycle transitions.
- `warn`: recoverable polling errors that will retry.
- `error`: rejected submission, terminal remote failure, or timeout.

When reporting a bug, copy only `[FLAQ generation]` entries from DevTools and redact any unexpected user content before sharing.
