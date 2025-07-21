/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { createFractalVisualizer } from "./fractals/fractals";
import {
  GenericWorkerRequest,
  WorkerRequest,
  WorkerResponse,
} from "./messages/types";

class WorkerRequestsManager {
  private workers: Worker[] = [];
  private workersCurrentRequest: Record<number, string | undefined> = {};
  private tasksRegistry: Record<string, [(value: any) => void, () => void]> =
    {};
  private id = 0;
  private queue: GenericWorkerRequest<string, unknown>[] = [];
  public length = 0;
  constructor() {
    const numOfWorkers = 5;
    this.length = numOfWorkers;
    const createWorkerMessageHandler =
      (index: number) => (result: MessageEvent<any>) => {
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
    request: Omit<Extract<WorkerRequest, { type: T }>, "id">
  ): Promise<Extract<WorkerResponse, { type: T }>> {
    const id = String(this.id++);

    let resolve: (
      value: Extract<WorkerResponse, { type: T }>
    ) => void = () => {};
    let reject: () => void = () => {};

    const promise = new Promise<Extract<WorkerResponse, { type: T }>>(
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

export const workers = new WorkerRequestsManager();

function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [[width, height], setSize] = useState([800, 600]);

  const ref = useRef<HTMLCanvasElement | null>(null);
  const loopRef = useRef<{
    run: () => void;
    stop: () => void;
    running: boolean;
  }>();

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    loopRef.current = createFractalVisualizer(ref.current, [width, height]);

    return () => {
      loopRef.current?.stop();
    };
  }, [width, height]);

  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      if (containerRef.current) {
        const entry = entries[0];
        if (entry) {
          setSize((prev) => {
            if (
              prev[0] === entry.contentRect.width &&
              prev[1] === entry.contentRect.height
            ) {
              return prev;
            }
            return [entry.contentRect.width, entry.contentRect.height];
          });
        }
      }
    });

    if (containerRef.current) {
      obs.observe(containerRef.current);
    }

    return () => {
      obs.disconnect();
    };
  });

  return (
    <div
      onDoubleClick={() => {
        if (!loopRef.current) {
          return;
        }

        if (loopRef.current.running) {
          loopRef.current.stop();
        } else {
          loopRef.current.run();
        }
      }}
      ref={(el) => {
        if (el) {
          setSize((prev) => {
            if (prev[0] === el.clientWidth && prev[1] === el.clientHeight) {
              return prev;
            }

            return [el.clientWidth, el.clientHeight];
          });
        }

        containerRef.current = el;
      }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <canvas
        ref={(el) => (ref.current = el)}
        style={{ width, height }}
        width={width}
        height={height}
      />
    </div>
  );
}

export default App;
