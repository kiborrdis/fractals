import { Vector2 } from "@/shared/libs/vectors";
import { FractalCanvasParams, initFractalCanvas } from "./initFractalCanvas";
import { renderFractalOnCanvas } from "./renderFractalOnCanvas";
import { FractalImage } from "./FractalImage";

export class FractalsRenderer {
  private canvasSize: Vector2;
  private canvasParams: FractalCanvasParams;

  constructor(
    private context: WebGL2RenderingContext,
    canvasSize: Vector2,
    private grid: FractalImage[][],
  ) {
    this.canvasSize = canvasSize;
    this.canvasParams = initFractalCanvas(this.context);
  }

  public resize(newSize: Vector2) {
    this.canvasSize = newSize;
  }

  public render(time: number) {
    const context = this.canvasParams.context;

    context.viewport(0, 0, ...this.canvasSize);
    context.clearColor(1, 1, 1, 1);
    context.clear(context.COLOR_BUFFER_BIT);
    context.enable(context.BLEND);
    context.blendFunc(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA);

    const gridRows = this.grid.length;
    const gridCols = this.grid[0]?.length || 0;

    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const fractalImage = this.grid[row][col];

        if (!fractalImage) {
          continue;
        }

        const [shader, params] = fractalImage.getRenderData(time);

        renderFractalOnCanvas(
          this.canvasParams,
          [this.canvasSize[0], this.canvasSize[1]],
          shader,
          [
            [col / gridCols, row / gridRows],
            [(col + 1) / gridCols, (row + 1) / gridRows],
          ],
          params,
        );
      }
    }
  }
}
