import { ViewFractal } from "@/pages/view/ViewFractal";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef } from "react";

export const Route = createFileRoute("/view")({
  component: ShowcasePage,
  validateSearch: (search): { encodedF: string | undefined } => {
    return {
      encodedF: search.encodedF as string,
    };
  },
  search: {
    middlewares: [
      ({ search, next }) => {
        const result = next(search);
        return {
          s: search.encodedF,
          ...result,
        };
      },
    ],
  },
});

function ShowcasePage() {
  const search = Route.useSearch();
  const ref = useRef(search);
  ref.current = search;

  const getParam = useCallback((key: string): string | undefined => {
    return (ref.current as Record<string, string | undefined>)[key] as
      | string
      | undefined;
  }, []);

  return <ViewFractal extractParam={getParam} />;
}
