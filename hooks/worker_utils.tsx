type WorkerMessage<T> = {
    action: string;
    data: T;
};

export function createWorker(workerScript: URL): Worker {
    return new Worker(workerScript);
}

export function runWorker<T, U>(worker: Worker, action: string, data: T): Promise<U> {
    return new Promise((resolve, reject) => {
        const listener = (event: MessageEvent<WorkerMessage<U>>) => {
            if (event.data.action === `${action}Response`) {
                worker.removeEventListener('message', listener);
                resolve(event.data.data);
            }
        };
        worker.addEventListener('message', listener);
        worker.onerror = (error) => {
            worker.postMessage({ action: "error", data: { message: error.message } });
            worker.removeEventListener('message', listener);
            reject(error);
        };
        worker.postMessage({ action, data });
    });
}