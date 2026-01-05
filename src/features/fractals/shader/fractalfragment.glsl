#version 300 es

precision highp float;
const float PI = 3.141592653589793238462f;
const float T = 1000000.0f;

uniform int u_gradient_coloring;
uniform int u_border_coloring;
uniform float u_border_intensity;

uniform int u_trap_coloring;
uniform float u_trap_intensity;

uniform int u_antialiasing_level;

uniform vec4 u_border_color;

uniform int u_smooth_pow;

uniform vec2 u_resolution;
uniform vec2 u_resolution2;

// Fractal parameters
uniform vec2 u_fractal_c;
uniform float u_fractal_r;
uniform float u_max_iterations;

uniform vec2 u_c_dist_variation;
uniform float u_r_dist_variation;
uniform float u_iterations_dist_variation;

// Mirroring
uniform float u_linear_mirroring;
uniform float u_radial_mirroring;
uniform vec2 u_radial_mirroring_angle_base_vector;
uniform float u_hex_mirroring_factor;

uniform float u_hex_mirroring_dist_variation;
uniform float u_linear_mirroring_dist_variation;
uniform float u_radial_mirroring_dist_variation;

uniform float u_time;

// Viewport
uniform vec2 u_fractal_r_range_start;
uniform vec2 u_fractal_r_range_end;

uniform int u_mirror_type; // 0 = off, 1 = square, 2 = hex, 3 = radial
uniform bool u_invert;

uniform sampler2D uSampler;
uniform int u_sampler_wl;

const int MAX_TRAPS = 64;
uniform int u_traps_size;
uniform int u_trap_types[MAX_TRAPS];
uniform vec3 u_trap_data[MAX_TRAPS];

const int MAX_BLEND = 3;
uniform int u_blend_types_size;
uniform ivec2 u_blend_types[MAX_BLEND];

uniform sampler2D uTrapGradient;
uniform int u_trap_gradient_wl;

in highp vec2 vTextureCoord;

//@CUSTOM_VARS_DECLARATION_PLACEHOLDER@

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

float distanceToPoint(vec2 p1, vec2 p2) {
  return length(p1 - p2);
}

// Distance from a point to a line defined by ax + y + c = 0, where line = vec3(a, b, c)
float distanceToLine(vec3 line, vec2 point) {
  float a = line.x;
  float b = line.y;
  float c = line.z;
  return abs(a * point.x + b * point.y + c) / length(vec2(a, b));
}

vec2 getTexCoord(vec2 pixelCoord, vec2 texDim) {
  return (pixelCoord + 0.5f) / texDim;
}

float calcDistanceToTraps(vec2 point) {
  float minDist = 100000.0f;

  for (int i = 0; i < u_traps_size; i++) {
    int trapType = u_trap_types[i];
    vec3 d = u_trap_data[i];

    if (trapType == 2) { // Line trap
      float distToLine = distanceToLine(d, point);
      minDist = min(minDist, distToLine);
    } else if (trapType == 3) { // Circle trap
      float distToEdge = max(distanceToPoint(point, d.xy) - d.z, 0.0f);
      minDist = min(minDist, distToEdge);
    }
  }

  return minDist;
}

vec4 createTrapGradient(float dist) {
  int numColors = u_trap_gradient_wl * 2;
  vec2 texDim = vec2(float(numColors), 1.0f);
  if (numColors == 0) {
    return vec4(1.0f, 0.0f, 1.0f, 1.0f);
  }

  vec4 prevTexel = texture(uTrapGradient, getTexCoord(vec2(0, 0), texDim));
  float prevPos = decodeUnsignedFloat(texture(uTrapGradient, getTexCoord(vec2(1, 0), texDim)));
  vec4 color = prevTexel;

  for (int i = 2; i < 256; i += 2) {
    if (i >= numColors) {
      break;
    }

    vec4 texel = texture(uTrapGradient, getTexCoord(vec2(i, 0), texDim));
    float curPos = decodeUnsignedFloat(texture(uTrapGradient, getTexCoord(vec2(i + 1, 0), texDim)));
    color = mix(color, texel, smoothstep(prevPos, curPos, dist));
    prevPos = curPos;
  }
  // myOutputColor = vec4(dist, 0.0f, 0.0f, 1.0f);

  return color;
}

vec4 createGradient(float part, int maxIterations) {
  int numColors = u_sampler_wl * 2;
  vec2 texDim = vec2(float(numColors), float(numColors));
  if (numColors == 0) {
    return vec4(1.0f, 0.0f, 1.0f, 1.0f);
  }

  if (abs(1.0f - part) < 0.00001f) {
    vec4 lastTexel = texture(uSampler, getTexCoord(vec2(numColors - 2, 0), texDim));
    return lastTexel;
  }

  vec4 prevTexel = texture(uSampler, getTexCoord(vec2(0, 0), texDim));

  vec4 color = prevTexel;
  float prevPos = decodeUnsignedFloat(texture(uSampler, getTexCoord(vec2(1, 0), texDim))) / float(maxIterations);

  bool nextBailOut = false;
  for (int i = 2; i < 256; i += 2) {
    if (i >= numColors) {
      break;
    }

    vec4 texel = texture(uSampler, getTexCoord(vec2(i, 0), texDim));
    float stopCoord = decodeUnsignedFloat(texture(uSampler, getTexCoord(vec2(i + 1, 0), texDim)));
    float curPos = stopCoord / float(maxIterations);

    if (stopCoord > float(maxIterations)) {
      if (nextBailOut) {
        curPos = 1.0f;
        texel = texture(uSampler, getTexCoord(vec2(numColors - 2, 0), texDim));
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

float sdCircle(vec2 p, float r) {
  return length(p) - r;
}

vec3 palette(float t) {
  vec3 a = vec3(0.5f, 0.5f, 0.5f);
  vec3 b = vec3(0.5f, 0.5f, 0.5f);
  vec3 c = vec3(1.0f, 1.0f, 1.0f);
  vec3 d = vec3(0.263f, 0.416f, 0.557f);

  return a + b * cos(6.28318f * (c * t * d));
}

vec2 rotate(float angle, vec2 uv) {
  float newU = (cos(angle) * uv.x) - (sin(angle) * uv.y);
  float newV = (sin(angle) * uv.x) + (cos(angle) * uv.y);
  return vec2(newU, newV);
}

vec2 hexMirror(vec2 centeredCoord, float height) {
  float side = height * 2.0f / sqrt(3.0f);

  vec2 candA = vec2(round(centeredCoord.x / (height * 2.0f)) * (height * 2.0f), round(centeredCoord.y / (side * 3.0f)) * (side * 3.0f));
  vec2 candB = vec2(round((centeredCoord.x - height) / (height * 2.0f)) * (height * 2.0f) + height, //52
  round((centeredCoord.y - side * 1.5f) / (side * 3.0f)) * (side * 3.0f) + side * 1.5f //90
  );

  vec2 hexCenter = candB;

  if (length(candA - centeredCoord) < length(candB - centeredCoord)) {
    hexCenter = candA;
  }

  vec2 vectorToAngle = vec2(1.0f, 0.0f);
  vec2 hexCoord = centeredCoord - hexCenter;

  float angle = acos((hexCoord.x * vectorToAngle.x + hexCoord.y * vectorToAngle.y) / length(hexCoord));
  angle = hexCoord.y < 0.0f ? -1.0f * angle : angle;
  float rotAngle = 0.0f;
  bool swap = false;

  if (angle > (5.0f * PI / 6.0f)) {
    rotAngle = -PI;
    swap = true;

  } else if (angle > (PI / 2.0f)) {
    rotAngle = -2.0f * PI / 3.0f;

  } else if (angle > PI / 6.0f) {
    rotAngle = -PI / 3.0f;
    swap = true;

  }

  if (angle < -(5.0f * PI / 6.0f)) {
    rotAngle = PI;
    swap = true;
  } else if (angle < -(PI / 2.0f)) {
    rotAngle = 2.0f * PI / 3.0f;

  } else if (angle < -PI / 6.0f) {
    rotAngle = PI / 3.0f;
    swap = true;
  }

  vec2 resultCoords = rotate(rotAngle, hexCoord);

  if (swap) {
    resultCoords.y = -resultCoords.y;
  }

  return resultCoords;
}

vec2 re(vec2 v) {
  return vec2(v.x, 0.0f);
}

vec2 im(vec2 v) {
  return vec2(v.y, 0.0f);
}

vec2 cmpl(float x, float y) {
  return vec2(x, y);
}

float atan2(float y, float x) {
  float angle = 0.0f;

  if (x != 0.0f) {
    angle = atan(y / x);
    if (x < 0.0f) {
      angle += (y >= 0.0f) ? PI : -PI;
    }
  } else {
    angle = (y > 0.0f) ? PI / 2.0f : (y < 0.0f) ? -PI / 2.0f : 0.0f;
  }

  return angle;
}

float vectorAngle(vec2 v) {
  float x = v.x;
  float y = v.y;

  float angle = atan2(y, x);

  return angle;
}

vec2 complexExp(vec2 i) {
  float expVal = exp(i.x);
  return vec2(expVal * cos(i.y), expVal * sin(i.y));
}

vec2 complexConjugate(vec2 i) {
  return vec2(i.x, -i.y);
}

vec2 complexMirror(vec2 i) {
  return vec2(i.y, i.x);
}

vec2 complexRotate(vec2 i, vec2 ang) {
  return rotate(ang.x, i);
}

vec2 complexMul(vec2 a, vec2 b) {
  return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

vec2 complexAdd(vec2 a, vec2 b) {
  return vec2(a.x + b.x, a.y + b.y);
}

vec2 complexSub(vec2 a, vec2 b) {
  return vec2(a.x - b.x, a.y - b.y);
}

vec2 complexDiv(vec2 c1, vec2 c2) {
  float a = c1.x;
  float b = c1.y;
  float c = c2.x;
  float d = c2.y;
  return vec2((a * c + b * d) / (c * c + d * d), (b * c - a * d) / (c * c + d * d));
}

vec2 complexPLog(vec2 a) {
  return vec2(log(length(a)), vectorAngle(a));
}

vec2 complexPow(vec2 a, float p) {
  return complexExp(p * complexPLog(a));
}

vec2 complexSin(vec2 i) {
  return vec2(sin(i.x) * cosh(i.y), cos(i.x) * sinh(i.y));
}

vec2 complexSinh(vec2 i) {
  return vec2(sinh(i.x) * cos(i.y), cosh(i.x) * sin(i.y));
}

vec2 complexCos(vec2 i) {
  return vec2(cos(i.x) * cosh(i.y), sin(i.x) * sinh(i.y));
}

vec2 complexCosh(vec2 i) {
  return vec2(cosh(i.x) * cos(i.y), sinh(i.x) * sin(i.y));
}

vec2 complexAsin(vec2 v) {
  vec2 i = vec2(0.0f, 1.0f);
  vec2 iz = complexMul(i, v);

  return complexMul(-1.0f * i, complexPLog(complexAdd(iz, complexPow((vec2(1.0f, 0.0f) - complexPow(v, 2.0f)), 0.5f))));
}

vec2 complexAcos(vec2 v) {
  vec2 i = vec2(0.0f, 1.0f);
  vec2 iz = complexMul(i, v);
  vec2 sqrtTerm = complexPow(vec2(1.0f, 0.0f) - complexPow(v, 2.0f), 0.5f);
  vec2 logTerm = complexPLog(complexAdd(iz, sqrtTerm));

  return vec2(PI / 2.0f, 0.0f) + complexMul(i, logTerm);
}

vec2 complexTan(vec2 i) {
  return complexDiv(complexSin(i), complexCos(i));
}

float distToLine(vec3 line, vec2 point) {
  return abs(line[0] * point[0] + line[1] * point[1] + line[2]) / length(line.xy);
}

// vec2 centeredCoord = gl_FragCoord.xy * 2.0 - u_resolution;
// vec2 coord = preparedCoord / u_resolution.y;
// vec2 fractStart = u_fractal_r_range_start;
// vec2 fractEnd = u_fractal_r_range_end;
// vec2 fractStartEndDelta = (fractEnd - fractStart) / 2.0;
// vec2 fractalCoords = fractStartEndDelta * (coord)  + fractStart + fractStartEndDelta;

vec2 mirrorCoord(vec2 inCoord, vec2 centCoord, float normLenFromCenter) {
  vec2 coord = inCoord;

  if (u_mirror_type == 0 || u_mirror_type == 3) {
    coord = coord / u_resolution2.y;
  }

  // Square mirroring
  if (u_mirror_type == 1) {
    float linMirror = u_linear_mirroring + u_linear_mirroring_dist_variation * normLenFromCenter;

    float resolutionSep = linMirror * u_resolution2.y;
    coord = mod(centCoord - resolutionSep / 2.0f, resolutionSep) - resolutionSep / 2.0f;

    coord = abs(coord / u_resolution2.y);
  }

  // Hexagonal mirroring
  if (u_mirror_type == 2) {
    float hexFactor = u_hex_mirroring_factor;
    hexFactor = hexFactor + u_hex_mirroring_dist_variation * normLenFromCenter;

    float hexHeight = hexFactor * u_resolution2.y;

    coord = hexMirror(coord, hexHeight);

    coord = coord / u_resolution2.y;
  }   

  // Perform radial split based on the angle
  vec2 normailizedCentrCoord = coord / length(coord);
  float angle = vectorAngle(normailizedCentrCoord) * (180.0f / PI);
  float sepAng = u_radial_mirroring;

  // Increase radial split based on the distance from the center
  sepAng = sepAng + u_radial_mirroring_dist_variation * normLenFromCenter;

  float part = abs(mod(angle, sepAng) - (sepAng / 2.0f)) / (180.0f / PI);
  vec2 nCrd = vec2(sin(part), cos(part)) * length(coord);

  if (sepAng < 180.0f && u_mirror_type != 0) {
    coord = nCrd;
  }

  return coord;
}

vec2 toFractalSpace(vec2 coord, vec2 fractStart, vec2 fractEnd) {
  vec2 fractStartEndDelta = (fractEnd - fractStart) / 2.0f;
  return fractStartEndDelta * (coord) + fractStart + fractStartEndDelta;
}

vec2 calcC0(vec2 initialC, vec2 changePerDist, float normLenFromCenter) {
  return initialC + changePerDist * normLenFromCenter;
}

vec2 calcEscapeIteration(vec2 z, vec2 c, vec2 zp, vec2 fCoord, vec2 scoord, float cdist) {
  //@FORMULA_PLACEHOLDER@
  return z;
}

vec2 calcEscapeDerivativeIteration(vec2 z, vec2 dz, vec2 c, vec2 zp, vec2 fCoord, vec2 scoord, float cdist) {
  //@FORMULA_DERIVATIVE_PLACEHOLDER@
  return dz;
}

vec3 generateFractalIntensity(vec2 point) {
  vec2 centCoord = point * 2.0f - u_resolution2;
  vec2 normCentCoord = centCoord / u_resolution2.y;

  float normLenFromCenter = length(normCentCoord);
  float normLenFromCenterClamped = clamp(normLenFromCenter, 0.0f, 1.0f);

  vec2 preparedCoord = centCoord;
  vec2 coord = mirrorCoord(preparedCoord, centCoord, normLenFromCenterClamped);
  vec2 fCoord = toFractalSpace(coord, u_fractal_r_range_start, u_fractal_r_range_end);

  float cx = u_fractal_c.x;
  float cy = u_fractal_c.y;
  float r = u_fractal_r;
  int maxIteration = int(u_max_iterations);

  r = u_fractal_r + u_r_dist_variation * normLenFromCenterClamped;
  maxIteration = maxIteration + int(u_iterations_dist_variation * normLenFromCenterClamped);

  vec2 c0 = calcC0(vec2(cx, cy), u_c_dist_variation, normLenFromCenterClamped);
  vec2 c = vec2(0.0f, 0.0f);
  vec2 z0 = vec2(0.0f, 0.0f);
  vec2 dz0 = vec2(1.0f, 0.0f);
  vec2 dz = dz0;

  //@INITIAL_C_FORMULA_PLACEHOLDER@
  //@INITIAL_Z_FORMULA_PLACEHOLDER@

  vec2 z = z0;

  float xSqrd = z.x * z.x;
  float ySqrd = z.y * z.y;
  float Rsqrd = r * r;
  int iteration = 0;
  vec2 zp = vec2(0.0f, 0.0f);

  // For cycle detection
  vec2 zPrev = z;
  int period = 0;

  vec2 scoord = normCentCoord;
  float cdist = normLenFromCenter;
  float trapDist = 100000000.0f;
  bool doTrapCalc = u_trap_coloring == 1 && u_traps_size > 0;

  float powZ = 0.0f;
  //@FORMULA_POW_PLACEHOLDER@
  bool earlyStop = false;

  // Half pixel threshold for early stopping
  float earlyStopThreshholdX = 0.1f * (u_fractal_r_range_end.x - u_fractal_r_range_start.x) / u_resolution2.x;
  float earlyStopThreshholdY = 0.1f * (u_fractal_r_range_end.y - u_fractal_r_range_start.y) / u_resolution2.y;
  float trapEarlyStopThreshold = min(earlyStopThreshholdX, earlyStopThreshholdY) * 2.0f;
  for (int iter = 0; iter < 10000; iter += 1) {
    iteration = iter;

    if (xSqrd + ySqrd >= Rsqrd || maxIteration <= iter) {
      break;
    }

    if (u_border_coloring == 1) {
      dz = calcEscapeDerivativeIteration(z, dz, c, zp, fCoord, scoord, cdist);
    }
    z = calcEscapeIteration(z, c, zp, fCoord, scoord, cdist);
    // if (trapDist <= trapEarlyStopThreshold) {
    //   return vec3(-1.0f, 0.0f, 0.0f);
    // }

    if (doTrapCalc && trapDist > trapEarlyStopThreshold) {
      trapDist = min(trapDist, calcDistanceToTraps(z));
    }

    zp = z;

    xSqrd = z.x * z.x;
    ySqrd = z.y * z.y;

    // Detecting cycles to speed up the rendering of some fractals
    if (abs(z.x - zPrev.x) < earlyStopThreshholdX && abs(z.y - zPrev.y) < earlyStopThreshholdY) {
      iteration = maxIteration;
      earlyStop = true;
      break;
    }

    period = period + 1;
    if (period > 25) {
      zPrev = z;
      period = 0;
    }
  }
  float dist = 0.0f;

  if (u_border_coloring == 1) {
    if (!earlyStop) {
      dist = 2.0f * length(z) * log(length(z)) / length(dz);
    }
    dist = clamp(dist * u_border_intensity, 0.0f, 1.0f);
  }

  float iterationSmooth = float(iteration);

  if (u_smooth_pow >= 2) {
    powZ = float(u_smooth_pow);
  }

  if (u_smooth_pow >= 0 && powZ >= 2.0f && iteration < maxIteration) {
    iterationSmooth = float(iteration) - log(log(xSqrd + ySqrd) / log(pow(2.0f, 1.0f / (powZ - 1.0f)))) / log(powZ);
  }

  return vec3(iterationSmooth, dist, trapDist);
}


vec4 doColoring(float iterationSmooth, float dist, float distToTrap) {
  vec4 resultColor = vec4(0.0f, 0.0f, 0.0f, 0.0f);
  int colorIndex = 0;

  for (int i = 0; i < u_blend_types_size; i++) {
    int coloringType = u_blend_types[i].x;

    vec4 currentColor = vec4(0.0f, 0.0f, 0.0f, 0.0f);

    // Time escape gradient coloring
    if (coloringType == 1) {
      if (u_gradient_coloring == 0) {
        continue;
      }

      float colorInt = iterationSmooth / u_max_iterations;
      currentColor = createGradient(colorInt, int(u_max_iterations));
    } else if(coloringType == 2) { // Border coloring
      if (u_border_coloring == 0) {
        continue;
      }

      currentColor = vec4(u_border_color.xyz * (1.0f - sqrt(sqrt(dist))), 1.0f);

    } else if (coloringType == 3) { // Trap coloring
      if (u_trap_coloring == 0 || u_traps_size == 0) {
        continue;
      }

      float scaledDist = sqrt(distToTrap) * u_trap_intensity;

      currentColor = createTrapGradient(scaledDist);
    }

    int blendMode = int(u_blend_types[i].y);

    if (colorIndex == 0) {
      resultColor = currentColor;
    } else {
      float alpha = currentColor.w;

      if (blendMode == 1) { // Normal
        resultColor = mix(resultColor, currentColor, alpha);

      } else if (blendMode == 2) { // Add
        resultColor = clamp(resultColor + currentColor * alpha, 0.0f, 1.0f);

      } else if (blendMode == 3) { // Multiply
        resultColor = mix(resultColor, resultColor * currentColor, alpha);

      } else if (blendMode == 4) { // Screen
        resultColor = mix(resultColor, vec4(1.0f) - (vec4(1.0f) - resultColor) * (vec4(1.0f) - currentColor), alpha);
      }
    }
    colorIndex++;
  }

  return resultColor;
}

void main() {
  int maxIteration = int(u_max_iterations);

  float iterationSmooth = 0.0f;
  float dist = 0.0f;
  float distToTrap = 0.0f;
  float superSampling = float(u_antialiasing_level); // Num of samples

  vec2 coord = vTextureCoord * u_resolution2;

  float sidePoints = superSampling / 2.0f;

  float step = 1.0f / (superSampling + 1.0f);

  float pointsPerRow = floor(sqrt(superSampling));
  float numOfRows = ceil(superSampling / pointsPerRow);
  float columnStep = 1.0f / (pointsPerRow + 1.0f);
  float rowStep = 1.0f / (numOfRows + 1.0f);
  vec2 halfDistanceBetweenPixels = vec2(0.5f);

  for (float i = 0.0f; i <= 16.0f; i += 1.0f) {
    if (i >= numOfRows) {
      break;
    }

    for (float j = 0.0f; j <= 16.0f; j += 1.0f) {
      if (j >= pointsPerRow) {
        break;
      }

      vec2 samplePoint = coord - halfDistanceBetweenPixels + vec2((j + 1.0f) * columnStep, (i + 1.0f) * rowStep);
      vec3 res = generateFractalIntensity(samplePoint);
      dist += res.y;
      distToTrap += res.z;
      iterationSmooth += res.x;
    }
  }

  dist = dist / superSampling;
  distToTrap = distToTrap / superSampling;
  iterationSmooth = iterationSmooth / superSampling;

  if (iterationSmooth == -1.0f) {
    myOutputColor = vec4(0.0f, 0.0f, 1.0f, 1.0f);
    return;
  }
  
  myOutputColor = doColoring(iterationSmooth, dist, distToTrap);
}

