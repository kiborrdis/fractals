import { rangeRule } from "@/shared/libs/numberRule";
import { makeRulesBasedOnParams } from "./ruleConversion";
import { FractalParams, FractalParamsBuildRules } from "./types";

export const getDefaultFractalRules = () => {
  const initialFractalParams: FractalParams = {
    formula: "z^2 + c",
    gradient: [
      [0, 0, 0, 0, 1],
      [10, 0.8, 0, 0, 1],
      [30, 1, 0.6666666666666666, 0, 1],
      [40, 1, 0.9490196078431372, 0, 1],
      [70, 0.9921568627450981, 1, 0.6, 1],
      [100, 1, 0.9372549019607843, 0.8392156862745098, 1],
    ],

    invert: false,

    mirroringType: "off",

    dynamic: {
      hexMirroringFactor: 1,
      hexMirroringPerDistChange: 0,
      linearMirroringFactor: 1,
      time: 0,
      c: [-1, 1],
      r: 2,
      rlVisibleRange: [-1, 1],
      imVisibleRange: [-1, 1],
      maxIterations: 100,
      linearMirroringPerDistChange: 0,
      radialMirroringPerDistChange: 0,
      cxPerDistChange: 0,
      cyPerDistChange: 0,
      rPerDistChange: 0,
      iterationsPerDistChange: 0,
      radialMirroringAngle: 181,
    },
    custom: {},
  };
  const buildRules = makeRulesBasedOnParams(initialFractalParams);

  return {
    ...buildRules,
    dynamic: {
      ...buildRules.dynamic,
      c: [rangeRule([-1, 1], 10, 0), rangeRule([-1, 1], 20, 0)],
    },
  } as FractalParamsBuildRules;
};
