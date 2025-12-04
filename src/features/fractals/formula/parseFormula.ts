import {
  CalcNode,
  CalcNodeError,
  CalcNodeNumber,
  CalcNodeType,
  forEachNodeChild,
} from "@/shared/libs/calcGraph";
import { funcNameToSignature, varNameToType } from "./fnAndVarDescr";
import { formulaGrammar } from "./grammar";
import { ParseFormulaError } from "./error";
import { GrammarParser } from "@/shared/libs/parseFormula";

export const parseFormula = (formula: string) => {
  if (formula.trim() === "") {
    return {
      t: CalcNodeType.Number,
      v: 0,
      r: [0, 0],
    } as CalcNodeNumber;
  }
  const parser = new GrammarParser(formulaGrammar);
  const [node] = parser.parse(formula);

  const errors: CalcNodeError[] = [];

  if (node) {
    forEachNodeChild(node, (node) => {
      if (node.t === CalcNodeType.Error) {
        errors.push(node);
      }
    });
  }

  if (!node || errors.length > 0) {
    throw new ParseFormulaError(undefined, node ?? undefined);
  }

  return node;
};

const allowedVars = new Set(Object.keys(varNameToType));
const allowedFns = new Set(Object.keys(funcNameToSignature));

export const validateFormula = (
  node: CalcNode,
  customVars: Set<string> = new Set(),
) => {
  let message = "";
  forEachNodeChild(node, (node) => {
    if (message) {
      return;
    }

    if (
      node.t == CalcNodeType.Variable &&
      !allowedVars.has(node.v) &&
      !customVars.has(node.v)
    ) {
      message = `Unknown variable "${node.v}", only ${[...allowedVars, ...customVars].join(", ")} are allowed`;
    } else if (node.t == CalcNodeType.FuncCall && !allowedFns.has(node.n)) {
      message = `Unknown variable "${node.n}", only ${[...allowedFns, ...customVars].join(", ")} are allowed`;
    }
  });

  return [!message, message] as const;
};
