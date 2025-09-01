import { CalcNode, CalcNodeType, ErrAtCalcNode } from "./CalcNode";

export const forEachNodeChild = (
  node: CalcNode,
  cb: (node: CalcNode) => void
) => {
  cb(node);

  if (node.t === CalcNodeType.Operation) {
    forEachNodeChild(node.c[0], cb);
    forEachNodeChild(node.c[1], cb);
  } else if (node.t === CalcNodeType.FuncCall) {
    for (const child of node.o) {
      forEachNodeChild(child, cb);
    }
  }
};

export function skipSpaces(formula: string, startIndex: number): number {
  while (/\s/.test(formula[startIndex])) {
    startIndex += 1;
  }

  return startIndex;
}

export class ParseFormulaError extends Error {
  constructor(public errorAt?: ErrAtCalcNode, public tree?: CalcNode) {
    super();
  }

  toString() {
    return JSON.stringify(this.errorAt, undefined, 2);
  }
}
