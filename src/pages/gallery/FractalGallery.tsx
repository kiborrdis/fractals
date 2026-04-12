import { DisplayFractals, FractalParamsBuildRules } from "@/features/fractals";

export const FractalGallery = ({
  fractals,
}: {
  fractals: FractalParamsBuildRules[];
}) => {
  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <DisplayFractals play={true} fractals={toGrid(fractals)} />
    </div>
  );
};

const toGrid = (
  fractals: FractalParamsBuildRules[],
): FractalParamsBuildRules[][] => {
  if (fractals.length >= 7) {
    console.log("Using 4 columns");
    const maxPerRow = 4;
    const rows = Math.ceil(fractals.length / maxPerRow);
    const grid: FractalParamsBuildRules[][] = [];
    for (let i = 0; i < rows; i++) {
      grid.push(fractals.slice(i * maxPerRow, (i + 1) * maxPerRow));
    }
    return grid;
  }

  if (fractals.length >= 5) {
    const maxPerRow = 3;
    const rows = Math.ceil(fractals.length / maxPerRow);
    const grid: FractalParamsBuildRules[][] = [];
    for (let i = 0; i < rows; i++) {
      grid.push(fractals.slice(i * maxPerRow, (i + 1) * maxPerRow));
    }
    return grid;
  }

  if (fractals.length >= 3) {
    const maxPerRow = 2;
    const rows = Math.ceil(fractals.length / maxPerRow);
    const grid: FractalParamsBuildRules[][] = [];
    for (let i = 0; i < rows; i++) {
      grid.push(fractals.slice(i * maxPerRow, (i + 1) * maxPerRow));
    }
    return grid;
  }
  if (fractals.length === 2) {
    return [[fractals[0]], [fractals[1]]];
  }
  if (fractals.length === 1) {
    return [fractals];
  }
  if (fractals.length === 0) {
    return [[]];
  }

  return [fractals];
};
