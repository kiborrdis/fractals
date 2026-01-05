import { Vector2 } from "@/shared/libs/vectors";
import { useRegisterCanvasRender } from "@/shared/ui/GraphEdit/context";
import { useCallback, useRef } from "react";
import { FractalImage } from "./shader/FractalImage";
import { FractalsRenderer } from "./shader/FractalsRenderer";
import { GradientStop } from "./types";
import { getDefaultFractalParams } from "./getDefaultFractalRules";
import { makeRulesBasedOnParams } from "./ruleConversion";

export const GraphFractalBackground = ({
  formula,
  c,
  gradient,

  priority,
}: {
  formula: string;
  gradient: GradientStop[];
  c: Vector2;
  priority?: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  if (canvasRef.current === null) {
    canvasRef.current = document.createElement("canvas");
  }

  const render = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      {
        size,
        axisRangeSizes,
        offset,
      }: {
        size: Vector2;
        axisRangeSizes: Vector2;
        offset: Vector2;
      },
    ) => {
      if (!canvasRef.current) {
        return;
      }

      const canvas = canvasRef.current;
      canvas.width = size[0];
      canvas.height = size[1];

      const fractalCtx = canvasRef.current.getContext("webgl2");
      if (!fractalCtx || canvas.width === 0 || canvas.height === 0) {
        return;
      }
      const defaultParams = getDefaultFractalParams();

      const fractalImage = new FractalImage(
        fractalCtx,
        makeRulesBasedOnParams({
          ...defaultParams,
          initialCFormula: "fCoord",
          initialZFormula: "c0",
          formula,
          gradient,
          dynamic: {
            ...defaultParams.dynamic,
            maxIterations: 100,
            c,
            rlVisibleRange: [
              -axisRangeSizes[0] / 2 - offset[0],
              axisRangeSizes[0] / 2 - offset[0],
            ],
            imVisibleRange: [
              -axisRangeSizes[1] / 2 - offset[1],
              axisRangeSizes[1] / 2 - offset[1],
            ],
          },
        }),
      );

      const renderer = new FractalsRenderer(fractalCtx, size, [[fractalImage]]);
      renderer.render(0, {
        offset: [0, 0],
        scale: 1,
      });

      ctx.drawImage(canvas, 0, 0, size[0], size[1]);
    },
    [c, formula, gradient],
  );

  useRegisterCanvasRender(render, priority);

  return null;
};
