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

bool isEven(float value) {
  return mod(float(int(value)), 2.0) < 0.5;
}
float size = 0.09;

vec4 getColorForUv(vec2 uv) {
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
  return vec4(lvl1/(mLvl*2.0), lvl2/(mLvlRt*2.0), lvl3/(mLvlRt*2.0), 1.0);
  return vec4(red, green, blue, 1.0);

  return color;

  // return vec4(float(int(lvl1)) / (mLvl * 2.0), float(int(lvl2)) / (mLvlRt * 2.0), float(int(lvl3)) / (mLvlRt * 2.0), 1.0);
}

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

void main() {
  float side = size * 2.0 / sqrt(3.0);

  vec2 centeredCoord = gl_FragCoord.xy * 2.0 - u_resolution;

  


  vec2 uv = centeredCoord / u_resolution.x;

  vec2 space1Uv = centeredCoord;
  vec2 space2Uv = rotate(PI / 3.0, centeredCoord);
  vec2 space3Uv = rotate(-1.0 * PI / 3.0, centeredCoord);

  vec2 maxUv = u_resolution;
  size = 200.0;
  float mLvl = maxUv.x / size;

  float tlvl1 = (space1Uv.x / size);
  float tlvl2 = (space2Uv.x / size);
  float tlvl3 = (space3Uv.x / size);
  float lvl1 = (space1Uv.x / size) + mLvl * 3.0 * size;
  float lvl2 = (space2Uv.x / size) + mLvl * 3.0 * size;
  float lvl3 = (space3Uv.x / size) + mLvl * 3.0 * size;

  float uMod = mod(space1Uv.x, size);
  float ru = abs(uMod);
  float l = ru / size;
  float il = (size - ru) / size;

  // if (isEven(lvl1)) {
  //   float t = l;
  //   l = il;
  //   il = t;
  // }

  float red = 0.0;
  float green = 0.0;
  float blue = 1.0;

  if (isEven(lvl2)) {
    red = 1.0;
    blue = 0.0;
  }

  if (isEven(lvl3)) {
    green = 1.0;
    blue = 0.0;
  }
  float t = il;
  // rv = (size / 2.0) * il + abs(space2Uv2.x);
  float rv = abs(mod(uv.y, side));
  vec2 rUv = vec2(ru, rv);

  bool negate = isEven(lvl1);

  if ((isEven(lvl2) || isEven(lvl3)) && !(isEven(lvl2) && isEven(lvl3))) {
    // ru = size - ru;
    // rv = side - rv;
    if (!isEven(lvl1) && !negate) {
      if (isEven(lvl2) || isEven(lvl3)) {
        rUv = leftTop(vec2(ru, rv), size, side);

      } else {
        rUv = leftBottom(vec2(ru, rv), size, side);
      }
    } else {

      if (!isEven(lvl2)) {
        rUv = rightTop(vec2(ru, rv), size, side);

      } else {
        rUv = rightBottom(vec2(ru, rv), size, side);
      }
    }
  } else {
    if (!isEven(lvl1)) {
      rUv = rightCenter(vec2(ru, rv), size, side);

    } else {
      rUv = leftCenter(vec2(ru, rv), size, side);
    }
  }

  // rUv = uvTri * originTransform;
  // gl_FragColor = vec4(sqrt(rsu), 0.0, 0.0, 1.0);

    // gl_FragColor = getColorForUv(uv);

  gl_FragColor = getColorForUv(rUv);
  gl_FragColor = getColorForUv(uv);
  // if (mod(float(int(lvl2)), 2.0) > 0.0) {
  //   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  // }
  if (float(int(tlvl1)) != 2.0 && float(int(tlvl1)) != 1.0) {
    // gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    gl_FragColor = getColorForUv(uv);
    // gl_FragColor = vec4(red, green, blue, 1.0);
  }

  if (abs(float(int(tlvl1))) < 1.0 && abs(float(int(tlvl2))) < 1.0 && abs(float(int(tlvl3))) < 1.0) {
    // gl_FragColor = vec4(0.0, (abs(uv)), 1.0);
    gl_FragColor = getColorForUv(uv);
    // gl_FragColor = vec4(sqrt(uv.y), 0.0, 0.0, 1.0);
  }
    // gl_FragColor = getColorForUv(rUv);

  if ((lvl2 - lvl3) > -3.0 && (lvl2 - lvl3) < 3.0) {
    gl_FragColor = getColorForUv(rUv);
  }

  float w = 3.0;
  vec4 grColor = vec4(0.89, 0.89, 0.89, 1.0);
  if (mod(space1Uv.x + w / 2.0, size) < w) {
    gl_FragColor = grColor;
  }

  if (mod(space2Uv.x + w / 2.0, size) < w) {
    gl_FragColor = grColor;
  }

  if (mod(space3Uv.x + w / 2.0, size) < w) {
    gl_FragColor = grColor;
  }
}
