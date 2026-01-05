import { Vector2 } from "@/shared/libs/vectors";
import { GraphEditMappingMode, GraphEditOptions } from "./context";

/**
 * @param canvasCoords Normalized 0-1
 * @param axisRangeSizes Half-width sizes for each axis, centered at 0
 * @param offset Offset in value space
 */
export const toValueSpace = (
  canvasCoords: Vector2,
  axisRangeSizes: Vector2,
  offset: Vector2,
): Vector2 => {
  return [
    canvasCoords[0] * axisRangeSizes[0] - axisRangeSizes[0] / 2 - offset[0],
    canvasCoords[1] * axisRangeSizes[1] - axisRangeSizes[1] / 2 - offset[1],
  ];
};

export const toValueSpaceSize = (
  canvasCoords: Vector2,
  axisRangeSizes: Vector2,
): Vector2 => {
  return [
    canvasCoords[0] * axisRangeSizes[0],
    canvasCoords[1] * axisRangeSizes[1],
  ];
};

export const toCanvasSpaceSize = (
  valueCoords: Vector2,
  axisRangeSizes: Vector2,
): Vector2 => {
  return [
    valueCoords[0] / axisRangeSizes[0],
    valueCoords[1] / axisRangeSizes[1],
  ];
};

export const toCanvasPixelsSize = (
  canvasCoord: Vector2,
  size: Vector2,
  options: GraphEditOptions,
): Vector2 => {
  if (options.mappingMode === GraphEditMappingMode.Fill) {
    return [canvasCoord[0] * size[0], canvasCoord[1] * size[1]];
  }

  const lowestDim = Math.min(size[0], size[1]);
  return [canvasCoord[0] * lowestDim, canvasCoord[1] * lowestDim];
};

export const toCanvasSpace = (
  valueCoords: Vector2,
  axisRangeSizes: Vector2,
  offset: Vector2,
): Vector2 => {
  return [
    (valueCoords[0] + axisRangeSizes[0] / 2 + offset[0]) / axisRangeSizes[0],
    (valueCoords[1] + axisRangeSizes[1] / 2 + offset[1]) / axisRangeSizes[1],
  ];
};
export const toCanvasPixels = (
  canvasCoord: Vector2,
  size: Vector2,
  options: GraphEditOptions,
): Vector2 => {
  if (options.mappingMode === GraphEditMappingMode.Fill) {
    return [canvasCoord[0] * size[0], canvasCoord[1] * size[1]];
  }

  const lowestDim = Math.min(size[0], size[1]);
  const sizeDiff = Math.max(size[0], size[1]) - lowestDim;
  const sizeDiffHalf = sizeDiff / 2;

  const xSizeDiffFix = size[0] > size[1] ? sizeDiffHalf : 0;
  const ySizeDiffFix = size[1] > size[0] ? sizeDiffHalf : 0;

  return [
    canvasCoord[0] * lowestDim + xSizeDiffFix,
    canvasCoord[1] * lowestDim + ySizeDiffFix,
  ];
};
export const fromCanvasPixels = (
  pixelCoord: Vector2,
  size: Vector2,
  options: GraphEditOptions,
): Vector2 => {
  if (options.mappingMode === GraphEditMappingMode.Fill) {
    return [pixelCoord[0] / size[0], pixelCoord[1] / size[1]];
  }

  const lowestDim = Math.min(size[0], size[1]);
  const sizeDiff = Math.max(size[0], size[1]) - lowestDim;
  const sizeDiffHalf = sizeDiff / 2;

  const xSizeDiffFix = size[0] > size[1] ? sizeDiffHalf : 0;
  const ySizeDiffFix = size[1] > size[0] ? sizeDiffHalf : 0;

  return [
    (pixelCoord[0] - xSizeDiffFix) / lowestDim,
    (pixelCoord[1] - ySizeDiffFix) / lowestDim,
  ];
};
