import { Vector2, RGBAVector } from "./fractals";
import { convertScreenCoordToSpace } from "./utils";

export class JuliaSetRenderer {
  public maxIterations: number = 0;
  public screenSize: Vector2 = [0, 0];

  public juliaSet: JuliaSet;
  public maxIntensityPoints: Vector2[] = [];
  public maxIntensity: number = 0;
  public numberOfOverflows: number = 0;
  public renderedNumber: number = 0;

  public colorConverter: (
    iteration: number,
    iterationsLimit: number,
    point: Vector2
  ) => RGBAVector;

  constructor({
    maxIterations,
    screenSize, //[number, number]
    juliaSet,
    colorConverter,
  }: {
    maxIterations: number;
    screenSize: Vector2;
    juliaSet: JuliaSet;
    colorConverter: (
      iteration: number,
      iterationsLimit: number,
      point: Vector2
    ) => RGBAVector;
  }) {
    this.maxIterations = maxIterations;
    this.screenSize = screenSize;
    this.colorConverter = colorConverter;
    this.juliaSet = juliaSet;
  }

  clearIntensity() {
    this.maxIntensity = 0;
    this.maxIntensityPoints = [];
    this.numberOfOverflows = 0;
    this.renderedNumber = 0;
  }

  getPixelColor(coords: Vector2): { color: RGBAVector; overflowed: boolean } {
    const iterations = this.juliaSet.iteratePoint(coords);

    const candidate = iterations === -1 ? this.maxIterations : iterations;
    if (candidate > this.maxIntensity) {
      this.maxIntensity = candidate;
      this.maxIntensityPoints = [coords];
    } else if (candidate === this.maxIntensity) {
      this.maxIntensityPoints.push(coords);
    }

    if (iterations === -1) {
      this.numberOfOverflows += 1;
    } else {
      this.renderedNumber += 1;
    }

    return {
      color: this.colorConverter(iterations, this.maxIterations, coords),
      overflowed: iterations === -1,
    };
  }
}

export type JuliaSetParams = {
  maxIterations: number;
  midPoint: Vector2;
  R: number;
  screenSize: Vector2;
  scale: number;
  c: Vector2;
};

export class JuliaSet {
  public maxIterations: number = 0;
  public midPoint: Vector2 = [0, 0];
  public R: number = 100;
  public screenSize: Vector2 = [0, 0];
  public scale: number = 1;
  public c: Vector2 = [0, 0];

  constructor({
    maxIterations,
    midPoint,
    R,
    screenSize,
    scale,
    c,
  }: {
    maxIterations: number;
    midPoint: Vector2;
    R: number;
    screenSize: Vector2;
    scale: number;
    c: Vector2;
  }) {
    this.maxIterations = maxIterations;
    this.midPoint = midPoint;
    this.R = R;
    this.screenSize = screenSize;
    this.scale = scale;
    this.c = c;
  }

  iteratePoint(coords: Vector2) {
    let zx = convertScreenCoordToSpace(
      coords[0],
      this.screenSize[0],
      this.midPoint[0],
      this.R,
      this.scale
    );
    let zy = convertScreenCoordToSpace(
      coords[1],
      this.screenSize[1],
      this.midPoint[1],
      this.R,
      this.scale
    );

    const [cx, cy] = this.c;

    let iteration = 0;

    let zxSqr = Math.pow(zx, 2);
    let zySqr = Math.pow(zy, 2);
    let RSqr = Math.pow(this.R, 2);

    while (zxSqr + zySqr < RSqr && iteration < this.maxIterations) {
      zy = 2 * zx * zy + cy;
      zx = zxSqr - zySqr + cx;

      zxSqr = Math.pow(zx, 2);
      zySqr = Math.pow(zy, 2);

      iteration = iteration + 1;
    }

    if (iteration == this.maxIterations) {
      return -1;
    } else {
      return iteration;
    }
  }
}
