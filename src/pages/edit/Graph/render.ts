export function render(
  canvas: HTMLCanvasElement,
  options: {
    data: [number[], string][];
    max: number;
    height: number;
    width: number;
    dataOffset?: number;
    zoomLevel?: number;
  },
) {
  const { max, data, height, width, dataOffset = 0, zoomLevel = 1 } = options;

  const effectiveWidth = Math.floor(width / zoomLevel);

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return;
  }

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);

  if (data.length === 0) {
    return;
  }

  for (const [arr, color] of data) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.7;

    // Apply offset and slice data to fit effective screen width (zoomed)
    const startIndex = Math.max(0, arr.length - effectiveWidth + dataOffset);
    const endIndex = Math.max(
      startIndex,
      Math.min(arr.length, startIndex + effectiveWidth),
    );
    const visibleData = arr.slice(startIndex, endIndex);

    if (visibleData.length === 0) {
      return;
    }

    ctx.save();
    ctx.scale(zoomLevel, 1);

    ctx.beginPath();

    ctx.moveTo(0, (visibleData[0] / max) * (height / 2) + height / 2);

    for (let i = 0; i < visibleData.length; i++) {
      ctx.lineTo(i, (visibleData[i] / max) * (height / 2) + height / 2 + 0.5);
      ctx.moveTo(i, (visibleData[i] / max) * (height / 2) + height / 2 + 0.5);
    }

    ctx.closePath();
    ctx.stroke();
  }

  // Restore context scaling
  ctx.restore();
}
