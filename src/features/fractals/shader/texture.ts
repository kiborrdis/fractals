import { Vector2 } from "@/shared/libs/vectors";
import { GradientStop } from "../types";

// Initialize a texture and load gradient data
export function loadTexture(gl: WebGLRenderingContext, stops: GradientStop[]) {
  const textPixels = stops
    .map((s) => {
      return [
        Math.round(s[1] * 255),
        Math.round(s[2] * 255),
        Math.round(s[3] * 255),
        Math.round(s[4] * 255),
        Math.round(s[0] * 255),
        Math.round(0),
        Math.round(0),
        Math.round(0),
      ];
    })
    .flat();
  const texture = gl.createTexture();

  gl.bindTexture(gl.TEXTURE_2D, texture);

  const level = 0;
  const internalFormat = gl.RGBA;
  const width = stops.length * 2;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;

  const pixel = new Uint8Array(textPixels);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    width,
    height,
    border,
    srcFormat,
    srcType,
    pixel
  );

  return texture;
}

export function loadIterDataTexture(
  gl: WebGLRenderingContext,
  iterData: Record<number, Vector2>,
  maxIterations: number
) {
  const textPixels = new Array(maxIterations).fill(0).map((_, i) => {
    if (!iterData[i]) {
      iterData[i] = [0, 0];
    }
    const minmax = iterData[i];
    return [
      minmax[0] % 255,
      Math.floor(minmax[0] / 255),
      minmax[1] % 255,
      Math.floor(minmax[1] / 255),
    ];
  }).flat();
 

  const texture = gl.createTexture();

  gl.bindTexture(gl.TEXTURE_2D, texture);

  const level = 0;
  const internalFormat = gl.RGBA;
  const width = maxIterations;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;

  const pixel = new Uint8Array(textPixels);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    width,
    height,
    border,
    srcFormat,
    srcType,
    pixel
  );

  return texture;
}

export function loadFractalTexture(
  gl: WebGLRenderingContext,
  arr: Uint8Array,
  size: Vector2
) {
  const texture = gl.createTexture();

  gl.bindTexture(gl.TEXTURE_2D, texture);

  const level = 0;
  const internalFormat = gl.RGBA;
  const width = size[0];
  const height = size[1];
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;

  const pixel = arr;
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    width,
    height,
    border,
    srcFormat,
    srcType,
    pixel
  );

  return texture;
}
