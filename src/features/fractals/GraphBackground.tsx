import { Vector2 } from "@/shared/libs/vectors";
import {
  useGraphEditContext,
  useRegisterCanvasRender,
} from "@/shared/ui/GraphEdit/context";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FractalImage } from "./shader/FractalImage";
import { FractalsRenderer } from "./shader/FractalsRenderer";
import { FractalParamsBuildRules, GradientStop } from "./types";
import {
  getDefaultFractalParams,
  getDefaultFractalRules,
} from "./getDefaultFractalRules";
import { makeRulesBasedOnParams } from "./ruleConversion";
import { FractalMapImage } from "./shader/FractaMapImage";
import { DisplayCanvas } from "@/shared/ui/DisplayCanvas/DisplayCanvas";

const DETAIL_LEVEL = 3;
const MAX_DETAIL_LEVEL = 5;
const DELAY_BETWEEN_LOD = 250;

/**
 * Calculates one point in value space(with coodinates = c) per pixel and draws it
 */
export const GraphFractalSimpleMap = ({
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
          gradients: [gradient],
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

type MultipointMapRenderParams = [
  params: FractalParamsBuildRules,
  mapParams: { axisSizes: Vector2; offset: Vector2; targetDetailLevel: number },
];

const useMultipointMapFractalParams = (fractal: FractalParamsBuildRules) => {
  const r = fractal.dynamic.r;
  const imRange = fractal.dynamic.imVisibleRange;
  const rlRange = fractal.dynamic.rlVisibleRange;
  const formula = fractal.formula;
  const initialCFormula = fractal.initialCFormula;
  const initialZFormula = fractal.initialZFormula;
  const custom = fractal.custom;

  return useMemo(() => {
    const defaultBuildParams = getDefaultFractalRules();

    return {
      ...defaultBuildParams,
      formula: formula || defaultBuildParams.formula,
      initialCFormula: initialCFormula || "c0",
      initialZFormula: initialZFormula || "fCoord",
      dynamic: {
        ...defaultBuildParams.dynamic,
        r: r || defaultBuildParams.dynamic.r,
        imVisibleRange: imRange || defaultBuildParams.dynamic.imVisibleRange,
        rlVisibleRange: rlRange || defaultBuildParams.dynamic.rlVisibleRange,
      },
      custom,
    };
  }, [formula, initialCFormula, initialZFormula, r, imRange, rlRange, custom]);
};

/**
 * Calculates multiple points in value space per pixel and combines them
 */
export const GraphFractalMultipointMap = ({
  fractal,
}: {
  fractal: FractalParamsBuildRules;
}) => {
  const [[width, height], setSize] = useState([0, 0]);
  const [canvasEl, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const fractalRef = useRef<FractalsRenderer | null>(null);
  const mapRef = useRef<FractalMapImage | null>(null);
  const { axisRangeSizes, offset } = useGraphEditContext();
  const rerenderRef = useRef<
    ((...params: MultipointMapRenderParams) => void) | null
  >(null);
  const timeoutRef = useRef<number | null>(null);

  const fractalParamsToRender = useMultipointMapFractalParams(fractal);

  const renderMap = useCallback(() => {
    if (!fractalRef.current || !mapRef.current) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    rerenderRef.current?.(fractalParamsToRender, {
      axisSizes: [axisRangeSizes[0], axisRangeSizes[1]],
      offset: [-offset[0], -offset[1]],
      targetDetailLevel: DETAIL_LEVEL,
    });

    let currentLOD = DETAIL_LEVEL;

    const renderNextLOD = () => {
      if (currentLOD >= MAX_DETAIL_LEVEL) {
        return;
      }

      currentLOD += 1;

      rerenderRef.current?.(fractalParamsToRender, {
        axisSizes: [axisRangeSizes[0], axisRangeSizes[1]],
        offset: [-offset[0], -offset[1]],
        targetDetailLevel: currentLOD,
      });

      timeoutRef.current = window.setTimeout(renderNextLOD, DELAY_BETWEEN_LOD);
    };

    timeoutRef.current = window.setTimeout(renderNextLOD, DELAY_BETWEEN_LOD);
  }, [axisRangeSizes, fractalParamsToRender, offset]);

  useEffect(() => {
    const canvas = canvasEl;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("webgl2", { antialias: true });
    if (!context) {
      console.error("WebGL2 context initialization failed");
      return;
    }
    canvas.width = width;
    canvas.height = height;

    if (!context) {
      return;
    }

    const fractalImage = new FractalMapImage(context, fractalParamsToRender, {
      axisSizes: [axisRangeSizes[0], axisRangeSizes[1]],
      offset: [-offset[0], -offset[1]],
      targetDetailLevel: DETAIL_LEVEL,
    });

    const renderer = new FractalsRenderer(
      context,
      [width, height],
      [[fractalImage]],
    );
    fractalRef.current = renderer;
    mapRef.current = fractalImage;

    let queuedParams: MultipointMapRenderParams | null = null;
    let isRendering = false;
    rerenderRef.current = (...params: MultipointMapRenderParams) => {
      const [fractalParams, mapParams] = params;
      if (isRendering) {
        queuedParams = params;
        return;
      }

      if (mapRef.current) {
        mapRef.current.updateMapParams(mapParams);
        mapRef.current.updateParams(fractalParams);

        fractalRef.current
          ?.render(0, {
            offset: [0, 0],
            scale: 1,
          })
          .then(() => {
            if (queuedParams) {
              isRendering = false;

              const nextParams = queuedParams;
              queuedParams = null;
              rerenderRef.current?.(...nextParams);
            }
          })
          .finally(() => {
            isRendering = false;
          });

        isRendering = true;
      }
    };

    return () => {
      renderer.cleanup();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fractal.formula,
    fractal.initialCFormula,
    fractal.initialZFormula,
    canvasEl,
  ]);

  useEffect(() => {
    fractalRef.current?.resize([width, height], false).then(() => {
      renderMap();
    });
  }, [width, height, renderMap]);

  return (
    <DisplayCanvas
      width={width === 0 ? undefined : width}
      height={height === 0 ? undefined : height}
      ref={setCanvas}
      onSizeChange={setSize}
    />
  );
};
