import { useCallback } from "react";
import {
  GraphEditOptions,
  useRegisterCanvasRender,
} from "@/shared/ui/GraphEdit/context";
import {
  toCanvasPixels,
  toCanvasSpace,
} from "@/shared/ui/GraphEdit/coordinateUtils";
import { Vector2 } from "@/shared/libs/vectors";
import { Vector2LinePoint } from "../helpers/timelineUtils";

const MIN_LINE_WIDTH = 1;
const MAX_LINE_WIDTH = 10;

const extractRgbaComponents = (
  color: string,
): [number, number, number, number] | null => {
  const match = color.match(
    /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(0|1|0?\.\d+)\s*\)$/,
  );
  if (match) {
    return [
      parseInt(match[1], 10),
      parseInt(match[2], 10),
      parseInt(match[3], 10),
      parseFloat(match[4]),
    ];
  }
  return null;
};

export const TimelineVector2Line = ({
  data,
  color,
  priority,
}: {
  data: Vector2LinePoint[];
  color: string;
  priority?: number;
}) => {
  const render = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      {
        offset,
        axisRangeSizes,
        size,
        options,
      }: {
        offset: Vector2;
        axisRangeSizes: Vector2;
        size: Vector2;
        options: GraphEditOptions;
      },
    ) => {
      if (data.length < 2) {
        return;
      }

      ctx.setLineDash([]);

      const rgbaComponents = extractRgbaComponents(color);
      const strColor = color;
      ctx.strokeStyle = strColor;

      for (let i = 1; i < data.length; i++) {
        const prev = data[i - 2] || data[i - 1];
        const cur = data[i];

        // Average dim1 of segment endpoints, map [-1,1] → [MIN, MAX]
        const averageZ = (prev[2] + cur[2]) / 2;
        const zVal = (averageZ + 1) / 2;
        ctx.lineWidth =
          MIN_LINE_WIDTH + zVal * (MAX_LINE_WIDTH - MIN_LINE_WIDTH);

        if (rgbaComponents) {
          const brightnessFactor = zVal * 0.8 + 0.2;
          const modulatedColor = `rgba(${Math.round(rgbaComponents[0] * brightnessFactor)}, ${Math.round(rgbaComponents[1] * brightnessFactor)}, ${Math.round(rgbaComponents[2] * brightnessFactor)}, ${rgbaComponents[3]})`;
          ctx.strokeStyle = modulatedColor;
        }

        const prevCanvas = toCanvasPixels(
          toCanvasSpace([prev[0], prev[1]], axisRangeSizes, offset),
          size,
          options,
        );
        const curCanvas = toCanvasPixels(
          toCanvasSpace([cur[0], cur[1]], axisRangeSizes, offset),
          size,
          options,
        );

        ctx.beginPath();
        ctx.moveTo(prevCanvas[0], prevCanvas[1]);
        ctx.lineTo(curCanvas[0], curCanvas[1]);
        ctx.stroke();
      }
    },
    [data, color],
  );

  useRegisterCanvasRender(render, priority);

  return null;
};
