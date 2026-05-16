import { startLocalHttpWorkerServer } from './local-http-worker.ts';

const port = Number(process.env.LOCAL_HTTP_WORKER_PORT ?? 8787);

startLocalHttpWorkerServer({ port })
  .then((worker) => {
    console.log(JSON.stringify({
      status: 'listening',
      worker_url: worker.url,
      health_url: `${worker.url}/health`,
      adapter_url: `${worker.url}/runtime/adapter`,
    }, null, 2));
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
