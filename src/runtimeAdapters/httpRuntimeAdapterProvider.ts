import type { RuntimeAdapterRequest, RuntimeAdapterResponse } from '../runtimeAdapter.ts';
import type { RuntimeAdapterProvider, RuntimeAdapterProviderConfig } from '../runtimeAdapterProvider.ts';

export function createHttpRuntimeAdapterProvider(config: RuntimeAdapterProviderConfig): RuntimeAdapterProvider {
  const endpointUrl = config.endpoint_url;
  return {
    id: 'http',
    label: 'HTTP Runtime Adapter',
    mode: 'http',
    description: 'HTTP provider skeleton for real local or remote runtime workers.',
    async dispatch(request: RuntimeAdapterRequest): Promise<RuntimeAdapterResponse> {
      if (!endpointUrl) {
        throw new Error('HTTP runtime adapter endpoint_url is required.');
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.timeout_ms ?? 30000);
      try {
        const response = await fetch(endpointUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(config.auth_token ? { Authorization: `Bearer ${config.auth_token}` } : {}),
          },
          body: JSON.stringify(request),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP runtime adapter failed with ${response.status}`);
        }

        return (await response.json()) as RuntimeAdapterResponse;
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}
