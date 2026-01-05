import {
  useGraphEditContext,
  useRegisterCanvasRender,
} from "@/shared/ui/GraphEdit/context";
import {
  toCanvasPixels,
  toCanvasSpace,
} from "@/shared/ui/GraphEdit/coordinateUtils";
import { useCallback } from "react";

export const TimelineNewStepIndicator = ({
  time,
  priority,
}: {
  time: number;
  priority?: number;
}) => {
  const { offset, axisRangeSizes, size, options } = useGraphEditContext();

  const render = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      // Convert time to canvas coordinates
      const canvasCoords = toCanvasSpace([time, 0], axisRangeSizes, offset);
      const [pixelX] = toCanvasPixels(canvasCoords, size, options);

      ctx.beginPath();
      ctx.strokeStyle = "pink";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(pixelX, 0);
      ctx.lineTo(pixelX, size[1]);
      ctx.stroke();
      ctx.setLineDash([]);
    },
    [time, axisRangeSizes, offset, size, options],
  );

  useRegisterCanvasRender(render, priority);

  return null;
};
