import { FractalParamsBuildRules } from "./types";

export type RenderRequestMessage = {
  type: "render_start";
  data: {
    fractal: FractalParamsBuildRules;
    startTime: number;
    timeMultiplier: number;
    width: number;
    height: number;
    offset: [number, number];
    scale: number;
    fps: number;
    duration: number;
  };
};

export type RenderStopMessage = {
  type: "render_stop";
};

export type RenderProgressMessage = {
  type: "render_progress";
  data: {
    framesRendered: number;
    totalFrames: number;
  };
};

export type RenderCompleteMessage = {
  type: "render_complete";
  data: {
    blob: Blob;
  };
};

export type RenderErrorMessage = {
  type: "render_error";
  data: {
    message: string;
  };
};

export type WorkerToMainMessage =
  | RenderProgressMessage
  | RenderCompleteMessage
  | RenderErrorMessage;

export type MainToWorkerMessage = RenderRequestMessage | RenderStopMessage;

export const createRenderRequestMessage = (
  data: RenderRequestMessage["data"],
): RenderRequestMessage => {
  return {
    type: "render_start",
    data,
  };
};

export const createRenderStopMessage = (): RenderStopMessage => {
  return {
    type: "render_stop",
  };
};

export const sendMessageToWorker = (
  worker: Worker,
  message: MainToWorkerMessage,
) => {
  worker.postMessage(message);
};
