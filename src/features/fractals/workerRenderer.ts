import {
  BufferTarget,
  CanvasSource,
  Mp4OutputFormat,
  Output,
} from "mediabunny";
import { FractalImage } from "./shader/FractalImage";
import { RecordLoop } from "@/shared/libs/render-loop";
import { FractalsRenderer } from "./shader/FractalsRenderer";
import { RenderRequestMessage } from "./message";

const IDLE_TIMEOUT_MS = 10000;
const PROGRESS_INTERVAL_MS = 1000;

let idleTimeoutId: ReturnType<typeof setTimeout> | null = null;
let stopRequested = false;
let currentLoop: RecordLoop | null = null;

const resetIdleTimeout = () => {
  if (idleTimeoutId) {
    clearTimeout(idleTimeoutId);
  }
  idleTimeoutId = setTimeout(() => {
    console.log("Worker idle timeout - terminating");
    self.close();
  }, IDLE_TIMEOUT_MS);
};

// Start the initial idle timeout
resetIdleTimeout();

// wait for a message about what to render
self.addEventListener("message", async (event) => {
  const { type, data } = event.data;

  if (type === "render_stop") {
    stopRequested = true;
    if (currentLoop) {
      currentLoop.stop();
    }
    return;
  }

  if (type === "render_start") {
    if (idleTimeoutId) {
      clearTimeout(idleTimeoutId);
      idleTimeoutId = null;
    }
    stopRequested = false;

    const {
      fractal,
      width,
      height,
      fps,
      duration,
      timeMultiplier,
      startTime,
      scale,
      offset,
    } = data as RenderRequestMessage["data"];

    const adjustedDuration = duration / timeMultiplier;
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext("webgl2", {
      antialias: true,
      preserveDrawingBuffer: true,
    });

    if (!context) {
      self.postMessage({
        type: "render_error",
        data: { message: "Failed to create WebGL2 context" },
      });
      resetIdleTimeout();
      return;
    }

    const fractalImage = new FractalImage(context, fractal);
    const renderer = new FractalsRenderer(
      context,
      [width, height],
      [[fractalImage]],
    );
    const totalFrames = Math.floor((adjustedDuration / 1000) * fps);
    let framesRendered = 0;
    let lastProgressUpdate = Date.now();

    const canvasSource = new CanvasSource(canvas, {
      codec: "av1",
      bitrate: 20_000_000,
    });
    const bufferTarget = new BufferTarget();
    const out = new Output({
      format: new Mp4OutputFormat(),
      target: bufferTarget,
    });

    out.addVideoTrack(canvasSource);
    out.setMetadataTags({
      title: "Fractal Recording",
      artist: "Fractal Playground",
      date: new Date(),
    });

    try {
      await out.start();

      const renderFrame = async ({ time }: { time: number }): Promise<void> => {
        if (stopRequested) {
          return;
        }

        await renderer.render(time * timeMultiplier, {
          offset,
          scale,
        });
        framesRendered += 1;

        const now = Date.now();
        if (now - lastProgressUpdate >= PROGRESS_INTERVAL_MS) {
          self.postMessage({
            type: "render_progress",
            data: {
              framesRendered,
              totalFrames,
            },
          });
          lastProgressUpdate = now;
        }

        await canvasSource.add(time / 1000, 1 / fps);
      };

      let resolveRecording: () => void = () => {};
      const recordingPromise = new Promise<void>((res) => {
        resolveRecording = res;
      });

      currentLoop = new RecordLoop(
        renderFrame,
        () => {
          resolveRecording();
        },
        {
          initialTime: startTime,
          duration: adjustedDuration,
          fps: fps,
        },
      );
      currentLoop.run();

      await recordingPromise;

      if (stopRequested) {
        // Recording was stopped early
        canvasSource.close();
        resetIdleTimeout();
        return;
      }

      canvasSource.close();
      await out.finalize();

      const buf = bufferTarget.buffer;
      if (!buf) {
        throw new Error("No buffer data from recording");
      }

      const videoBlob = new Blob([buf], { type: "video/mp4" });

      self.postMessage({
        type: "render_complete",
        data: { blob: videoBlob },
      });
    } catch (error) {
      self.postMessage({
        type: "render_error",
        data: {
          message: error instanceof Error ? error.message : "Unknown error",
        },
      });
    } finally {
      currentLoop = null;
      resetIdleTimeout();
    }
  }
});
