import { Vector2 } from "@/shared/libs/vectors";
import { makeFractalParamsFromRules } from "../ruleConversion";
import { FractalParamsBuildRules } from "../types";
import {
  createFractalShader,
  FractalShaderDescrition,
} from "./createFractalShader";
import { FractalCanvasParams } from "./initFractalCanvas";

const convertCustomVarsToTypes = (customVars: Record<string, unknown>) => {
  return Object.entries(customVars).reduce(
    (acc, [key, val]) => {
      acc[key] = Array.isArray(val) ? "vector2" : "number";
      return acc;
    },
    {} as Record<string, "number" | "vector2">,
  );
};

export class FractalImage {
  private shader: FractalShaderDescrition;

  constructor(
    private context: WebGL2RenderingContext,
    private params: FractalParamsBuildRules,
  ) {
    this.shader = createFractalShader(
      this.context,
      params.formula,
      convertCustomVarsToTypes(params.custom),
      params.initialZFormula,
      params.initialCFormula,
    );
  }

  updateParams(newParams: FractalParamsBuildRules) {
    if (
      Object.keys(newParams.custom).length !==
        Object.keys(this.params.custom).length ||
      this.params.formula !== newParams.formula ||
      this.params.initialCFormula !== newParams.initialCFormula ||
      this.params.initialZFormula !== newParams.initialZFormula
    ) {
      this.shader = createFractalShader(
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

  render(
    time: number,
    camera: {
      offset: Vector2;
      scale: number;
    },
    canvasSize: Vector2,
    //** @desciption top left and bottom right corners of the area to render. From 0 to 1
    size: readonly [Vector2, Vector2],
    { context, positionBuffer }: FractalCanvasParams,
    applyInitialTime: boolean = false,
  ) {
    context.useProgram(this.shader.program);
    const builtParams = makeFractalParamsFromRules(
      this.params,
      time + (applyInitialTime ? (this.params.initialTime ?? 0) : 0),
    );
    this.shader.applyFractalParams(builtParams);
    this.shader.applyCameraParams(camera);
    this.shader.applyResolutionParams({
      fullResolution: canvasSize,
      renderResolution: [
        (size[1][0] - size[0][0]) * canvasSize[0],
        (size[1][1] - size[0][1]) * canvasSize[1],
      ] as const,
    });
    this.shader.applyCustomVars(builtParams.custom);

    const positions = [
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

    const textureCoordBuffer = context.createBuffer();
    context.bindBuffer(context.ARRAY_BUFFER, textureCoordBuffer);

    const textureCoordinates = [
      0.0, 0.0, 0.0, 1.0, 1.0, 0.0,

      1.0, 1.0, 0.0, 1.0, 1.0, 0.0,
    ];

    context.bufferData(
      context.ARRAY_BUFFER,
      new Float32Array(textureCoordinates),
      context.STATIC_DRAW,
    );

    context.bindBuffer(context.ARRAY_BUFFER, textureCoordBuffer);
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

    context.enableVertexAttribArray(this.shader.pos_vertex_attr_array);

    context.bindBuffer(context.ARRAY_BUFFER, positionBuffer);

    context.vertexAttribPointer(
      this.shader.pos_vertex_attr_array,
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
  }
}
