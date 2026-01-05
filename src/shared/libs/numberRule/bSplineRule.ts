import { Vector2 } from "../vectors";
import { RuleType, Vector2BSplineRule } from "./types";

function generateBSplineKnots(
  controlPoints: number,
  dimension: number,
): number[] {
  // To make spline closed, we need to repeat first 'dimension' control points at the end
  const numOfControls = controlPoints + dimension;
  const numOfKnots = numOfControls + dimension + 1;
  const domainKnotsN = numOfKnots - dimension * 2 - 1;
  return Array.from(
    { length: numOfKnots },
    (_, i) => i / domainKnotsN - dimension / domainKnotsN,
  );
}

export const forEachDomainKnot = (
  rule: Vector2BSplineRule,
  callback: (knotValue: number, index: number) => void,
) => {
  const dim = rule.dimension;
  const knots = rule.knots;

  for (let i = dim; i < knots.length - dim; i++) {
    callback(knots[i], i - dim);
  }
};

export const createBSplineRuleFromPoints = (
  period: number,
  points: Vector2[],
  dimension: number = 4, // Cubic B-Spline as default
): Vector2BSplineRule => {
  const controls = [...points];

  const knots = generateBSplineKnots(controls.length, dimension);

  return {
    t: RuleType.Vector2BSpline,
    knots,
    controls,
    period,
    dimension,
  };
};

export const moveControlPointInBSpline = (
  rule: Vector2BSplineRule,
  index: number,
  newPos: Vector2,
): Vector2BSplineRule => {
  const newControls = [...rule.controls];

  newControls[index] = newPos;

  return {
    ...rule,
    controls: newControls,
  };
};

export const addControlPointToSpline = (
  rule: Vector2BSplineRule,
  segmentIndex: number,
  newPoint: Vector2,
): Vector2BSplineRule => {
  const insertIndex = (segmentIndex + 1) % rule.controls.length;
  const newControls = [
    ...rule.controls.slice(0, insertIndex),
    newPoint,
    ...rule.controls.slice(insertIndex),
  ];

  const knots = generateBSplineKnots(newControls.length, rule.dimension);

  return {
    ...rule,
    controls: newControls,
    knots,
  };
};

export const deleteControlPointFromSpline = (
  rule: Vector2BSplineRule,
  index: number,
): Vector2BSplineRule => {
  // No less than dimension control points allowed
  if (rule.controls.length <= rule.dimension) {
    return rule;
  }

  const newControls = rule.controls.filter((_, i) => i !== index);
  const knots = generateBSplineKnots(newControls.length, rule.dimension);

  return {
    ...rule,
    controls: newControls,
    knots,
  };
};

export const makeVector2FromBSpline = (
  rule: Vector2BSplineRule,
  time: number,
): Vector2 => {
  return evalSplinePoint(rule, time);
};

const evalSplinePoint = (rule: Vector2BSplineRule, time: number) => {
  let accum: Vector2 = [0, 0];
  const period = rule.period * 1000;

  const splineX = (time % period) / period;

  accum = deBoor(getContainingKnotIndex(splineX, rule.knots), splineX, rule);

  return accum;
};

const getContainingKnotIndex = (x: number, knots: number[]): number => {
  for (let i = 0; i < knots.length - 1; i++) {
    if (x >= knots[i] && x < knots[i + 1]) {
      return i;
    }
  }
  return knots.length - 2; // Return last index if x is at the end
};

// https://en.wikipedia.org/wiki/De_Boor%27s_algorithm
export function deBoor(
  k: number, // Index of knot interval that contains x
  x: number, // Position
  rule: Vector2BSplineRule, // Rule containing knots and control points
): Vector2 {
  const t = rule.knots;
  const c = rule.controls;
  const p = rule.dimension;

  // Copying control points influencing x
  const d: Vector2[] = [];
  for (let j = 0; j <= p; j++) {
    d[j] = c[(j + k - p) % c.length];
  }

  for (let r = 1; r <= p; r++) {
    for (let j = p; j >= r; j--) {
      const denom = t[j + 1 + k - r] - t[j + k - p];
      let alpha = 0;
      if (denom !== 0) {
        alpha = (x - t[j + k - p]) / denom;
      }
      d[j] = [
        (1.0 - alpha) * d[j - 1][0] + alpha * d[j][0],
        (1.0 - alpha) * d[j - 1][1] + alpha * d[j][1],
      ];
    }
  }

  return d[p];
}

// const evalCoxDeBoor = (rule: Vector2BSplineRule, time: number) => {
//   const dim = rule.dimension;

//   // To make spline closed, we need to repeat first 'dim' control points at the end
//   const realN = rule.controls.length;
//   const n = realN + dim;

//   let accum: Vector2 = [0, 0];
//   const period = rule.period * 1000;

//   const splineX = (time % period) / period;

//   for (let i = 0; i < n; i++) {
//     accum = sum(
//       mul(
//         rule.controls[i % realN],
//         coxDeBoor(splineX, i, dim, rule.knots),
//       ),
//       accum,
//     );
//   }

//   return accum;
// };

// const coxDeBoor = (
//   t: number,
//   i: number,
//   dim: number,
//   knots: number[],
// ): number => {
//   if (dim === 0) {
//     return knots[i] <= t && t < knots[i + 1] ? 1 : 0;
//   }

//   let leftTerm = 0.0;
//   let rightTerm = 0.0;

//   if (knots[i + dim] != knots[i]) {
//     leftTerm =
//       ((t - knots[i]) / (knots[i + dim] - knots[i])) *
//       coxDeBoor(t, i, dim - 1, knots);
//   }

//   if (knots[i + dim + 1] != knots[i + 1]) {
//     rightTerm =
//       ((knots[i + dim + 1] - t) / (knots[i + dim + 1] - knots[i + 1])) *
//       coxDeBoor(t, i + 1, dim - 1, knots);
//   }

//   return leftTerm + rightTerm;
// };
