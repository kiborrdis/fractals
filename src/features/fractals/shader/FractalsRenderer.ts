import { Vector2 } from "@/shared/libs/vectors";
import { FractalImage } from "./FractalImage";
import { FractalMapImage } from "./FractaMapImage";
import { WebGLError } from "../errors";

const createMemoryTexture = (
  context: WebGL2RenderingContext,
  canvasSize: Vector2,
) => {
  const targetTexture = context.createTexture();
  context.bindTexture(context.TEXTURE_2D, targetTexture);
  const targetTextureWidth = canvasSize[0];
  const targetTextureHeight = canvasSize[1];
  {
    context.texStorage2D(
      context.TEXTURE_2D,
      1, // levels
      context.RGBA32F, // internal format
      targetTextureWidth,
      targetTextureHeight,
    );

    // set the filtering so we don't need mips
    context.texParameteri(
      context.TEXTURE_2D,
      context.TEXTURE_MIN_FILTER,
      context.NEAREST,
    );
    context.texParameteri(
      context.TEXTURE_2D,
      context.TEXTURE_MAG_FILTER,
      context.NEAREST,
    );
    context.texParameteri(
      context.TEXTURE_2D,
      context.TEXTURE_WRAP_S,
      context.CLAMP_TO_EDGE,
    );
    context.texParameteri(
      context.TEXTURE_2D,
      context.TEXTURE_WRAP_T,
      context.CLAMP_TO_EDGE,
    );
  }

  return targetTexture;
};

export const createRendererContext = (context: WebGL2RenderingContext) => {
  const positionBuffer = context.createBuffer();
  const uvBuffer = context.createBuffer();

  context.bindBuffer(context.ARRAY_BUFFER, positionBuffer);

  return {
    context,
    uvBuffer,
    positionBuffer,
  };
};

export type FractalRendererContext = ReturnType<typeof createRendererContext>;

export class FractalsRenderer {
  private canvasSize: Vector2;
  private rendererContext: FractalRendererContext;
  private timeQueryExtension: {
    TIME_ELAPSED_EXT: number;
  } | null = null;

  private tex0: WebGLTexture;
  private tex1: WebGLTexture;
  private framebuffer: WebGLFramebuffer;

  constructor(
    private context: WebGL2RenderingContext,
    canvasSize: Vector2,
    private grid: (FractalImage | FractalMapImage)[][],
  ) {
    this.canvasSize = canvasSize;
    this.rendererContext = createRendererContext(this.context);

    const timeQueryExtension = context.getExtension(
      "EXT_disjoint_timer_query_webgl2",
    );
    if (timeQueryExtension) {
      this.timeQueryExtension = timeQueryExtension;
    }

    const floatExt = this.context.getExtension("EXT_color_buffer_float");
    if (!floatExt) {
      throw new WebGLError("EXT_color_buffer_float not supported — RGBA32F FBO will fail");
    }

    const ext = this.context.getExtension("OES_texture_float_linear");
    if (!ext) {
      throw new WebGLError("OES_texture_float_linear not supported — linear filtering on floating point textures will not work");
    }

    this.tex0 = createMemoryTexture(context, canvasSize);
    this.tex1 = createMemoryTexture(context, canvasSize);

    this.framebuffer = context.createFramebuffer();
  }

  public resize(newSize: Vector2): void {
    if (
      newSize[0] === this.canvasSize[0] &&
      newSize[1] === this.canvasSize[1]
    ) {
      return;
    }

    this.canvasSize = newSize;

    if (newSize[0] <= 0 || newSize[1] <= 0) {
      return;
    }

    this.context.deleteTexture(this.tex0);
    this.context.deleteTexture(this.tex1);

    this.tex0 = createMemoryTexture(this.context, this.canvasSize);
    this.tex1 = createMemoryTexture(this.context, this.canvasSize);
  }

  public render(
    time: number,
    camera: {
      offset: Vector2;
      scale: number;
    },
    applyInitialTime: boolean = false,
  ): Promise<number> {
    if (this.canvasSize[0] <= 0 || this.canvasSize[1] <= 0) {
      return Promise.resolve(-1);
    }


    let resolve: (value: number) => void = () => {};
    const renderPromise = new Promise<number>((newResolve) => {
      resolve = newResolve;
    });

    const context = this.rendererContext.context;
    let query: WebGLQuery | null = null;
    if (this.timeQueryExtension) {
      query = context.createQuery();

      context.beginQuery(this.timeQueryExtension.TIME_ELAPSED_EXT, query);
    }

    context.viewport(0, 0, ...this.canvasSize);
    context.clearColor(1, 1, 1, 1);
    context.clear(context.COLOR_BUFFER_BIT);

    const gridRows = this.grid.length;

    for (let row = 0; row < gridRows; row++) {
      const gridCols = this.grid[row]?.length || 0;
      for (let col = 0; col < gridCols; col++) {
        const fractalImage = this.grid[row][col];

        if (!fractalImage) {
          continue;
        }

        if (fractalImage instanceof FractalMapImage) {
          fractalImage.renderCalculationPass(
            [this.canvasSize[0], this.canvasSize[1]],
            [
              [col / gridCols, row / gridRows],
              [(col + 1) / gridCols, (row + 1) / gridRows],
            ],
            this.rendererContext,
            {
              framebuffer: this.framebuffer,
              textures: [this.tex0, this.tex1],
            },
          );
        } else {
          fractalImage.renderCalculationPass(
            time,
            camera,
            [this.canvasSize[0], this.canvasSize[1]],
            [
              [col / gridCols, row / gridRows],
              [(col + 1) / gridCols, (row + 1) / gridRows],
            ],
            this.rendererContext,
            applyInitialTime,
            {
              framebuffer: this.framebuffer,
              textures: [this.tex0, this.tex1],
            },
          );
        }
      }
    }

    for (let row = 0; row < gridRows; row++) {
      const gridCols = this.grid[row]?.length || 0;
      for (let col = 0; col < gridCols; col++) {
        const fractalImage = this.grid[row][col];

        if (!fractalImage) {
          continue;
        }

        fractalImage.renderColoringPass(
          time,
          camera,
          [this.canvasSize[0], this.canvasSize[1]],
          [
            [col / gridCols, row / gridRows],
            [(col + 1) / gridCols, (row + 1) / gridRows],
          ],
          this.rendererContext,
          {
            textures: [this.tex0, this.tex1],
          },
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

  cleanup = () => {
    this.context.deleteTexture(this.tex0);
    this.context.deleteTexture(this.tex1);
    this.context.deleteFramebuffer(this.framebuffer);

    this.context.deleteBuffer(this.rendererContext.positionBuffer);
    this.context.deleteBuffer(this.rendererContext.uvBuffer);

    for (const row of this.grid) {
      for (const fractalImage of row) {
        fractalImage?.cleanup();
      }
    }
  };
}
