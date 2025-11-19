export type Vector2 = [number, number];
export type Vector3 = [number, number, number];
export type Vector4 = [number, number, number, number];
export type RGBAVector = Vector4;

export type FractalParams = {
  formula: string;
  gradient: GradientStop[],

  mirroringType: 'off' | 'hex' | 'square';

  dynamic: FractalDynamicParams;
}

export type FractalDynamicParams = {
  invert: boolean;
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

export enum RuleType {
  StaticNumber = 0,
  RangeNumber = 1,
  ConstBoolean = 2,
  StaticGradient = 3,

  PatchNumber = 4,
  StepNumber = 5,
}

export type ConstBooleanRule = {
  t: RuleType.ConstBoolean;
  value: boolean;
};

export type StaticNumberRule = {
  t: RuleType.StaticNumber;
  value: number;
};


export type RangeNumberRule = {
  t: RuleType.RangeNumber;
  range: Vector2;
  cycleSeconds: number;
  phaseSeconds: number;
};

export type PatchNumberRule = {
  t: RuleType.PatchNumber;
  patches: {
    fn: 'sin' | 'lin',
    range: Vector2,
    len: number,
    phase: number,
    cycle: number,
  }[],
};

export type StepNumberRule = {
  t: RuleType.StepNumber;
  range: Vector2;
  steps: number[];
  transitions: StepTransition[];
};

export type StepTransition = {
  fn: StepTransitionFn;
  /**
   * Transition length in seconds
   */
  len: number;
}

export type StepTransitionFnType = StepTransitionFn['t'];

export type StepTransitionFn = {
  t: 'linear' | 't' | 'easeInSine' | 'easeOutSine' | 'easeInOutSine' | 'easeInOutElastic';
  data?: never;
}

export type NumberBuildRule = StaticNumberRule | RangeNumberRule | PatchNumberRule | StepNumberRule;

export type ConvertToRule<
  I extends boolean | number | number[]
> = I extends number
  ? NumberBuildRule
  : I extends boolean
  ? ConstBooleanRule
  : I extends [infer F, ...infer Rest]
  ? [
      F extends number ? ConvertToRule<F> : never,
      ...(Rest extends number[] ? ConvertToRule<Rest> : [])
    ]
  : [];

export type ConvertToBuildResult<
  R extends
    | ConstBooleanRule
    | NumberBuildRule
    | NumberBuildRule[]
    
> = R extends NumberBuildRule
  ? number
  : R extends boolean
  ? boolean
  : R extends [infer F, ...infer Rest]
  ? [
      F extends NumberBuildRule ? number : never,
      ...(Rest extends NumberBuildRule[] ? ConvertToBuildResult<Rest> : [])
    ]
  : [];

export type FractalDynamicParamsBuildRules = {
  [K in keyof FractalDynamicParams]: ConvertToRule<FractalDynamicParams[K]>;
};

export type FractalParamsBuildRules = Omit<FractalParams, 'dynamic'> & {
  dynamic: FractalDynamicParamsBuildRules;
};

