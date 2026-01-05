import {
  calcRulePeriod,
  makeArrayFromRules,
  NVectorStepRule,
} from "@/shared/libs/numberRule";
import { Vector2 } from "@/shared/libs/vectors";
import { useMemo } from "react";

export const useRuleData = (rule: NVectorStepRule<2>, numOfPoints: number) => {
  const period = calcRulePeriod(rule);
  const quant = period / numOfPoints;

  const data: Vector2[] = useMemo(() => {
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
