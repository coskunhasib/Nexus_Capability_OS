import type { RuntimeAdapterRequest, RuntimeAdapterResponse } from './runtimeAdapter.ts';

export type RuntimeAdapterProviderMode = 'mock' | 'http' | 'external';

export type RuntimeAdapterProvider = {
  id: string;
  label: string;
  mode: RuntimeAdapterProviderMode;
  description: string;
  dispatch(request: RuntimeAdapterRequest): Promise<RuntimeAdapterResponse>;
};

export type RuntimeAdapterProviderConfig = {
  endpoint_url?: string;
  auth_token?: string;
  timeout_ms?: number;
};

export type RuntimeAdapterProviderRegistry = Record<string, RuntimeAdapterProvider>;

export function createRuntimeAdapterProviderRegistry(providers: RuntimeAdapterProvider[]): RuntimeAdapterProviderRegistry {
  return Object.fromEntries(providers.map((provider) => [provider.id, provider]));
}

export function getRuntimeAdapterProvider(registry: RuntimeAdapterProviderRegistry, providerId: string): RuntimeAdapterProvider {
  const provider = registry[providerId];
  if (!provider) throw new Error(`Unknown runtime adapter provider: ${providerId}`);
  return provider;
}

export async function dispatchRuntimeAdapterRequest(provider: RuntimeAdapterProvider, request: RuntimeAdapterRequest): Promise<RuntimeAdapterResponse> {
  return provider.dispatch(request);
}
