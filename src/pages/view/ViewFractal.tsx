import {
  DisplayFractal,
  FractalParamsBuildRules,
  getDefaultFractalRules,
} from "@/features/fractals";
import { useStateWithQueryPersistence } from "@/shared/hooks/useQueryPersistense";
import { FullViewport } from "@/shared/ui/FullViewport/FullViewport";

const defaultRules = getDefaultFractalRules();

export function ViewFractal({
  extractParam,
}: {
  extractParam?: (key: string) => string | null | undefined;
}) {
  const [params] = useStateWithQueryPersistence<FractalParamsBuildRules>(
    "s",
    defaultRules,
    {
      extract: extractParam,
    },
  );

  return (
    <FullViewport>
      <DisplayFractal formula={params.formula} params={params} play />
    </FullViewport>
  );
}
