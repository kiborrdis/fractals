import { useCallback } from "react";
import { render2DCircle, render2DLine } from "./render2D";
import { Vector2 } from "@/shared/libs/vectors";
import { GraphEditOptions, useRegisterCanvasRender } from "./context";

export const Graph2DLine = ({
  data,
  lineWidth = 1,
  getColor,
  priority,
}: {
  data: Vector2[];
  lineWidth?: number;
  getColor?: (index: number, len: number) => string;
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
      render2DLine(ctx, {
        data,
        axisRangeSizes,
        width: size[0],
        height: size[1],
        offset,
        lineWidth,
        getColor,
        graphOptions: options,
      });
    },
    [data, getColor, lineWidth],
  );

  useRegisterCanvasRender(render, priority);

  return null;
};

export const Graph2DCircle = ({
  center,
  radius,
  lineWidth = 1,
  lineDash,
  color = "white",
  priority,
}: {
  center: Vector2;
  radius: number;
  lineWidth?: number;
  lineDash?: number;
  color?: string;
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
      render2DCircle(ctx, {
        center,
        radius,
        lineDash: lineDash,
        axisRangeSizes,
        width: size[0],
        height: size[1],
        offset,
        lineWidth,
        color,
        graphOptions: options,
      });
    },
    [center, radius, lineDash, lineWidth, color],
  );

  useRegisterCanvasRender(render, priority);

  return null;
};
