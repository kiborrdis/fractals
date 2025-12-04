import { Showcase } from "@/pages/showcase/Showcase";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: ShowcasePage,
});

function ShowcasePage() {
  return <Showcase />;
}
