import {
  FractalParamsBuildRules,
  GradientStop,
  Vector2,
} from "../fractals/types";
import { DisplayFractal } from "../DisplayFractal";
import {
  makeRuleFromArray,
  makeRuleFromBoolean,
  makeRuleFromNumber,
  rangeRule,
} from "../ruleConversion";
import { randomRange } from "../fractals/utils";
import { useState } from "react";
import { FullViewport } from "../components/FullViewport/FullViewport";

const rangeSize = randomRange(0.2, 0.6);
const fractalRRangeStart: Vector2 = [-rangeSize, -rangeSize];
const fractalRRangeEnd: Vector2 = [rangeSize, rangeSize];
const linearSplit = randomRange(0.5, 6);

let linearSplitPerD = randomRange(-2, 2);

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

const randomParams: FractalParamsBuildRules = {
  formula: "z^2 + c",
  gradient: stops,
  mirroringType: "off",
  dynamic: {
    hexMirroringFactor: makeRuleFromNumber(randomRange(0, 0.6)),
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
      [150, 600],
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

  return (
    <FullViewport>
      <DisplayFractal params={params} play />
    </FullViewport>
  );
}
