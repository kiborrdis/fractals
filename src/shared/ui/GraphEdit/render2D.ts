import { mul, Vector2 } from "@/shared/libs/vectors";
import { GraphEditOptions } from "./context";
import {
  fromCanvasPixels,
  toCanvasPixels,
  toCanvasPixelsSize,
  toCanvasSpace,
  toCanvasSpaceSize,
  toValueSpace,
} from "./coordinateUtils";

const defaultOffset: [number, number] = [0, 0];

const defaultGetColor = () => {
  return "pink";
};

const getInterpolatedColor = (
  color1: [number, number, number, number],
  color2: [number, number, number, number],
  factor: number,
): string => {
  const r = Math.round(color1[0] + (color2[0] - color1[0]) * factor);
  const g = Math.round(color1[1] + (color2[1] - color1[1]) * factor);
  const b = Math.round(color1[2] + (color2[2] - color1[2]) * factor);
  const a = color1[3] + (color2[3] - color1[3]) * factor;

  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

export function clearWithColor(
  ctx: CanvasRenderingContext2D,
  size: Vector2,
  color: string = "black",
) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, ...size);
}

export function render2DLine(
  ctx: CanvasRenderingContext2D,
  options: {
    data: Vector2[];
    axisRangeSizes: [number, number];
    offset?: [number, number];
    lineDash?: number;
    lineWidth?: number;
    height: number;
    width: number;
    graphOptions: GraphEditOptions;
    getColor?: (index: number, len: number) => string;
  },
) {
  const {
    axisRangeSizes,
    data,
    lineWidth = 1,
    offset = defaultOffset,
    graphOptions,
  } = options;
  const size = [options.width, options.height] as Vector2;
  const getColor = options.getColor || defaultGetColor;

  if (data.length === 0) {
    return;
  }

  ctx.lineWidth = lineWidth;

  const visibleData = data;

  if (visibleData.length === 0) {
    return;
  }

  let item = visibleData[0];
  let prevItem = item;

  if (options.lineDash) {
    ctx.setLineDash([options.lineDash]);
  } else {
    ctx.setLineDash([]);
  }

  for (let i = 1; i < visibleData.length; i++) {
    prevItem = item;
    item = visibleData[i];

    ctx.beginPath();
    ctx.moveTo(
      ...toCanvasPixels(
        toCanvasSpace(prevItem, axisRangeSizes, offset),
        size,
        graphOptions,
      ),
    );

    const nextPoint = toCanvasPixels(
      toCanvasSpace(item, axisRangeSizes, offset),
      size,
      graphOptions,
    );

    ctx.lineTo(...nextPoint);
    ctx.moveTo(...nextPoint);

    ctx.closePath();

    ctx.strokeStyle = getColor(i, data.length);

    ctx.stroke();
  }
}

export function render2DCircle(
  ctx: CanvasRenderingContext2D,
  options: {
    center: Vector2;
    radius: number;
    axisRangeSizes: [number, number];
    offset?: [number, number];
    lineWidth?: number;
    lineDash?: number;
    height: number;
    width: number;
    graphOptions: GraphEditOptions;
    color?: string;
  },
) {
  const {
    axisRangeSizes,
    center,
    radius,
    lineWidth = 1,
    offset = defaultOffset,
    graphOptions,
  } = options;
  const size = [options.width, options.height] as Vector2;
  const color = options.color || "white";

  if (radius <= 0) {
    return;
  }

  ctx.lineWidth = lineWidth;

  if (options.lineDash) {
    ctx.setLineDash([options.lineDash]);
  } else {
    ctx.setLineDash([]);
  }

  ctx.beginPath();
  const centerCanvas = toCanvasPixels(
    toCanvasSpace(center, axisRangeSizes, offset),
    size,
    graphOptions,
  );
  const radiusCanvas = toCanvasPixelsSize(
    toCanvasSpaceSize([radius, radius], axisRangeSizes),
    size,
    graphOptions,
  )[0];

  ctx.arc(centerCanvas[0], centerCanvas[1], radiusCanvas, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.strokeStyle = color;

  ctx.stroke();
}

export type GridInfo = {
  xValueSizes: number[];
  yValueSizes: number[];
};

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  {
    xCellSize = 0.5,
    yCellSize = 0.5,
    centerAxis = true,
  }: {
    xCellSize?: number;
    yCellSize?: number;
    centerAxis?: boolean;
  },
  axisRangeSizes: Vector2,
  offset: Vector2,
  [width, height]: Vector2,
  options: GraphEditOptions,
): GridInfo {
  const minNumberOfCells = 8;
  const subcellsInCell = 2;
  const canvasMiddle = [width / 2, height / 2];

  const center = toCanvasPixels(
    toCanvasSpace([0, 0], axisRangeSizes, offset),
    [width, height],
    options,
  );

  const highestDim = Math.max(width, height);

  const [minGridWidth, minGridHeight] = toCanvasPixelsSize(
    toCanvasSpaceSize([xCellSize, yCellSize], axisRangeSizes),
    [width, height],
    options,
  );

  // minCellSize = baseCellSize * subcellsInCell^n
  // dim/minCellSize = minNumberOfCells
  // dim /(baseCellSize * subcellsInCell^n) = minNumberOfCells
  // dim/(baseCellSize * minNumberOfCells) = subcellsInCell^n
  // subcellsInCell^n  = dim/(minNumberOfCells * baseCellSize)
  // n = log(dim/(minNumberOfCells * baseCellSize)) / log(subcellsInCell)
  const subcellsPowerX = Math.floor(
    Math.log(highestDim / (minNumberOfCells * minGridWidth)) /
      Math.log(subcellsInCell),
  );
  const subcellsPowerY = Math.floor(
    Math.log(highestDim / (minNumberOfCells * minGridHeight)) /
      Math.log(subcellsInCell),
  );

  const leftTopCorner = toCanvasPixels(
    toCanvasSpace(
      toValueSpace(
        fromCanvasPixels([0, 0], [width, height], options),
        axisRangeSizes,
        offset,
      ),
      axisRangeSizes,
      [0, 0],
    ),
    [width, height],
    options,
  );

  const rightBottomCorner = toCanvasPixels(
    toCanvasSpace(
      toValueSpace(
        fromCanvasPixels([width, height], [width, height], options),
        axisRangeSizes,
        offset,
      ),
      axisRangeSizes,
      [0, 0],
    ),
    [width, height],
    options,
  );

  const startW = leftTopCorner[0] - canvasMiddle[0];
  const endW = rightBottomCorner[0] - canvasMiddle[0];
  const startH = leftTopCorner[1] - canvasMiddle[1];
  const endH = rightBottomCorner[1] - canvasMiddle[1];

  const minSubdivision: Vector2 = [
    Math.pow(subcellsInCell, subcellsPowerX),
    Math.pow(subcellsInCell, subcellsPowerY),
  ];

  const params = calculateGridParams({
    startW,
    endW,
    startH,
    endH,
    size: [width, height],
    gridSize: toCanvasPixelsSize(
      toCanvasSpaceSize(
        mul([xCellSize, yCellSize], minSubdivision),
        axisRangeSizes,
      ),
      [width, height],
      options,
    ),
  });
  const factor =
    1 -
    (highestDim / params.gridSize[0] - minNumberOfCells) /
      (minNumberOfCells * subcellsInCell - minNumberOfCells);

  drawGridPart(
    ctx,
    params,
    getInterpolatedColor([32, 32, 32, 0], [32, 32, 32, 0.7], factor),
  );

  const params2 = calculateGridParams({
    startW,
    endW,
    startH,
    endH,
    size: [width, height],
    gridSize: toCanvasPixelsSize(
      toCanvasSpaceSize(
        mul([xCellSize, yCellSize], mul(minSubdivision, subcellsInCell)),
        axisRangeSizes,
      ),
      [width, height],
      options,
    ),
  });
  const factor2 =
    1 -
    (highestDim / params2.gridSize[0] - minNumberOfCells / subcellsInCell) /
      (minNumberOfCells - minNumberOfCells / subcellsInCell);
  drawGridPart(
    ctx,
    params2,
    getInterpolatedColor([32, 32, 32, 0.7], [64, 64, 64, 0.7], factor2),
  );

  const params3 = calculateGridParams({
    startW,
    endW,
    startH,
    endH,
    size: [width, height],
    gridSize: toCanvasPixelsSize(
      toCanvasSpaceSize(
        mul(
          [xCellSize, yCellSize],
          mul(minSubdivision, subcellsInCell * subcellsInCell),
        ),
        axisRangeSizes,
      ),
      [width, height],
      options,
    ),
  });
  const factor3 =
    1 -
    (highestDim / params3.gridSize[0] -
      minNumberOfCells / (subcellsInCell * subcellsInCell)) /
      (minNumberOfCells / subcellsInCell -
        minNumberOfCells / (subcellsInCell * subcellsInCell));
  drawGridPart(
    ctx,
    params3,
    getInterpolatedColor([64, 64, 64, 0.7], [96, 96, 96, 0.7], factor3),
  );

  // Central axis
  if (centerAxis) {
    ctx.beginPath();
    ctx.strokeStyle = "#888";

    ctx.lineWidth = 1.4;

    ctx.moveTo(center[0], height);
    ctx.lineTo(center[0], 0);

    ctx.moveTo(0, center[1]);
    ctx.lineTo(width, center[1]);
    ctx.closePath();
    ctx.stroke();
  }

  return {
    xValueSizes: [
      xCellSize * minSubdivision[0] * subcellsInCell * subcellsInCell,
      xCellSize * minSubdivision[0] * subcellsInCell,
      xCellSize * minSubdivision[0],
    ],
    yValueSizes: [
      yCellSize * minSubdivision[1] * subcellsInCell * subcellsInCell,
      yCellSize * minSubdivision[1] * subcellsInCell,
      yCellSize * minSubdivision[1],
    ],
  };
}

const drawGridPart = (
  ctx: CanvasRenderingContext2D,
  {
    xGridLinesNum,
    yGridLinesNum,
    gridXLineStartNum,
    gridYLineStartNum,
    gridSize: [minGridWidth, minGridHeight],
    size: [width, height],
  }: ReturnType<typeof calculateGridParams>,
  color: string,
) => {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  for (let i = gridXLineStartNum; i <= xGridLinesNum; i++) {
    const x = i * minGridWidth;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }

  for (let i = gridYLineStartNum; i <= yGridLinesNum; i++) {
    const y = i * minGridHeight;
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }

  ctx.closePath();
  ctx.stroke();
};

const calculateGridParams = ({
  startW,
  endW,
  startH,
  endH,
  size,
  gridSize,
}: {
  startW: number;
  endW: number;
  startH: number;
  endH: number;
  size: Vector2;
  gridSize: Vector2;
}) => {
  const xGridLinesNum = Math.min((endW - startW) / gridSize[0], size[0]);
  const yGridLinesNum = Math.min((endH - startH) / gridSize[1], size[1]);

  const valueSpaceXGridStart = startW / gridSize[0];
  const gridXLineStartNum =
    1 - Math.abs(valueSpaceXGridStart - Math.floor(valueSpaceXGridStart));
  const valueSpaceYGridStart = startH / gridSize[1];
  const gridYLineStartNum =
    1 - Math.abs(valueSpaceYGridStart - Math.floor(valueSpaceYGridStart));

  return {
    xGridLinesNum,
    yGridLinesNum,
    gridXLineStartNum,
    gridYLineStartNum,
    gridSize,
    size,
  };
};
