precision highp float;
const float PI = 3.141592653589793238462;
uniform vec2 u_resolution;
uniform sampler2D uSamplerIterData;
uniform sampler2D uSamplerFractal;
uniform sampler2D uSampler;
uniform int u_sampler_wl;
uniform int u_max_iterations;

vec2 getTexCoord(vec2 pixelCoord, vec2 texDim) {
  return (pixelCoord + 0.5) / texDim;
}

vec3 createGradient(float part) {
  int numColors = u_sampler_wl * 2;

  if (numColors == 0) {
    return vec3(1.0, 0.0, 1.0);
  }

  vec4 prevTexel = texture2D(uSampler, getTexCoord(vec2(0, 0), vec2(numColors, numColors)));
  vec4 prevPosTexel = texture2D(uSampler, getTexCoord(vec2(1, 0), vec2(numColors, numColors)));

  vec4 color = prevTexel;
  float prevPos = prevPosTexel.x;

  for (int i = 2; i < 256; i += 2) {
    if (i >= numColors) {
      break;
    }

    vec4 texel = texture2D(uSampler, getTexCoord(vec2(i, 0), vec2(numColors, numColors)));
    float curPos = texture2D(uSampler, getTexCoord(vec2(i + 1, 0), vec2(numColors, numColors))).x;

    color = mix(color, texel, smoothstep(prevPos, curPos, part));
    prevPos = curPos;
  }

  return color.xyz;
}

void main() {
  // vec2 centeredCoord = gl_FragCoord.xy * 2.0 - u_resolution;
  // texture2D(uSamplerFractal, getTexCoord(gl_FragCoord.xy, u_resolution))
  vec4 fractalPoint = texture2D(uSamplerFractal, getTexCoord(gl_FragCoord.xy, u_resolution));
  float iter = floor(fractalPoint.x * 255.0)  + floor(fractalPoint.y * 255.0) * 255.0;
  float distToR = fractalPoint.z + fractalPoint.w * 255.0;

  vec4 iterData = texture2D(uSamplerIterData, getTexCoord(vec2(iter, 0.0), vec2(u_max_iterations, 1.0)));
  float rMin = iterData.x + iterData.y * 255.0;
  float rMax = iterData.z + iterData.w * 255.0;

  float iterPerc = (distToR - rMin) / (rMax - rMin); 

  iterPerc = sqrt(iterPerc);
  if (iterPerc > 1.0) {
    iterPerc = 1.0;
  }

  if (iterPerc < 0.0) {
    iterPerc = 0.0;
  }

  iterPerc = 1.0 - iterPerc;

  float part = (float(iter + iterPerc)) / float(u_max_iterations);

  if (iter < 1.0) {
    part = 0.0;
  }

  if (iter >= float(u_max_iterations - 1)) {
    part = 1.0;
  }
  // gl_FragColor = vec4(0.0, part, 0.0, 1.0);
  gl_FragColor = vec4(createGradient(part), 1.0);
}
