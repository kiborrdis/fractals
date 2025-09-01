import { FractalParamsBuildRules } from "../fractals/types";
import { useStateWithQueryPersistence } from "../useStateWithQueryPersistence";
import { DisplayFractal } from "../DisplayFractal";
import { FullViewport } from "../components/FullViewport/FullViewport";
import { getDefaultFractalRules } from "../fractals/getDefaultFractalRules";

const defaultRules = getDefaultFractalRules();

export function ViewFractal() {
  const [params] =
    useStateWithQueryPersistence<FractalParamsBuildRules>("s", defaultRules);

  return (
    <FullViewport>
      <DisplayFractal params={params} play />
    </FullViewport>
  );
}
