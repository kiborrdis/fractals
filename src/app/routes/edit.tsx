import { EditFractal } from "@/pages/edit/EditFractal";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useRef } from "react";

export const Route = createFileRoute("/edit")({
  component: EditPage,
  validateSearch: (search): { s: string | undefined } => {
    return {
      s: search.s as string,
    };
  },
});

function EditPage() {
  const search = Route.useSearch();
  const ref = useRef(search);
  const navigate = useNavigate();

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
