import { Vector2 } from "@/shared/libs/vectors";
import { divide, mul, sum } from "../../shared/libs/vectors/vectorOperations";
import { RGBAVector } from "./types";

export const distance = (a: Vector2, b: Vector2): number =>
  Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));

export const randomRange = (start: number, stop: number) =>
  start + (stop - start) * Math.random();

export const randomRangeInt = (start: number, stop: number) =>
  Math.floor(start + (stop - start) * Math.random());

export const convertScreenCoordToSpace = (
  screenCoord: number,
  screenSize: number,
  spaceCenter: number,
  spaceSize: number,
  convertionScale: number,
) => {
  const targetRangeEnd = spaceSize * convertionScale + spaceCenter;
  const targetRangeStart = targetRangeEnd - 2 * spaceSize * convertionScale;
  const ratio = screenCoord / screenSize;

  return targetRangeEnd * ratio + targetRangeStart * (1 - ratio);
};

export const createIterationsColorConverterFn = (
  [startColor, endColor]: [RGBAVector, RGBAVector],
  overflowColor: RGBAVector,
) => {
  const diff = endColor.map((end, i) => end - startColor[i]);
  const colorMap: Record<number, Record<number, RGBAVector>> = {};

  return (
    iterations: number,
    maxIterations: number,
    _coords: Vector2,
  ): RGBAVector => {
    if (iterations === -1) {
      return overflowColor;
    }

    if (colorMap?.[maxIterations]?.[iterations]) {
      return colorMap[maxIterations][iterations];
    }

    if (!colorMap[maxIterations]) {
      colorMap[maxIterations] = {};
    }

    const coef = iterations / maxIterations;

    const result = startColor.map((startColorComp, index) => {
      return Math.floor(startColorComp + diff[index] * coef);
    }) as RGBAVector;
    result[3] = 255;

    colorMap[maxIterations][iterations] = result;
    return result as RGBAVector;
  };
};

export const transformToFractalCoord = (
  pointInContainer: Vector2,
  containerSize: Vector2,
  containerRLRange: Vector2,
  containerIMRange: Vector2,
): Vector2 => {
  const transformedPoint: Vector2 = [...pointInContainer];
  transformedPoint[1] = containerSize[1] - transformedPoint[1];

  const centerCoord = sum(mul(transformedPoint, 2), mul(containerSize, -1));
  const coord = divide(centerCoord, containerSize[1]);

  const fractStart: Vector2 = [containerRLRange[0], containerIMRange[0]];
  const fractEnd: Vector2 = [containerRLRange[1], containerIMRange[1]];

  const fractStartEndDelta = divide(sum(fractEnd, mul(fractStart, -1)), 2);

  return sum(
    sum(mul(fractStartEndDelta, coord), fractStart),
    fractStartEndDelta,
  );
};
