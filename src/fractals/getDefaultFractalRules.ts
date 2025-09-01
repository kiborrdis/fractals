import { makeRulesBasedOnParams } from "../ruleConversion";
import { FractalParams, GradientStop } from "./types";

export const getDefaultFractalRules = () => {
  const initialFractalParams: FractalParams = {
    formula: "z^2 + c",
    gradient: [
      [
        0,
        ...[0.7803959025681232, 0.8286006045344724, 0.8742375132153735],
        1,
      ] as GradientStop,
      [
        1,
        ...[0.9294395326843901, 0.14428688157634406, 0.386154731668613],
        1,
      ] as GradientStop,
    ],

    mirroringType: 'off',

    dynamic: {
      hexMirroringFactor: 0.0,
      hexMirroringPerDistChange: [0, 0],
      invert: false,
      linearMirroringFactor: 2000,
      time: 0,
      c: [-0.5107646917831926, -0.5423690294181617],
      r: 2,
      rlVisibleRange: [-0.46873034440015887, 0.5075717619717306],
      imVisibleRange: [-0.4832997472169364, 0.4917917550166656],
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

  return makeRulesBasedOnParams(initialFractalParams)
};
