import { GradientStop } from "../types";

// Initialize a texture and load gradient data
export function loadTexture(gl: WebGLRenderingContext, stops: GradientStop[]) {
  const textPixels = stops
    .map((s) => {
      return [
        Math.round(s[1] * 255),
        Math.round(s[2] * 255),
        Math.round(s[3] * 255),
        Math.round(s[0] * 255),
      ];
    })
    .flat();
  const texture = gl.createTexture();

  gl.bindTexture(gl.TEXTURE_2D, texture);

  const level = 0;
  const internalFormat = gl.RGBA;
  const width = stops.length;
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
