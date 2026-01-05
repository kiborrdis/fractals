import { FractalParamsBuildRules } from "@/features/fractals";
import { RuleType } from "@/shared/libs/numberRule";

const julia: FractalParamsBuildRules = {
  formula: "z^3 + c",

  gradient: [
    [0, 0.05, 0.01, 0.15, 1], // Deep blue-purple
    [15, 0.2, 0.05, 0.4, 1], // Royal purple
    [30, 0.6, 0.15, 0.7, 1], // Vibrant purple
    [45, 0.9, 0.4, 0.8, 1], // Pink-purple
    [60, 1, 0.7, 0.5, 1], // Coral
    [75, 1, 0.9, 0.3, 1], // Golden
    [90, 0.95, 1, 0.7, 1], // Pale yellow
    [100, 1, 1, 0.95, 1], // Near white
  ],

  invert: false,
  mirroringType: "hex",
  bandSmoothing: 3,
  initialTime: 0,

  dynamic: {
    // Complex constant oscillates in a figure-8 pattern
    c: {
      t: RuleType.Vector2BSpline,
      knots: [0, 0, 0, 0, 0.25, 0.5, 0.75, 1, 1, 1, 1],
      controls: [
        [0.4, 0.1],
        [0.2, 0.3],
        [-0.1, 0.2],
        [-0.3, -0.1],
        [-0.2, -0.3],
        [0.1, -0.2],
        [0.3, 0.1],
      ],
      period: 30,
      dimension: 2,
    },

    // Escape radius pulses gently
    r: {
      t: RuleType.RangeNumber,
      range: [3, 5],
      period: 20,
      phase: 0,
    },

    // Max iterations increases for more detail
    maxIterations: {
      t: RuleType.RangeNumber,
      range: [80, 150],
      period: 40,
      phase: 0,
    },

    // Hex mirroring creates kaleidoscope effect
    hexMirroringFactor: {
      t: RuleType.RangeNumber,
      range: [0.7, 1.3],
      period: 25,
      phase: 5,
    },

    rlVisibleRange: [
      {
        t: RuleType.StaticNumber,
        value: -1.5,
      },
      {
        t: RuleType.StaticNumber,
        value: 1.5,
      },
    ],

    imVisibleRange: [
      {
        t: RuleType.StaticNumber,
        value: -1.5,
      },
      {
        t: RuleType.StaticNumber,
        value: 1.5,
      },
    ],

    time: {
      t: RuleType.StaticNumber,
      value: 0,
    },

    linearMirroringFactor: {
      t: RuleType.StaticNumber,
      value: 1,
    },

    radialMirroringAngle: {
      t: RuleType.RangeNumber,
      range: [170, 190],
      period: 35,
      phase: 10,
    },

    hexMirroringDistVariation: {
      t: RuleType.StaticNumber,
      value: 0.05,
    },

    linearMirroringDistVariation: {
      t: RuleType.StaticNumber,
      value: 0,
    },

    radialMirroringDistVariation: {
      t: RuleType.StaticNumber,
      value: 0.03,
    },

    cDistVariation: [
      {
        t: RuleType.StaticNumber,
        value: 0.02,
      },
      {
        t: RuleType.StaticNumber,
        value: 0.02,
      },
    ],

    rDistVariation: {
      t: RuleType.StaticNumber,
      value: 0.1,
    },

    iterationsDistVariation: {
      t: RuleType.StaticNumber,
      value: 5,
    },
  },

  custom: {},
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
    hexMirroringDistVariation: {
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
        period: 10,
        phase: 0,
      },
      {
        t: 1,
        range: [-1, 1],
        period: 20,
        phase: 0,
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
    linearMirroringDistVariation: {
      t: 0,
      value: 0,
    },
    radialMirroringDistVariation: {
      t: 0,
      value: 0,
    },
    cDistVariation: [
      {
        t: 0,
        value: 0,
      },
      {
        t: 0,
        value: 0,
      },
    ],
    rDistVariation: {
      t: 0,
      value: 0,
    },
    iterationsDistVariation: {
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
    hexMirroringDistVariation: {
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
        period: 10,
        phase: 0,
      },
      {
        t: 1,
        range: [-1, 1],
        period: 20,
        phase: 0,
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
    linearMirroringDistVariation: {
      t: 0,
      value: 0,
    },
    radialMirroringDistVariation: {
      t: 0,
      value: 0,
    },
    cDistVariation: [
      {
        t: 0,
        value: 0,
      },
      {
        t: 0,
        value: 0,
      },
    ],
    rDistVariation: {
      t: 0,
      value: 0,
    },
    iterationsDistVariation: {
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
    hexMirroringDistVariation: {
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
        period: 10,
        phase: 0,
      },
      {
        t: 1,
        range: [-1, 1],
        period: 20,
        phase: 0,
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
    linearMirroringDistVariation: {
      t: 0,
      value: 0,
    },
    radialMirroringDistVariation: {
      t: 0,
      value: 0,
    },
    cDistVariation: [
      {
        t: 0,
        value: 0,
      },
      {
        t: 0,
        value: 0,
      },
    ],
    rDistVariation: {
      t: 0,
      value: 0,
    },
    iterationsDistVariation: {
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
    hexMirroringDistVariation: {
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
        period: 10,
        phase: 0,
      },
      {
        t: 1,
        range: [-1, 1],
        period: 20,
        phase: 0,
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
    linearMirroringDistVariation: {
      t: 0,
      value: 0,
    },
    radialMirroringDistVariation: {
      t: 0,
      value: 0,
    },
    cDistVariation: [
      {
        t: 0,
        value: 0,
      },
      {
        t: 0,
        value: 0,
      },
    ],
    rDistVariation: {
      t: 0,
      value: 0,
    },
    iterationsDistVariation: {
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
