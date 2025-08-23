import { FractalParams, FractalParamsBuildRules } from "../fractals/types";
import { useStateWithQueryPersistence } from "../useStateWithQueryPersistence";
import { DisplayFractal } from "../DisplayFractal";
import { makeRulesBasedOnParams } from "../ruleConversion";

const initialFractalParams: FractalParams = {
  hexMirroringFactor: 0.0,
  hexMirroringPerDistChange: [0, 0],
  invert: false,
  mirror: false,
  colorStart: [0.7803959025681232, 0.8286006045344724, 0.8742375132153735],
  colorEnd: [0.9294395326843901, 0.14428688157634406, 0.386154731668613],
  colorOverflow: [0.278634668037373, 0.04227163613144469, 0.3846757635418552],
  splitNumber: 0.4875142979845785,
  time: 0,
  c: [-0.5107646917831926, -0.5423690294181617],
  r: 2,
  rRangeStart: [-0.46873034440015887, -0.4832997472169364],
  rRangeEnd: [0.5075717619717306, 0.4917917550166656],
  maxIterations: 100,
  linearSplitPerDistChange: [0, 0],
  radialSplitPerDistChange: [0, 0],
  cxSplitPerDistChange: [0, 0],
  cySplitPerDistChange: [0, 0],
  rSplitPerDistChange: [0, 0],
  iterationsSplitPerDistChange: [0, 0],
  angularSplitNumber: 181,
};

const defaultRules = makeRulesBasedOnParams(initialFractalParams);

export function ViewFractal() {
  const [params] =
    useStateWithQueryPersistence<FractalParamsBuildRules>("s", defaultRules);

  return (
    <>
      <DisplayFractal params={params} play />
    </>
  );
}
