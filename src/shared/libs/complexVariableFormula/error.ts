import { CalcNode, ErrAtCalcNode } from "@/shared/libs/complexVariableFormula";

export class ParseFormulaError extends Error {
  constructor(
    public errorAt?: ErrAtCalcNode,
    public tree?: CalcNode,
  ) {
    super();
  }

  toString() {
    return JSON.stringify(this.errorAt, undefined, 2);
  }
}
