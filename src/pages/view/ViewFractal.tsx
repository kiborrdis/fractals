import { DisplayFractal, FractalParamsBuildRules } from "@/features/fractals";
import { FullViewport } from "@/shared/ui/FullViewport/FullViewport";

export function ViewFractal({ data }: { data: FractalParamsBuildRules }) {
  return (
    <FullViewport>
      <DisplayFractal params={data} play />
    </FullViewport>
  );
}
