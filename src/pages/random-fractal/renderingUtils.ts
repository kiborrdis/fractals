import { Vector2 } from "@/shared/libs/vectors";
import { FractalsRenderer } from "@/features/fractals/shader/FractalsRenderer";

export const getBitmapFromRenderer = async (
  ctx: WebGL2RenderingContext,
  renderer: FractalsRenderer,
  size: Vector2,
): Promise<Uint8ClampedArray> => {
  await renderer.render(0, { offset: [0, 0], scale: 1 });

  const data = new Uint8ClampedArray(size[0] * size[1] * 4);
  ctx.readPixels(0, 0, size[0], size[1], ctx.RGBA, ctx.UNSIGNED_BYTE, data);

  return data;
};

export const renderBitmapToCanvas = async (
  bitmap: Uint8ClampedArray,
  canvasSize: Vector2,
  canvasId: string,
  flipY: boolean = true,
): Promise<void> => {
  let dataToRender = bitmap;

  // Flip data along y-axis if needed (WebGL vs Canvas coordinate difference)
  if (flipY) {
    const flippedData = new Uint8ClampedArray(bitmap.length);
    const pixelsPerRow = canvasSize[0] * 4;
    for (let y = 0; y < canvasSize[1]; y++) {
      const srcRow = y * pixelsPerRow;
      const dstRow = (canvasSize[1] - 1 - y) * pixelsPerRow;
      flippedData.set(bitmap.slice(srcRow, srcRow + pixelsPerRow), dstRow);
    }
    dataToRender = flippedData;
  }

  const imageData = new ImageData(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataToRender as any,
    canvasSize[0],
    canvasSize[1],
  );
  const debugCanvas = document.createElement("canvas");
  debugCanvas.width = canvasSize[0];
  debugCanvas.height = canvasSize[1];
  const debugCtx = debugCanvas.getContext("2d");

  if (debugCtx) {
    debugCtx.putImageData(imageData, 0, 0);
    const debugImageBitmap = await createImageBitmap(debugCanvas);
    const testCanvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (testCanvas) {
      const testCtx = testCanvas.getContext("bitmaprenderer");
      if (testCtx) {
        testCtx.transferFromImageBitmap(debugImageBitmap);
      }
    }
  }
};

export const renderNVectorStepRuleVisualization = async (
  bitmap: Uint8ClampedArray,
  canvasSize: Vector2,
  selectedPoints: Array<{ x: number; y: number }>,
  canvasId: string,
): Promise<void> => {
  // Flip data along y-axis
  const flippedData = new Uint8ClampedArray(bitmap.length);
  const pixelsPerRow = canvasSize[0] * 4;
  for (let y = 0; y < canvasSize[1]; y++) {
    const srcRow = y * pixelsPerRow;
    const dstRow = (canvasSize[1] - 1 - y) * pixelsPerRow;
    flippedData.set(bitmap.slice(srcRow, srcRow + pixelsPerRow), dstRow);
  }

  const imageData = new ImageData(flippedData, canvasSize[0], canvasSize[1]);
  const debugCanvas = document.createElement("canvas");
  debugCanvas.width = canvasSize[0];
  debugCanvas.height = canvasSize[1];
  const debugCtx = debugCanvas.getContext("2d");

  if (debugCtx) {
    debugCtx.putImageData(imageData, 0, 0);

    // Draw line through selected points
    if (selectedPoints.length > 0) {
      debugCtx.strokeStyle = "yellow";
      debugCtx.lineWidth = 2;
      debugCtx.beginPath();

      // Flip Y coordinate for display (already in pixel space)
      const flippedPoints = selectedPoints.map((p) => ({
        x: p.x,
        y: canvasSize[1] - 1 - p.y,
      }));

      // debugCtx.moveTo(flippedPoints[0].x, flippedPoints[0].y);
      // for (let i = 1; i < flippedPoints.length; i++) {
      //   debugCtx.lineTo(flippedPoints[i].x, flippedPoints[i].y);
      // }
      debugCtx.stroke();

      // Draw points as circles
      debugCtx.fillStyle = "blue";
      for (const p of flippedPoints) {
        debugCtx.beginPath();
        debugCtx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        debugCtx.fill();
      }
    }

    const debugImageBitmap = await createImageBitmap(debugCanvas);
    const testCanvas2 = document.getElementById(canvasId) as HTMLCanvasElement;
    if (testCanvas2) {
      const testCtx2 = testCanvas2.getContext("bitmaprenderer");
      if (testCtx2) {
        testCtx2.transferFromImageBitmap(debugImageBitmap);
      }
    }
  }
};
