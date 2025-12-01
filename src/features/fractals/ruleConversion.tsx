import { makeRuleFromArray, makeRuleFromNumber } from "@/shared/libs/numberRule";
import {
  FractalDynamicParamsBuildRules,
  FractalDynamicParams,
  FractalParams,
  FractalParamsBuildRules,
} from "./types";

export const makeRulesBasedOnParams = ({
  dynamic: params,
  ...rest
}: FractalParams): FractalParamsBuildRules => {
  const rules: FractalParamsBuildRules = {
    ...rest,
    dynamic: {
      hexMirroringFactor: makeRuleFromNumber(params.hexMirroringFactor),
      hexMirroringPerDistChange: makeRuleFromArray(
        params.hexMirroringPerDistChange
      ),
      linearMirroringFactor: makeRuleFromNumber(params.linearMirroringFactor),
      time: makeRuleFromNumber(params.time),
      c: makeRuleFromArray(params.c),
      r: makeRuleFromNumber(params.r),
      rlVisibleRange: makeRuleFromArray(params.rlVisibleRange),
      imVisibleRange: makeRuleFromArray(params.imVisibleRange),
      maxIterations: makeRuleFromNumber(params.maxIterations),
      linearMirroringPerDistChange: makeRuleFromArray(
        params.linearMirroringPerDistChange
      ),
      radialMirroringPerDistChange: makeRuleFromArray(
        params.radialMirroringPerDistChange
      ),
      cxPerDistChange: makeRuleFromArray(params.cxPerDistChange),
      cyPerDistChange: makeRuleFromArray(params.cyPerDistChange),
      rPerDistChange: makeRuleFromArray(params.rPerDistChange),
      iterationsPerDistChange: makeRuleFromArray(
        params.iterationsPerDistChange
      ),
      radialMirroringAngle: makeRuleFromNumber(params.radialMirroringAngle),
    },
  };

  return rules;
};

export const makeFractalParamsFromRules = (
  rules: FractalParamsBuildRules,
  time: number = 0
): FractalParams => {
  return {
    ...rules,
    dynamic: makeFractalDynamicParamsFromRules(rules.dynamic, time),
  };
};

const makeFractalDynamicParamsFromRules = (
  rules: FractalDynamicParamsBuildRules,
  time: number = 0
): FractalDynamicParams => {
  const params = Object.entries(rules).reduce((acc, [key, value]) => {
    if (Array.isArray(value)) {
      // @ts-expect-error TODO research, maybe it can be done properly now
      acc[key as keyof FractalDynamicParams] = makeArrayFromRules(value, time);
      return acc;
    }

    // @ts-expect-error TODO research, maybe it can be done properly now
    acc[key] = makeScalarFromRule(value, time);
    return acc;
  }, {} as FractalDynamicParams);

  return params;
};
