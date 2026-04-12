import { createFileRoute, redirect } from "@tanstack/react-router";
import { isMobile } from "@/shared/libs/isMobile";
import { deserializeBuildRules } from "@/features/fractals";
import { fractalsApiClient } from "@/shared/api/fractalStorageApi";
import { FractalGallery } from "@/pages/gallery/FractalGallery";

export const Route = createFileRoute("/gallery")({
  beforeLoad: () => {
    if (isMobile()) {
      throw redirect({ to: "/" });
    }
  },
  validateSearch: (search): { p: string | undefined } => {
    return {
      p: search.p as string,
    };
  },
  loaderDeps: ({ search }) => [search.p],
  loader: async ({ deps: [p] }) => {
    const page = p ? parseInt(p) : 0;

    const response = await fractalsApiClient.get_fractals({
      limit: 16,
      page,
    });

    if (response[0] !== 200) {
      throw new Error("Failed to load fractals");
    }

    return Promise.all(
      response[1].list.map(async (fractal) => {
        return await deserializeBuildRules(fractal.serialiazedStr);
      }),
    );
  },
  component: GalleryPage,
});

function GalleryPage() {
  const data = Route.useLoaderData();

  return <FractalGallery fractals={data} />;
}
