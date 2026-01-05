import {
  calcRulePeriod,
  makeArrayFromRules,
  makeNumberFromRangeRule,
  NVectorStepRule,
  RuleType,
  Vector2BSplineRule,
} from "@/shared/libs/numberRule";
import { lowestCommonMultiple } from "@/shared/libs/numbers";
import {
  TimelineItem,
  TimelineNumberRuleItem,
  TimelineVector2Item,
} from "../stores/editStore/data/useTimelineRules";
import { Vector2 } from "@/shared/libs/vectors";
import { useMemo } from "react";

export function calcPeriod(rules: TimelineItem[]): number {
  if (!rules[0]) {
    return 0;
  }

  return rules.reduce((acc, { rule }) => {
    return lowestCommonMultiple(acc, calcRulePeriod(rule));
  }, 1);
}

const SAMPLE_POINTS = 500;

export function useTimelineGraphData(
  rules: TimelineNumberRuleItem[],
  period: number,
): { data: Vector2[]; color: string }[] {
  return useMemo(() => {
    if (rules.length === 0 || period === 0) {
      return [];
    }

    return rules.map((ruleItem) => {
      const points: Vector2[] = [];
      const ruleToCalc = { ...ruleItem.rule, range: [-1, 1] as Vector2 };

      for (let i = 0; i <= SAMPLE_POINTS; i++) {
        const time = (i / SAMPLE_POINTS) * period;
        const value = makeNumberFromRangeRule(ruleToCalc, time);
        points.push([time, value]);
      }

      return { data: points, color: ruleItem.color };
    });
  }, [rules, period]);
}

function getVector2RuleBounds(rule: Vector2BSplineRule | NVectorStepRule<2>): {
  min: [number, number];
  max: [number, number];
} {
  const points =
    rule.t === RuleType.Vector2BSpline ? rule.controls : rule.steps;
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const p of points) {
    if (p[0] < minX) {
      minX = p[0];
    }
    if (p[0] > maxX) {
      maxX = p[0];
    }
    if (p[1] < minY) {
      minY = p[1];
    }
    if (p[1] > maxY) {
      maxY = p[1];
    }
  }
  if (minX === maxX) {
    minX -= 1;
    maxX += 1;
  }
  if (minY === maxY) {
    minY -= 1;
    maxY += 1;
  }
  return { min: [minX, minY], max: [maxX, maxY] };
}
export type Vector2LinePoint = [number, number, number];

export function useTimelineVector2GraphData(
  rules: TimelineVector2Item[],
  period: number,
): { data: Vector2LinePoint[]; color: string }[] {
  return useMemo(() => {
    if (rules.length === 0 || period === 0) {
      return [];
    }

    return rules.map((item) => {
      const { rule } = item;
      const bounds = getVector2RuleBounds(rule);
      const data: Vector2LinePoint[] = [];

      for (let i = 0; i <= SAMPLE_POINTS; i++) {
        const time = (i / SAMPLE_POINTS) * period;
        const val = makeArrayFromRules(rule, time);
        const norm0 =
          (2 * (val[0] - bounds.min[0])) / (bounds.max[0] - bounds.min[0]) - 1;
        const norm1 =
          (2 * (val[1] - bounds.min[1])) / (bounds.max[1] - bounds.min[1]) - 1;
        data.push([time, norm0, norm1]);
      }

      return { data, color: item.color };
    });
  }, [rules, period]);
}
