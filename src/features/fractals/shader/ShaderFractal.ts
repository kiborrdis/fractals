import { Vector2 } from "@/shared/libs/vectors";
import { FractalParams } from "../types";
import { FractalCanvasParams, initFractalCanvas } from "./initFractalCanvas";
import { prepareCanvasToRender } from "./prepareCanvasToRender";
import { prepareFractalUniforms } from "./prepareFractalUniforms";

export class ShaderFractal {
  private canvas: HTMLCanvasElement;
  private canvasSize: Vector2;
  private canvasParams: FractalCanvasParams;
  private lastParams: FractalParams | null = null;
  private formula: string;

  constructor(formula: string, canvas: HTMLCanvasElement, canvasSize: Vector2, initialParams?: FractalParams) {
    this.formula = formula;
    this.canvas = canvas;
    this.canvasSize = canvasSize;
    this.lastParams = initialParams || null;
    this.canvasParams = initFractalCanvas(this.formula, this.canvas, initialParams ? Object.entries(initialParams.custom).reduce((acc, [key, val]) => {
      acc[key] = typeof val === "number" ? "number" : "vector2";
      return acc;
    }, {} as Record<string, "number" | "vector2">) : undefined);
  }

  public resize(newSize: Vector2) {
    this.canvasSize = newSize;
    this.canvasParams = initFractalCanvas(
      this.formula,
      this.canvas,

      this.lastParams
        ? Object.entries(this.lastParams.custom).reduce((acc, [key, val]) => {
            acc[key] = typeof val === "number" ? "number" : "vector2";
            return acc;
          }, {} as Record<string, "number" | "vector2">)
        : undefined
    );

    if (this.lastParams) {
      this.render(this.lastParams);
    }
  }

  public render(params: FractalParams) {
    const lastNumOfCustomVars = Object.keys(this.lastParams?.custom ?? {}).length;
    this.lastParams = params;

    if (lastNumOfCustomVars !== Object.keys(params.custom).length) {
      this.canvasParams = initFractalCanvas(
        this.formula,
        this.canvas,
        Object.entries(params.custom).reduce((acc, [key, val]) => {
          acc[key] = typeof val === "number" ? "number" : "vector2";
          return acc;
        }, {} as Record<string, "number" | "vector2">)
      );
    }

    prepareFractalUniforms(this.canvasParams, params);
    prepareCanvasToRender(this.canvasParams, this.canvasSize);
  }
}
