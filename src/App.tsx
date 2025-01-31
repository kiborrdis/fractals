import { useEffect, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
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

    let promise = new Promise<Extract<WorkerResponse, { type: T }>>(
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
      (k) => !Boolean(this.workersCurrentRequest[Number(k)])
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
  const ref = useRef<HTMLCanvasElement | null>(null);
  const loopRef = useRef<{
    run: () => void;
    stop: () => void;
  }>();
  const [run, setRun] = useState(true);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    loopRef.current = createFractalVisualizer(ref.current, [800, 600]);

    return () => {
      loopRef.current?.stop();
    };
  }, []);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <canvas
          ref={(el) => (ref.current = el)}
          style={{ width: 800, height: 600 }}
          width={800}
          height={600}
        />
        <button
          onClick={() => {
            if (run) {
              loopRef.current?.stop();
              setRun(false);
            } else {
              loopRef.current?.run();
              setRun(true);
            }
          }}
        >
          {run ? "Pause" : "Play"}
        </button>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
