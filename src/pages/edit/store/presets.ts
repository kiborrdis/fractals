import { FractalParamsBuildRules } from "@/features/fractals";

const julia: FractalParamsBuildRules = {
  formula: "z^2 + c",
  gradient: [
    [0, 0, 0, 0, 1],
    [10, 0.8, 0, 0, 1],
    [30, 1, 0.6666666666666666, 0, 1],
    [40, 1, 0.9490196078431372, 0, 1],
    [70, 0.9921568627450981, 1, 0.6, 1],
    [100, 1, 0.9372549019607843, 0.8392156862745098, 1],
  ],
  invert: false,
  mirroringType: "off",
  custom: {},
  dynamic: {
    hexMirroringFactor: {
      t: 0,
      value: 0,
    },
    hexMirroringPerDistChange: {
      t: 0,
      value: 0,
    },
    linearMirroringFactor: {
      t: 0,
      value: 2000,
    },
    time: {
      t: 0,
      value: 0,
    },
    c: [
      {
        t: 1,
        range: [-1, 1],
        cycleSeconds: 10,
        phaseSeconds: 0,
      },
      {
        t: 1,
        range: [-1, 1],
        cycleSeconds: 20,
        phaseSeconds: 0,
      },
    ],
    r: {
      t: 0,
      value: 4,
    },
    rlVisibleRange: [
      {
        t: 0,
        value: -1,
      },
      {
        t: 0,
        value: 1,
      },
    ],
    imVisibleRange: [
      {
        t: 0,
        value: -1,
      },
      {
        t: 0,
        value: 1,
      },
    ],
    maxIterations: {
      t: 0,
      value: 100,
    },
    linearMirroringPerDistChange: {
      t: 0,
      value: 0,
    },
    radialMirroringPerDistChange: {
      t: 0,
      value: 0,
    },
    cxPerDistChange: {
      t: 0,
      value: 0,
    },
    cyPerDistChange: {
      t: 0,
      value: 0,
    },
    rPerDistChange: {
      t: 0,
      value: 0,
    },
    iterationsPerDistChange: {
      t: 0,
      value: 0,
    },
    radialMirroringAngle: {
      t: 0,
      value: 181,
    },
  },
  initialTime: 17504.950495049507,
};

const mandelbrot: FractalParamsBuildRules = {
  formula: "z^2 + c",
  gradient: [
    [0, 0, 0, 0, 1],
    [10, 0.8, 0, 0, 1],
    [30, 1, 0.6666666666666666, 0, 1],
    [40, 1, 0.9490196078431372, 0, 1],
    [70, 0.9921568627450981, 1, 0.6, 1],
    [100, 1, 0.9372549019607843, 0.8392156862745098, 1],
  ],
  invert: false,
  mirroringType: "off",
  custom: {},
  dynamic: {
    hexMirroringFactor: {
      t: 0,
      value: 0,
    },
    hexMirroringPerDistChange: {
      t: 0,
      value: 0,
    },
    linearMirroringFactor: {
      t: 0,
      value: 2000,
    },
    time: {
      t: 0,
      value: 0,
    },
    c: [
      {
        t: 1,
        range: [-1, 1],
        cycleSeconds: 10,
        phaseSeconds: 0,
      },
      {
        t: 1,
        range: [-1, 1],
        cycleSeconds: 20,
        phaseSeconds: 0,
      },
    ],
    r: {
      t: 0,
      value: 2,
    },
    rlVisibleRange: [
      {
        t: 0,
        value: -1.4,
      },
      {
        t: 0,
        value: 0.6,
      },
    ],
    imVisibleRange: [
      {
        t: 0,
        value: -1,
      },
      {
        t: 0,
        value: 1,
      },
    ],
    maxIterations: {
      t: 0,
      value: 100,
    },
    linearMirroringPerDistChange: {
      t: 0,
      value: 0,
    },
    radialMirroringPerDistChange: {
      t: 0,
      value: 0,
    },
    cxPerDistChange: {
      t: 0,
      value: 0,
    },
    cyPerDistChange: {
      t: 0,
      value: 0,
    },
    rPerDistChange: {
      t: 0,
      value: 0,
    },
    iterationsPerDistChange: {
      t: 0,
      value: 0,
    },
    radialMirroringAngle: {
      t: 0,
      value: 181,
    },
  },
  initialZFormula: "c0",
  initialCFormula: "fCoord",
};

const burningship: FractalParamsBuildRules = {
  formula: "cmpl(abs(re(z)), abs(im(z)))^2 + c",
  gradient: [
    [0, 0, 0, 0, 1],
    [10, 0.8, 0, 0, 1],
    [30, 1, 0.6666666666666666, 0, 1],
    [40, 1, 0.9490196078431372, 0, 1],
    [70, 0.9921568627450981, 1, 0.6, 1],
    [100, 1, 0.9372549019607843, 0.8392156862745098, 1],
  ],
  invert: false,
  mirroringType: "off",
  custom: {},
  dynamic: {
    hexMirroringFactor: {
      t: 0,
      value: 0,
    },
    hexMirroringPerDistChange: {
      t: 0,
      value: 0,
    },
    linearMirroringFactor: {
      t: 0,
      value: 2000,
    },
    time: {
      t: 0,
      value: 0,
    },
    c: [
      {
        t: 1,
        range: [-1, 1],
        cycleSeconds: 10,
        phaseSeconds: 0,
      },
      {
        t: 1,
        range: [-1, 1],
        cycleSeconds: 20,
        phaseSeconds: 0,
      },
    ],
    r: {
      t: 0,
      value: 2,
    },
    rlVisibleRange: [
      {
        t: 0,
        value: -1.8,
      },
      {
        t: 0,
        value: 1,
      },
    ],
    imVisibleRange: [
      {
        t: 0,
        value: -2.2,
      },
      {
        t: 0,
        value: 0.6,
      },
    ],
    maxIterations: {
      t: 0,
      value: 100,
    },
    linearMirroringPerDistChange: {
      t: 0,
      value: 0,
    },
    radialMirroringPerDistChange: {
      t: 0,
      value: 0,
    },
    cxPerDistChange: {
      t: 0,
      value: 0,
    },
    cyPerDistChange: {
      t: 0,
      value: 0,
    },
    rPerDistChange: {
      t: 0,
      value: 0,
    },
    iterationsPerDistChange: {
      t: 0,
      value: 0,
    },
    radialMirroringAngle: {
      t: 0,
      value: 181,
    },
  },
  initialZFormula: "c0",
  initialCFormula: "fCoord",
  bandSmoothing: 4,
};

const tricorn: FractalParamsBuildRules = {
  formula: "conjugate(z)^2 + c",
  gradient: [
    [0, 0, 0, 0, 1],
    [10, 0.8, 0, 0, 1],
    [30, 1, 0.6666666666666666, 0, 1],
    [40, 1, 0.9490196078431372, 0, 1],
    [70, 0.9921568627450981, 1, 0.6, 1],
    [100, 1, 0.9372549019607843, 0.8392156862745098, 1],
  ],
  invert: false,
  mirroringType: "off",
  custom: {},
  dynamic: {
    hexMirroringFactor: {
      t: 0,
      value: 0,
    },
    hexMirroringPerDistChange: {
      t: 0,
      value: 0,
    },
    linearMirroringFactor: {
      t: 0,
      value: 2000,
    },
    time: {
      t: 0,
      value: 0,
    },
    c: [
      {
        t: 1,
        range: [-1, 1],
        cycleSeconds: 10,
        phaseSeconds: 0,
      },
      {
        t: 1,
        range: [-1, 1],
        cycleSeconds: 20,
        phaseSeconds: 0,
      },
    ],
    r: {
      t: 0,
      value: 2,
    },
    rlVisibleRange: [
      {
        t: 0,
        value: -2,
      },
      {
        t: 0,
        value: 2,
      },
    ],
    imVisibleRange: [
      {
        t: 0,
        value: -2,
      },
      {
        t: 0,
        value: 2,
      },
    ],
    maxIterations: {
      t: 0,
      value: 100,
    },
    linearMirroringPerDistChange: {
      t: 0,
      value: 0,
    },
    radialMirroringPerDistChange: {
      t: 0,
      value: 0,
    },
    cxPerDistChange: {
      t: 0,
      value: 0,
    },
    cyPerDistChange: {
      t: 0,
      value: 0,
    },
    rPerDistChange: {
      t: 0,
      value: 0,
    },
    iterationsPerDistChange: {
      t: 0,
      value: 0,
    },
    radialMirroringAngle: {
      t: 0,
      value: 181,
    },
  },
  initialZFormula: "c0",
  initialCFormula: "fCoord",
  bandSmoothing: 4,
};

const multibrot: FractalParamsBuildRules = {
  formula: "z^5 + c",
  gradient: [
    [0, 0, 0, 0, 1],
    [10, 0.8, 0, 0, 1],
    [30, 1, 0.6666666666666666, 0, 1],
    [40, 1, 0.9490196078431372, 0, 1],
    [70, 0.9921568627450981, 1, 0.6, 1],
    [100, 1, 0.9372549019607843, 0.8392156862745098, 1],
  ],
  invert: false,
  mirroringType: "off",
  custom: {},
  dynamic: {
    hexMirroringFactor: {
      t: 0,
      value: 0,
    },
    hexMirroringPerDistChange: {
      t: 0,
      value: 0,
    },
    linearMirroringFactor: {
      t: 0,
      value: 2000,
    },
    time: {
      t: 0,
      value: 0,
    },
    c: [
      {
        t: 1,
        range: [-1, 1],
        cycleSeconds: 10,
        phaseSeconds: 0,
      },
      {
        t: 1,
        range: [-1, 1],
        cycleSeconds: 20,
        phaseSeconds: 0,
      },
    ],
    r: {
      t: 0,
      value: 2,
    },
    rlVisibleRange: [
      {
        t: 0,
        value: -2,
      },
      {
        t: 0,
        value: 2,
      },
    ],
    imVisibleRange: [
      {
        t: 0,
        value: -2,
      },
      {
        t: 0,
        value: 2,
      },
    ],
    maxIterations: {
      t: 0,
      value: 100,
    },
    linearMirroringPerDistChange: {
      t: 0,
      value: 0,
    },
    radialMirroringPerDistChange: {
      t: 0,
      value: 0,
    },
    cxPerDistChange: {
      t: 0,
      value: 0,
    },
    cyPerDistChange: {
      t: 0,
      value: 0,
    },
    rPerDistChange: {
      t: 0,
      value: 0,
    },
    iterationsPerDistChange: {
      t: 0,
      value: 0,
    },
    radialMirroringAngle: {
      t: 0,
      value: 181,
    },
  },
  initialZFormula: "c0",
  initialCFormula: "fCoord",
  bandSmoothing: 0,
};

export const fractalPresets: Record<string, FractalParamsBuildRules> = {
  julia,
  mandelbrot,
  burningship,
  tricorn,
  multibrot,
};
