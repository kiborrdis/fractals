import { Vector2 } from "@/shared/libs/vectors";
import { makeFractalParamsFromRules } from "../ruleConversion";
import { FractalParams, FractalParamsBuildRules } from "../types";
import { FractalRendererContext } from "./FractalsRenderer";
import {
  createFractalMapShader,
  FractalMapShader,
} from "./createFractalMapShader";
import {
  createMapColoringShader,
  MapColoringShader,
} from "./createMapColoringShader";

const convertCustomVarsToTypes = (customVars: Record<string, unknown>) => {
  return Object.entries(customVars).reduce(
    (acc, [key, val]) => {
      acc[key] = Array.isArray(val) ? "vector2" : "number";
      return acc;
    },
    {} as Record<string, "number" | "vector2">,
  );
};

const textureCoordinates = [
  0.0, 0.0, 0.0, 1.0, 1.0, 0.0,

  1.0, 1.0, 0.0, 1.0, 1.0, 0.0,
];

export class FractalMapImage {
  private shader: FractalMapShader;
  private coloringShader: MapColoringShader;
  private builtParams: FractalParams | null = null;
  private textureToRenderTo = 0;
  private prevDetailLevel = 0;

  getColoringShader() {
    return this.coloringShader;
  }

  constructor(
    private context: WebGL2RenderingContext,
    private params: FractalParamsBuildRules,
    private mapParams: {
      axisSizes: Vector2;
      offset: Vector2;
      targetDetailLevel: number;
    },
    coloringShader?: MapColoringShader,
  ) {
    this.shader = createFractalMapShader(
      this.context,
      params.formula,
      convertCustomVarsToTypes(params.custom),
      params.initialZFormula,
      params.initialCFormula,
    );
    this.coloringShader =
      coloringShader || createMapColoringShader(this.context);
  }

  private attachTexturesToFramebuffer(
    fb: WebGLFramebuffer,
    size: Vector2,
    texturePair: [WebGLTexture, WebGLTexture],
  ) {
    if (size[0] <= 0 || size[1] <= 0) {
      return;
    }

    const context = this.context;

    context.bindFramebuffer(context.FRAMEBUFFER, fb);

    context.framebufferTexture2D(
      context.FRAMEBUFFER,
      context.COLOR_ATTACHMENT0,
      context.TEXTURE_2D,
      texturePair[this.textureToRenderTo],
      0,
    );

    const status = context.checkFramebufferStatus(context.FRAMEBUFFER);
    if (status !== context.FRAMEBUFFER_COMPLETE) {
      throw new Error("Framebuffer not complete: " + status.toString());
    }
  }

  updateMapParams(newMapParams: {
    axisSizes: Vector2;
    offset: Vector2;
    targetDetailLevel: number;
  }) {
    if (newMapParams.targetDetailLevel !== this.mapParams.targetDetailLevel) {
      this.prevDetailLevel = Math.max(
        this.mapParams.targetDetailLevel,
        this.prevDetailLevel,
      );
    }

    if (
      this.mapParams.axisSizes[0] !== newMapParams.axisSizes[0] ||
      this.mapParams.axisSizes[1] !== newMapParams.axisSizes[1] ||
      this.mapParams.offset[0] !== newMapParams.offset[0] ||
      this.mapParams.offset[1] !== newMapParams.offset[1]
    ) {
      this.prevDetailLevel = 0;
    }

    this.mapParams = newMapParams;
  }

  updateParams(newParams: FractalParamsBuildRules) {
    this.prevDetailLevel = 0;
    if (
      Object.keys(newParams.custom).length !==
        Object.keys(this.params.custom).length ||
      this.params.formula !== newParams.formula ||
      this.params.initialCFormula !== newParams.initialCFormula ||
      this.params.initialZFormula !== newParams.initialZFormula
    ) {
      this.shader.cleanup();
      this.shader = createFractalMapShader(
        this.context,
        newParams.formula,
        convertCustomVarsToTypes(newParams.custom),
        newParams.initialZFormula,
        newParams.initialCFormula,
      );
    }

    this.params = newParams;
  }

  getRenderData(time: number) {
    return [
      this.shader,
      makeFractalParamsFromRules(this.params, time),
    ] as const;
  }

  renderCalculationPass(
    canvasSize: Vector2,
    //** @desciption top left and bottom right corners of the area to render. From 0 to 1
    size: [Vector2, Vector2],
    { context, positionBuffer, uvBuffer }: FractalRendererContext,
    {
      framebuffer,
      textures,
    }: {
      framebuffer: WebGLFramebuffer;
      textures: [WebGLTexture, WebGLTexture];
    },
  ) {
    this.attachTexturesToFramebuffer(framebuffer, canvasSize, textures);
    const ySize = size[1][1] - size[0][1];

    context.enable(context.SCISSOR_TEST);
    context.scissor(
      size[0][0] * canvasSize[0] - 0.01,
      (1 - size[0][1] - ySize) * canvasSize[1] - 0.01,
      (size[1][0] - size[0][0] + 0.01) * canvasSize[0],
      (size[1][1] - size[0][1] + 0.01) * canvasSize[1],
    );
    context.useProgram(this.shader.program);
    context.bindFramebuffer(context.FRAMEBUFFER, framebuffer);

    this.builtParams = makeFractalParamsFromRules(this.params, 0);

    this.shader.applyMapParams({
      ...this.mapParams,
      prevDetailLevel: this.prevDetailLevel,
      prevData: textures[(this.textureToRenderTo + 1) % 2],
    });
    this.shader.applyMapFractalParams(this.builtParams);
    this.shader.applyCameraParams({
      offset: [0, 0],
      scale: 1,
    });
    this.shader.applyResolutionParams({
      fullResolution: canvasSize,
      renderResolution: [
        (size[1][0] - size[0][0]) * canvasSize[0],
        (size[1][1] - size[0][1]) * canvasSize[1],
      ] as const,
    });
    this.shader.applyCustomVars(this.builtParams.custom);

    const positions = calculateFaceVertices(canvasSize, size);

    context.bindBuffer(context.ARRAY_BUFFER, uvBuffer);
    context.bufferData(
      context.ARRAY_BUFFER,
      new Float32Array(textureCoordinates),
      context.STATIC_DRAW,
    );
    context.vertexAttribPointer(
      context.getAttribLocation(this.shader.program, "a_texture_coord"),
      2, // every coordinate composed of 2 values
      context.FLOAT, // the data in the buffer is 32-bit float
      false, // don't normalize
      0, // how many bytes to get from one set to the next
      0, // how many bytes inside the buffer to start from
    );
    context.enableVertexAttribArray(
      context.getAttribLocation(this.shader.program, "a_texture_coord"),
    );

    context.bindBuffer(context.ARRAY_BUFFER, positionBuffer);
    context.bufferData(
      context.ARRAY_BUFFER,
      new Float32Array(positions),
      context.STATIC_DRAW,
    );
    context.enableVertexAttribArray(
      context.getAttribLocation(this.shader.program, "a_position"),
    );
    context.vertexAttribPointer(
      context.getAttribLocation(this.shader.program, "a_position"),
      3, // 3 components per iteration
      context.FLOAT, // the data is 32bit floats
      false, // don't normalize the data
      0, // 0 = move forward size * sizeof(type) each iteration to get the next position
      0, // start at the beginning of the buffer
    );

    const primitiveType = context.TRIANGLES;
    const offset2 = 0;
    const count2 = 6;

    context.drawBuffers([context.COLOR_ATTACHMENT0]);
    context.drawArrays(primitiveType, offset2, count2);

    context.disable(context.SCISSOR_TEST);

    this.textureToRenderTo = (this.textureToRenderTo + 1) % 2;
  }

  renderColoringPass(
    _: number,
    camera: {
      offset: Vector2;
      scale: number;
    },
    canvasSize: Vector2,
    //** @desciption top left and bottom right corners of the area to render. From 0 to 1
    size: [Vector2, Vector2],
    { context, positionBuffer, uvBuffer }: FractalRendererContext,
    {
      textures,
    }: {
      textures: [WebGLTexture, WebGLTexture];
    },
  ) {
    const ySize = size[1][1] - size[0][1];

    context.enable(context.SCISSOR_TEST);
    context.scissor(
      size[0][0] * canvasSize[0] - 0.01,
      (1 - size[0][1] - ySize) * canvasSize[1] - 0.01,
      (size[1][0] - size[0][0] + 0.01) * canvasSize[0],
      (size[1][1] - size[0][1] + 0.01) * canvasSize[1],
    );

    context.bindFramebuffer(context.FRAMEBUFFER, null);
    context.useProgram(this.coloringShader.program);

    this.coloringShader.applyColorParams({
      resolution: [
        (size[1][0] - size[0][0]) * canvasSize[0],
        (size[1][1] - size[0][1]) * canvasSize[1],
      ] as const,
      detailLevel: this.mapParams.targetDetailLevel,
      data: textures[(this.textureToRenderTo + 1) % 2],
    });
    this.coloringShader.applyCameraParams(camera);

    context.bindBuffer(context.ARRAY_BUFFER, uvBuffer);
    context.bufferData(
      context.ARRAY_BUFFER,
      new Float32Array(textureCoordinates),
      context.STATIC_DRAW,
    );
    context.vertexAttribPointer(
      context.getAttribLocation(this.coloringShader.program, "a_texture_coord"),
      2, // every coordinate composed of 2 values
      context.FLOAT, // the data in the buffer is 32-bit float
      false, // don't normalize
      0, // how many bytes to get from one set to the next
      0, // how many bytes inside the buffer to start from
    );
    context.enableVertexAttribArray(
      context.getAttribLocation(this.coloringShader.program, "a_texture_coord"),
    );

    const positions = calculateFaceVertices(canvasSize, size);

    context.bindBuffer(context.ARRAY_BUFFER, positionBuffer);
    context.bufferData(
      context.ARRAY_BUFFER,
      new Float32Array(positions),
      context.STATIC_DRAW,
    );
    context.enableVertexAttribArray(
      context.getAttribLocation(this.coloringShader.program, "a_position"),
    );
    context.vertexAttribPointer(
      context.getAttribLocation(this.coloringShader.program, "a_position"),
      3, // 3 components per iteration
      context.FLOAT, // the data is 32bit floats
      false, // don't normalize the data
      0, // 0 = move forward size * sizeof(type) each iteration to get the next position
      0, // start at the beginning of the buffer
    );

    const primitiveType = context.TRIANGLES;
    const offset2 = 0;
    const count2 = 6;

    context.drawArrays(primitiveType, offset2, count2);
    context.disable(context.SCISSOR_TEST);
  }

  cleanup() {
    this.shader.cleanup();
    this.coloringShader.cleanup();
  }
}

const calculateFaceVertices = (
  canvasSize: Vector2,
  size: [Vector2, Vector2],
) => [
  // First triangle
  // top left
  canvasSize[0] * size[0][0],
  canvasSize[1] * size[0][1],
  0,

  // bottom left
  canvasSize[0] * size[0][0],
  canvasSize[1] * size[1][1],
  0,

  // top right
  canvasSize[0] * size[1][0],
  canvasSize[1] * size[0][1],
  0,

  // Second triangle
  // bottom right
  canvasSize[0] * size[1][0],
  canvasSize[1] * size[1][1],
  0,

  // bottom left
  canvasSize[0] * size[0][0],
  canvasSize[1] * size[1][1],
  0,

  // top right
  canvasSize[0] * size[1][0],
  canvasSize[1] * size[0][1],
  0,
];
