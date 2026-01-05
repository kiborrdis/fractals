import { deserializeBuildRules } from "@/features/fractals";
import { Showcase } from "@/pages/showcase/Showcase";
import { createFileRoute } from "@tanstack/react-router";
import { fractals } from "../fractalStrings";

export const Route = createFileRoute("/")({
  component: ShowcasePage,
  loader: async () => {
    return Promise.all(
      fractals
        .sort(() => Math.random() - 0.5)
        .slice(0, 16)
        .map((f) => deserializeBuildRules(f)),
    );
  },
});

function ShowcasePage() {
  const data = Route.useLoaderData();

  return <Showcase fractals={data} />;
}
