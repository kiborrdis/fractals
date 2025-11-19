import { CalcNode, CalcNodeError, CalcNodeNumber, CalcNodeType, forEachNodeChild, ParseFormulaError, skipSpaces } from "@/shared/libs/parseFormula";
import { funcNameToSignature, varNameToType } from "./fnAndVarDescr";
import { rootRule } from "./rules";

export const parseFormula = (formula: string) => {
  if (formula.trim() === "") {
    return {
      t: CalcNodeType.Number,
      v: 0,
      r: [0, 0],
    } as CalcNodeNumber;
  }

  const [node, matchContext] = rootRule.transform({
    lastIndex: 0,
    matched: false,
    str: formula,
    depth: "",
  });

  const errors: CalcNodeError[] = [];

  if (node) {
    forEachNodeChild(node, (node) => {
      if (node.t === CalcNodeType.Error) {
        errors.push(node);
      }
    });
  }

  if (
    !node ||
    errors.length > 0 ||
    skipSpaces(formula, matchContext.lastIndex) !== formula.length
  ) {
    throw new ParseFormulaError(undefined, node);
  }

  return node;
};

const allowedVars = new Set(Object.keys(varNameToType));
const allowedFns = new Set(Object.keys(funcNameToSignature));

export const validateFormula = (node: CalcNode) => {
  let message = '';
  forEachNodeChild(node, node => {
    if (message) {
      return;
    }

    if (node.t == CalcNodeType.Variable && !allowedVars.has(node.v)) {
      message = `Unknown variable "${node.v}", only ${[...allowedVars].join(', ')} are allowed`;
    } else if (node.t == CalcNodeType.FuncCall && !allowedFns.has(node.n)) {
      message = `Unknown variable "${node.n}", only ${[...allowedFns].join(', ')} are allowed`;
    }
  });

  return [!message, message] as const;
}