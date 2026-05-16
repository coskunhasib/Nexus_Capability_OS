import express, { type Request, type Response } from 'express';
import { type Server } from 'node:http';
import { runMockRuntimeAdapter, type RuntimeAdapterRequest } from '../src/runtimeAdapter.ts';

export type LocalHttpWorkerConfig = {
  worker_id?: string;
  version?: string;
  port?: number;
};

export type LocalHttpWorkerServer = {
  server: Server;
  port: number;
  url: string;
  close(): Promise<void>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

export function isRuntimeAdapterRequest(value: unknown): value is RuntimeAdapterRequest {
  if (!isRecord(value)) return false;
  if (value.packet_type !== 'nexus.runtime_adapter_request') return false;
  if (value.version !== '0.1') return false;
  if (typeof value.request_id !== 'string') return false;
  if (!isRecord(value.handoff_packet)) return false;
  if (!isRecord(value.dispatch)) return false;
  if (typeof value.dispatch.target_worker !== 'string') return false;
  if (typeof value.dispatch.callback_url !== 'string') return false;
  return ['dry_run', 'mock', 'real'].includes(String(value.dispatch.mode));
}

function workerError(code: string, message: string, retryable = false) {
  return {
    packet_type: 'nexus.local_http_worker_error',
    version: '0.1',
    code,
    message,
    retryable,
  };
}

export function createLocalHttpWorkerApp(config: LocalHttpWorkerConfig = {}) {
  const workerId = config.worker_id ?? 'local-http-worker';
  const version = config.version ?? '0.1';
  const app = express();

  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_request: Request, response: Response) => {
    response.json({
      ok: true,
      worker_id: workerId,
      version,
      status: 'healthy',
      capabilities: [
        'nexus.runtime_adapter_request',
        'nexus.runtime_adapter_response',
        'runtime_bridge_events',
        'artifact_refs',
      ],
    });
  });

  app.post('/runtime/adapter', (request: Request, response: Response) => {
    if (!isRuntimeAdapterRequest(request.body)) {
      response.status(400).json(workerError(
        'INVALID_RUNTIME_ADAPTER_REQUEST',
        'Request body must be a nexus.runtime_adapter_request v0.1 payload.',
      ));
      return;
    }

    const adapterResponse = runMockRuntimeAdapter({
      ...request.body,
      dispatch: {
        ...request.body.dispatch,
        target_worker: workerId,
      },
    });
    response.json(adapterResponse);
  });

  app.use((_request: Request, response: Response) => {
    response.status(404).json(workerError('NOT_FOUND', 'Unknown local worker endpoint.'));
  });

  return app;
}

export function startLocalHttpWorkerServer(config: LocalHttpWorkerConfig = {}): Promise<LocalHttpWorkerServer> {
  const app = createLocalHttpWorkerApp(config);
  const port = config.port ?? 8787;

  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      const address = server.address();
      const actualPort = typeof address === 'object' && address ? address.port : port;
      resolve({
        server,
        port: actualPort,
        url: `http://localhost:${actualPort}`,
        close: () => new Promise<void>((closeResolve, closeReject) => {
          server.close((error) => {
            if (error) closeReject(error);
            else closeResolve();
          });
        }),
      });
    });
    server.on('error', reject);
  });
}
