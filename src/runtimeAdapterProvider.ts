import type { RuntimeAdapterRequest, RuntimeAdapterResponse } from './runtimeAdapter.ts';

export type RuntimeAdapterProviderMode = 'mock' | 'http' | 'external';

export type RuntimeAdapterProviderHealth = {
  ok: boolean;
  provider_id: string;
  status: 'healthy' | 'unconfigured' | 'unreachable' | 'failed';
  message: string;
  checked_at: string;
};

export type RuntimeAdapterProvider = {
  id: string;
  label: string;
  mode: RuntimeAdapterProviderMode;
  description: string;
  dispatch(request: RuntimeAdapterRequest): Promise<RuntimeAdapterResponse>;
  healthCheck?(): Promise<RuntimeAdapterProviderHealth>;
};

export type RuntimeAdapterRetryPolicy = {
  max_retries?: number;
  retry_delay_ms?: number;
  retry_on_statuses?: number[];
};

export type RuntimeAdapterProviderConfig = {
  endpoint_url?: string;
  healthcheck_url?: string;
  auth_token?: string;
  timeout_ms?: number;
  retry_policy?: RuntimeAdapterRetryPolicy;
  fetch_impl?: typeof fetch;
};

export type RuntimeAdapterProviderRegistry = Record<string, RuntimeAdapterProvider>;

export class RuntimeAdapterProviderError extends Error {
  code: string;
  retryable: boolean;
  status?: number;

  constructor(message: string, options: { code: string; retryable?: boolean; status?: number }) {
    super(message);
    this.name = 'RuntimeAdapterProviderError';
    this.code = options.code;
    this.retryable = options.retryable ?? false;
    this.status = options.status;
  }
}

export function createRuntimeAdapterProviderRegistry(providers: RuntimeAdapterProvider[]): RuntimeAdapterProviderRegistry {
  return Object.fromEntries(providers.map((provider) => [provider.id, provider]));
}

export function getRuntimeAdapterProvider(registry: RuntimeAdapterProviderRegistry, providerId: string): RuntimeAdapterProvider {
  const provider = registry[providerId];
  if (!provider) throw new RuntimeAdapterProviderError(`Unknown runtime adapter provider: ${providerId}`, { code: 'UNKNOWN_PROVIDER' });
  return provider;
}

export async function dispatchRuntimeAdapterRequest(provider: RuntimeAdapterProvider, request: RuntimeAdapterRequest): Promise<RuntimeAdapterResponse> {
  return provider.dispatch(request);
}

export function isRuntimeAdapterResponse(value: unknown): value is RuntimeAdapterResponse {
  const candidate = value as RuntimeAdapterResponse;
  return Boolean(
    candidate &&
    candidate.packet_type === 'nexus.runtime_adapter_response' &&
    candidate.version === '0.1' &&
    typeof candidate.request_id === 'string' &&
    typeof candidate.accepted === 'boolean' &&
    ['accepted', 'rejected', 'queued', 'running', 'failed'].includes(candidate.status) &&
    candidate.job &&
    typeof candidate.job.job_id === 'string' &&
    typeof candidate.job.target_worker === 'string' &&
    typeof candidate.job.started_at === 'string' &&
    Array.isArray(candidate.events)
  );
}
