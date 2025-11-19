import {
  FractalParamsBuildRules,
  GradientStop,
  Vector2,
  makeRuleFromArray,
  makeRuleFromBoolean,
  makeRuleFromNumber,
  rangeRule,
  randomRange,
  DisplayFractal,
} from "@/features/fractals";
import { useState } from "react";
import { defaultStringify } from "@/shared/hooks/useQueryPersistense";
import { FullViewport } from "@/shared/ui/FullViewport/FullViewport";

const rangeSize = randomRange(-1, 1);
const fractalRRangeStart: Vector2 = [-rangeSize, -rangeSize];
const fractalRRangeEnd: Vector2 = [rangeSize, rangeSize];
const linearSplit = randomRange(50, 2000);

let linearSplitPerD = randomRange(-200, 200);

if (linearSplit + linearSplitPerD < 0.5) {
  linearSplitPerD = 0;
}
const radialSplit = randomRange(15, 181);
let radialSplitPerD = randomRange(-60, 60);

if (radialSplit + radialSplitPerD < 0) {
  radialSplitPerD = 0;
}

const cyPerDist = randomRange(-0.05, 0.05);
const cxPerDist = randomRange(-0.05, 0.05);

// const iterationsPerDist = randomRange(-50, 250);

const fractalC = [-0.54, -0.55];

const shortTime = 120;
const longTime = 240;

const numberOfStops = Math.floor(randomRange(2, 8));

const stops = new Array(numberOfStops).fill(0).map((_, i) => {
  return [
    i / (numberOfStops - 1),
    Math.random(),
    Math.random(),
    Math.random(),
    1,
  ] as GradientStop;
});

const formulas = ["z^2 + c", "z^3 + c"];

const mirroringTypes = ["off", "square", "hex"] as const;
const pickedMirroringType =
  mirroringTypes[Math.floor(Math.random() * mirroringTypes.length)];

const randomParams: FractalParamsBuildRules = {
  formula: formulas[Math.floor(Math.random() * formulas.length)],
  gradient: stops,
  mirroringType: pickedMirroringType,
  dynamic: {
    hexMirroringFactor: makeRuleFromNumber(randomRange(100, 2000)),
    hexMirroringPerDistChange: makeRuleFromArray([0, 0] as const),
    invert: makeRuleFromBoolean(Math.random() < 0.5),
    linearMirroringFactor: rangeRule(
      [
        Math.max(linearSplit - linearSplit, 0.5),
        Math.max(linearSplit + linearSplit - 1, 0.5),
      ],
      longTime + Math.random() * (longTime / 10)
    ),
    time: makeRuleFromNumber(0),
    c: [
      rangeRule(
        [fractalC[0] - 0.03, fractalC[0] + 0.03],
        shortTime + Math.random() * (shortTime / 10)
      ),
      rangeRule(
        [fractalC[1] - 0.03, fractalC[1] + 0.03],
        shortTime + Math.random() * (shortTime / 10)
      ),
    ],
    r: makeRuleFromNumber(3),
    rlVisibleRange: [
      rangeRule(
        [fractalRRangeStart[0] - 0.02, fractalRRangeStart[0] + 0.02],
        shortTime + Math.random() * (shortTime / 10)
      ),
      rangeRule(
        [fractalRRangeEnd[0] - 0.02, fractalRRangeEnd[0] + 0.02],
        shortTime + Math.random() * (shortTime / 10)
      ),
    ],
    imVisibleRange: [
      rangeRule(
        [fractalRRangeStart[1] - 0.02, fractalRRangeStart[1] + 0.02],
        shortTime + Math.random() * (shortTime / 10)
      ),
      rangeRule(
        [fractalRRangeEnd[1] - 0.02, fractalRRangeEnd[1] + 0.02],
        shortTime + Math.random() * (shortTime / 10)
      ),
    ],
    maxIterations: rangeRule(
      [50, 250],
      shortTime + Math.random() * (shortTime / 10)
    ),
    linearMirroringPerDistChange: makeRuleFromArray([
      linearSplitPerD,
      0,
    ] as const),
    radialMirroringAngle: makeRuleFromNumber(radialSplit),

    radialMirroringPerDistChange: makeRuleFromArray([
      0,
      radialSplitPerD,
    ] as const),
    cxPerDistChange: makeRuleFromArray([cxPerDist, cxPerDist] as const),
    cyPerDistChange: makeRuleFromArray([cyPerDist, cyPerDist] as const),
    rPerDistChange: makeRuleFromArray([0, 0] as const),
    iterationsPerDistChange: makeRuleFromArray([0, 0] as const),
  },
};

export function RandomFractal() {
  const [params] = useState<FractalParamsBuildRules>(randomParams);
  console.log("RandomFractal params", defaultStringify(params));
  return (
    <FullViewport>
      <DisplayFractal formula={params.formula} params={params} play />
    </FullViewport>
  );
}
