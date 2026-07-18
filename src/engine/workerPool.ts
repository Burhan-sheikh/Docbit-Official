export interface WorkerTask {
  id: string;
  workerName: string;
  payload: unknown;
  transfer?: Transferable[];
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}

const workerFactories: Record<string, () => Worker> = {};
const pools: Record<string, Worker[]> = {};
const maxPerName = 2;

export function registerWorker(name: string, factory: () => Worker): void {
  workerFactories[name] = factory;
}

function getWorker(name: string): Worker | null {
  const factory = workerFactories[name];
  if (!factory) return null;
  const pool = pools[name] || (pools[name] = []);
  const idle = pool.find((w) => !(w as any).__busy);
  if (idle) return idle;
  if (pool.length < maxPerName) {
    const w = factory();
    pool.push(w);
    return w;
  }
  return null;
}

export async function runWorker<T = unknown>(
  name: string,
  payload: unknown,
  transfer: Transferable[] = []
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const tryRun = () => {
      const worker = getWorker(name);
      if (!worker) {
        setTimeout(tryRun, 50);
        return;
      }
      (worker as any).__busy = true;
      worker.onmessage = (e: MessageEvent) => {
        (worker as any).__busy = false;
        resolve(e.data as T);
      };
      worker.onerror = (e: ErrorEvent) => {
        (worker as any).__busy = false;
        reject(new Error(e.message || `Worker ${name} failed`));
      };
      worker.postMessage(payload, transfer);
    };
    tryRun();
  });
}

export function terminateAll(): void {
  for (const name of Object.keys(pools)) {
    pools[name].forEach((w) => w.terminate());
    delete pools[name];
  }
}
