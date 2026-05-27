import { FractalParamsBuildRules } from "./types";
import { FractalsRenderer } from "./shader/FractalsRenderer";
import { Vector2 } from "@/shared/libs/vectors";
import { FractalImage } from "./shader/FractalImage";
import { RenderLoop } from "@/shared/libs/render-loop";
import { WebGLError } from "./errors";

const BUDGET = 500;

export const createFractalVisualizer = (
  canvas: HTMLCanvasElement,
  canvasSize: Vector2,
  initialFractalParams: FractalParamsBuildRules,
  loopParams: {
    play: boolean;
    time: number;
    timeMultiplier: number;
    loopStartTime?: number;
    loopDuration?: number;
    maxFps?: number;
  },
  renderCallback?: (time: number) => void,
  initialCamera: {
    offset: Vector2;
    scale: number;
  } = {
    offset: [0, 0],
    scale: 1,
  },
  onError?: (error: unknown) => void,
) => {
  let camera = initialCamera;

  const context = canvas.getContext("webgl2", { antialias: true });
  if (!context) {
    throw new WebGLError("WebGL2 context initialization failed");
  }

  const fractalImage = new FractalImage(context, initialFractalParams);
  const renderer = new FractalsRenderer(context, canvasSize, [[fractalImage]]);
  const firstRenderTime = loopParams.time ?? 0;

  const render: typeof renderer.render = (...args) => {
    return renderer.render(...args).catch((error) => {
      if (onError) {
        onError(error);
        return -1;
      }
      throw error;
    });
  };

  render(firstRenderTime, camera);
  renderCallback?.(firstRenderTime);

  const iterationCallback = async ({
    timeSinceStart,
  }: {
    timeSinceStart: number;
  }) => {
    const promise = render(timeSinceStart, camera).then(
      (renderTimeMs: number) => {
        if (loopParams.maxFps === 0) {
          return;
        }

        if (renderTimeMs < 0) {
          loop.maxFps = 30;
          return;
        }

        loop.maxFps =
          renderTimeMs > 0
            ? Math.min(60, Math.floor(BUDGET / renderTimeMs))
            : 60;
      },
    );

    if (renderCallback) {
      renderCallback(timeSinceStart);
    }

    return promise;
  };

  const loop = new RenderLoop(
    iterationCallback,
    {
      play: loopParams.play,
      initialTime: loopParams.time,
      timeMultiplier: loopParams.timeMultiplier,
      loopTimeStart: loopParams.loopStartTime,
      loopDuration: loopParams.loopDuration,
    },
    loopParams.maxFps,
    onError,
  );

  const updateParams = (newParams: FractalParamsBuildRules): Promise<void> => {
    fractalImage.updateParams(newParams);

    return render(loop.currentTime, camera).then(() => {});
  };

  return {
    loop,
    updateParams,
    setCamera: (newCamera: { offset: Vector2; scale: number }) => {
      camera = newCamera;
      render(loop.currentTime, camera);
    },
    resize: (newSize: Vector2) => {
      renderer.resize(newSize);
      render(loop.currentTime, camera);
    },
  };
};

export const createShowcaseFractalsVisualizer = (
  canvas: HTMLCanvasElement | OffscreenCanvas,
  canvasSize: Vector2,
  fractals: FractalParamsBuildRules[][],
  params: { play: boolean } = { play: true },
  onError?: (error: unknown) => void,
) => {
  const context = canvas.getContext("webgl2", { antialias: true });
  if (!context) {
    throw new WebGLError("WebGL2 context initialization failed");
  }

  const fractalImagesGrid: FractalImage[][] = fractals.map((row) => {
    return row.map((fractalParams) => {
      return new FractalImage(context as WebGL2RenderingContext, fractalParams);
    });
  });
  const renderer = new FractalsRenderer(
    context as WebGL2RenderingContext,
    canvasSize,
    fractalImagesGrid,
  );

  const render: typeof renderer.render = (...args): Promise<number> => {
    return renderer.render(...args).catch((error) => {
      if (onError) {
        onError(error);
        return -1;
      }
      throw error;
    });
  };

  render(0, { offset: [0, 0], scale: 1 }, true);

  const iterationCallback = async ({
    timeSinceStart,
  }: {
    timeSinceStart: number;
  }) => {
    return render(timeSinceStart, { offset: [0, 0], scale: 1 }, true).then(
      (renderTimeMs: number) => {
        if (renderTimeMs < 0) {
          return;
        }

        loop.maxFps =
          renderTimeMs > 0
            ? Math.min(60, Math.floor(BUDGET / renderTimeMs))
            : 60;
      },
    );
  };

  const loop = new RenderLoop(
    iterationCallback,
    {
      play: params.play,
      initialTime: 0,
      timeMultiplier: 1,
    },
    60,
    onError,
  );

  return {
    loop,
    cleanup: () => {
      renderer.cleanup();
    },
    resize: (newSize: Vector2) => {
      renderer.resize(newSize);
      render(loop.currentTime, { offset: [0, 0], scale: 1 }, true);
    },
  };
};

export type StaticFractalVisualizerControls = ReturnType<
  typeof createFractalVisualizer
>;
