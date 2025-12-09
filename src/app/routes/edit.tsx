import { EditFractal } from "@/pages/edit/EditFractal";
import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useCallback, useRef } from "react";
import { isMobile } from "@/shared/libs/isMobile";

export const Route = createFileRoute("/edit")({
  beforeLoad: () => {
    if (isMobile()) {
      throw redirect({ to: "/" });
    }
  },
  component: EditPage,
  validateSearch: (search): { s: string | undefined } => {
    return {
      s: search.s as string,
    };
  },
});

function EditPage() {
  const navigate = useNavigate();

  const search = Route.useSearch();
  const ref = useRef(search);
  ref.current = search;

  const getParam = useCallback((key: string): string | undefined => {
    return (ref.current as Record<string, string | undefined>)[key] as
      | string
      | undefined;
  }, []);

  const saveFractal = useCallback(
    (_: string, newEncodedF: string) => {
      navigate({
        from: Route.id,
        to: Route.id,
        search: (old) => ({
          ...old,
          s: newEncodedF,
        }),
      });
    },
    [navigate],
  );

  return <EditFractal extractParam={getParam} onSave={saveFractal} />;
}
