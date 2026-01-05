import { ReactNode, useCallback, useRef, useState } from "react";
import { drawGrid, GridInfo } from "./render2D";
import { Vector2 } from "@/shared/libs/vectors";
import { GraphEditOptions, useRegisterCanvasRender } from "./context";
import { toCanvasPixelsSize, toCanvasSpaceSize } from "./coordinateUtils";
import styles from "./Graph2DGrid.module.css";

const formatGridValue = (value: number): string => {
  return parseFloat(value.toPrecision(6)).toString();
};

export const GridCellRuler = ({
  xPixelSizes,
  xValueSizes,
  unit,
  formatValue = formatGridValue,
}: {
  xPixelSizes: number[];
  xValueSizes: number[];
  unit?: string;
  formatValue?: (value: number) => string;
}) => {
  const levelIndex = Math.min(1, xPixelSizes.length - 1);
  const rulerWidth = xPixelSizes[levelIndex];
  const cellValue = xValueSizes[levelIndex];
  const smallestPx = xPixelSizes[xPixelSizes.length - 1];
  const subdivisionCount = Math.round(rulerWidth / smallestPx);
  const label = unit
    ? `${formatValue(cellValue)} ${unit}`
    : formatValue(cellValue);

  return (
    <div className={styles.gridHelper}>
      <div className={styles.ruler} style={{ width: rulerWidth }}>
        <div className={styles.rulerBar} />
        <div className={styles.rulerEndcap} style={{ left: 0 }} />
        <div className={styles.rulerEndcap} style={{ right: 0 }} />
        {Array.from({ length: subdivisionCount - 1 }, (_, i) => (
          <div
            key={i}
            className={styles.rulerSubdivision}
            style={{ left: ((i + 1) / subdivisionCount) * rulerWidth }}
          />
        ))}
      </div>
      <span className={styles.rulerLabel}>{label}</span>
    </div>
  );
};

export const defaultRenderGridRuler = (
  xPixelSizes: number[],
  _yPixelSizes: number[],
  xValueSizes: number[],
) => {
  return <GridCellRuler xPixelSizes={xPixelSizes} xValueSizes={xValueSizes} />;
};

export type RenderGridRulerFn = typeof defaultRenderGridRuler;

type GridRenderInfo = {
  gridInfo: GridInfo;
  xPixelSizes: number[];
  yPixelSizes: number[];
};

export const Graph2DGrid = ({
  xCellSize = 0.5,
  yCellSize = 0.5,
  centerAxis = true,
  priority,
  renderRuler,
}: {
  xCellSize?: number;
  yCellSize?: number;
  centerAxis?: boolean;
  priority?: number;
  renderRuler?: (
    xPixelSizes: number[],
    yPixelSizes: number[],
    xValueSizes: number[],
    yValueSizes: number[],
  ) => ReactNode;
}) => {
  const [renderGridInfo, setRenderGridInfo] = useState<GridRenderInfo | null>(
    null,
  );
  const renderGridInfoRef = useRef<GridRenderInfo | null>(null);

  const renderFn = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      {
        offset,
        axisRangeSizes,
        size,
        options,
      }: {
        offset: Vector2;
        axisRangeSizes: Vector2;
        size: Vector2;
        options: GraphEditOptions;
      },
    ) => {
      const info = drawGrid(
        ctx,
        { xCellSize, yCellSize, centerAxis },
        axisRangeSizes,
        offset,
        size,
        options,
      );

      const xPixelSizes = info.xValueSizes.map(
        (s) =>
          toCanvasPixelsSize(
            toCanvasSpaceSize([s, s], axisRangeSizes),
            size,
            options,
          )[0],
      );
      const yPixelSizes = info.yValueSizes.map(
        (s) =>
          toCanvasPixelsSize(
            toCanvasSpaceSize([s, s], axisRangeSizes),
            size,
            options,
          )[1],
      );

      const prev = renderGridInfoRef.current;
      const changed =
        !prev ||
        yPixelSizes.some((v, i) => v !== prev.yPixelSizes[i]) ||
        xPixelSizes.some((v, i) => v !== prev.xPixelSizes[i]) ||
        info.xValueSizes.some((v, i) => v !== prev.gridInfo.xValueSizes[i]) ||
        info.yValueSizes.some((v, i) => v !== prev.gridInfo.yValueSizes[i]);

      if (changed) {
        const next = { gridInfo: info, xPixelSizes, yPixelSizes };
        renderGridInfoRef.current = next;
        setRenderGridInfo(next);
      }
    },
    [xCellSize, yCellSize, centerAxis],
  );

  useRegisterCanvasRender(renderFn, priority);

  if (!renderGridInfo || !renderRuler) return null;

  return (
    <>
      {renderRuler(
        renderGridInfo.xPixelSizes,
        renderGridInfo.yPixelSizes,
        renderGridInfo.gridInfo.xValueSizes,
        renderGridInfo.gridInfo.yValueSizes,
      )}
    </>
  );
};
