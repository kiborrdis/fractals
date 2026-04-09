import {
  convertBuildObjectToResult,
  makeRuleFromArray,
  makeRuleFromNumber,
} from "@/shared/libs/numberRule";
import {
  BlendMode,
  ColoringBuildRule,
  ColoringMode,
  FractalDynamicParamsBuildRules,
  FractalDynamicParams,
  FractalParams,
  FractalParamsBuildRules,
  FractalCustomRules,
} from "./types";
import { isVector2 } from "@/shared/libs/vectors";

export const makeRulesBasedOnParams = ({
  dynamic: params,
  custom,
  ...rest
}: FractalParams): FractalParamsBuildRules => {
  const rules: FractalParamsBuildRules = {
    ...rest,
    custom: Object.entries(custom).reduce((acc, [key, value]) => {
      if (typeof value === "number") {
        acc[key] = makeRuleFromNumber(value);
      } else if (isVector2(value)) {
        acc[key] = makeRuleFromArray(value);
      }

      return acc;
    }, {} as FractalCustomRules),
    dynamic: {
      coloring: params.coloring.map((entry) => {
        const [mode, gradIds, entryParams, blend] = entry as [
          number,
          number[],
          number[],
          number,
        ];
        return [mode, gradIds, entryParams.map(makeRuleFromNumber), blend];
      }) as ColoringBuildRule[],
      mirroringPasses: params.mirroringPasses.map(([type, param1, param2]) => [
        type,
        makeRuleFromNumber(param1),
        makeRuleFromNumber(param2),
      ]),
      time: makeRuleFromNumber(params.time),
      c: makeRuleFromArray(params.c),
      r: makeRuleFromNumber(params.r),
      rlVisibleRange: makeRuleFromArray(params.rlVisibleRange),
      imVisibleRange: makeRuleFromArray(params.imVisibleRange),
      maxIterations: makeRuleFromNumber(params.maxIterations),
      cDistVariation: makeRuleFromArray(params.cDistVariation),
      rDistVariation: makeRuleFromNumber(params.rDistVariation),
      iterationsDistVariation: makeRuleFromNumber(
        params.iterationsDistVariation,
      ),
    },
  };

  return rules;
};

export const makeFractalParamsFromRules = (
  rules: FractalParamsBuildRules,
  time: number = 0,
): FractalParams => {
  return {
    ...rules,
    custom: makeCustomFractalParamsFromRules(rules.custom, time),
    dynamic: makeFractalDynamicParamsFromRules(rules.dynamic, time),
  };
};

const makeCustomFractalParamsFromRules = (
  rules: FractalCustomRules,
  time: number = 0,
): { [key: string]: number | [number, number] } => {
  return convertBuildObjectToResult(rules, time);
};

const makeFractalDynamicParamsFromRules = (
  rules: FractalDynamicParamsBuildRules,
  time: number = 0,
): FractalDynamicParams => {
  const result = convertBuildObjectToResult(
    rules,
    time,
  ) as FractalDynamicParams;
  if (!result.coloring || result.coloring.length === 0) {
    result.coloring = [[ColoringMode.Iterations, [0], [], BlendMode.Normal]];
  }
  return result;
};
