import {
  convertBuildObjectToResult,
  makeRuleFromArray,
  makeRuleFromNumber,
} from "@/shared/libs/numberRule";
import {
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
      hexMirroringFactor: makeRuleFromNumber(params.hexMirroringFactor),
      hexMirroringDistVariation: makeRuleFromNumber(
        params.hexMirroringDistVariation,
      ),
      linearMirroringFactor: makeRuleFromNumber(params.linearMirroringFactor),
      time: makeRuleFromNumber(params.time),
      c: makeRuleFromArray(params.c),
      r: makeRuleFromNumber(params.r),
      rlVisibleRange: makeRuleFromArray(params.rlVisibleRange),
      imVisibleRange: makeRuleFromArray(params.imVisibleRange),
      maxIterations: makeRuleFromNumber(params.maxIterations),
      linearMirroringDistVariation: makeRuleFromNumber(
        params.linearMirroringDistVariation,
      ),
      radialMirroringDistVariation: makeRuleFromNumber(
        params.radialMirroringDistVariation,
      ),
      cDistVariation: makeRuleFromArray(params.cDistVariation),
      rDistVariation: makeRuleFromNumber(params.rDistVariation),
      iterationsDistVariation: makeRuleFromNumber(
        params.iterationsDistVariation,
      ),
      radialMirroringAngle: makeRuleFromNumber(params.radialMirroringAngle),
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
  return convertBuildObjectToResult(rules, time);
};
