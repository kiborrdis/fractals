import { FractalParamsBuildRules } from "@/features/fractals";
import { defaultParse } from "@/shared/hooks/useQueryPersistense";
import { DisplayFractals } from "./DisplayFractals";
import { fractals } from "./fractalStrings";
import { HeroOverlay } from "./HeroOverlay";

export const Showcase = () => {
  const rows = 4;
  const cols = 4;
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
      }}
    >
      <DisplayFractals
        fractals={toGrid(
          fractals.map((f) => defaultParse(f) as FractalParamsBuildRules),
          rows,
          cols,
        )}
      />
      <BoxShadowGrid rows={rows} cols={cols} />
      <HeroOverlay />
    </div>
  );
};

const toGrid = <E extends object>(
  elems: E[],
  rows: number,
  cols: number,
): E[][] => {
  const grid: E[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: E[] = [];
    for (let c = 0; c < cols; c++) {
      const index = (r * cols + c) % elems.length;
      if (index < elems.length) {
        row.push(elems[index]);
      }
    }
    grid.push(row);
  }

  return grid;
};

const BoxShadowGrid = ({ rows, cols }: { rows: number; cols: number }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          style={{
            display: "flex",
            height: `${100 / rows}vh`,
          }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              style={{
                flex: 1,
                boxShadow: "inset 0px 0px 31px 18px rgba(0,0,0,0.4)",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

