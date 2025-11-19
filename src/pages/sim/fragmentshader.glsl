precision highp float;

const float PI = 3.141592653589793238462;

const mat2 triangTransform = mat2(0.6641741461862876, 0.7475778912847248,   // first column
-0.7475778912847248, 0.6641741461862876);

const mat2 originTransform = mat2(0.6641741461862876, -0.7475778912847248,   // first column
0.7475778912847248, 0.6641741461862876);

uniform vec2 u_resolution;

float fn1(vec2 uv) {
  return uv.x * sqrt(2.0);
}

float fn2(vec2 uv) {
  return uv.x * -1.0 * sqrt(2.0);
}

float fn3(vec2 uv) {
  return 0.0;
}

vec2 rotate(float angle, vec2 uv) {
  float newU = (cos(angle) * uv.x) - (sin(angle) * uv.y);
  float newV = (sin(angle) * uv.x) + (cos(angle) * uv.y);
  return vec2(newU, newV);
}

float round(float val) {
  return sign(val) * float(int(abs(val) + 0.5));
}
bool isEven(float value) {
  return mod(float(int(value)), 2.0) < 0.5;
}
float height = 150.0;

vec2 rightBottom(vec2 uv, float size, float side) {
  return rotate(-4.0 * PI / 3.0, vec2(uv.x - size, uv.y - side));
}

vec2 rightTop(vec2 uv, float size, float side) {
  return rotate(-8.0 * PI / 3.0, vec2(uv.x - size, uv.y));
}

vec2 rightCenter(vec2 uv, float size, float side) {
  if (uv.y > side / 2.0) {
    return vec2(uv.x, -(side - uv.y));
  }

  return uv;
}

vec2 leftTop(vec2 uv, float size, float side) {
  return rotate(-PI / 3.0, vec2(uv.x, uv.y));
}

vec2 leftBottom(vec2 uv, float size, float side) {
  return rotate(1.0 * PI / 3.0, vec2(uv.x, uv.y - side));
}

vec2 leftCenter(vec2 uv, float size, float side) {
  if (uv.y > side / 2.0) {
    return vec2(size - uv.x, -(side - uv.y));
  }

  return rotate(0.0, vec2(size - uv.x, uv.y));
}


vec2 toUv(vec2 coords) {
  return coords / u_resolution.x;
}

vec4 drawTestBackground(vec2 centeredCoords) {
  vec2 uv = toUv(centeredCoords);
  float size = height / u_resolution.y;
  vec2 space1Uv = uv;
  vec2 space2Uv = rotate(PI / 3.0, uv);
  vec2 space3Uv = rotate(-1.0 * PI / 3.0, uv);

  vec2 maxUv = vec2(1.0, 1.0);

  float mLvl = maxUv.x / size;
  float mLvlRt = length(maxUv) / size;

  float tlvl1 = (space1Uv.x / size);
  float tlvl2 = (space2Uv.x / size);
  float tlvl3 = (space3Uv.x / size);
  float lvl1 = ((space1Uv.x + 1.0 + (size - mod(1.0, size))) / size);
  float lvl2 = ((space2Uv.x + length(maxUv) + (size - mod(length(maxUv), size))) / size);
  float lvl3 = ((space3Uv.x + length(maxUv) + (size - mod(length(maxUv), size))) / size);
  vec4 color = vec4(0.0, 0.0, 0.0, 1.0);

  float density = 30.0;
  if (isEven(float(int((uv.x + 1.0) * density))) && !isEven(float(int((uv.y + 1.0) * density))) || !isEven(float(int((uv.x + 1.0) * density))) && isEven(float(int((uv.y + 1.0) * density)))) {
    color = vec4(0.3, 0.3, 0.3, 1.0);
  }

  float w = 0.05;
  if (mod(space1Uv.x + w / 2.0, size) < w) {
    color = vec4(0.0, 0.0, 0.5, 1.0);
  } else if (mod(space2Uv.x + w / 2.0, size) < w) {
    color = vec4(0.0, 0.5, 0.0, 1.0);
  } else if (mod(space3Uv.x + w / 2.0, size) < w) {
    color = vec4(0.5, 0.0, 0.0, 1.0);
  }

  float red = 0.0;
  float green = 0.0;
  float blue = 1.0;

  if (isEven(lvl1)) {
    blue = 0.7;
  }

  if (isEven(lvl2)) {
    red = 0.7;
  }

  if (isEven(lvl3)) {
    green = 0.7;
  }

  // if (lvl1 < 0.0 || lvl2 < 0.0 || lvl3 < 0.0) {
  //   return vec4(0.0, 0.0, 0.0, 0.0);
  // }
  // return vec4(lvl1/(mLvl*2.0), lvl2/(mLvlRt*2.0), lvl3/(mLvlRt*2.0), 1.0);
  // return vec4(red, green, blue, 1.0);
  // color = vec4(red, green, blue, 0.0);
  float w1 = 0.005;
  vec4 grColor = vec4(0.89, 0.89, 0.89, 1.0);
  if (mod(space1Uv.x + w1 / 2.0, size) < w1) {
    color = grColor;
  }

  if (mod(space2Uv.x + w1 / 2.0, size) < w1) {
    color = grColor;
  }

  if (mod(space3Uv.x + w1 / 2.0, size) < w1) {
    color = grColor;
  }

  return color;

  // return vec4(float(int(lvl1)) / (mLvl * 2.0), float(int(lvl2)) / (mLvlRt * 2.0), float(int(lvl3)) / (mLvlRt * 2.0), 1.0);
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

void main() {
  float side = height * 2.0 / sqrt(3.0);
  vec2 centeredCoord = gl_FragCoord.xy * 2.0 - u_resolution;
  vec2 hexCoord = hexMirror(centeredCoord, height);

  vec4 testColor = drawTestBackground(hexCoord);

  if (testColor[3] != 0.0) {
    gl_FragColor = testColor;
  }
}
