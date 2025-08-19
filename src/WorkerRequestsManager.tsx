/* eslint-disable @typescript-eslint/no-explicit-any */
import { GenericWorkerRequest, WorkerResponse, WorkerRequest } from "./messages/types";

export class WorkerRequestsManager {
  private workers: Worker[] = [];
  private workersCurrentRequest: Record<number, string | undefined> = {};
  private tasksRegistry: Record<string, [(value: any) => void, () => void]> = {};
  private id = 0;
  private queue: GenericWorkerRequest<string, unknown>[] = [];
  public length = 0;
  constructor() {
    const numOfWorkers = 5;
    this.length = numOfWorkers;
    const createWorkerMessageHandler = (index: number) => (result: MessageEvent<any>) => {
      const response = result.data as WorkerResponse;

      if (this.tasksRegistry[response.id]) {
        this.tasksRegistry[response.id][0](response);
        delete this.tasksRegistry[response.id];
      } else {
        console.error(
          "No resolve/reject found in task registry",
          JSON.stringify(this.tasksRegistry, undefined, 2)
        );
      }

      if (this.workersCurrentRequest[index] === response.id) {
        this.workersCurrentRequest[index] = undefined;
        this.popQueueAndRun();
      } else {
        console.error("RequestId in response doesnt match recorded");
      }
    };

    new Array(numOfWorkers).fill(1).map((_, i) => {
      this.workers.push(
        new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })
      );
      this.workersCurrentRequest[i] = undefined;
      this.workers[i].onmessage = createWorkerMessageHandler(i);
    });
  }

  public async request<T extends WorkerRequest["type"]>(
    request: Omit<Extract<WorkerRequest, { type: T; }>, "id">
  ): Promise<Extract<WorkerResponse, { type: T; }>> {
    const id = String(this.id++);

    let resolve: (
      value: Extract<WorkerResponse, { type: T; }>
    ) => void = () => { };
    let reject: () => void = () => { };

    const promise = new Promise<Extract<WorkerResponse, { type: T; }>>(
      (newResolve, newReject) => {
        resolve = newResolve;
        reject = newReject;
      }
    );

    this.tasksRegistry[id] = [resolve, reject];

    this.queue.push({ ...request, id: id });

    this.popQueueAndRun();

    return promise;
  }

  private async popQueueAndRun() {
    const emptyWorkerId = Object.keys(this.workersCurrentRequest).find(
      (k) => !this.workersCurrentRequest[Number(k)]
    );

    if (!emptyWorkerId) {
      return;
    }

    const request = this.queue.shift();

    if (!request) {
      return;
    }

    this.workersCurrentRequest[Number(emptyWorkerId)] = request.id;
    this.workers[Number(emptyWorkerId)].postMessage(request);
  }
}
