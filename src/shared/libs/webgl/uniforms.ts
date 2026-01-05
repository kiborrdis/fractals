type Uniform2F<Data> = [
  "2f",
  string,
  (data: Data, ctx: WebGL2RenderingContext) => readonly [number, number] | null,
];
type Uniform4F<Data> = [
  "4f",
  string,
  (
    data: Data,
    ctx: WebGL2RenderingContext,
  ) => readonly [number, number, number, number] | null,
];
type Uniform1F<Data> = [
  "1f",
  string,
  (data: Data, ctx: WebGL2RenderingContext) => number | null,
];
type Uniform1I<Data> = [
  "1i",
  string,
  (data: Data, ctx: WebGL2RenderingContext) => number | null,
];
type UniformTexture<Data> = [
  "texture",
  string,
  (data: Data, ctx: WebGL2RenderingContext) => WebGLTexture | null,
];
type UniformArray1IV<Data> = [
  "1iv",
  string,
  (data: Data, ctx: WebGL2RenderingContext) => Int32Array | null,
];
type UniformArray2IV<Data> = [
  "2iv",
  string,
  (data: Data, ctx: WebGL2RenderingContext) => Int32Array | null,
];
type UniformArray3FV<Data> = [
  "3fv",
  string,
  (data: Data, ctx: WebGL2RenderingContext) => Float32Array | null,
];

export type UniformApplicationRule<Data> =
  | Uniform2F<Data>
  | Uniform4F<Data>
  | Uniform1F<Data>
  | Uniform1I<Data>
  | UniformTexture<Data>
  | UniformArray1IV<Data>
  | UniformArray2IV<Data>
  | UniformArray3FV<Data>;

export class UniformApplierMemory {
  private nameToTextureIndex: Record<string, number> = {};
  private freeTextureIndex = 0;

  getTextureUnit(name: string): number {
    if (this.nameToTextureIndex[name] === undefined) {
      this.nameToTextureIndex[name] = this.freeTextureIndex++;
    }
    return this.nameToTextureIndex[name];
  }
}

export const createUniformApplier = <Data>(
  ctx: WebGL2RenderingContext,
  program: WebGLProgram,
  memory: UniformApplierMemory,
  rules: UniformApplicationRule<Data>[],
): ((data: Data) => void) => {
  const locationsCache: Record<string, WebGLUniformLocation | null> = {};

  rules.forEach((rule) => {
    const name = rule[1];
    if (locationsCache[name] === undefined) {
      locationsCache[name] = ctx.getUniformLocation(
        program,
        name,
      ) as WebGLUniformLocation;

      if (locationsCache[name] === null) {
        console.warn(`Uniform ${name} not found in shader`);
        return;
      }
    }
  });

  return (data: Data) => {
    rules.forEach((rule) => {
      const name = rule[1];
      const location = locationsCache[name];

      if (location === null) {
        return;
      }

      if (rule[0] === "2f") {
        const value = rule[2](data, ctx);
        if (value !== null) {
          ctx.uniform2f(location, ...value);
        }
      } else if (rule[0] === "4f") {
        const value = rule[2](data, ctx);
        if (value !== null) {
          ctx.uniform4f(location, ...value);
        }
      } else if (rule[0] === "1f") {
        const value = rule[2](data, ctx);
        if (value !== null) {
          ctx.uniform1f(location, value);
        }
      } else if (rule[0] === "1i") {
        const value = rule[2](data, ctx);
        if (value !== null) {
          ctx.uniform1i(location, value);
        }
      } else if (rule[0] === "texture") {
        // Activate the unit BEFORE calling the rule function so that any
        // internal gl.bindTexture calls inside the creator (e.g. encodeGradientInTexture)
        // land on the correct unit instead of whatever was last active.
        const textureIndex = memory.getTextureUnit(name);
        ctx.activeTexture(ctx.TEXTURE0 + textureIndex);
        const value = rule[2](data, ctx);
        if (value !== null) {
          ctx.bindTexture(ctx.TEXTURE_2D, value);
          ctx.uniform1i(location, textureIndex);
        }
      } else if (rule[0] === "1iv") {
        const value = rule[2](data, ctx);
        if (value !== null) {
          ctx.uniform1iv(location, value);
        }
      } else if (rule[0] === "2iv") {
        const value = rule[2](data, ctx);
        if (value !== null) {
          ctx.uniform2iv(location, value);
        }
      } else if (rule[0] === "3fv") {
        const value = rule[2](data, ctx);
        if (value !== null) {
          ctx.uniform3fv(location, value);
        }
      }
    });
  };
};
