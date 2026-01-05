import { Simulation } from "@/pages/sim/Simulation";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sim")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Simulation />;
}
