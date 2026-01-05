import { rangeRule } from "@/shared/libs/numberRule";
import { makeRulesBasedOnParams } from "./ruleConversion";
import { FractalParams, FractalParamsBuildRules } from "./types";

export const getDefaultFractalParams = (): FractalParams => {
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

    trapColoringEnabled: false,
    traps: [
      {
        type: "line",
        a: 0.5051792015689373,
        b: 0.8630144693469345,
        c: 0.18808899521550237,
      },
      {
        type: "circle",
        center: [-0.27526102826745136, -0.07280495741490056],
        radius: 0.10503381341784324,
      },
      {
        type: "circle",
        center: [0.7279929826547069, -0.6341925808550974],
        radius: 0.047084123256274646,
      },
    ],
    trapIntensity: 25,
    trapGradient: [
      [0, 1, 0.9372549019607843, 0.8392156862745098, 1],
      [1, 1, 0.9372549019607843, 0.8392156862745098, 1],
      [1.7, 0.9921568627450981, 1, 0.6, 1],
      [3, 1, 0.9490196078431372, 0, 1],
      [5, 1, 0.6666666666666666, 0, 1],
      [8, 0.8, 0, 0, 1],
      [15, 0, 0, 0, 1],
    ],

    borderColoringEnabled: false,
    borderColor: [1, 1, 1, 1],
    borderIntensity: 25,

    mirroringType: "off",

    initialTime: 10738,

    dynamic: {
      hexMirroringFactor: 1,
      hexMirroringDistVariation: 0,
      linearMirroringFactor: 1,
      time: 0,
      c: [-1, 1],
      r: 4,
      rlVisibleRange: [-1, 1],
      imVisibleRange: [-1, 1],
      maxIterations: 100,
      linearMirroringDistVariation: 0,
      radialMirroringDistVariation: 0,
      cDistVariation: [0, 0],
      rDistVariation: 0,
      iterationsDistVariation: 0,
      radialMirroringAngle: 181,
    },
    custom: {},
  };
  return initialFractalParams;
};

export const getDefaultFractalRules = () => {
  const initialFractalParams: FractalParams = getDefaultFractalParams();
  const buildRules = makeRulesBasedOnParams(initialFractalParams);

  return {
    ...buildRules,
    dynamic: {
      ...buildRules.dynamic,
      c: [rangeRule([-1, 1], 10, 0), rangeRule([-1, 1], 20, 0)],
    },
  } as FractalParamsBuildRules;
};
