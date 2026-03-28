// This file is auto-generated. Do not edit manually.
// Generated from markdown files in public-docs/

export interface DocEntry {
  short: string;
  hasLong: boolean;
}

export const docMap: Record<string, DocEntry> = {
  "band-smoothing": {
    "short": "Controls smoothness of color transitions. Negative = sharp bands, positive = smooth gradients.",
    "hasLong": true
  },
  "border-distance-multiplier": {
    "short": "Scales the escape distance before applying border coloring. Higher values create sharper, more visible borders. Range: 0–1,000,000.",
    "hasLong": true
  },
  "c": {
    "short": "A fixed complex number parameter that determines the shape of Julia set fractals. Represented as a 2D vector `[real, imaginary]`.",
    "hasLong": true
  },
  "coloring-border": {
    "short": "Colors the fractal based on distance to the escape boundary using distance estimation. Creates glowing edge effects around the fractal set.",
    "hasLong": true
  },
  "coloring-gradient": {
    "short": "Colors the fractal by mapping iteration counts to a color gradient. The primary coloring method for creating vibrant fractal images.",
    "hasLong": true
  },
  "coloring-trap": {
    "short": "Trap coloring is a technique that uses the distance to predefined shapes (traps) to determine the color of each point in the fractal. By defining different trap shapes and their corresponding colors, you can create unique and intricate coloring effects that enhance the visual appeal of your fractals.",
    "hasLong": true
  },
  "custom-variables": {
    "short": "User-defined variables that can be referenced in your fractal formula.",
    "hasLong": true
  },
  "dist-variation": {
    "short": "Varies parameter values based on distance from viewport center, creating spatial gradients.",
    "hasLong": true
  },
  "fractal-formula-spec": {
    "short": "Reference for all variables and functions available in fractal formulas.",
    "hasLong": true
  },
  "fractal-formula": {
    "short": "The mathematical expression that defines fractal iteration. Classic: `z^2 + c`",
    "hasLong": true
  },
  "gradient": {
    "short": "Color scheme that maps iteration counts to colors, creating vibrant visual patterns.",
    "hasLong": true
  },
  "graph-map-edit": {
    "short": "Edit the complex constant C directly on a live fractal preview. Click to set values, hover to preview.",
    "hasLong": true
  },
  "graph-new-spline": {
    "short": "Draw a new B-spline curve from scratch by clicking control points on the graph.",
    "hasLong": true
  },
  "graph-sep-dims": {
    "short": "Graph editor for 2D parameters with separate X and Y dimension controls. Click on the graph to set values, hover to preview.",
    "hasLong": true
  },
  "graph-spline": {
    "short": "Graph editor for B-spline curves. Add, move, or delete control points to shape smooth animation paths.",
    "hasLong": true
  },
  "graph-step-rule": {
    "short": "Graph editor for step-based animation rules. Visualize and edit discrete step points with configurable transitions.",
    "hasLong": true
  },
  "hex-mirroring": {
    "short": "Controls hexagonal cell size for 6-fold symmetry patterns.",
    "hasLong": true
  },
  "imaginary": {
    "short": "The vertical axis component of a complex number, controlling position along the imaginary axis.",
    "hasLong": true
  },
  "initial-time": {
    "short": "The starting value of the time variable at the beginning of your animation.",
    "hasLong": true
  },
  "iterations-gradient": {
    "short": "Controls how iteration counts are mapped to colors in your gradient.",
    "hasLong": true
  },
  "linear-mirroring": {
    "short": "Controls spacing between mirror reflections in square symmetry mode.",
    "hasLong": true
  },
  "main-content-area": {
    "short": "The main fractal viewport where the fractal is rendered. Includes pan, zoom, and area selection controls.",
    "hasLong": true
  },
  "max-iterations": {
    "short": "Maximum number of formula iterations per pixel. Higher = more detail but slower. Typical range: 50-500.",
    "hasLong": true
  },
  "mirroring-type": {
    "short": "Creates symmetric patterns by mirroring the fractal. Options: Off, Square, Hex, Radial.",
    "hasLong": true
  },
  "r": {
    "short": "The boundary value beyond which a point is considered to have escaped to infinity. Typical values: 2-4.",
    "hasLong": true
  },
  "radial-mirroring": {
    "short": "Angular spacing (degrees) for radial symmetry. 60° = 6-fold, 45° = 8-fold, 90° = 4-fold.",
    "hasLong": true
  },
  "range-rule": {
    "short": "Oscillates a value between min/max over a time period using smooth transitions.",
    "hasLong": true
  },
  "real": {
    "short": "The horizontal axis component of a complex number, controlling position along the real axis.",
    "hasLong": true
  },
  "recording-duration": {
    "short": "Length of the exported video in seconds. Range: 1–300 seconds. Determines total frames rendered (FPS × duration).",
    "hasLong": true
  },
  "recording-fps": {
    "short": "Frame rate for the exported video. Options: 24, 30, or 60 frames per second.",
    "hasLong": true
  },
  "recording-mode": {
    "short": "Switches the editor into a dedicated video recording interface for exporting fractal animations as video files.",
    "hasLong": true
  },
  "recording-resolution": {
    "short": "Output video dimensions in pixels. Choose a preset (1080p, 720p, 480p, etc.) or enter custom width and height.",
    "hasLong": true
  },
  "recording-start-time": {
    "short": "The point in the animation timeline where the recording begins, in seconds. Range: 0–3600.",
    "hasLong": true
  },
  "recording-timeline": {
    "short": "Read-only timeline showing all parameter animations with the recording window highlighted. Hover to preview values at any point in time.",
    "hasLong": true
  },
  "separate-vector-rule": {
    "short": "Define separate rules for X and Y components instead of as a single 2D vector.",
    "hasLong": true
  },
  "spline-vector-rule": {
    "short": "Smooth curves through control points using B-spline interpolation for organic motion paths.",
    "hasLong": true
  },
  "static-rule": {
    "short": "A fixed numeric value that doesn't change over time. Simplest rule type.",
    "hasLong": true
  },
  "steps-vector-rule": {
    "short": "Define custom animation sequences with discrete steps and transition functions.",
    "hasLong": true
  },
  "supersampling": {
    "short": "Anti-aliasing quality level. Renders multiple samples per pixel and averages them for smoother edges. Higher values = better quality but slower. Options: 1x (off), 4x, 8x, 16x, 32x.",
    "hasLong": true
  },
  "time": {
    "short": "Dynamic variable for creating animated fractals. Reference as `time` in formulas.",
    "hasLong": true
  },
  "timeline-tool": {
    "short": "Animation timeline editor for creating and modifying parameter animations over time. View, add, and edit animation keyframes.",
    "hasLong": true
  },
  "trap-distance-multiplier": {
    "short": "Scales trap distance values before mapping to the gradient. Higher values intensify the trap coloring effect. Range: 0–1,000,000.",
    "hasLong": true
  },
  "trap-edit-mode": {
    "short": "Visual editing mode for positioning and modifying trap shapes directly on the fractal viewport.",
    "hasLong": true
  },
  "trap-edit-sidebar": {
    "short": "Sidebar panel for managing trap shapes. View the trap list, add or remove traps, and toggle the visual trap editing mode.",
    "hasLong": true
  },
  "trap-gradient": {
    "short": "Separate color gradient for mapping orbit trap distances to colors. Position stops correspond to distance values rather than iteration counts.",
    "hasLong": true
  }
} as const;
