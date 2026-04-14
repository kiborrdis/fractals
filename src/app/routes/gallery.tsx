import { createFileRoute } from "@tanstack/react-router";
import { deserializeBuildRules } from "@/features/fractals";
import { fractalsApiClient } from "@/shared/api/fractalStorageApi";
import { FractalGallery } from "@/pages/gallery/FractalGallery";

export const Route = createFileRoute("/gallery")({
  beforeLoad: () => {},
  validateSearch: (search): { p: number } => {
    let page: number | undefined;

    if (search.p) {
      page = parseInt(search.p as string);
      if (isNaN(page)) {
        page = undefined;
      }
    }

    return {
      p: !page || page < 1 ? 1 : page,
    };
  },
  loaderDeps: ({ search }) => [search.p],
  loader: async ({ deps: [p] }) => {
    const page = p;

    const response = await fractalsApiClient.get_fractals({
      limit: 16,
      page,
    });

    if (response[0] !== 200) {
      throw new Error("Failed to load fractals");
    }

    return {
      hasNext: response[1].hasNext,
      list: await Promise.all(
        response[1].list.map(async (fractal) => {
          return {
            name: fractal.name,
            params: await deserializeBuildRules(fractal.serialiazedStr),
          };
        }),
      ),
    };
  },
  component: GalleryPage,
});

function GalleryPage() {
  const data = Route.useLoaderData();
  const search = Route.useSearch();

  return (
    <FractalGallery
      hasNextPage={data.hasNext}
      currentPage={search.p}
      fractals={data.list}
    />
  );
}
