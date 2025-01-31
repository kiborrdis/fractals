import { makeArrayFromRules, makeRuleFromArray, makeRuleFromNumber, makeScalarFromRule } from "@/shared/libs/numberRule";
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
      hexMirroringPerDistChange: makeRuleFromNumber(
        params.hexMirroringPerDistChange
      ),
      linearMirroringFactor: makeRuleFromNumber(params.linearMirroringFactor),
      time: makeRuleFromNumber(params.time),
      c: makeRuleFromArray(params.c),
      r: makeRuleFromNumber(params.r),
      rlVisibleRange: makeRuleFromArray(params.rlVisibleRange),
      imVisibleRange: makeRuleFromArray(params.imVisibleRange),
      maxIterations: makeRuleFromNumber(params.maxIterations),
      linearMirroringPerDistChange: makeRuleFromNumber(
        params.linearMirroringPerDistChange
      ),
      radialMirroringPerDistChange: makeRuleFromNumber(
        params.radialMirroringPerDistChange
      ),
      cxPerDistChange: makeRuleFromNumber(params.cxPerDistChange),
      cyPerDistChange: makeRuleFromNumber(params.cyPerDistChange),
      rPerDistChange: makeRuleFromNumber(params.rPerDistChange),
      iterationsPerDistChange: makeRuleFromNumber(
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      acc[key as keyof FractalDynamicParams] = makeArrayFromRules(value, time) as any;
      return acc;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    acc[key as keyof FractalDynamicParams] = makeScalarFromRule(value, time) as any;
    
    return acc;
  }, {} as FractalDynamicParams);

  return params;
};
