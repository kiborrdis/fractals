// This file is auto-generated. Do not edit manually.
// Generated from markdown files in public-docs/

export interface DocEntry {
  short: string;
  hasLong: boolean;
}

export const docMap: Record<string, DocEntry> = {
  "band-smoothing": {
    short:
      "Controls smoothness of color transitions. Negative = sharp bands, positive = smooth gradients.",
    hasLong: true,
  },
  c: {
    short:
      "A fixed complex number parameter that determines the shape of Julia set fractals. Represented as a 2D vector `[real, imaginary]`.",
    hasLong: true,
  },
  "custom-variables": {
    short:
      "User-defined variables that can be referenced in your fractal formula.",
    hasLong: true,
  },
  "dist-variation": {
    short:
      "Varies parameter values based on distance from viewport center, creating spatial gradients.",
    hasLong: true,
  },
  "fractal-formula-spec": {
    short:
      "Reference for all variables and functions available in fractal formulas.",
    hasLong: true,
  },
  "fractal-formula": {
    short:
      "The mathematical expression that defines fractal iteration. Classic: `z^2 + c`",
    hasLong: true,
  },
  gradient: {
    short:
      "Color scheme that maps iteration counts to colors, creating vibrant visual patterns.",
    hasLong: true,
  },
  "hex-mirroring": {
    short: "Controls hexagonal cell size for 6-fold symmetry patterns.",
    hasLong: true,
  },
  imaginary: {
    short:
      "The vertical axis component of a complex number, controlling position along the imaginary axis.",
    hasLong: true,
  },
  "initial-time": {
    short:
      "The starting value of the time variable at the beginning of your animation.",
    hasLong: true,
  },
  "iterations-gradient": {
    short:
      "Controls how iteration counts are mapped to colors in your gradient.",
    hasLong: true,
  },
  "linear-mirroring": {
    short:
      "Controls spacing between mirror reflections in square symmetry mode.",
    hasLong: true,
  },
  "max-iterations": {
    short:
      "Maximum number of formula iterations per pixel. Higher = more detail but slower. Typical range: 50-500.",
    hasLong: true,
  },
  "mirroring-type": {
    short:
      "Creates symmetric patterns by mirroring the fractal. Options: Off, Square, Hex, Radial.",
    hasLong: true,
  },
  r: {
    short:
      "The boundary value beyond which a point is considered to have escaped to infinity. Typical values: 2-4.",
    hasLong: true,
  },
  "radial-mirroring": {
    short:
      "Angular spacing (degrees) for radial symmetry. 60° = 6-fold, 45° = 8-fold, 90° = 4-fold.",
    hasLong: true,
  },
  "range-rule": {
    short:
      "Oscillates a value between min/max over a time period using smooth transitions.",
    hasLong: true,
  },
  real: {
    short:
      "The horizontal axis component of a complex number, controlling position along the real axis.",
    hasLong: true,
  },
  "separate-vector-rule": {
    short:
      "Define separate rules for X and Y components instead of as a single 2D vector.",
    hasLong: true,
  },
  "spline-vector-rule": {
    short:
      "Smooth curves through control points using B-spline interpolation for organic motion paths.",
    hasLong: true,
  },
  "static-rule": {
    short:
      "A fixed numeric value that doesn't change over time. Simplest rule type.",
    hasLong: true,
  },
  "steps-vector-rule": {
    short:
      "Define custom animation sequences with discrete steps and transition functions.",
    hasLong: true,
  },
  time: {
    short:
      "Dynamic variable for creating animated fractals. Reference as `time` in formulas.",
    hasLong: true,
  },
} as const;
