import { EditFractal } from "@/pages/edit/EditFractal";
import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useCallback, useRef } from "react";
import { isMobile } from "@/shared/libs/isMobile";
import {
  deserializeBuildRules,
  FractalParamsBuildRules,
  serializeBuildRules,
} from "@/features/fractals";
import { getDefaultFractalRules } from "@/features/fractals/getDefaultFractalRules";

export const Route = createFileRoute("/edit")({
  beforeLoad: () => {
    if (isMobile()) {
      throw redirect({ to: "/" });
    }
  },
  validateSearch: (search): { s: string | undefined } => {
    return {
      s: search.s as string,
    };
  },
  loaderDeps: ({ search }) => [search.s],
  loader: async ({ deps: [s] }) => {
    if (s) {
      return deserializeBuildRules(s);
    }

    return getDefaultFractalRules();
  },
  component: EditPage,
});

function EditPage() {
  const navigate = useNavigate();
  const timeoutIdRef = useRef<null | ReturnType<typeof setTimeout>>(null);
  const saveFractal = useCallback(
    (data: FractalParamsBuildRules) => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }

      timeoutIdRef.current = setTimeout(async () => {
        const base64 = await serializeBuildRules(data);

        navigate({
          from: Route.id,
          to: Route.id,
          search: (old) => ({
            ...old,
            s: base64,
          }),
        });
      }, 1000);
    },
    [navigate],
  );

  const data = Route.useLoaderData();

  return <EditFractal data={data} onSave={saveFractal} />;
}
