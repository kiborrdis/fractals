import { RandomFractal } from "@/pages/random-fractal/RandomFractal";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/random")({
  component: RandomPage,
});

function RandomPage() {
  return <RandomFractal />;
}
