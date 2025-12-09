import { Vector2 } from "@/shared/libs/vectors";
import { FractalCanvasParams, initFractalCanvas } from "./initFractalCanvas";
import { renderFractalOnCanvas } from "./renderFractalOnCanvas";
import { FractalImage } from "./FractalImage";

export class FractalsRenderer {
  private canvasSize: Vector2;
  private canvasParams: FractalCanvasParams;
  private lastRenderTime: number = 0;
  private timeQueryExtension: {
    TIME_ELAPSED_EXT: number;
  } | null = null;

  constructor(
    private context: WebGL2RenderingContext,
    canvasSize: Vector2,
    private grid: FractalImage[][],
  ) {
    this.canvasSize = canvasSize;
    this.canvasParams = initFractalCanvas(this.context);

    const timeQueryExtension = context.getExtension(
      "EXT_disjoint_timer_query_webgl2",
    );
    if (timeQueryExtension) {
      this.timeQueryExtension = timeQueryExtension;
    }
  }

  public resize(newSize: Vector2) {
    this.canvasSize = newSize;
    this.render(this.lastRenderTime);
  }

  public render(time: number): Promise<number> {
    let resolve: (value: number) => void = () => {};
    const renderPromise = new Promise<number>((newResolve) => {
      resolve = newResolve;
    });

    this.lastRenderTime = time;
    const context = this.canvasParams.context;
    let query: WebGLQuery | null = null;
    if (this.timeQueryExtension) {
      query = context.createQuery();

      context.beginQuery(this.timeQueryExtension.TIME_ELAPSED_EXT, query);
    }

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
    if (this.timeQueryExtension) {
      context.endQuery(this.timeQueryExtension.TIME_ELAPSED_EXT);

      const interval = setInterval(() => {
        if (!query) {
          resolve(-1);
          clearInterval(interval);
          return;
        }

        const available = context.getQueryParameter(
          query,
          context.QUERY_RESULT_AVAILABLE,
        );

        if (available) {
          const timeElapsed = context.getQueryParameter(
            query,
            context.QUERY_RESULT,
          );

          clearInterval(interval);

          resolve(timeElapsed / 1000000);
          return;
        }
      }, 10);
    } else {
      resolve(-1);
    }

    return renderPromise;
  }
}
