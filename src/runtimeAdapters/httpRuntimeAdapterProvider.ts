import type { RuntimeAdapterRequest, RuntimeAdapterResponse } from '../runtimeAdapter.ts';
import {
  isRuntimeAdapterResponse,
  RuntimeAdapterProviderError,
  type RuntimeAdapterProvider,
  type RuntimeAdapterProviderConfig,
  type RuntimeAdapterProviderHealth,
} from '../runtimeAdapterProvider.ts';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(fetchImpl: typeof fetch, url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new RuntimeAdapterProviderError(`HTTP runtime adapter timed out after ${timeoutMs}ms.`, { code: 'HTTP_TIMEOUT', retryable: true });
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function shouldRetry(status: number, retryOnStatuses: number[]) {
  return retryOnStatuses.includes(status) || status >= 500;
}

async function parseResponseJson(response: Response) {
  try {
    return await response.json();
  } catch {
    throw new RuntimeAdapterProviderError('HTTP runtime adapter returned invalid JSON.', { code: 'INVALID_JSON', retryable: false, status: response.status });
  }
}

export function createHttpRuntimeAdapterProvider(config: RuntimeAdapterProviderConfig): RuntimeAdapterProvider {
  const endpointUrl = config.endpoint_url;
  const healthcheckUrl = config.healthcheck_url ?? endpointUrl;
  const timeoutMs = config.timeout_ms ?? 30000;
  const retryPolicy = {
    max_retries: config.retry_policy?.max_retries ?? 0,
    retry_delay_ms: config.retry_policy?.retry_delay_ms ?? 250,
    retry_on_statuses: config.retry_policy?.retry_on_statuses ?? [408, 409, 425, 429, 500, 502, 503, 504],
  };
  const fetchImpl = config.fetch_impl ?? fetch;

  const headers = {
    'Content-Type': 'application/json',
    ...(config.auth_token ? { Authorization: `Bearer ${config.auth_token}` } : {}),
  };

  return {
    id: 'http',
    label: 'HTTP Runtime Adapter',
    mode: 'http',
    description: 'HTTP provider for real local or remote runtime workers with timeout, retry, response guard and health check boundaries.',
    async healthCheck(): Promise<RuntimeAdapterProviderHealth> {
      if (!healthcheckUrl) {
        return {
          ok: false,
          provider_id: 'http',
          status: 'unconfigured',
          message: 'HTTP runtime adapter healthcheck_url or endpoint_url is required.',
          checked_at: new Date().toISOString(),
        };
      }

      try {
        const response = await fetchWithTimeout(fetchImpl, healthcheckUrl, { method: 'GET', headers }, timeoutMs);
        return {
          ok: response.ok,
          provider_id: 'http',
          status: response.ok ? 'healthy' : 'failed',
          message: response.ok ? 'HTTP runtime adapter endpoint is reachable.' : `HTTP runtime adapter health check failed with ${response.status}.`,
          checked_at: new Date().toISOString(),
        };
      } catch (error) {
        return {
          ok: false,
          provider_id: 'http',
          status: 'unreachable',
          message: error instanceof Error ? error.message : 'HTTP runtime adapter health check failed.',
          checked_at: new Date().toISOString(),
        };
      }
    },
    async dispatch(request: RuntimeAdapterRequest): Promise<RuntimeAdapterResponse> {
      if (!endpointUrl) {
        throw new RuntimeAdapterProviderError('HTTP runtime adapter endpoint_url is required.', { code: 'HTTP_ENDPOINT_REQUIRED' });
      }

      let attempt = 0;
      while (true) {
        const response = await fetchWithTimeout(fetchImpl, endpointUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(request),
        }, timeoutMs);

        if (!response.ok) {
          const retryable = shouldRetry(response.status, retryPolicy.retry_on_statuses);
          if (retryable && attempt < retryPolicy.max_retries) {
            attempt += 1;
            await sleep(retryPolicy.retry_delay_ms);
            continue;
          }
          throw new RuntimeAdapterProviderError(`HTTP runtime adapter failed with ${response.status}.`, {
            code: 'HTTP_STATUS_ERROR',
            retryable,
            status: response.status,
          });
        }

        const payload = await parseResponseJson(response);
        if (!isRuntimeAdapterResponse(payload)) {
          throw new RuntimeAdapterProviderError('HTTP runtime adapter returned an invalid runtime adapter response shape.', {
            code: 'INVALID_RUNTIME_ADAPTER_RESPONSE',
            retryable: false,
            status: response.status,
          });
        }

        return payload;
      }
    },
  };
}
