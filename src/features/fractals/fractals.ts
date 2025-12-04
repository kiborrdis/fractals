import { createRenderLoop } from "./renderLoop";
import { FractalParamsBuildRules } from "./types";
import { FractalsRenderer } from "./shader/FractalsRenderer";
import { Vector2 } from "@/shared/libs/vectors";
import { FractalImage } from "./shader/FractalImage";

export const createFractalVisualizer = (
  formula: string,
  canvas: HTMLCanvasElement,
  canvasSize: Vector2,
  initialFractalParams: FractalParamsBuildRules,
  loopParams: { play: boolean; time: number; timeMultiplier: number },
  renderCallback?: (time: number) => void
) => {
  const context = canvas.getContext("webgl2", { antialias: true });
  if (!context) {
    throw new Error("WebGL2 context initialization failed");
  }

  const fractalImage = new FractalImage(context, formula, initialFractalParams);
  const renderer = new FractalsRenderer(context, canvasSize, [[fractalImage]]);

  renderer.render(0);

  const loop = createRenderLoop({
    params: loopParams,
    loopIterationCallback: async ({ timeSinceStart }) => {
      renderer.render(timeSinceStart);

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
  fractals: FractalParamsBuildRules[][]
) => {
  const context = canvas.getContext("webgl2", { antialias: true });
  if (!context) {
    throw new Error("WebGL2 context initialization failed");
  }
  const fractalImagesGrid: FractalImage[][] = fractals.map((row) => {
    return row.map((fractalParams) => {
      return new FractalImage(context, fractalParams.formula, fractalParams);
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
      renderer.render(timeSinceStart);
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
