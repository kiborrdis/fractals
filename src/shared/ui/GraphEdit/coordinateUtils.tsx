import { Vector2 } from "@/shared/libs/vectors";
import { GraphEditMappingMode, GraphEditOptions } from "./context";

/**
 * Converts normalized canvas coordinates (0-1) to value space coordinates.
 * @param canvasCoords Normalized 0-1
 * @param axisRangeSizes 
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

/**
 * Converts a size from normalized canvas space to value space.
 * @param canvasCoords Normalized 0-1
 * @param axisRangeSizes 
 */
export const toValueSpaceSize = (
  canvasCoords: Vector2,
  axisRangeSizes: Vector2,
): Vector2 => {
  return [
    canvasCoords[0] * axisRangeSizes[0],
    canvasCoords[1] * axisRangeSizes[1],
  ];
};

/**
 * Converts a size from value space to normalized canvas space.
 * @param valueCoords 
 * @param axisRangeSizes 
 * @returns 
 */
export const toCanvasSpaceSize = (
  valueCoords: Vector2,
  axisRangeSizes: Vector2,
): Vector2 => {
  return [
    valueCoords[0] / axisRangeSizes[0],
    valueCoords[1] / axisRangeSizes[1],
  ];
};

/** Converts a size from pixel space to normalized canvas space.
 * @param pixelSize Size in pixels
 * @param size Canvas size in pixels
 * @param options Graph edit options
 */
export const fromCanvasPixelsSize = (
  pixelSize: Vector2,
  size: Vector2,
  options: GraphEditOptions,
): Vector2 => {
  if (options.mappingMode === GraphEditMappingMode.Fill) {
    return [pixelSize[0] / size[0], pixelSize[1] / size[1]];
  }

  const lowestDim = Math.min(size[0], size[1]);
  return [pixelSize[0] / lowestDim, pixelSize[1] / lowestDim];
}

/** * Converts normalized canvas coordinates (0-1) to pixel coordinates.
 * @param canvasCoord Normalized 0-1
 * @param size Canvas size in pixels
 * @param options Graph edit options
 */
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

/** * Converts value space coordinates to normalized canvas coordinates (0-1).
 * @param valueCoords Value space coordinates
 * @param axisRangeSizes 
 * @param offset Offset in value space
 */
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

/** * Converts normalized canvas coordinates (0-1) to pixel coordinates.
 * @param canvasCoord Normalized 0-1
 * @param size Canvas size in pixels
 * @param options Graph edit options
 */
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

/** * Converts pixel coordinates to normalized canvas coordinates (0-1).
 * @param pixelCoord Pixel coordinates
 * @param size Canvas size in pixels
 * @param options Graph edit options
 */
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
