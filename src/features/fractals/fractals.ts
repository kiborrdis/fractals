import { createRenderLoop } from "./renderLoop";
import {
  FractalParamsBuildRules,
  Vector2,
} from "./types";
import { ShaderFractal } from "./shader/ShaderFractal";
import { makeFractalParamsFromRules } from "./ruleConversion";

export const createFractalVisualizer = (
  formula: string,
  canvas: HTMLCanvasElement,
  canvasSize: Vector2,
  initialFractalParams: FractalParamsBuildRules,
  loopParams: { play: boolean; time: number; timeMultiplier: number },
  renderCallback?: (time: number) => void,
) => {
  let fractalParamsRules: FractalParamsBuildRules = {
    ...initialFractalParams,
  };

  const shaderFractal = new ShaderFractal(formula, canvas, canvasSize);
  const params = makeFractalParamsFromRules(fractalParamsRules);
  shaderFractal.render(params);

  const loop = createRenderLoop({
    params: loopParams,
    loopIterationCallback: async ({ timeSinceStart }) => {
      shaderFractal.render({
        ...makeFractalParamsFromRules(fractalParamsRules, timeSinceStart),
      });

      if (renderCallback) {
        renderCallback(timeSinceStart);
      }
    },
  });

  const updateParams = (newParams: FractalParamsBuildRules) => {
    fractalParamsRules = {
      ...newParams,
    };

    shaderFractal.render(makeFractalParamsFromRules(fractalParamsRules, loop.getCurrentTime()));
  };

  return {
    loop,
    updateParams,
    resize: (newSize: Vector2) => {
      shaderFractal.resize(newSize);
    },
  };
};

export type StaticFractalVisualizerControls = ReturnType<
  typeof createFractalVisualizer
>;
