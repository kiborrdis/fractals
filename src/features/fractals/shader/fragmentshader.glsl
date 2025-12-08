#version 300 es

precision highp float;
const float PI = 3.141592653589793238462f;
const float T = 255.0f * 255.0f;

uniform int u_smooth_pow;

uniform vec2 u_resolution;
uniform vec2 u_resolution2;
uniform vec2 u_fractal_c;
uniform float u_fractal_r;
uniform float u_linear_split;
uniform float u_radial_split;
uniform vec2 u_radial_split_angle_base_vector;
uniform float u_time;

uniform float u_max_iterations;

uniform vec2 u_fractal_r_range_start;
uniform vec2 u_fractal_r_range_end;

uniform float u_linear_split_per_dist_change;
uniform float u_radial_split_per_dist_change;

uniform float u_cx_split_per_dist_change;
uniform float u_cy_split_per_dist_change;
uniform float u_r_split_per_dist_change;
uniform float u_iterations_split_per_dist_change;

uniform int u_mirror_type; // 0 = off, 1 = square, 2 = hex
uniform bool u_invert;

uniform float u_hex_mirroring_factor;
uniform float u_hex_mirroring_dist_change;
uniform sampler2D uSampler;
uniform int u_sampler_wl;

in highp vec2 vTextureCoord;

//@CUSTOM_VARS_DECLARATION_PLACEHOLDER@

out vec4 myOutputColor;

vec2 getTexCoord(vec2 pixelCoord, vec2 texDim) {
  return (pixelCoord + 0.5f) / texDim;
}

vec3 createGradient(float part, int maxIterations) {
  int numColors = u_sampler_wl * 2;

  if (numColors == 0) {
    return vec3(1.0f, 0.0f, 1.0f);
  }

  if (part >= 1.0f) {
    vec4 lastTexel = texture(uSampler, getTexCoord(vec2(numColors - 2, 0), vec2(numColors, numColors)));
    return lastTexel.xyz;
  }

  vec4 prevTexel = texture(uSampler, getTexCoord(vec2(0, 0), vec2(numColors, numColors)));
  vec4 prevPosTexel = texture(uSampler, getTexCoord(vec2(1, 0), vec2(numColors, numColors)));

  vec4 color = prevTexel;
  float prevPos = (prevPosTexel.x * 255.0f * 255.0f + prevPosTexel.y * 255.0f) / float(maxIterations);

  for (int i = 2; i < 256; i += 2) {
    if (i >= numColors) {
      break;
    }

    vec4 texel = texture(uSampler, getTexCoord(vec2(i, 0), vec2(numColors, numColors)));
    vec4 posTexel = texture(uSampler, getTexCoord(vec2(i + 1, 0), vec2(numColors, numColors)));
    float curPosInt = (posTexel.x * 255.0f * 255.0f + posTexel.y * 255.0f);
    float curPos = curPosInt / float(maxIterations);

    if (curPosInt > float(maxIterations)) {
      curPos = 1.0f;
      texel = texture(uSampler, getTexCoord(vec2(numColors - 2, 0), vec2(numColors, numColors)));
    }

    color = mix(color, texel, smoothstep(prevPos, curPos, part));

    if (curPos >= 1.0f) {
      return color.xyz;
    }

    prevPos = curPos;
  }

  return color.xyz;
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

float re(vec2 v) {
  return v.x;
}

float im(vec2 v) {
  return v.y;
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

vec2 complexRotate(vec2 i, float ang) {
  return rotate(ang, i);
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

float generateFractalIntensity(vec2 point) {
  float slowTime = u_time / 50000.0f;
  vec2 base = u_radial_split_angle_base_vector;
    //base = vec2(0.707106781186548, 0.707106781186548);

  float sep = u_linear_split;
  vec2 centeredCoord = point * 2.0f - u_resolution2;
  vec2 normCentCoord = centeredCoord;
  normCentCoord = abs((1.0f * float(u_invert)) + (1.0f + float(u_invert) * (-2.0f)) * abs((centeredCoord / (u_resolution2))));
  float normLenFromCenter = length(normCentCoord);

  vec2 uv = centeredCoord / u_resolution2.x;
  vec2 preparedCoord = centeredCoord;
  vec2 coord = preparedCoord;

  if (u_mirror_type == 0) {
    coord = preparedCoord / u_resolution2.y;
  }

  // Square mirroring
  if (u_mirror_type == 1) {
    sep = sep + u_linear_split_per_dist_change * normLenFromCenter;
    preparedCoord = mod(centeredCoord - sep / 2.0f, sep) - sep / 2.0f;

    coord = abs(preparedCoord / u_resolution2.y);
  }

  // Hexagonal mirroring
  if (u_mirror_type == 2) {
    float hexHeight = u_hex_mirroring_factor;
    hexHeight = hexHeight + u_hex_mirroring_dist_change * normLenFromCenter;
    preparedCoord = hexMirror(preparedCoord, hexHeight);

    coord = preparedCoord / u_resolution2.y;
  }   

  // Perform radial split based on the angle
  vec2 normailizedCentrCoord = coord / length(coord);
  float angle = atan(normailizedCentrCoord.y, normailizedCentrCoord.x) * (180.0f / PI);
  float sepAng = u_radial_split;

  // Increase radial split based on the distance from the center
  sepAng = sepAng + u_radial_split_per_dist_change * normLenFromCenter;

  float part = abs(mod(angle, sepAng) - (sepAng / 2.0f)) / (180.0f / PI);
  vec2 nCrd = vec2(sin(part), cos(part)) * length(coord);

  if (sepAng < 180.0f && u_mirror_type != 0) {
    coord = nCrd;
  }

  vec3 palColor = palette(length(uv) + u_time / 1000.0f);
  vec3 palColorEnd = palette(length(coord) + u_time / 1130.0f);

    // coord = fract(coord*2.0) - 0.5;

  // Transform the coordinates to the particular part of fractal space
  vec2 fractStart = u_fractal_r_range_start;
  vec2 fractEnd = u_fractal_r_range_end;
  vec2 fractStartEndDelta = (fractEnd - fractStart) / 2.0f;
  vec2 fractalCoords = fractStartEndDelta * (coord) + fractStart + fractStartEndDelta;

  float cx = u_fractal_c.x;
  float cy = u_fractal_c.y;

  float r = u_fractal_r;
  int maxIteration = int(u_max_iterations);

  // Modify the fractal coordinates based on the distance from center split
  cx = u_fractal_c.x + u_cx_split_per_dist_change * normLenFromCenter;
  cy = u_fractal_c.y + u_cy_split_per_dist_change * normLenFromCenter;
  r = u_fractal_r + u_r_split_per_dist_change * normLenFromCenter;

  // Increase max iterations based on the distance from the center
  maxIteration = maxIteration + int(u_iterations_split_per_dist_change * normLenFromCenter);

  // float zx = cx;
  // float zy = cy;
  // cx = fractalCoords.x;
  // cy = fractalCoords.y;
  // float zx = 0.0;
  // float zy = 0.0;
  float zx = fractalCoords.x;
  float zy = fractalCoords.y;
  vec2 zInit = vec2(zx, zy);
  vec2 z = zInit;
  // vec2 c = vec2(fractalCoords.x, fractalCoords.y);
  vec2 c = vec2(cx, cy);

  float zxPrev = zx * zx;
  float zyPrev = zy * zy;
  float xSqrd = z.x * z.x;
  float ySqrd = z.y * z.y;
  float Rsqrd = r * r;
  int iteration = 0;
  float distToTrap = 1000.0f;
  vec2 zPrev = z;

  float powZ = 0.0f;
  //@FORMULA_POW_PLACEHOLDER@
  int period = 0;
  float ar = 0.0f; // average of reciprocals

  for (int iter = 0; iter < 10000; iter += 1) {

    iteration = iter;

    if (xSqrd + ySqrd >= Rsqrd || maxIteration <= iter) {
      break;
    }

    //@FORMULA_PLACEHOLDER@
    // z = complexMul(z, z);
    // z = complexAdd(z, c);

    zxPrev = xSqrd;
    zyPrev = ySqrd;
    xSqrd = z.x * z.x;
    ySqrd = z.y * z.y;

    // Detecting cycles to speed up the rendering of some fractals
    if (abs(z.x - zPrev.x) < 0.001f && abs(z.y - zPrev.y) < 0.001f) {
      iteration = maxIteration;
      break;
    }

    period = period + 1;
    if (period > 20) {
      zPrev = z;
      period = 0;
    }
  }

  float abs_z = xSqrd + ySqrd;
  float x = sqrt(abs_z) - u_fractal_r;
  float iterationSmooth = float(iteration);

  if (u_smooth_pow >= 4) {
    powZ = float(u_smooth_pow);
  }

  // iterationSmooth = float(iteration) + (1.0 - log(log(abs_z)) / log(Rsqrd));
  if (u_smooth_pow >= 0 && powZ >= 2.0f && iteration < maxIteration) {
    iterationSmooth = float(iteration) - log(log(abs_z) / log(pow(2.0f, 1.0f / (powZ - 1.0f)))) / log(powZ);
    // float log_zn = log(abs_z) / 2.0;
    // float nu = log(log_zn / log(Rsqrd)) / log(powZ);
    // iterationSmooth = float(iteration) + 1.0 - nu;
  }

  // if (iteration < maxIteration) {
  //   float distToROnPrev = length(zPrev);
  //   // myOutputColor = vec4(1.0 - pow(distToROnPrev / u_fractal_r, 2.0), 0.0, 0.0, 1.0);
  //   // return;
  //   iterationSmooth = float(iteration) + 1.0 - pow(distToROnPrev / u_fractal_r, 2.0);
  // }

  // iterationSmooth = float(iteration) - 1.0 * min(sqrt(x / 2.1), 1.0);

  return iterationSmooth;
}

void main() {
  int maxIteration = int(u_max_iterations);

  float iterationSmooth = 0.0f;
  float superSampling = 1.0f; // n x n grid, should be even

  vec2 coord = vTextureCoord * u_resolution2;

  if (superSampling == 1.0f) {
    iterationSmooth = generateFractalIntensity(coord);
  } else {
    float sidePoints = superSampling / 2.0f;

    float step = 1.0f / (superSampling + 1.0f);

    for (float i = 0.0f; i <= 16.0f; i += 1.0f) {
      if ((i - sidePoints) == 0.0f) {
        continue;
      }

      if (i > superSampling) {
        break;
      }

      for (float j = 0.0f; j <= 16.0f; j += 1.0f) {
        if ((j - sidePoints) == 0.0f) {
          continue;
        }

        if (j > superSampling) {
          break;
        }
  
        vec2 samplePoint = coord + vec2((i - sidePoints) * step, (j - sidePoints) * step);
        // iterationSmooth = min(generateFractalIntensity(samplePoint), iterationSmooth);
        iterationSmooth += generateFractalIntensity(samplePoint);
      }
    }

    iterationSmooth = iterationSmooth / (superSampling * superSampling);
  }
  if (iterationSmooth == -1.0f) {
    myOutputColor = vec4(0.0f, 0.0f, 1.0f, 1.0f);
    return;
  }

//   // iterationSmooth = float(iteration) - 1.0 * min(sqrt(x / 2.1), 1.0);
  float colorInt = iterationSmooth / float(maxIteration);

  // vec3 color = createGradient(colorInt * colorInt);
  vec3 color = createGradient(colorInt, maxIteration);

  // float palPart = 0.1;
  // vec3 resultColor = ((0.9 + palPart * (1.0 - colorInt)) * color + (palPart * colorInt) * palColorEnd);
  // myOutputColor = vec4(resultColor, 1.0);

  myOutputColor = vec4(color, 1.0f);
}
