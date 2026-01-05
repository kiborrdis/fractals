import { FractalParamsBuildRules } from "./types";
import { FractalsRenderer } from "./shader/FractalsRenderer";
import { Vector2 } from "@/shared/libs/vectors";
import { FractalImage } from "./shader/FractalImage";
import { RenderLoop } from "@/shared/libs/render-loop";

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
) => {
  let camera = initialCamera;

  const context = canvas.getContext("webgl2", { antialias: true });
  if (!context) {
    throw new Error("WebGL2 context initialization failed");
  }

  const fractalImage = new FractalImage(context, initialFractalParams);
  const renderer = new FractalsRenderer(context, canvasSize, [[fractalImage]]);
  const firstRenderTime = loopParams.time ?? 0;

  renderer.render(firstRenderTime, camera);
  renderCallback?.(firstRenderTime);

  const iterationCallback = async ({
    timeSinceStart,
  }: {
    timeSinceStart: number;
  }) => {
    renderer.render(timeSinceStart, camera).then((renderTimeMs: number) => {
      if (loopParams.maxFps === 0) {
        return;
      }

      if (renderTimeMs < 0) {
        loop.maxFps = 30;
        return;
      }

      loop.maxFps =
        renderTimeMs > 0 ? Math.min(60, Math.floor(BUDGET / renderTimeMs)) : 60;
    });

    if (renderCallback) {
      renderCallback(timeSinceStart);
    }
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
  );

  const updateParams = (newParams: FractalParamsBuildRules): Promise<void> => {
    fractalImage.updateParams(newParams);
    return renderer.render(loop.currentTime, camera).then(() => {});
  };

  return {
    loop,
    updateParams,
    setCamera: (newCamera: { offset: Vector2; scale: number }) => {
      camera = newCamera;
      renderer.render(loop.currentTime, camera);
    },
    resize: (newSize: Vector2) => {
      renderer.resize(newSize);
    },
  };
};

export const createShowcaseFractalsVisualizer = (
  canvas: HTMLCanvasElement | OffscreenCanvas,
  canvasSize: Vector2,
  fractals: FractalParamsBuildRules[][],
) => {
  const context = canvas.getContext("webgl2", { antialias: true });
  if (!context) {
    throw new Error("WebGL2 context initialization failed");
  }
  const fractalImagesGrid: FractalImage[][] = fractals.map((row) => {
    return row.map((fractalParams) => {
      return new FractalImage(context, fractalParams);
    });
  });
  const renderer = new FractalsRenderer(context, canvasSize, fractalImagesGrid);

  renderer.render(0, { offset: [0, 0], scale: 1 }, true);

  const iterationCallback = async ({
    timeSinceStart,
  }: {
    timeSinceStart: number;
  }) => {
    renderer
      .render(timeSinceStart, { offset: [0, 0], scale: 1 }, true)
      .then((renderTimeMs: number) => {
        if (renderTimeMs < 0) {
          return;
        }

        loop.maxFps =
          renderTimeMs > 0
            ? Math.min(60, Math.floor(BUDGET / renderTimeMs))
            : 60;
      });
  };

  const loop = new RenderLoop(
    iterationCallback,
    {
      play: true,
      initialTime: 0,
      timeMultiplier: 1,
    },
    60,
  );

  return {
    loop,
    resize: (newSize: Vector2) => {
      renderer.resize(newSize);
    },
  };
};

export type StaticFractalVisualizerControls = ReturnType<
  typeof createFractalVisualizer
>;
