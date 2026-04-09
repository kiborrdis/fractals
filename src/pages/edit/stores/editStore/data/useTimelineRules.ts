import { getDynamicParamLabel, getDynamicColoringParamLabels, getDynamicMirroringPassesParamLabels } from "@/features/fractals";
import {
  useFractalCustomRules,
  useFractalDynamicRules,
} from "./useFractalParamsData";
import {
  NVectorStepRule,
  RangeNumberRule,
  RuleType,
  StepNumberRule,
  Vector2BSplineRule,
} from "@/shared/libs/numberRule";

export const colorsArray = [
  "rgba(231, 76, 60, 0.7)",
  "rgba(230, 126, 34, 0.7)",
  "rgba(155, 89, 182, 0.7)",
  "rgba(26, 188, 156, 0.7)",
  "rgba(236, 112, 99, 0.7)",
  "rgba(133, 193, 233, 0.7)",
  "rgba(130, 224, 170, 0.7)",
  "rgba(195, 155, 211, 0.7)",
  "rgba(245, 176, 65, 0.7)",
  "rgba(93, 109, 126, 0.7)",
  "rgba(162, 217, 206, 0.7)",
  "rgba(176, 58, 46, 0.7)",
  "rgba(39, 174, 96, 0.7)",
  "rgba(41, 128, 185, 0.7)",
  "rgba(118, 68, 138, 0.7)",
  "rgba(149, 165, 166, 0.7)",
  "rgba(52, 73, 94, 0.7)",
];

const hardcodedRouteColors: Record<string, string> = {
  "d.c.0": "rgba(241, 196, 15, 0.7)",
  "d.c.1": "rgba(52, 152, 219, 0.7)",
  "d.c": "rgba(46, 204, 113, 0.7)",
};

function routeToColor(route: string[]): string {
  const str = route.join(".");
  const hardcoded = hardcodedRouteColors[str];
  if (hardcoded) {
    return hardcoded;
  }
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) & 0x7fffffff;
  }
  return colorsArray[hash % colorsArray.length];
}

export type TimelineNumberRuleItem = {
  kind: "number";
  id: string;
  name: string;
  route: string[];
  color: string;
  rule: RangeNumberRule | StepNumberRule;
};

export type TimelineVector2Item = {
  kind: "vector2";
  id: string;
  name: string;
  route: string[];
  color: string;
  rule: Vector2BSplineRule | NVectorStepRule<2>;
};

export type TimelineItem = TimelineNumberRuleItem | TimelineVector2Item;

export const isNumberItem = (
  item: TimelineItem,
): item is TimelineNumberRuleItem => item.kind === "number";

export const useDynamicNumberRules = (): TimelineItem[] => {
  const rawDynamic = useFractalDynamicRules();

  const dynamicColoringRules = Object.entries(rawDynamic.coloring).reduce<
    TimelineItem[]
  >((memo, [key, rule]) => {
    const route = ["d", "coloring", key, "2"];

    rule[2].forEach((paramRule, paramIndex) => {
      if (typeof paramRule === "number" || Array.isArray(paramRule)) {
        return;
      }

      if (
        paramRule.t === RuleType.RangeNumber ||
        paramRule.t === RuleType.StepNumber
      ) {
        const itemRoute = [...route, String(paramIndex)];
        memo.push({
          kind: "number",
          id: itemRoute.join("."),
          route: itemRoute,
          name: getDynamicColoringParamLabels(rule[0], paramIndex),
          color: routeToColor(itemRoute),
          rule: paramRule,
        });
      }
    });

    return memo;
  }, []);


  const dynamicMirroringRules = Object.entries(rawDynamic.mirroringPasses).reduce<
    TimelineItem[]
  >((memo, [key, pass]) => {
    const route = ["d", "mirroringPasses", key];

    pass.forEach((paramRule, paramIndex) => {
      if (typeof paramRule === "number" || Array.isArray(paramRule)) {
        return;
      }

      if (
        paramRule.t === RuleType.RangeNumber ||
        paramRule.t === RuleType.StepNumber
      ) {
        const itemRoute = [...route, String(paramIndex)];
        memo.push({
          kind: "number",
          id: itemRoute.join("."),
          route: itemRoute,
          name: getDynamicMirroringPassesParamLabels(pass[0], paramIndex) + ' ' + key,
          color: routeToColor(itemRoute),
          rule: paramRule,
        });
      }
    });

    return memo;
  }, []);

  const dynamic = Object.entries(rawDynamic).reduce<TimelineItem[]>(
    (memo, [key, rule]) => {
      if ("t" in rule) {
        if (rule.t === RuleType.RangeNumber || rule.t === RuleType.StepNumber) {
          const route = ["d", key];
          memo.push({
            kind: "number",
            id: route.join("."),
            route,
            name: getDynamicParamLabel(route.slice(1)),
            color: routeToColor(route),
            rule: rule as RangeNumberRule | StepNumberRule,
          });
        } else if (
          rule.t === RuleType.Vector2BSpline ||
          (rule.t === RuleType.StepNVector && rule.dimension === 2)
        ) {
          const route = ["d", key];
          memo.push({
            kind: "vector2",
            id: route.join("."),
            route,
            name: getDynamicParamLabel(route.slice(1)),
            color: routeToColor(route),
            rule: rule as Vector2BSplineRule | NVectorStepRule<2>,
          });
        }
      } else if (Array.isArray(rule)) {
        rule.forEach((aRule, i) => {
          if (typeof aRule === "number" || Array.isArray(aRule)) {
            return;
          }

          if (
            aRule.t === RuleType.RangeNumber ||
            aRule.t === RuleType.StepNumber
          ) {
            const route = ["d", key, String(i)];
            memo.push({
              kind: "number",
              id: route.join("."),
              route,
              name: getDynamicParamLabel(route.slice(1)),
              color: routeToColor(route),
              rule: aRule as RangeNumberRule | StepNumberRule,
            });
          }
        });
      }
      return memo;
    },
    [],
  );

  const rawCustom = useFractalCustomRules();
  const custom = Object.entries(rawCustom).reduce<TimelineItem[]>(
    (memo, [key, rule]) => {
      if ("t" in rule) {
        if (rule.t === RuleType.RangeNumber || rule.t === RuleType.StepNumber) {
          const route = ["c", key];
          memo.push({
            kind: "number",
            id: route.join("."),
            route,
            name: getDynamicParamLabel(route.slice(1)),
            color: routeToColor(route),
            rule: rule as RangeNumberRule | StepNumberRule,
          });
        } else if (
          rule.t === RuleType.Vector2BSpline ||
          (rule.t === RuleType.StepNVector && rule.dimension === 2)
        ) {
          const route = ["c", key];
          memo.push({
            kind: "vector2",
            id: route.join("."),
            route,
            name: `Custom ${key}`,
            color: routeToColor(route),
            rule: rule as Vector2BSplineRule | NVectorStepRule<2>,
          });
        }
      } else if (Array.isArray(rule)) {
        rule.forEach((aRule, i) => {
          if (
            aRule.t === RuleType.RangeNumber ||
            aRule.t === RuleType.StepNumber
          ) {
            const route = ["c", key, String(i)];
            memo.push({
              kind: "number",
              id: route.join("."),
              route,
              name: `Custom ${key} [${i}]`,
              color: routeToColor(route),
              rule: aRule as RangeNumberRule | StepNumberRule,
            });
          }
        });
      }
      return memo;
    },
    [],
  );

  return [...dynamic,...dynamicColoringRules, ...dynamicMirroringRules, ...custom];
};
