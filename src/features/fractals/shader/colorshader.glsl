#version 300 es

precision highp float;
const float T = 1000000.0f;

uniform vec4 u_border_color;

uniform vec2 u_resolution;

uniform float u_max_iterations;

uniform sampler2D u_gradients_sampler;

const int MAX_BLEND = 6;
uniform int u_blend_configs_size;
uniform ivec4 u_blend_configs[MAX_BLEND]; // [mode, blendMode, gradId, 0]
uniform vec4 u_blend_params[MAX_BLEND];   // [param0, param1, 0, 0]
uniform int u_gradient_wls[MAX_BLEND];    // stop count per gradient row

uniform sampler2D u_fractal_data1;
uniform sampler2D u_fractal_data2;

in highp vec2 vTextureCoord;

uniform float u_time;

const float GRADIENT_TEXTURE_LENGTH = 32.0f * 2.0f;
const float GRADIENT_TEXTURE_ROWS = float(MAX_BLEND);

out vec4 myOutputColor;

float decodeFloat(vec4 encoded) {
  float b1 = floor(encoded.x * 255.0f + 0.5f);
  float b2 = floor(encoded.y * 255.0f + 0.5f);
  float b3 = floor(encoded.z * 255.0f + 0.5f);
  float b4 = floor(encoded.w * 255.0f + 0.5f);
  return (b1 * 16777216.0f + b2 * 65536.0f + b3 * 256.0f + b4 - 2147483648.0f) / T;
}

float decodeUnsignedFloat(vec4 encoded) {
  float b1 = floor(encoded.x * 255.0f + 0.5f);
  float b2 = floor(encoded.y * 255.0f + 0.5f);
  float b3 = floor(encoded.z * 255.0f + 0.5f);
  float b4 = floor(encoded.w * 255.0f + 0.5f);
  return (b1 * 16777216.0f + b2 * 65536.0f + b3 * 256.0f + b4) / T;
}

vec2 complexDiv(vec2 c1, vec2 c2) {
  float a = c1.x;
  float b = c1.y;
  float c = c2.x;
  float d = c2.y;
  return vec2((a * c + b * d) / (c * c + d * d), (b * c - a * d) / (c * c + d * d));
}

vec2 getTexCoord(vec2 pixelCoord, vec2 texDim) {
  return (pixelCoord + 0.5f) / texDim;
}

vec4 createTrapGradient(float dist, int gradRow, int wl) {
  int numColors = wl * 2;
  vec2 texDim = vec2(GRADIENT_TEXTURE_LENGTH, GRADIENT_TEXTURE_ROWS);
  if (numColors == 0) {
    return vec4(1.0f, 0.0f, 1.0f, 1.0f);
  }

  vec4 prevTexel = texture(u_gradients_sampler, getTexCoord(vec2(0, float(gradRow)), texDim));
  float prevPos = decodeUnsignedFloat(texture(u_gradients_sampler, getTexCoord(vec2(1, float(gradRow)), texDim)));
  vec4 color = prevTexel;

  for (int i = 2; i < 256; i += 2) {
    if (i >= numColors) {
      break;
    }

    vec4 texel = texture(u_gradients_sampler, getTexCoord(vec2(i, float(gradRow)), texDim));
    float curPos = decodeUnsignedFloat(texture(u_gradients_sampler, getTexCoord(vec2(i + 1, float(gradRow)), texDim)));
    color = mix(color, texel, smoothstep(prevPos, curPos, dist));
    prevPos = curPos;
  }

  return color;
}

vec4 createGradient(float part, int maxIterations, int gradRow, int wl) {
  int numColors = wl * 2;
  vec2 texDim = vec2(GRADIENT_TEXTURE_LENGTH, GRADIENT_TEXTURE_ROWS);
  if (numColors == 0) {
    return vec4(1.0f, 0.0f, 1.0f, 1.0f);
  }

  if (abs(1.0f - part) < 0.00001f) {
    vec4 lastTexel = texture(u_gradients_sampler, getTexCoord(vec2(numColors - 2, float(gradRow)), texDim));
    return lastTexel;
  }

  vec4 prevTexel = texture(u_gradients_sampler, getTexCoord(vec2(0, float(gradRow)), texDim));

  vec4 color = prevTexel;
  float prevPos = decodeUnsignedFloat(texture(u_gradients_sampler, getTexCoord(vec2(1, float(gradRow)), texDim))) / float(maxIterations);

  bool nextBailOut = false;
  for (int i = 2; i < 256; i += 2) {
    if (i >= numColors) {
      break;
    }

    vec4 texel = texture(u_gradients_sampler, getTexCoord(vec2(i, float(gradRow)), texDim));
    float stopCoord = decodeUnsignedFloat(texture(u_gradients_sampler, getTexCoord(vec2(i + 1, float(gradRow)), texDim)));
    float curPos = stopCoord / float(maxIterations);

    if (stopCoord > float(maxIterations)) {
      if (nextBailOut) {
        curPos = 1.0f;
        texel = texture(u_gradients_sampler, getTexCoord(vec2(numColors - 2, float(gradRow)), texDim));
      }
      nextBailOut = true;
    }

    color = mix(color, texel, smoothstep(prevPos, curPos, part));

    if (curPos >= 1.0f) {
      return color;
    }

    prevPos = curPos;
  }

  return color;
}

struct FractalInfo {
  float escapeIteration;
  float borderDistance;
  float trapDistance;
  float stripeAvg;
  vec2 derivative;
  vec2 finalZ;
};

vec4 blendColor(int blendMode, vec4 lowerColor, vec4 currentColor) {
  float alpha = currentColor.w;
  vec4 resultColor = lowerColor;

  if (blendMode == 1) { // Normal
    resultColor = mix(resultColor, currentColor, alpha);

  } else if (blendMode == 2) { // Add
    resultColor = clamp(resultColor + currentColor * alpha, 0.0f, 1.0f);

  } else if (blendMode == 3) { // Multiply
    resultColor = mix(resultColor, resultColor * currentColor, alpha);

  } else if (blendMode == 4) { // Screen
    resultColor = mix(resultColor, vec4(1.0f) - (vec4(1.0f) - resultColor) * (vec4(1.0f) - currentColor), alpha);

  } else if (blendMode == 5) { // Color Dodge
    vec4 dodged = vec4(0.0f);
    dodged.x = resultColor.x == 1.0f ? 1.0f : min(1.0f, resultColor.x / (1.0f - currentColor.x));
    dodged.y = resultColor.y == 1.0f ? 1.0f : min(1.0f, resultColor.y / (1.0f - currentColor.y));
    dodged.z = resultColor.z == 1.0f ? 1.0f : min(1.0f, resultColor.z / (1.0f - currentColor.z));
    dodged.w = 1.0f;
    resultColor = mix(resultColor, dodged, alpha);

  } else if (blendMode == 6) { // Color Burn
    vec4 burned = vec4(0.0f);
    burned.x = resultColor.x == 0.0f ? 0.0f : max(0.0f, 1.0f - (1.0f - resultColor.x) / currentColor.x);
    burned.y = resultColor.y == 0.0f ? 0.0f : max(0.0f, 1.0f - (1.0f - resultColor.y) / currentColor.y);
    burned.z = resultColor.z == 0.0f ? 0.0f : max(0.0f, 1.0f - (1.0f - resultColor.z) / currentColor.z);
    burned.w = 1.0f;
    resultColor = mix(resultColor, burned, alpha);

  } else if (blendMode == 7) { // Lighten
    vec4 lightened = max(resultColor, currentColor);
    lightened.w = 1.0f;
    resultColor = mix(resultColor, lightened, alpha);

  } else if (blendMode == 8) { // Darken
    vec4 darkened = min(resultColor, currentColor);
    darkened.w = 1.0f;
    resultColor = mix(resultColor, darkened, alpha);

  } else if (blendMode == 9) { // Difference
    vec4 difference = abs(resultColor - currentColor);
    difference.w = 1.0f;
    resultColor = mix(resultColor, difference, alpha);

  } else if (blendMode == 10) { // Exclusion
    vec4 exclusion = resultColor + currentColor - 2.0f * resultColor * currentColor;
    exclusion.w = 1.0f;
    resultColor = mix(resultColor, exclusion, alpha);

  } else if (blendMode == 11) { // Overlay
    vec4 overlaid = vec4(0.0f);
    overlaid.x = resultColor.x <= 0.5f ? 2.0f * resultColor.x * currentColor.x : 1.0f - 2.0f * (1.0f - resultColor.x) * (1.0f - currentColor.x);
    overlaid.y = resultColor.y <= 0.5f ? 2.0f * resultColor.y * currentColor.y : 1.0f - 2.0f * (1.0f - resultColor.y) * (1.0f - currentColor.y);
    overlaid.z = resultColor.z <= 0.5f ? 2.0f * resultColor.z * currentColor.z : 1.0f - 2.0f * (1.0f - resultColor.z) * (1.0f - currentColor.z);
    overlaid.w = 1.0f;
    resultColor = mix(resultColor, overlaid, alpha);

  } else if (blendMode == 12) { // Hard Light
    vec4 hardLight = vec4(0.0f);
    hardLight.x = currentColor.x <= 0.5f ? 2.0f * resultColor.x * currentColor.x : 1.0f - 2.0f * (1.0f - resultColor.x) * (1.0f - currentColor.x);
    hardLight.y = currentColor.y <= 0.5f ? 2.0f * resultColor.y * currentColor.y : 1.0f - 2.0f * (1.0f - resultColor.y) * (1.0f - currentColor.y);
    hardLight.z = currentColor.z <= 0.5f ? 2.0f * resultColor.z * currentColor.z : 1.0f - 2.0f * (1.0f - resultColor.z) * (1.0f - currentColor.z);
    hardLight.w = 1.0f;
    resultColor = mix(resultColor, hardLight, alpha);

  } else if (blendMode == 13) { // Inverted Overlay
    vec4 invertedOverlay = vec4(0.0f);
    invertedOverlay.x = resultColor.x > 0.5f ? 2.0f * resultColor.x * currentColor.x : 1.0f - 2.0f * (1.0f - resultColor.x) * (1.0f - currentColor.x);
    invertedOverlay.y = resultColor.y > 0.5f ? 2.0f * resultColor.y * currentColor.y : 1.0f - 2.0f * (1.0f - resultColor.y) * (1.0f - currentColor.y);
    invertedOverlay.z = resultColor.z > 0.5f ? 2.0f * resultColor.z * currentColor.z : 1.0f - 2.0f * (1.0f - resultColor.z) * (1.0f - currentColor.z);
    invertedOverlay.w = 1.0f;
    resultColor = mix(resultColor, invertedOverlay, alpha);

  } else if (blendMode == 14) { // Inverted Hard Light
    vec4 invertedHardLight = vec4(0.0f);
    invertedHardLight.x = currentColor.x > 0.5f ? 2.0f * resultColor.x * currentColor.x : 1.0f - 2.0f * (1.0f - resultColor.x) * (1.0f - currentColor.x);
    invertedHardLight.y = currentColor.y > 0.5f ? 2.0f * resultColor.y * currentColor.y : 1.0f - 2.0f * (1.0f - resultColor.y) * (1.0f - currentColor.y);
    invertedHardLight.z = currentColor.z > 0.5f ? 2.0f * resultColor.z * currentColor.z : 1.0f - 2.0f * (1.0f - resultColor.z) * (1.0f - currentColor.z);
    invertedHardLight.w = 1.0f;
    resultColor = mix(resultColor, invertedHardLight, alpha);

  } else if (blendMode == 15) { // Soft Light
    vec4 softLight = vec4(0.0f);
    softLight.x = currentColor.x <= 0.5f ? resultColor.x + (2.0f * currentColor.x - 1.0f) * (resultColor.x - resultColor.x * resultColor.x) : resultColor.x + (2.0f * currentColor.x - 1.0f) * (sqrt(resultColor.x) - resultColor.x);
    softLight.y = currentColor.y <= 0.5f ? resultColor.y + (2.0f * currentColor.y - 1.0f) * (resultColor.y - resultColor.y * resultColor.y) : resultColor.y + (2.0f * currentColor.y - 1.0f) * (sqrt(resultColor.y) - resultColor.y);
    softLight.z = currentColor.z <= 0.5f ? resultColor.z + (2.0f * currentColor.z - 1.0f) * (resultColor.z - resultColor.z * resultColor.z) : resultColor.z + (2.0f * currentColor.z - 1.0f) * (sqrt(resultColor.z) - resultColor.z);
    softLight.w = 1.0f;
    resultColor = mix(resultColor, softLight, alpha);
  }

  return resultColor;
}

vec4 doColoring(FractalInfo info) {
  vec4 resultColor = vec4(0.0f, 0.0f, 0.0f, 0.0f);
  int colorIndex = 0;

  for (int i = 0; i < u_blend_configs_size; i++) {
    int coloringMode = u_blend_configs[i].x;
    int blendMode = u_blend_configs[i].y;
    int gradId = u_blend_configs[i].z;
    float param0 = u_blend_params[i].x;
    float param1 = u_blend_params[i].y;

    vec4 currentColor = vec4(0.0f, 0.0f, 0.0f, 0.0f);

    // Time escape gradient coloring
    if (coloringMode == 1) {
      float colorInt = info.escapeIteration / u_max_iterations;
      currentColor = createGradient(colorInt, int(u_max_iterations), gradId, u_gradient_wls[gradId]);
    } else if (coloringMode == 2) { // Border coloring
      float dist = clamp(pow(info.borderDistance, param1) * param0, 0.0f, 1.0f);

      currentColor = vec4(u_border_color.xyz * (1.0f - sqrt(sqrt(dist))), 1.0f);
    } else if (coloringMode == 3) { // Trap coloring
      float scaledDist = pow(info.trapDistance, param1) * param0;

      currentColor = createTrapGradient(scaledDist, gradId, u_gradient_wls[gradId]);
    } else if (coloringMode == 40) { // Normal coloring
      if (info.escapeIteration == u_max_iterations) {
        currentColor = vec4(0.0f, 0.0f, 0.0f, 1.0f);
        continue;
      }

      float t = dot(normalize(complexDiv(info.finalZ, info.derivative)), vec2(1.0f, 0.0f));
      t = t * 0.5f + 0.5f;

      currentColor = vec4(t, t, t, 1.0f);
    } else if (coloringMode == 50) { // Stripe averaging
      float original = info.stripeAvg;
      currentColor = vec4(original, original, original, 1.0f);
    }

    if (colorIndex == 0) {
      resultColor = currentColor;
    } else {
      resultColor = blendColor(blendMode, resultColor, currentColor);
    }
    colorIndex++;
  }

  return resultColor;
}

FractalInfo getFractalData() {
  vec2 coord = gl_FragCoord.xy / u_resolution;
  vec4 d1 = texture(u_fractal_data1, coord);
  vec4 d2 = texture(u_fractal_data2, coord);

  FractalInfo info;
  info.escapeIteration = d1.x;
  info.trapDistance = d1.y;
  info.borderDistance = d1.z;
  info.stripeAvg = d1.w;
  info.derivative.x = d2.x;
  info.derivative.y = d2.y;
  info.finalZ.x = d2.z;
  info.finalZ.y = d2.w;

  return info;
}

void main() {
  myOutputColor = doColoring(getFractalData()); 
  // myOutputColor = vec4(1.0f, 0.0f, 0.0f, 1.0f);
}
