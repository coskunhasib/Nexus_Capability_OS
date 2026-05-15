import { runMockRuntimeAdapter } from '../runtimeAdapter.ts';
import type { RuntimeAdapterProvider } from '../runtimeAdapterProvider.ts';

export const mockRuntimeAdapterProvider: RuntimeAdapterProvider = {
  id: 'mock',
  label: 'Mock Runtime Adapter',
  mode: 'mock',
  description: 'In-process mock provider for demos, CI and local adapter-loop verification.',
  async dispatch(request) {
    return runMockRuntimeAdapter(request);
  },
  async healthCheck() {
    return {
      ok: true,
      provider_id: 'mock',
      status: 'healthy',
      message: 'Mock runtime adapter is available in-process.',
      checked_at: new Date().toISOString(),
    };
  },
};
