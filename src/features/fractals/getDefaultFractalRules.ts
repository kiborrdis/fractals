import { makeRulesBasedOnParams, rangeRule } from "./ruleConversion";
import {
  FractalParams,
  FractalParamsBuildRules,
} from "./types";

export const getDefaultFractalRules = () => {
  const initialFractalParams: FractalParams = {
    formula: "z^2 + c",
    gradient: [
      [0.006309148264984227, 0, 0, 0, 1],
      [0.0946372239747634, 0.8, 0, 0, 1],
      [0.22712933753943218, 1, 0.6666666666666666, 0, 1],
      [0.40063091482649843, 1, 0.9490196078431372, 0, 1],
      [0.5709779179810726, 0.9921568627450981, 1, 0.6, 1],
      [0.7350157728706624, 1, 0.9372549019607843, 0.8392156862745098, 1],
    ],

    mirroringType: "off",

    dynamic: {
      hexMirroringFactor: 0.0,
      hexMirroringPerDistChange: [0, 0],
      invert: false,
      linearMirroringFactor: 2000,
      time: 0,
      c: [-1, 1],
      r: 2,
      rlVisibleRange: [-1, 1],
      imVisibleRange: [-1, 1],
      maxIterations: 100,
      linearMirroringPerDistChange: [0, 0],
      radialMirroringPerDistChange: [0, 0],
      cxPerDistChange: [0, 0],
      cyPerDistChange: [0, 0],
      rPerDistChange: [0, 0],
      iterationsPerDistChange: [0, 0],
      radialMirroringAngle: 181,
    },
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
