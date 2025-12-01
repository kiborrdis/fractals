import { ConvertToRule } from "@/shared/libs/numberRule";
import { Vector2, Vector4 } from "@/shared/libs/vectors";

export type RGBAVector = Vector4;

export type FractalParams = {
  invert: boolean;

  formula: string;
  gradient: GradientStop[],

  mirroringType: 'off' | 'hex' | 'square';

  dynamic: FractalDynamicParams;
}

export type FractalDynamicParams = {
  hexMirroringFactor: number;
  hexMirroringPerDistChange: Vector2;
  linearMirroringFactor: number;
  radialMirroringAngle: number;
  time: number;
  c: Vector2;
  r: number;
  rlVisibleRange: Vector2;
  imVisibleRange: Vector2;
  maxIterations: number;
  linearMirroringPerDistChange: Vector2;
  radialMirroringPerDistChange: Vector2;
  cxPerDistChange: Vector2;
  cyPerDistChange: Vector2;
  rPerDistChange: Vector2;
  iterationsPerDistChange: Vector2;
};

export type GradientStop = [
  number, // Position 0-1, following by r,g,b,a
  number,
  number,
  number,
  number
];

export type FractalDynamicParamsBuildRules = {
  [K in keyof FractalDynamicParams]: ConvertToRule<FractalDynamicParams[K]>;
};

export type FractalParamsBuildRules = Omit<FractalParams, 'dynamic'> & {
  dynamic: FractalDynamicParamsBuildRules;
};

