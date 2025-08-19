// import { JuliaSet, JuliaSetRenderer } from "./JuliaSetRenderer";
import { randomRange } from "./utils";
import { createRenderLoop } from "./renderLoop";
import {
  ConstBooleanRule,
  ConvertToBuildResult,
  FractalParams,
  FractalParamsBuildRules,
  NumberBuildRule,
  RuleType,
  Vector2,
  Vector3,
} from "./types";
import { ShaderFractal } from "./shader/ShaderFractal";

export const createFractalVisualizer = (
  canvas: HTMLCanvasElement,
  canvasSize: Vector2
) => {
  const shaderFractal = new ShaderFractal(canvas, canvasSize);

  const colorStart: Vector3 = [Math.random(), Math.random(), Math.random()];
  const colorEnd: Vector3 = [Math.random(), Math.random(), Math.random()];
  const colorOverflow: Vector3 = [Math.random(), Math.random(), Math.random()];

  // const fractalC = [-0.55, -0.595];
  // const fractalR = 2;

  // const fractalC = [-0.5, -0.595];
  const fractalC = [-0.54, -0.55];

  const fractalR = 3;
  const rangeSize = randomRange(0.2, 0.6);
  const fractalRRangeStart = [-rangeSize, -rangeSize];
  const fractalRRangeEnd = [rangeSize, rangeSize];

  const uniqnessMod = (Math.random() - 0.5) * 300;

  const uniqnessMod1 = (Math.random() - 0.5) * 300;

  const uniqnessMod2 = (Math.random() - 0.5) * 300;
  const startSep = randomRange(0.5, 12);

  const loop = createRenderLoop({
    loopIterationCallback: async ({ timeSinceStart }) => {
      const originalTimeSinceStart = timeSinceStart;
      timeSinceStart = timeSinceStart / 50;

      const iterationFractalC: Vector2 = [
        fractalC[0] + Math.cos(timeSinceStart / (1131 + uniqnessMod)) * 0.03,
        fractalC[1] + Math.sin(timeSinceStart / (1000 + uniqnessMod1)) * 0.03,
      ];
      const iterationFractalR = fractalR;

      const iterationFractalRRangeStart: Vector2 = [
        fractalRRangeStart[0] +
          Math.cos(timeSinceStart / (1131 + uniqnessMod2)) * 0.02,
        fractalRRangeStart[1] +
          Math.sin(timeSinceStart / (1030 + uniqnessMod)) * 0.02,
      ];
      const iterationFractalRRangeEnd: Vector2 = [
        fractalRRangeEnd[0] +
          Math.cos(timeSinceStart / (1000 + uniqnessMod1)) * 0.02,
        fractalRRangeEnd[1] +
          Math.sin(timeSinceStart / (1412 + uniqnessMod2)) * 0.02,
      ];
      shaderFractal.render({
        invert: false,
        mirror: true,
        colorStart,
        colorEnd,
        colorOverflow,
        splitNumber:
          startSep + Math.sin(timeSinceStart / 10000) * (startSep - 1.0),
        time: originalTimeSinceStart,
        c: iterationFractalC,
        r: iterationFractalR,
        rRangeStart: iterationFractalRRangeStart,
        rRangeEnd: iterationFractalRRangeEnd,
        maxIterations: 100,
        angularSplitNumber: 181,
        linearSplitPerDistChange: [0, 0],
        radialSplitPerDistChange: [0, 0],
        cxSplitPerDistChange: [0, 0],
        cySplitPerDistChange: [0, 0],
        rSplitPerDistChange: [0, 0],
        iterationsSplitPerDistChange: [0, 0],
      });
    },
  });

  return loop;
};

const makeScalarFromRule = (
  rule: NumberBuildRule | ConstBooleanRule,
  time: number = 0
): number | boolean => {
  if (rule.t === RuleType.ConstBoolean) {
    return rule.value;
  }

  if (rule.t === RuleType.StaticNumber) {
    return rule.value;
  }

  if (rule.t === RuleType.RangeNumber) {
    const [start, end] = rule.range;

    return (
      start +
      (end - start) / 2 +
      ((end - start) / 2) *
        Math.sin(time / ((rule.cycleSeconds * 1000) / Math.PI))
    );
  }

  return 0;
};

const makeArrayFromRules = <V extends NumberBuildRule[]>(
  rules: V,
  time: number = 0
): ConvertToBuildResult<V> => {
  return rules.map((rule) =>
    makeScalarFromRule(rule, time)
  ) as ConvertToBuildResult<V>;
};

export const makeFractalParamsFromRules = (
  rules: FractalParamsBuildRules,
  time: number = 0
): FractalParams => {
  return Object.entries(rules).reduce((acc, [key, value]) => {
    if (Array.isArray(value)) {
      // @ts-expect-error TODO research, maybe it can be done properly now
      acc[key as keyof FractalParams] = makeArrayFromRules(value, time);
      return acc;
    }

    // @ts-expect-error TODO research, maybe it can be done properly now
    acc[key] = makeScalarFromRule(value, time);
    return acc;
  }, {} as FractalParams);
};

export const createStaticFractalVisualizer = (
  canvas: HTMLCanvasElement,
  canvasSize: Vector2,
  initialFractalParams: FractalParamsBuildRules
) => {
  let fractalParamsRules: FractalParamsBuildRules = {
    ...initialFractalParams,
  };

  const shaderFractal = new ShaderFractal(canvas, canvasSize);
  const params = makeFractalParamsFromRules(fractalParamsRules);
  shaderFractal.render(params);

  const loop = createRenderLoop({
    loopIterationCallback: async ({ timeSinceStart }) => {
      console.log("??");
      shaderFractal.render({
        ...makeFractalParamsFromRules(fractalParamsRules, timeSinceStart),
        time: timeSinceStart,
      });
    },
  });

  const updateParams = (newParams: FractalParamsBuildRules) => {
    fractalParamsRules = {
      ...newParams,
    };

    shaderFractal.render(makeFractalParamsFromRules(fractalParamsRules));
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
  typeof createStaticFractalVisualizer
>;
