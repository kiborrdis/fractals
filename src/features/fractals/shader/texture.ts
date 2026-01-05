import { Vector2 } from "@/shared/libs/vectors";
import { FractalTrap, FractalTrapType, GradientStop } from "../types";

const mapTypeToNumber: Record<FractalTrapType, number> = {
  point: 1,
  line: 2,
  circle: 3,
};

// Offset shifts the range to [0, 2^32) so negative values can be encoded in unsigned bytes.
// Supported range: ±2147.483648
const FLOAT_ENCODE_OFFSET = 2147483648;

export const encodeFloatTo4Bytes = (
  num: number,
): [number, number, number, number] => {
  const intNum = Math.round(num * 1000000) + FLOAT_ENCODE_OFFSET;
  const byte4 = intNum & 0xff;
  const byte3 = (intNum >>> 8) & 0xff;
  const byte2 = (intNum >>> 16) & 0xff;
  const byte1 = (intNum >>> 24) & 0xff;
  return [byte1, byte2, byte3, byte4];
};

export const encodeUnsignedFloatTo4Bytes = (
  num: number,
): [number, number, number, number] => {
  const intNum = Math.round(num * 1000000);
  const byte4 = intNum & 0xff;
  const byte3 = (intNum >>> 8) & 0xff;
  const byte2 = (intNum >>> 16) & 0xff;
  const byte1 = (intNum >>> 24) & 0xff;
  return [byte1, byte2, byte3, byte4];
};

export const MAX_TRAPS = 64;

export function encodeTrapsAsUniforms(traps: FractalTrap[]): {
  types: Int32Array;
  data: Float32Array;
} {
  const types = new Int32Array(MAX_TRAPS);
  const data = new Float32Array(MAX_TRAPS * 3);

  traps.slice(0, MAX_TRAPS).forEach((trap, i) => {
    types[i] = mapTypeToNumber[trap.type];
    if (trap.type === "point") {
      data[i * 3 + 0] = trap.position[0];
      data[i * 3 + 1] = trap.position[1];
      data[i * 3 + 2] = 0;
    } else if (trap.type === "line") {
      data[i * 3 + 0] = trap.a;
      data[i * 3 + 1] = trap.b;
      data[i * 3 + 2] = trap.c;
    } else if (trap.type === "circle") {
      data[i * 3 + 0] = trap.center[0];
      data[i * 3 + 1] = trap.center[1];
      data[i * 3 + 2] = trap.radius;
    }
  });

  return { types, data };
}

// Initialize a texture and load gradient data
export function encodeGradientInTexture(
  gl: WebGLRenderingContext,
  stops: GradientStop[],
) {
  const textPixels = stops
    .map((s) => {
      return [
        Math.round(s[1] * 255),
        Math.round(s[2] * 255),
        Math.round(s[3] * 255),
        Math.round(s[4] * 255),
        ...encodeUnsignedFloatTo4Bytes(s[0]),
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
    pixel,
  );

  return texture;
}

export function loadIterDataTexture(
  gl: WebGLRenderingContext,
  iterData: Record<number, Vector2>,
  maxIterations: number,
) {
  const textPixels = new Array(maxIterations)
    .fill(0)
    .map((_, i) => {
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
    })
    .flat();

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
    pixel,
  );

  return texture;
}

export function loadFractalTexture(
  gl: WebGLRenderingContext,
  arr: Uint8Array,
  size: Vector2,
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
    pixel,
  );

  return texture;
}
