import { Vector2 } from "@/shared/libs/vectors";
import {
  createRenderRequestMessage,
  createRenderStopMessage,
  sendMessageToWorker,
  WorkerToMainMessage,
} from "./message";
import { FractalParamsBuildRules } from "./types";

export type RecordingSettings = {
  width: number;
  height: number;
  offset: Vector2;
  scale: number;
  fps: number;
  duration: number;
  timeMultiplier: number;
  startTime: number;
};

export type RecordingCallbacks = {
  onProgress?: (framesRendered: number, totalFrames: number) => void;
  onComplete?: (videoUrl: string) => void;
  onError?: (message: string) => void;
};

export type RecordingController = {
  stop: () => void;
};

export const recordFractal = ({
  params,
  settings,
  callbacks,
}: {
  params: FractalParamsBuildRules;
  settings: RecordingSettings;
  callbacks?: RecordingCallbacks;
}): RecordingController => {
  const worker = new Worker(new URL("./workerRenderer.ts", import.meta.url), {
    type: "module",
  });

  worker.addEventListener("message", (event) => {
    const message = event.data as WorkerToMainMessage;

    switch (message.type) {
      case "render_progress":
        callbacks?.onProgress?.(
          message.data.framesRendered,
          message.data.totalFrames,
        );
        break;
      case "render_complete":
        callbacks?.onComplete?.(URL.createObjectURL(message.data.blob));
        worker.terminate();
        break;
      case "render_error":
        callbacks?.onError?.(message.data.message);
        worker.terminate();
        break;
    }
  });

  worker.addEventListener("error", (event) => {
    callbacks?.onError?.(event.message || "Worker error occurred");
    worker.terminate();
  });

  sendMessageToWorker(
    worker,
    createRenderRequestMessage({
      fractal: params,
      startTime: settings.startTime,
      timeMultiplier: settings.timeMultiplier,
      width: settings.width,
      height: settings.height,
      offset: settings.offset,
      scale: settings.scale,
      fps: settings.fps,
      duration: settings.duration,
    }),
  );

  return {
    stop: () => {
      sendMessageToWorker(worker, createRenderStopMessage());
      worker.terminate();
    },
  };
};
