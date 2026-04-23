#version 300 es

precision highp float;
const float PI = 3.141592653589793238462f;
const float T = 1000000.0f;

uniform int u_derivative_enabled;
uniform int u_stripe_enabled;
uniform int u_trap_calculation_enabled;

uniform int u_supersampling_level;

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

const int MAX_MIRRORING_PASSES = 8;
uniform int u_mirroring_passes_size;
uniform vec4 u_mirroring_passes[MAX_MIRRORING_PASSES];

// Viewport
uniform vec2 u_fractal_r_range_start;
uniform vec2 u_fractal_r_range_end;

const int MAX_TRAPS = 64;
uniform int u_traps_size;
uniform int u_trap_types[MAX_TRAPS];
uniform vec4 u_trap_data[MAX_TRAPS];

in highp vec2 vTextureCoord;

//@CUSTOM_VARS_DECLARATION_PLACEHOLDER@

layout (location = 0) out vec4 output1;
layout (location = 1) out vec4 output2;

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

float distanceToSegment(vec2 p1, vec2 p2, vec2 point) {
  vec2 ab = p2 - p1;
  vec2 ap = point - p1;
  float t = clamp(dot(ap, ab) / dot(ab, ab), 0.0f, 1.0f);
  return length(ap - t * ab);
}

vec2 getTexCoord(vec2 pixelCoord, vec2 texDim) {
  return (pixelCoord + 0.5f) / texDim;
}

float calcDistanceToTraps(vec2 point) {
  float minDist = 100000.0f;

  for (int i = 0; i < u_traps_size; i++) {
    int trapType = u_trap_types[i];
    vec4 d = u_trap_data[i];

    if (trapType == 2) { // Line trap
      float distToLine = distanceToLine(d.xyz, point);
      minDist = min(minDist, distToLine);
    } else if (trapType == 3) { // Circle trap
      float distToEdge = max(distanceToPoint(point, d.xy) - d.z, 0.0f);
      minDist = min(minDist, distToEdge);
    } else if (trapType == 4) { // Segment trap
      float distToSeg = distanceToSegment(d.xy, d.zw, point);
      minDist = min(minDist, distToSeg);
    }
  }

  return minDist;
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

vec2 complexPow(vec2 a, vec2 p) {
  return complexExp(complexMul(p, complexPLog(a)));
}

vec2 complexRealPow(vec2 a, float p) {
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

  return complexMul(-1.0f * i, complexPLog(complexAdd(iz, complexRealPow((vec2(1.0f, 0.0f) - complexRealPow(v, 2.0f)), 0.5f))));
}

vec2 complexAcos(vec2 v) {
  vec2 i = vec2(0.0f, 1.0f);
  vec2 iz = complexMul(i, v);
  vec2 sqrtTerm = complexRealPow(vec2(1.0f, 0.0f) - complexRealPow(v, 2.0f), 0.5f);
  vec2 logTerm = complexPLog(complexAdd(iz, sqrtTerm));

  return vec2(PI / 2.0f, 0.0f) + complexMul(i, logTerm);
}

vec2 complexTan(vec2 i) {
  return complexDiv(complexSin(i), complexCos(i));
}

vec2 mirrorCoord(vec2 inCoord, float normLenFromCenter) {
  vec2 coord = inCoord / u_resolution2.y;

  for (int i = 0; i < u_mirroring_passes_size; i++) {
    int passType = int(u_mirroring_passes[i].x);
    float factor = u_mirroring_passes[i].y + u_mirroring_passes[i].z * normLenFromCenter;

    if (passType == 1) {
      // Linear/square mirroring (normalized space)
      coord = mod(coord - factor / 2.0f, factor) - factor / 2.0f;
      coord = abs(coord);
    } else if (passType == 2) {
      // Hexagonal mirroring (scale-invariant, works in normalized space)
      coord = hexMirror(coord, factor);
    } else if (passType == 3) {
      // Radial mirroring
      vec2 normalizedDir = coord / length(coord);
      float angle = vectorAngle(normalizedDir) * (180.0f / PI);
      float part = abs(mod(angle, factor) - factor / 2.0f) / (180.0f / PI);
      coord = vec2(sin(part), cos(part)) * length(coord);
    }
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

struct FractalInfo {
  float escapeIteration;
  float borderDistance;
  float trapDistance;
  float stripeAvg;
  vec2 derivative;
  vec2 finalZ;
};

FractalInfo generateFractalIntensity(vec2 point) {
  vec2 centCoord = point * 2.0f - u_resolution2;
  vec2 normCentCoord = centCoord / u_resolution2.y;

  float normLenFromCenter = length(normCentCoord);

  vec2 preparedCoord = centCoord;
  vec2 coord = mirrorCoord(preparedCoord, normLenFromCenter);
  vec2 fCoord = toFractalSpace(coord, u_fractal_r_range_start, u_fractal_r_range_end);

  float cx = u_fractal_c.x;
  float cy = u_fractal_c.y;
  float r = u_fractal_r;
  int maxIteration = int(u_max_iterations);

  r = u_fractal_r + u_r_dist_variation * normLenFromCenter;
  maxIteration = maxIteration + int(u_iterations_dist_variation * normLenFromCenter);

  vec2 c0 = calcC0(vec2(cx, cy), u_c_dist_variation, normLenFromCenter);
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
  bool doTrapCalc = u_trap_calculation_enabled == 1 && u_traps_size > 0;

  float stripeSum = 0.0f;
  float prevStripeSumVal = 0.0f;

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

    if (u_derivative_enabled == 1) {
      dz = calcEscapeDerivativeIteration(z, dz, c, zp, fCoord, scoord, cdist);
    }

    z = calcEscapeIteration(z, c, zp, fCoord, scoord, cdist);

    // if (trapDist <= trapEarlyStopThreshold) {
    //   return vec3(-1.0f, 0.0f, 0.0f);
    // }

    if (u_stripe_enabled == 1) {
      prevStripeSumVal = stripeSum;
      stripeSum += 0.5f + 0.5f * sin(16.0f * vectorAngle(z));
    }

    if (doTrapCalc && trapDist > trapEarlyStopThreshold) {
      trapDist = min(trapDist, calcDistanceToTraps(z));
    }

    zp = z;

    xSqrd = z.x * z.x;
    ySqrd = z.y * z.y;



    period = period + 1;
    if (period > 25) {
      zPrev = z;
      period = 0;
    }
  }
  float dist = 0.0f;

  if (u_derivative_enabled == 1) {
    if (!earlyStop) {
      dist = 2.0f * length(z) * log(length(z)) / length(dz);
    }
  }

  float iterationSmooth = float(iteration);

  if (u_smooth_pow >= 2) {
    powZ = float(u_smooth_pow);
  }

  if (u_smooth_pow >= 0 && powZ >= 2.0f && iteration < maxIteration) {
    iterationSmooth = float(iteration) - log(log(length(z)) / log(r)) / log(powZ);
  }

  FractalInfo info;
  info.escapeIteration = iterationSmooth;
  info.borderDistance = dist;
  info.trapDistance = trapDist;
  info.derivative = dz;
  info.finalZ = z;

  if (u_stripe_enabled == 1) {
    float curStripeAvg = stripeSum / max(float(iteration), 1.0f);
    float smoothFrac = fract(iterationSmooth);
    info.stripeAvg = mix(prevStripeSumVal / max(float(iteration) - 1.0f, 1.0f), curStripeAvg, smoothFrac);
  }

  return info;
}

void main() {
  int maxIteration = int(u_max_iterations);

  float superSampling = float(u_supersampling_level); // Num of samples

  vec2 coord = vTextureCoord * u_resolution2;

  float sidePoints = superSampling / 2.0f;

  float step = 1.0f / (superSampling + 1.0f);

  float pointsPerRow = floor(sqrt(superSampling));
  float numOfRows = ceil(superSampling / pointsPerRow);
  float columnStep = 1.0f / (pointsPerRow + 1.0f);
  float rowStep = 1.0f / (numOfRows + 1.0f);
  vec2 halfDistanceBetweenPixels = vec2(0.5f);

  FractalInfo final;
  final.escapeIteration = 0.0f;
  final.borderDistance = 0.0f;
  final.trapDistance = 0.0f;
  final.derivative = vec2(0.0f, 0.0f);
  final.finalZ = vec2(0.0f, 0.0f);
  final.stripeAvg = 0.0f;

  bool stopSuperSampling = false;
  float numOfRenderedSamples = 0.0f;

  for (float i = 0.0f; i <= 16.0f; i += 1.0f) {
    if (i >= numOfRows || stopSuperSampling) {
      break;
    }

    for (float j = 0.0f; j <= 16.0f; j += 1.0f) {
      if (j >= pointsPerRow || stopSuperSampling) {
        break;
      }

      vec2 samplePoint = coord - halfDistanceBetweenPixels + vec2((j + 1.0f) * columnStep, (i + 1.0f) * rowStep);

      FractalInfo res = generateFractalIntensity(samplePoint);

      if ((j > 0.0f || i > 0.0f)) {
        float escapeDiff = abs(res.escapeIteration - final.escapeIteration / numOfRenderedSamples);
        float trapDistDiff = abs(res.trapDistance - final.trapDistance / numOfRenderedSamples);

        // For traps it works badly, probably because first 2 samples is very close. 
        // Would be better if first two sample were from diffrent corners of the pixel. For now I set very low threshold for trap distance
        stopSuperSampling = escapeDiff <= 0.5f && trapDistDiff <= 0.000001f;
      }

      final.escapeIteration += res.escapeIteration;
      final.borderDistance += res.borderDistance;
      final.trapDistance += res.trapDistance;
      final.derivative += res.derivative;
      final.finalZ += res.finalZ;
      final.stripeAvg += res.stripeAvg;
      numOfRenderedSamples += 1.0f;
    }
  }

  final.borderDistance = final.borderDistance / numOfRenderedSamples;
  final.trapDistance = final.trapDistance / numOfRenderedSamples;
  final.escapeIteration = final.escapeIteration / numOfRenderedSamples;
  final.derivative = final.derivative / numOfRenderedSamples;
  final.finalZ = final.finalZ / numOfRenderedSamples;
  final.stripeAvg = final.stripeAvg / numOfRenderedSamples;

  output1 = vec4(final.escapeIteration, final.trapDistance, final.borderDistance, final.stripeAvg);
  output2 = vec4(final.derivative.x, final.derivative.y, final.finalZ.x, final.finalZ.y);
}
