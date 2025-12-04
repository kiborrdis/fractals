export function createShader(
  gl: WebGLRenderingContext,
  type:
    | WebGLRenderingContext["VERTEX_SHADER"]
    | WebGLRenderingContext["FRAGMENT_SHADER"],
  source: string,
) {
  const shader = gl.createShader(type);

  if (!shader) {
    return;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

export function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader | undefined,
  fragmentShader: WebGLShader | undefined,
) {
  const program = gl.createProgram();

  if (!program) {
    return;
  }
  if (vertexShader) {
    gl.attachShader(program, vertexShader);
  }
  if (fragmentShader) {
    gl.attachShader(program, fragmentShader);
  }

  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}
