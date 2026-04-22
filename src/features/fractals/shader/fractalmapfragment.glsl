#version 300 es

precision highp float;
const float PI = 3.141592653589793238462f;
const float T = 1000000.0f;

uniform vec2 u_axis_sizes;
uniform vec2 u_offset;

uniform int u_target_detail_level;
uniform int u_prev_detail_level;

uniform vec2 u_resolution;

uniform sampler2D u_prev_data;

// Fractal parameters
uniform vec2 u_fractal_c;
uniform float u_fractal_r;
uniform float u_max_iterations;

// Viewport
uniform vec2 u_fractal_r_range_start;
uniform vec2 u_fractal_r_range_end;

in highp vec2 vTextureCoord;

//@CUSTOM_VARS_DECLARATION_PLACEHOLDER@

layout (location = 0) out vec4 output1;

vec2 rotate(float angle, vec2 uv) {
  float newU = (cos(angle) * uv.x) - (sin(angle) * uv.y);
  float newV = (sin(angle) * uv.x) + (cos(angle) * uv.y);
  return vec2(newU, newV);
}

vec2 re(vec2 v) {
  return vec2(v.x, 0.0f);
}

vec2 im(vec2 v) {
  return vec2(v.y, 0.0f);
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

vec2 calcC0() {
  vec2 coord = vTextureCoord * u_resolution - 0.5f * u_resolution;
  float lowestDim = min(u_resolution.x, u_resolution.y);

  return u_axis_sizes * (coord / (lowestDim)) + u_offset;
}

vec2 calcEscapeIteration(vec2 z, vec2 c, vec2 zp, vec2 fCoord, vec2 scoord, float cdist) {
  //@FORMULA_PLACEHOLDER@
  return z;
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
  vec2 centCoord = point * 2.0f - u_axis_sizes;
  vec2 normCentCoord = centCoord / u_axis_sizes.y;

  float normLenFromCenter = length(normCentCoord);

  vec2 fCoord = point;

  float cx = u_fractal_c.x;
  float cy = u_fractal_c.y;
  float r = u_fractal_r;
  int maxIteration = int(u_max_iterations);

  r = u_fractal_r;
  maxIteration = maxIteration;

  vec2 c0 = calcC0();
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

  //@FORMULA_POW_PLACEHOLDER@
  bool earlyStop = false;

  // Half pixel threshold for early stopping
  float earlyStopThreshholdX = 0.1f * (u_fractal_r_range_end.x - u_fractal_r_range_start.x) / u_resolution.x;
  float earlyStopThreshholdY = 0.1f * (u_fractal_r_range_end.y - u_fractal_r_range_start.y) / u_resolution.y;

  for (int iter = 0; iter < 10000; iter += 1) {
    iteration = iter;

    if (xSqrd + ySqrd >= Rsqrd || maxIteration <= iter) {
      break;
    }

    z = calcEscapeIteration(z, c, zp, fCoord, scoord, cdist);

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

  FractalInfo info;
  info.escapeIteration = float(iteration);
  info.borderDistance = 0.0f;
  info.trapDistance = 0.0f;
  info.derivative = vec2(0.0f, 0.0f);
  info.finalZ = vec2(0.0f, 0.0f);

  return info;
}

void main() {
  int maxIteration = int(u_max_iterations);

  float intensity = 0.0f;
  float samplesInIntensity = 0.0f;
  float countHigh = 0.0f;
  float countMiddle = 0.0f;
  float countLow = 0.0f;

  int samplingLevel = u_target_detail_level;
  int startSamplingLevel = u_prev_detail_level + 1;
  if (samplingLevel > 8) {
    samplingLevel = 8;
  }

  if (startSamplingLevel < 1) {
    startSamplingLevel = 1;
  }

  // 1 is 4, 2 is 9, 3 is 25, 4 is 81, 5 is 289, 6 is 1089
  // (2^(k - 1) + 1)^2 
  float samplesPerSide = pow(2.0f, float(samplingLevel) - 1.0f);
  float numOfSamples = pow(samplesPerSide, 2.0f);
  float count = 0.0f;
  for (int k = startSamplingLevel; k <= 8; k += 1) {
    if (k > samplingLevel) {
      break;
    }

    int gridSideSize = int(pow(2.0f, float(k - 1)));
    vec2 start = u_fractal_r_range_start;
    vec2 delta = (u_fractal_r_range_end - u_fractal_r_range_start) / pow(2.0f, float(k - 1));

    for (int i = 0; i < 128; i += 1) {
      if (i > gridSideSize) {
        break;
      }

      for (int j = 0; j < 128; j += 1) {
        if (j > gridSideSize) {
          break;
        }

        if (k > 1 && (i % 2 == 0 && j % 2 == 0)) {
          continue; // Skip points that are not part of the current step
        }
        count += 1.0f;
        vec2 samplePoint = start + delta * vec2(float(i), float(j));

        FractalInfo fractalSample = generateFractalIntensity(samplePoint);

        if (fractalSample.escapeIteration > 5.0f && fractalSample.escapeIteration < 10.0f) {
          countLow += 1.0f;
        }

        if (fractalSample.escapeIteration >= 10.0f && fractalSample.escapeIteration < 20.0f) {
          countMiddle += 1.0f;
        }

        if (fractalSample.escapeIteration >= 20.0f && fractalSample.escapeIteration < 30.0f) {
          countHigh += 1.0f;
        }

        if (fractalSample.escapeIteration > 0.0f) {
          intensity += fractalSample.escapeIteration;
          samplesInIntensity += 1.0f;
        }
      }
    }
  }
  vec4 prevData = vec4(0.0f, 0.0f, 0.0f, 1.0f);

  if (u_prev_detail_level > 0) {
    prevData = texture(u_prev_data, gl_FragCoord.xy / u_resolution);
  }

  output1 = vec4(countLow + prevData.x, countMiddle + prevData.y, countHigh + prevData.z, 1.0f);
}


// void main() {
//   myOutputColor = vec4(0.0f, 0.0f, 0.0f, 1.0f);

//   int maxIteration = int(u_max_iterations);

//   int numOfSamples = (u_sample_per_side * u_sample_per_side + 1) * (u_sample_per_side * u_sample_per_side + 1); 

//   for (int k = 1; k < 32; k += 1) {
//     if (k > u_sample_per_side) {
//       break;
//     }

//     int gridSideSize = int(pow(2.0f, float(k - 1)));
//     vec2 start = u_resolution / 4.0f;
//     vec2 delta = (u_resolution / 2.0f) / pow(2.0f, float(k - 1));

//     for (int i = 0; i < 128; i += 1) {
//       if (i > gridSideSize) {
//         break;
//       }

//       for (int j = 0; j < 128; j += 1) {
//         if (j > gridSideSize) {
//           break;
//         }

//         if (k > 1 && (i % 2 == 0 && j % 2 == 0)) {
//           continue; // Skip points that are not part of the current step
//         }

//         vec2 samplePoint = start + delta * vec2(float(i), float(j));

//         if (length(samplePoint - vTextureCoord * u_resolution) < 2.0f) {
//           myOutputColor = vec4(1.0f, 0.0f, 0.0f, 1.0f); 
//         }
//       }
//     }
//   }
// }
