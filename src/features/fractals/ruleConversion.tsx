import {
  makeArrayFromRules,
  makeRuleFromArray,
  makeRuleFromNumber,
  makeScalarFromRule,
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
    custom: makeCustomFractalParamsFromRules(rules.custom, time),
    dynamic: makeFractalDynamicParamsFromRules(rules.dynamic, time),
  };
};

const makeCustomFractalParamsFromRules = (
  rules: FractalCustomRules,
  time: number = 0
): { [key: string]: number | [number, number] } => {
  const params = Object.entries(rules).reduce((acc, [key, value]) => {
    if (Array.isArray(value)) {
      acc[key] = makeArrayFromRules(value, time);
      return acc;
    }

    acc[key] = makeScalarFromRule(value, time);

    return acc;
  }, {} as { [key: string]: number | [number, number] });

  return params;
};

const makeFractalDynamicParamsFromRules = (
  rules: FractalDynamicParamsBuildRules,
  time: number = 0
): FractalDynamicParams => {
  const params = Object.entries(rules).reduce((acc, [key, value]) => {
    if (Array.isArray(value)) {
      acc[key as keyof FractalDynamicParams] = makeArrayFromRules(
        value,
        time
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as any;
      return acc;
    }

    acc[key as keyof FractalDynamicParams] = makeScalarFromRule(
      value,
      time
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any;

    return acc;
  }, {} as FractalDynamicParams);

  return params;
};
