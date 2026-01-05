import {
  DisplayFractal,
  makeRulesBasedOnParams,
  GradientStop,
  FractalParamsBuildRules,
} from "@/features/fractals";
import { Vector2 } from "@/shared/libs/vectors";
import { FractalImage } from "@/features/fractals/shader/FractalImage";
import { FractalsRenderer } from "@/features/fractals/shader/FractalsRenderer";
import { useEffect, useState } from "react";
import {
  makeArrayFromRules,
  makeRuleFromArray,
  NVectorStepRule,
  RuleType,
} from "@/shared/libs/numberRule";
import {
  getBitmapFromRenderer,
  renderBitmapToCanvas,
  renderNVectorStepRuleVisualization,
} from "./renderingUtils";
import { generateRandomFormula } from "./formulaGeneration";
import { findCellWithMostGreen } from "./cellFinder";
import { FullViewport } from "@/shared/ui/FullViewport/FullViewport";

// Example of asymetric map of maps
// formula = "exp(z^-2*(1.00 + -7.20i))*(1.00 + 8.78i)+c";

const BACKGROUND_GRADIENT: GradientStop[] = [
  [0, 0, 0, 0, 1],
  [10, 0, 0, 0, 1],
  [30, 0, 0, 0, 1],
  [40, 0, 0, 0, 1],
  [90, 0, 0.1, 0, 1],
  [98, 0, 0.1, 0, 1],
  [99, 0, 1, 0, 1],
  [100, 1, 0, 0, 1],
];

const BACKGROUND_GRADIENT_STEP_SEARCH: GradientStop[] = [
  [0, 0, 0, 0, 1],
  [10, 0, 0.1, 0, 1],
  [30, 0, 0.2, 0, 1],
  [40, 0, 0.7, 0, 1],
  [70, 0, 0.8, 0, 1],
  [99, 0, 0.01, 0, 1],
  [100, 1, 0, 0, 1],
];

const BACKGROUND_GRADIENT_GOOD_FRAME: GradientStop[] = [
  [0, 0, 0, 0, 1],
  [10, 0, 1, 0, 1],
  [20, 0, 1, 0, 1],
  [30, 0, 0, 0, 1],
  [40, 1, 0, 0, 1],
  [70, 1, 0, 0, 1],
  [80, 0, 0, 0, 1],
  [100, 0, 0, 0, 1],
];

const getParamsWithC = (
  formula: string,
  c: [number, number],
  gradient?: GradientStop[],
) => {
  return makeRulesBasedOnParams({
    formula: formula,
    gradient: gradient || BACKGROUND_GRADIENT,
    invert: false,
    mirroringType: "off",
    initialTime: 0,
    initialCFormula: "fCoord",
    initialZFormula: "c0",
    dynamic: {
      hexMirroringFactor: 1,
      hexMirroringDistVariation: 0,
      linearMirroringFactor: 1,
      time: 0,
      c: c,
      r: 10,
      rlVisibleRange: [-2, 2],
      imVisibleRange: [-2, 2],
      maxIterations: 100,
      linearMirroringDistVariation: 0,
      radialMirroringDistVariation: 0,
      cDistVariation: [0, 0],
      rDistVariation: 0,
      iterationsDistVariation: 0,
      radialMirroringAngle: 0,
    },
    custom: {},
  });
};

const findGreenestPointsAndMakeRule = async (
  formula: string,
  c: Vector2,
  numPoints: number = 5,
): Promise<NVectorStepRule<2> | null> => {
  const CANVAS_SIZE: Vector2 = [600, 600];
  const canvas = new OffscreenCanvas(...CANVAS_SIZE);

  const context = canvas.getContext("webgl2", {
    antialias: true,
    preserveDrawingBuffer: true,
  });
  if (!context) {
    throw new Error("WebGL2 context initialization failed");
  }

  const fractalImage = new FractalImage(
    context,
    getParamsWithC(formula, c, BACKGROUND_GRADIENT_STEP_SEARCH),
  );
  const renderer = new FractalsRenderer(context, CANVAS_SIZE, [[fractalImage]]);

  const data = await getBitmapFromRenderer(context, renderer, CANVAS_SIZE);

  // Find pixels with green values and sort by greenness
  const greenPixels: Array<{ x: number; y: number; green: number }> = [];

  for (let y = 0; y < CANVAS_SIZE[1]; y++) {
    for (let x = 0; x < CANVAS_SIZE[0]; x++) {
      const index = (y * CANVAS_SIZE[0] + x) * 4;
      const green = data[index + 1];
      if (green > 50) {
        greenPixels.push({ x, y, green });
      }
    }
  }

  // Sort by green value descending
  greenPixels.sort((a, b) => b.green - a.green);

  const veryGreenPixels = greenPixels.filter((p) => p.green > 200);
  console.log("veryGreenPixels", veryGreenPixels);
  // Take the greenest point first
  if (greenPixels.length === 0) {
    return null;
  }

  const greenestPixel = greenPixels[0];

  // Convert to c-space for neighborhood search
  const greenestC: Vector2 = [
    (greenestPixel.x / CANVAS_SIZE[0]) * 4 - 2,
    -(greenestPixel.y / CANVAS_SIZE[1]) * 4 + 2,
  ];

  // Define neighborhood radius in c-space
  const neighborhoodRadius = 0.3;

  // Filter pixels within the neighborhood
  const pixelsInNeighborhood = greenPixels.filter((pixel) => {
    const pixelC: Vector2 = [
      (pixel.x / CANVAS_SIZE[0]) * 4 - 2,
      -(pixel.y / CANVAS_SIZE[1]) * 4 + 2,
    ];
    const distance = Math.hypot(
      pixelC[0] - greenestC[0],
      pixelC[1] - greenestC[1],
    );
    return distance <= neighborhoodRadius;
  });

  // Take top N unique points (filter neighbors in pixel space to avoid clustering)
  const selectedPoints: Array<{ x: number; y: number }> = [];
  const minDistance = 20; // minimum pixel distance between selected points

  for (const pixel of pixelsInNeighborhood) {
    if (selectedPoints.length >= numPoints) break;

    const tooClose = selectedPoints.some(
      (p) => Math.hypot(p.x - pixel.x, p.y - pixel.y) < minDistance,
    );

    if (!tooClose) {
      selectedPoints.push({ x: pixel.x, y: pixel.y });
    }
  }

  // Convert pixel coordinates to c-space coordinates
  const cSpacePoints: Vector2[] = selectedPoints.map((p) => {
    // Map from pixel space to fractal coordinate space (-2 to 2 range)
    const cX = (p.x / CANVAS_SIZE[0]) * 4 - 2;
    const cY = -(p.y / CANVAS_SIZE[1]) * 4 + 2; // Flip Y
    return [cX, cY];
  });

  // Render to test-canvas2 for debugging with visualization
  await renderNVectorStepRuleVisualization(
    data,
    CANVAS_SIZE,
    veryGreenPixels,
    "test-canvas2",
  );

  // Create NVectorStepRule with linear transitions
  const transitionLength = 1; // 1 second per transition
  const transitions = cSpacePoints.map(() => ({
    fns: [{ t: "linear" as const }, { t: "linear" as const }],
    len: transitionLength,
  }));

  return {
    t: RuleType.StepNVector,
    dimension: 2,
    steps: cSpacePoints.map(([x, y]) => [x, y]),
    transitions,
  };
};

const lookForValidCForMap = async (
  formula: string,
): Promise<Vector2 | null> => {
  const CANVAS_SIZE: Vector2 = [900, 900];
  const GRID_SIZE = 9;
  const RANGE = [-1, 1];
  const cValues = new Array(GRID_SIZE)
    .fill(0)
    .map((_, i) => (i / (GRID_SIZE - 1)) * (RANGE[1] - RANGE[0]) + RANGE[0]);

  const canvas = new OffscreenCanvas(...CANVAS_SIZE);

  const context = canvas.getContext("webgl2", {
    antialias: true,
    preserveDrawingBuffer: true,
  });
  if (!context) {
    throw new Error("WebGL2 context initialization failed");
  }
  const fractalImagesGrid: FractalImage[][] = cValues.map((cx) =>
    cValues.map((cy) => {
      return new FractalImage(context, getParamsWithC(formula, [cx, cy]));
    }),
  );
  const renderer = new FractalsRenderer(
    context,
    CANVAS_SIZE,
    fractalImagesGrid,
  );

  const data = await getBitmapFromRenderer(context, renderer, CANVAS_SIZE);
  const cell = findCellWithMostGreen(
    data,
    CANVAS_SIZE[0],
    CANVAS_SIZE[1],
    GRID_SIZE,
  );

  // Render the modified data to test-canvas
  await renderBitmapToCanvas(data, CANVAS_SIZE, "test-canvas", true);

  if (!cell) {
    return null;
  }

  return [cValues[cell[0]], cValues[cell[1]]];
};
const makeToDisplayParams = () => {
  return makeRulesBasedOnParams({
    formula: formula,
    gradient: BACKGROUND_GRADIENT_GOOD_FRAME,
    invert: false,
    mirroringType: "off",
    initialTime: 0,
    bandSmoothing: formula.match(/(exp|sin|cos|tan|sinh|cosh)/)
      ? -1
      : undefined,
    dynamic: {
      hexMirroringFactor: 1,
      hexMirroringDistVariation: 0,
      linearMirroringFactor: 1,
      time: 0,
      c: [0, 0],
      r: 4,
      rlVisibleRange: [-1, 1],
      imVisibleRange: [-1, 1],
      maxIterations: 100,
      linearMirroringDistVariation: 0,
      radialMirroringDistVariation: 0,
      cDistVariation: [0, 0],
      rDistVariation: 0,
      iterationsDistVariation: 0,
      radialMirroringAngle: 0,
    },
    custom: {},
  });
};

const lookForGoodFrame = async (
  c: Vector2,
): Promise<{ rlVisibleRange: Vector2; imVisibleRange: Vector2 }> => {
  const CANVAS_SIZE: Vector2 = [600, 600];
  const INITIAL_RL_RANGE: Vector2 = [-1, 1];
  const INITIAL_IM_RANGE: Vector2 = [-1, 1];

  const canvas = new OffscreenCanvas(...CANVAS_SIZE);
  const context = canvas.getContext("webgl2", {
    antialias: true,
    preserveDrawingBuffer: true,
  });
  if (!context) {
    throw new Error("WebGL2 context initialization failed");
  }
  const params = makeToDisplayParams();
  params.dynamic.c = makeRuleFromArray(c);
  params.dynamic.rlVisibleRange = makeRuleFromArray(INITIAL_RL_RANGE);
  params.dynamic.imVisibleRange = makeRuleFromArray(INITIAL_IM_RANGE);

  const fractalImage = new FractalImage(context, params);
  const renderer = new FractalsRenderer(context, CANVAS_SIZE, [[fractalImage]]);
  const data = await getBitmapFromRenderer(context, renderer, CANVAS_SIZE);

  const [width, height] = CANVAS_SIZE;

  // Calculate F-scores for rows (horizontal, affects imVisibleRange)
  const rowScores: number[] = [];
  for (let y = 0; y < height; y++) {
    let greenSum = 0;
    let redSum = 0;
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      greenSum += data[index + 1]; // Green channel
      redSum += data[index]; // Red channel
    }
    const greenNorm = greenSum / (width * 255);
    const redNorm = redSum / (width * 255);
    const fScore =
      greenNorm + redNorm === 0
        ? 0
        : (2 * greenNorm * redNorm) / (greenNorm + redNorm);
    rowScores.push(fScore);
  }

  // Calculate F-scores for columns (vertical, affects rlVisibleRange)
  const colScores: number[] = [];
  for (let x = 0; x < width; x++) {
    let greenSum = 0;
    let redSum = 0;
    for (let y = 0; y < height; y++) {
      const index = (y * width + x) * 4;
      greenSum += data[index + 1]; // Green channel
      redSum += data[index]; // Red channel
    }
    const greenNorm = greenSum / (height * 255);
    const redNorm = redSum / (height * 255);
    const fScore =
      greenNorm + redNorm === 0
        ? 0
        : (2 * greenNorm * redNorm) / (greenNorm + redNorm);
    colScores.push(fScore);
  }

  // Find best window for rows (1/3 of height)
  const windowHeight = Math.floor(height / 3);
  let bestRowStart = 0;
  let maxRowSum = 0;
  for (let y = 0; y <= height - windowHeight; y++) {
    const sum = rowScores.slice(y, y + windowHeight).reduce((a, b) => a + b, 0);
    if (sum > maxRowSum) {
      maxRowSum = sum;
      bestRowStart = y;
    }
  }

  // Find best window for columns (1/3 of width)
  const windowWidth = Math.floor(width / 3);
  let bestColStart = 0;
  let maxColSum = 0;
  for (let x = 0; x <= width - windowWidth; x++) {
    const sum = colScores.slice(x, x + windowWidth).reduce((a, b) => a + b, 0);
    if (sum > maxColSum) {
      maxColSum = sum;
      bestColStart = x;
    }
  }

  // Map pixel positions back to c-space
  // For columns (x) -> rlVisibleRange
  const rlMin =
    (bestColStart / width) * (INITIAL_RL_RANGE[1] - INITIAL_RL_RANGE[0]) +
    INITIAL_RL_RANGE[0];
  const rlMax =
    ((bestColStart + windowWidth) / width) *
      (INITIAL_RL_RANGE[1] - INITIAL_RL_RANGE[0]) +
    INITIAL_RL_RANGE[0];

  // For rows (y) -> imVisibleRange (note: y is flipped in fractal coordinates)
  const imMax =
    -(bestRowStart / height) * (INITIAL_IM_RANGE[1] - INITIAL_IM_RANGE[0]) +
    INITIAL_IM_RANGE[1];
  const imMin =
    -((bestRowStart + windowHeight) / height) *
      (INITIAL_IM_RANGE[1] - INITIAL_IM_RANGE[0]) +
    INITIAL_IM_RANGE[1];

  return {
    rlVisibleRange: [rlMin, rlMax],
    imVisibleRange: [imMin, imMax],
  };
};

let formula = generateRandomFormula();

const generateGradient = (maxIterations: number): GradientStop[] => {
  const numColors = Math.floor(Math.random() * 1) + 3;
  const stops: GradientStop[] = [];

  for (let i = 0; i < numColors; i++) {
    // Exponential distribution for positions
    const t = i / (numColors - 1); // 0 to 1
    const position = Math.pow(t, 2.5) * maxIterations; // exponential curve, 0 to 100

    // Generate random color
    const r = Math.random();
    const g = Math.random();
    const b = Math.random();
    const a = 1;

    stops.push([position, r, g, b, a]);
  }

  return stops;
};
const DEBUG = false;
export function RandomFractal() {
  const [params, setParams] = useState<FractalParamsBuildRules | null>(null);

  useEffect(() => {
    const handler = async () => {
      console.time("Generating interesting fractal");
      let rule: NVectorStepRule<2> | null = null;
      while (!rule) {
        formula = generateRandomFormula();
        console.log("Trying formula:", formula);
        const cell: Vector2 | null = await lookForValidCForMap(formula);

        if (cell) {
          rule = await findGreenestPointsAndMakeRule(formula, cell, 5);
        }
      }

      const defaultParams = makeToDisplayParams();
      defaultParams.dynamic.c = rule;

      const goodFrame = await lookForGoodFrame(makeArrayFromRules(rule, 0));
      defaultParams.dynamic.rlVisibleRange = makeRuleFromArray(
        goodFrame.rlVisibleRange,
      );
      defaultParams.dynamic.imVisibleRange = makeRuleFromArray(
        goodFrame.imVisibleRange,
      );

      defaultParams.gradient = generateGradient(100);
      console.timeEnd("Generating interesting fractal");
      console.log("rule", rule);
      setParams(defaultParams);
    };
    handler();
  }, []);

  if (!DEBUG) {
    return (
      <FullViewport>
        {params && (
          <DisplayFractal timeMultiplier={0.01} params={params} play />
        )}
      </FullViewport>
    );
  }

  return (
    <div>
      <div>{formula}</div>
      <div
        style={{
          width: "900px",
          height: "900px",
        }}
      >
        <canvas id='test-canvas' style={{ width: "900px", height: "900px" }} />
      </div>
      <div
        style={{
          width: "600px",
          height: "600px",
        }}
      >
        <canvas id='test-canvas2' style={{ width: "600px", height: "600px" }} />
      </div>
      {params && (
        <div
          style={{
            width: "600px",
            height: "600px",
          }}
        >
          <DisplayFractal timeMultiplier={0.01} params={params} play />
        </div>
      )}
      {params && (
        <div
          style={{
            width: "600px",
            height: "600px",
          }}
        >
          <DisplayFractal
            timeMultiplier={0.01}
            params={{
              ...params,
              dynamic: {
                ...params.dynamic,
                rlVisibleRange: makeRuleFromArray([-1, 1] as const),
                imVisibleRange: makeRuleFromArray([-1, 1] as const),
              },
            }}
            play
          />
        </div>
      )}
    </div>
  );
}
