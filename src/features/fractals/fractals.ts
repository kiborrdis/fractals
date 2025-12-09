import { createRenderLoop } from "./renderLoop";
import { FractalParamsBuildRules } from "./types";
import { FractalsRenderer } from "./shader/FractalsRenderer";
import { Vector2 } from "@/shared/libs/vectors";
import { FractalImage } from "./shader/FractalImage";

const BUDGET = 500;

export const createFractalVisualizer = (
  canvas: HTMLCanvasElement,
  canvasSize: Vector2,
  initialFractalParams: FractalParamsBuildRules,
  loopParams: { play: boolean; time: number; timeMultiplier: number },
  renderCallback?: (time: number) => void,
) => {
  const context = canvas.getContext("webgl2", { antialias: true });
  if (!context) {
    throw new Error("WebGL2 context initialization failed");
  }

  const fractalImage = new FractalImage(context, initialFractalParams);
  const renderer = new FractalsRenderer(context, canvasSize, [[fractalImage]]);

  renderer.render(0);

  const loop = createRenderLoop({
    params: loopParams,
    loopIterationCallback: async ({ timeSinceStart }) => {
      renderer.render(timeSinceStart).then((renderTimeMs: number) => {
        if (renderTimeMs < 0) {
          loop.setMaxFps(30);
          return;
        }

        loop.setMaxFps(
          renderTimeMs > 0
            ? Math.min(60, Math.floor(BUDGET / renderTimeMs))
            : 60,
        );
      });

      if (renderCallback) {
        renderCallback(timeSinceStart);
      }
    },
  });

  const updateParams = (newParams: FractalParamsBuildRules) => {
    fractalImage.updateParams(newParams);
    renderer.render(loop.getCurrentTime());
  };

  return {
    loop,
    updateParams,
    resize: (newSize: Vector2) => {
      renderer.resize(newSize);
    },
  };
};

export const createShowcaseFractalsVisualizer = (
  canvas: HTMLCanvasElement,
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

  renderer.render(0);

  const loop = createRenderLoop({
    params: {
      time: 0,
      play: true,
      timeMultiplier: 1,
    },
    loopIterationCallback: async ({ timeSinceStart }) => {
      renderer.render(timeSinceStart).then((renderTimeMs: number) => {
        if (renderTimeMs < 0) {
          return;
        }

        loop.setMaxFps(
          renderTimeMs > 0
            ? Math.min(60, Math.floor(BUDGET / renderTimeMs))
            : 60,
        );
      });
    },
  });

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
