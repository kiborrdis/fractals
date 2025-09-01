precision highp float;
const float PI = 3.141592653589793238462;
uniform vec2 u_resolution;
uniform vec2 u_fractal_c;
uniform float u_fractal_r;
uniform float u_linear_split;
uniform float u_radial_split;
uniform vec2 u_radial_split_angle_base_vector;
uniform float u_time;

uniform float u_max_iterations;

uniform vec2 u_fractal_r_range_start;
uniform vec2 u_fractal_r_range_end;

uniform vec2 u_linear_split_per_dist_change;
uniform vec2 u_radial_split_per_dist_change;

uniform vec2 u_cx_split_per_dist_change;
uniform vec2 u_cy_split_per_dist_change;
uniform vec2 u_r_split_per_dist_change;
uniform vec2 u_iterations_split_per_dist_change;

uniform int u_mirror_type; // 0 = off, 1 = square, 2 = hex
uniform bool u_invert;

uniform float u_hex_mirroring_factor;
uniform vec2 U_hex_mirroring_dist_change;
uniform sampler2D uSampler;
uniform int u_sampler_wl;

vec2 getTexCoord(vec2 pixelCoord, vec2 texDim) {
  return (pixelCoord + 0.5) / texDim;
}

vec3 createGradient(float part) {
  int numColors = u_sampler_wl;

  if (numColors == 0) {
    return vec3(1.0, 0.0, 1.0);
  }

  vec4 prevTexel = texture2D(uSampler, getTexCoord(vec2(0, 0), vec2(numColors, numColors)));
  vec3 color = prevTexel.xyz;

  for (int i = 1; i < 256; i++) {
    if (i >= numColors) {
      break;
    }

    vec4 texel = texture2D(uSampler, getTexCoord(vec2(i, 0), vec2(numColors, numColors)));
    color = mix(color, texel.xyz, smoothstep(prevTexel.w, texel.w, part));
    prevTexel = texel;
  }

  return color.xyz;
}

float sdCircle(vec2 p, float r) {
  return length(p) - r;
}

vec3 palette(float t) {
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.5, 0.5, 0.5);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.263, 0.416, 0.557);

  return a + b * cos(6.28318 * (c * t * d));
}

vec2 rotate(float angle, vec2 uv) {
  float newU = (cos(angle) * uv.x) - (sin(angle) * uv.y);
  float newV = (sin(angle) * uv.x) + (cos(angle) * uv.y);
  return vec2(newU, newV);
}

float round(float val) {
  return sign(val) * float(int(abs(val) + 0.5));
}
vec2 hexMirror(vec2 centeredCoord, float height) {
  float side = height * 2.0 / sqrt(3.0);

  vec2 candA = vec2(round(centeredCoord.x / (height * 2.0)) * (height * 2.0), round(centeredCoord.y / (side * 3.0)) * (side * 3.0));
  vec2 candB = vec2(round((centeredCoord.x - height) / (height * 2.0)) * (height * 2.0) + height, //52
  round((centeredCoord.y - side * 1.5) / (side * 3.0)) * (side * 3.0) + side * 1.5 //90
  );

  vec2 hexCenter = candB;

  if (length(candA - centeredCoord) < length(candB - centeredCoord)) {
    hexCenter = candA;
  }

  vec2 vectorToAngle = vec2(1.0, 0.0);
  vec2 hexCoord = centeredCoord - hexCenter;

  float angle = acos((hexCoord.x * vectorToAngle.x + hexCoord.y * vectorToAngle.y) / length(hexCoord));
  angle = hexCoord.y < 0.0 ? -1.0 * angle : angle;
  float rotAngle = 0.0;
  bool swap = false;

  if (angle > (5.0 * PI / 6.0)) {
    rotAngle = -PI;
    swap = true;

  } else if (angle > (PI / 2.0)) {
    rotAngle = -2.0 * PI / 3.0;

  } else if (angle > PI / 6.0) {
    rotAngle = -PI / 3.0;
    swap = true;

  }

  if (angle < -(5.0 * PI / 6.0)) {
    rotAngle = PI;
    swap = true;
  } else if (angle < -(PI / 2.0)) {
    rotAngle = 2.0 * PI / 3.0;

  } else if (angle < -PI / 6.0) {
    rotAngle = PI / 3.0;
    swap = true;
  }

  vec2 resultCoords = rotate(rotAngle, hexCoord);

  if (swap) {
    resultCoords.y = -resultCoords.y;
  }

  return resultCoords;
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

vec2 complexPow(vec2 a, float p) {
  float len = pow(length(a), p);
  vec2 norm = a / length(a);
  float angle = acos(norm.x);

  if (norm.y < 0.0) {
    angle = 2.0 * PI - angle;
  }

  // if (norm.x < 0.0 && norm.y < 0.0) {
  //   angle = 2.0 * PI - angle;
  // }

  return vec2(cos(angle * p) * len, sin(angle * p) * len);
}

// vec2 centeredCoord = gl_FragCoord.xy * 2.0 - u_resolution;
// vec2 coord = preparedCoord / u_resolution.y;
// vec2 fractStart = u_fractal_r_range_start;
// vec2 fractEnd = u_fractal_r_range_end;
// vec2 fractStartEndDelta = (fractEnd - fractStart) / 2.0;
// vec2 fractalCoords = fractStartEndDelta * (coord)  + fractStart + fractStartEndDelta;

void main() {
  float slowTime = u_time / 50000.0;
  vec2 base = u_radial_split_angle_base_vector;
    //base = vec2(0.707106781186548, 0.707106781186548);

  float sep = u_linear_split;
  vec2 centeredCoord = gl_FragCoord.xy * 2.0 - u_resolution;

  vec2 normCentCoord = centeredCoord;
  normCentCoord = abs((1.0 * float(u_invert)) + (1.0 + float(u_invert) * (-2.0)) * abs((centeredCoord / (u_resolution))));

  vec2 uv = centeredCoord / u_resolution.x;
  vec2 preparedCoord = centeredCoord;
  vec2 coord = preparedCoord;

  if (u_mirror_type == 0) {
    coord = preparedCoord / u_resolution.y;
  }

  // Square mirroring
  if (u_mirror_type == 1) {
    vec2 linearSplitPerDistChange = u_linear_split_per_dist_change;
    sep = sep + linearSplitPerDistChange.x * abs(normCentCoord.x) + linearSplitPerDistChange.y * abs(normCentCoord.y);
    preparedCoord = mod(centeredCoord - sep / 2.0, sep) - sep / 2.0;

    coord = abs(preparedCoord / u_resolution.y);
  }

  // Hexagonal mirroring
  if (u_mirror_type == 2) { 
    float hexHeight = u_hex_mirroring_factor;
    hexHeight = hexHeight + U_hex_mirroring_dist_change.x * abs(normCentCoord.x) + U_hex_mirroring_dist_change.y * abs(normCentCoord.y);
    preparedCoord = hexMirror(preparedCoord, hexHeight);

    coord = preparedCoord / u_resolution.y;
  }   

  // Perform radial split based on the angle
  vec2 normailizedCentrCoord = coord / length(coord);
  float angle = acos(base.x * normailizedCentrCoord.x + base.y * normailizedCentrCoord.y) * (180.0 / PI);
  float sepAng = u_radial_split;

  vec2 radialSplitPerDistChange = u_radial_split_per_dist_change;

  // Increase radial split based on the distance from the center
  sepAng = sepAng + radialSplitPerDistChange.x * abs(normCentCoord.x) + radialSplitPerDistChange.y * abs(normCentCoord.y);

  float part = abs(mod(angle, sepAng) - (sepAng / 2.0)) / (180.0 / PI);
  vec2 nCrd = vec2(sin(part), cos(part)) * length(coord);

  if (sepAng < 180.0) {
    coord = nCrd;
  }

  vec3 palColor = palette(length(uv) + u_time / 1000.0);
  vec3 palColorEnd = palette(length(coord) + u_time / 1130.0);

    // coord = fract(coord*2.0) - 0.5;

  // Transform the coordinates to the particular part of fractal space
  vec2 fractStart = u_fractal_r_range_start;
  vec2 fractEnd = u_fractal_r_range_end;
  vec2 fractStartEndDelta = (fractEnd - fractStart) / 2.0;
  vec2 fractalCoords = fractStartEndDelta * (coord) + fractStart + fractStartEndDelta;
  gl_FragColor = vec4((coord + 1.0) / 2.0, 0.0, 1.0);
  // return;
  float cy = u_fractal_c.x;
  float cx = u_fractal_c.y;
  float r = u_fractal_r;
  int maxIteration = int(u_max_iterations);

  vec2 cxPerDistChange = u_cx_split_per_dist_change;
  vec2 cyPerDistChange = u_cy_split_per_dist_change;
  vec2 rPerDistChange = u_r_split_per_dist_change;
  vec2 iterationsPerDistChange = u_iterations_split_per_dist_change;

    // Modify the fractal coordinates based on the distance from center split
  cy = u_fractal_c.x + cxPerDistChange.x * abs(normCentCoord.x) + cxPerDistChange.y * abs(normCentCoord.y);
  cx = u_fractal_c.y + cyPerDistChange.x * abs(normCentCoord.x) + cyPerDistChange.y * abs(normCentCoord.y);
  r = u_fractal_r + rPerDistChange.x * abs(normCentCoord.x) + rPerDistChange.y * abs(normCentCoord.y);

    // Increase max iterations based on the distance from the center
  maxIteration = maxIteration + int(iterationsPerDistChange.x * abs(normCentCoord.x) + iterationsPerDistChange.y * abs(normCentCoord.y));

  float zx = fractalCoords.x;
  float zy = fractalCoords.y;
  vec2 z = vec2(zx, zy);
  vec2 c = vec2(cx, cy);

  float zxPrev = zx;
  float zyPrev = zy;
  float xSqrd = pow(fractalCoords.x, 2.0);
  float ySqrd = pow(fractalCoords.y, 2.0);
  float Rsqrd = pow(r, 2.0);
  int iteration = 0;

  for (int iter = 0; iter < 10000; iter += 1) {
    if (xSqrd + ySqrd >= Rsqrd || maxIteration <= iter) {
      break;
    }

    //@FORMULA_PLACEHOLDER@
    // z = complexMul(z, z);
    // z = complexAdd(z, c);

    xSqrd = pow(z.x, 2.0);
    ySqrd = pow(z.y, 2.0);
    iteration = iter;
  }

  float abs_z = xSqrd + ySqrd;
  float x = sqrt(abs_z) - u_fractal_r;

  float iterationSmooth = float(iteration);
    //iterationSmooth = float(iteration) - 1.0*clamp(x/2.0,0.0,1.0);

  // iterationSmooth = float(iteration) - 1.0 * min(sqrt(x / 2.1), 1.0);

  float colorInt = iterationSmooth / float(maxIteration);

  vec3 color = createGradient(colorInt);

  float palPart = 0.1;
  vec3 resultColor = ((0.9 + palPart * (1.0 - colorInt)) * color + (0.0 + palPart * colorInt) * palColorEnd);
  gl_FragColor = vec4(resultColor, 1.0);
}
