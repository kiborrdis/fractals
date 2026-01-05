import {
  deserializeBuildRules,
  getDefaultFractalRules,
} from "@/features/fractals";
import { ViewFractal } from "@/pages/view/ViewFractal";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/view")({
  component: ShowcasePage,
  validateSearch: (search): { s: string | undefined } => {
    return {
      s: search.s as string | undefined,
    };
  },
  loaderDeps: ({ search }) => [search.s],
  loader: async ({ deps: [s] }) => {
    if (s) {
      return deserializeBuildRules(s);
    }

    return getDefaultFractalRules();
  },
});

function ShowcasePage() {
  const data = Route.useLoaderData();

  return <ViewFractal data={data} />;
}
