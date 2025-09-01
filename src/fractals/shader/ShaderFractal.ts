import { FractalParams, Vector2 } from "../types";
import { doCanvasRender } from "./doCanvasRender";
import { FractalCanvasParams, initFractalCanvas } from "./initFractalCanvas";
import { prepareCanvasToRender } from "./prepareCanvasToRender";
import { prepareFractalUniforms } from "./prepareFractalUniforms";

export class ShaderFractal {
  private canvas: HTMLCanvasElement;
  private canvasSize: Vector2;
  private canvasParams: FractalCanvasParams;
  private lastParams: FractalParams | null = null;
  private formula: string;

  constructor(formula: string, canvas: HTMLCanvasElement, canvasSize: Vector2) {
    this.formula = formula;
    this.canvas = canvas;
    this.canvasSize = canvasSize;
    this.canvasParams = initFractalCanvas(this.formula, this.canvas, this.canvasSize);
  }

  public resize(newSize: Vector2) {
    this.canvasSize = newSize;
    this.canvasParams = initFractalCanvas(this.formula, this.canvas, this.canvasSize);

    if (this.lastParams) {
      this.render(this.lastParams);
    }
  }

  public render(params: FractalParams) {
    this.lastParams = params;
    
    prepareCanvasToRender(this.canvasParams, this.canvasSize);
    prepareFractalUniforms(this.canvasParams, params);
    doCanvasRender(this.canvasParams);
  }
}