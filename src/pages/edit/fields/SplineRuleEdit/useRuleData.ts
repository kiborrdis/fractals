import {
  calcRulePeriod,
  makeArrayFromRules,
  Vector2BSplineRule,
} from "@/shared/libs/numberRule";
import { Vector2 } from "@/shared/libs/vectors";
import { useMemo } from "react";

export const useRuleData = (
  rule: Vector2BSplineRule | undefined,
  numOfPoints: number,
) => {
  const period = rule ? calcRulePeriod(rule) : 0;
  const quant = period / numOfPoints;

  const data: Vector2[] = useMemo(() => {
    if (!rule) {
      return [];
    }

    const points: Vector2[] = [];

    for (let i = 0; i <= numOfPoints; i++) {
      const t = i * quant;

      points.push(makeArrayFromRules(rule, t));
    }

    return points;
  }, [numOfPoints, quant, rule]);

  return {
    data,
    quant,
    period,
  };
};
