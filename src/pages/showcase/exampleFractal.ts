import { FractalParamsBuildRules } from "@/features/fractals";

export const exampleFractal: FractalParamsBuildRules = {
  formula: "z^2 + c",
  gradient: [
    [0, 0.00784313725490196, 0, 0.16862745098039217, 1],
    [5, 0.13333333333333333, 0.1843137254901961, 0.3686274509803922, 1],
    [10, 0.6705882352941176, 0.5803921568627451, 0, 1],
    [15, 0, 0.47058823529411764, 0.01568627450980392, 1],
    [20, 0.7294117647058823, 0, 0, 1],
    [25, 0.6, 0.01568627450980392, 0.7019607843137254, 1],
    [35, 0, 0.5686274509803921, 0.9019607843137255, 1],
    [50, 1, 0.8823529411764706, 0.45098039215686275, 1],
    [75, 0.6, 1, 0.7725490196078432, 1],
    [100, 1, 0.6313725490196078, 0.9019607843137255, 1],
    [125, 1, 0.7294117647058823, 0.5686274509803921, 1],
    [137, 1, 1, 1, 1],
    [150, 0, 0, 0, 1],
  ],
  invert: false,
  mirroringType: "off",
  initialTime: 150,
  custom: {},
  borderColoringEnabled: false,
  dynamic: {
    hexMirroringFactor: {
      t: 0,
      value: 1,
    },
    hexMirroringDistVariation: {
      t: 0,
      value: 0,
    },
    linearMirroringFactor: {
      t: 0,
      value: 1,
    },
    time: {
      t: 0,
      value: 0,
    },
    c: [
      {
        t: 0,
        value: 0.359,
      },
      {
        t: 0,
        value: 0.094,
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
      t: 5,
      range: [1, 150],
      steps: [0, 0.3, 0.7533333333333333, 1],
      transitions: [
        {
          fn: {
            t: "linear",
          },
          len: 0.5478615071283095,
        },
        {
          fn: {
            t: "linear",
          },
          len: 0.9429735234215888,
        },
        {
          fn: {
            t: "linear",
          },
          len: 0.5081649694501019,
        },
        {
          fn: {
            t: "linear",
          },
          len: 0.0010000000000000009,
        },
      ],
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
  bandSmoothing: -1,
};
