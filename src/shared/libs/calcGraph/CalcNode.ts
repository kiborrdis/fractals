
export enum CalcNodeType {
  Operation = 1,
  Variable = 2,
  Number = 3,
  FuncCall = 4,

  Error = 256
}

export type CalcNode = CalcNodeError |
  CalcNodeOperation |
  CalcNodeVariable |
  CalcNodeNumber |
  CalcNodeFuncCall;

export type CalcNodeNumber = {
  /**
   * @description Parent node
   */
  p?: CalcNode;
  t: CalcNodeType.Number;
  /**
   * @description Value of number token
   */
  v: number;
  /**
   * @description index range of number token in original string
   */
  r: readonly [number, number];
};

export type CalcNodeFuncCall = {
  p?: CalcNode;
  t: CalcNodeType.FuncCall;
  /**
   * @description Name of function
   */
  n: string,
  /**
   * @description Arguments of function
   */
  o: (CalcNodeNumber | CalcNodeVariable | CalcNodeOperation | CalcNodeError | CalcNodeFuncCall)[];
  /**
   * @description Range of function name
   */
  r: readonly [number, number];
};

export type CalcNodeVariable = {
  p?: CalcNode;
  
  t: CalcNodeType.Variable;
  /**
   * @description Variable name
   */
  v: string;
  /**
   * @description Range of variable name
   */
  r: readonly [number, number];
};

export type CalcNodeOperation = {
  p?: CalcNode;
  t: CalcNodeType.Operation;
  /**
   * @description Operation type
   */
  v: string;
  /**
   * @description Operation arguments
   */
  c: [CalcNode, CalcNode];
  /**
   * @description Range of operation in the original string
   */
  r: readonly [number, number];
};

export type CalcNodeError = {
  p?: CalcNode;
  t: CalcNodeType.Error;
  expT: CalcNodeType;
  r: [number, number];
};

export type ErrAtCalcNode = {
  t: CalcNodeType;
  range: [number, number];
};

export type DraftOpNode = {
  t: CalcNodeType.Operation;
  v: string;
  r: [number, number];
};
