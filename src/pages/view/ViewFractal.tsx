import { DisplayFractal, FractalParamsBuildRules, getDefaultFractalRules } from "@/features/fractals";
import { useStateWithQueryPersistence } from "@/shared/hooks/useQueryPersistense";
import { FullViewport } from "@/shared/ui/FullViewport/FullViewport";

const defaultRules = getDefaultFractalRules();

export function ViewFractal() {
  const [params] =
    useStateWithQueryPersistence<FractalParamsBuildRules>("s", defaultRules);
  console.log(params.gradient);
  return (
    <FullViewport>
      <DisplayFractal formula={params.formula} params={params} play />
    </FullViewport>
  );
}
