import {
  FractalParamsBuildRules,
  Vector2,
} from "../fractals/types";
import { defaultStringify } from "../useStateWithQueryPersistence";
import { DisplayFractal } from "../DisplayFractal";
import {
  makeRuleFromArray,
  makeRuleFromBoolean,
  makeRuleFromNumber,
  rangeRule,
} from "../ruleConversion";
import { randomRange } from "../fractals/utils";
import { useState } from "react";

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


const randomParams: FractalParamsBuildRules = {
  invert: makeRuleFromBoolean(Math.random() < 0.5),
  mirror: makeRuleFromBoolean(true),
  colorStart: makeRuleFromArray([
    Math.random(),
    Math.random(),
    Math.random(),
  ] as const),
  colorEnd: makeRuleFromArray([
    Math.random(),
    Math.random(),
    Math.random(),
  ] as const),
  colorOverflow: makeRuleFromArray([
    Math.random(),
    Math.random(),
    Math.random(),
  ] as const),
  splitNumber: rangeRule(
    [Math.max(linearSplit - linearSplit, 0.5), Math.max(linearSplit + linearSplit - 1, 0.5)],
    longTime + (Math.random() * (longTime / 10))
  ),
  time: makeRuleFromNumber(0),
  c: [
    rangeRule(
      [fractalC[0] - 0.03, fractalC[0] + 0.03],
      shortTime + (Math.random() * (shortTime/10))
    ),
    rangeRule(
      [fractalC[1] - 0.03, fractalC[1] + 0.03],
      shortTime + (Math.random() * (shortTime/10))
    ),
  ],
  r: makeRuleFromNumber(3),
  rRangeStart: [
    rangeRule(
      [fractalRRangeStart[0] - 0.02, fractalRRangeStart[0] + 0.02],
      shortTime + (Math.random() *(shortTime/10))
    ),
    rangeRule(
      [fractalRRangeStart[1] - 0.02, fractalRRangeStart[1] + 0.02],
      shortTime + (Math.random() * (shortTime/10))
    ),
  ],
  rRangeEnd: [
    rangeRule(
      [fractalRRangeEnd[0] - 0.02, fractalRRangeEnd[0] + 0.02],
      shortTime + (Math.random() * (shortTime/10))
    ),
    rangeRule(
      [fractalRRangeEnd[1] - 0.02, fractalRRangeEnd[1] + 0.02],
      shortTime + (Math.random() * (shortTime/10))
    ),
  ],
  maxIterations: makeRuleFromNumber(150),
  linearSplitPerDistChange: makeRuleFromArray([linearSplitPerD, 0] as const),
  angularSplitNumber: makeRuleFromNumber(radialSplit),

  radialSplitPerDistChange: makeRuleFromArray([0, radialSplitPerD] as const),
  cxSplitPerDistChange: makeRuleFromArray([cxPerDist, cxPerDist] as const),
  cySplitPerDistChange: makeRuleFromArray([cyPerDist, cyPerDist] as const),
  rSplitPerDistChange: makeRuleFromArray([0, 0] as const),
  iterationsSplitPerDistChange: makeRuleFromArray([0, 0] as const),
};

export function RandomFractal() {
  const [params] = useState<FractalParamsBuildRules>(
    randomParams
  );

  console.log("RandomFractal params", params, defaultStringify(params));

  return (
    <>
      <DisplayFractal params={params} play />
    </>
  );
}
