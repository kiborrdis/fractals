import { Vector2 } from "@/shared/libs/vectors";
import { FractalImage } from "./FractalImage";

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
  private lastCamera: {
    offset: Vector2;
    scale: number;
  } = {
    offset: [0, 0],
    scale: 1,
  };

  private canvasSize: Vector2;
  private rendererContext: FractalRendererContext;
  private lastRenderTime: number = 0;
  private timeQueryExtension: {
    TIME_ELAPSED_EXT: number;
  } | null = null;

  private tex0: WebGLTexture;
  private tex1: WebGLTexture;
  private framebuffer: WebGLFramebuffer;

  constructor(
    private context: WebGL2RenderingContext,
    canvasSize: Vector2,
    private grid: FractalImage[][],
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
      console.error(
        "EXT_color_buffer_float not supported — RGBA32F FBO will fail",
      );
    }

    const ext = this.context.getExtension("OES_texture_float_linear");
    if (!ext) {
      console.error(
        "OES_texture_float_linear not supported — linear filtering on floating point textures will not work",
      );
    }

    this.tex0 = createMemoryTexture(context, canvasSize);
    this.tex1 = createMemoryTexture(context, canvasSize);

    this.framebuffer = context.createFramebuffer();
    this.attachTexturesToFramebuffer([this.tex0, this.tex1]);
  }

  private attachTexturesToFramebuffer(
    texturePair: [WebGLTexture, WebGLTexture],
  ) {
    const context = this.context;
    const fb = this.framebuffer;

    context.bindFramebuffer(context.FRAMEBUFFER, fb);

    context.framebufferTexture2D(
      context.FRAMEBUFFER,
      context.COLOR_ATTACHMENT0,
      context.TEXTURE_2D,
      texturePair[0],
      0,
    );
    context.framebufferTexture2D(
      context.FRAMEBUFFER,
      context.COLOR_ATTACHMENT1,
      context.TEXTURE_2D,
      texturePair[1],
      0,
    );

    const status = context.checkFramebufferStatus(context.FRAMEBUFFER);
    if (status !== context.FRAMEBUFFER_COMPLETE) {
      throw new Error("Framebuffer not complete: " + status.toString());
    }
  }

  public resize(newSize: Vector2) {
    this.canvasSize = newSize;

    this.context.deleteTexture(this.tex0);
    this.context.deleteTexture(this.tex1); 

    this.tex0 = createMemoryTexture(this.context, this.canvasSize);
    this.tex1 = createMemoryTexture(this.context, this.canvasSize);
    this.attachTexturesToFramebuffer([this.tex0, this.tex1]);

    this.render(this.lastRenderTime, this.lastCamera);
  }

  public render(
    time: number,
    camera: {
      offset: Vector2;
      scale: number;
    },
    applyInitialTime: boolean = false,
  ): Promise<number> {
    this.lastCamera = camera;

    let resolve: (value: number) => void = () => {};
    const renderPromise = new Promise<number>((newResolve) => {
      resolve = newResolve;
    });

    this.lastRenderTime = time;
    const context = this.rendererContext.context;
    let query: WebGLQuery | null = null;
    if (this.timeQueryExtension) {
      query = context.createQuery();

      context.beginQuery(this.timeQueryExtension.TIME_ELAPSED_EXT, query);
    }

    context.viewport(0, 0, ...this.canvasSize);
    context.clearColor(1, 1, 1, 1);
    context.clear(context.COLOR_BUFFER_BIT);
    // context.enable(context.BLEND);
    // context.blendFunc(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA);

    const gridRows = this.grid.length;
    const gridCols = this.grid[0]?.length || 0;

    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const fractalImage = this.grid[row][col];

        if (!fractalImage) {
          continue;
        }

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
          },
        );
      }
    }

    for (let row = 0; row < gridRows; row++) {
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
  }
}
