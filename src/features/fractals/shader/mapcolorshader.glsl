#version 300 es

precision highp float;

uniform sampler2D u_fractal_data1;
uniform int u_sample_target_detail_level;
uniform vec2 u_resolution;

out vec4 myOutputColor;

vec2 getTexCoord(vec2 pixelCoord, vec2 texDim) {
  return (pixelCoord + 0.5f) / texDim;
}

void main() {
  int samplingLevel = u_sample_target_detail_level;
 
  if (samplingLevel > 8) {
    samplingLevel = 8;
  }

  // 1 is 4, 2 is 9, 3 is 25, 4 is 81, 5 is 289, 6 is 1089
  // (2^(k - 1) + 1)^2 
  float samplesPerSide = pow(2.0f, float(samplingLevel) - 1.0f);
  float numOfSamples = pow(samplesPerSide, 2.0f);

  vec2 coord = gl_FragCoord.xy / u_resolution;
  vec4 d1 = texture(u_fractal_data1, coord);

  float lowSamples = clamp(d1[0], 0.0f, samplesPerSide * 2.0f);
  float middleSamples = clamp(d1[1], 0.0f, samplesPerSide);
  float highSamples = clamp(d1[2], 0.0f, samplesPerSide);

  myOutputColor = vec4(
    (lowSamples / (samplesPerSide * 2.0f)) * 0.25f, 
    (middleSamples / samplesPerSide) * 0.5f, 
    (highSamples / samplesPerSide) * 0.5f, 
    1.0f
  );
}
