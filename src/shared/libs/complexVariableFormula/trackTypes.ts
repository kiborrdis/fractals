import { CalcNode, CalcNodeType } from "./CalcNode";
import { CalcNodeResultType, CalcNodeResultTypeMap } from "./types";
import { funcNameToSignature, varNameToType } from "./fnAndVarDescr";
import { forEachNodeChild } from "./utils";

const isReal = (node: CalcNode): boolean => {
  return node.t === CalcNodeType.Number && node.im === 0;
};

export const calcTypesOfNodes = (
  calcNode: CalcNode,
  customVars: Record<string, CalcNodeResultType> = {},
): CalcNodeResultTypeMap => {
  const map: CalcNodeResultTypeMap = new Map();
  forEachNodeChild(
    calcNode,
    (node) => {
      const nodeType = getTypeForNode(node, map, {
        ...customVars,
        ...varNameToType,
      });

      map.set(node, nodeType);
    },
    { parentAfterChildren: true },
  );

  return map;
};

const getTypeForNode = (
  node: CalcNode,
  map: CalcNodeResultTypeMap,
  vars: Record<string, CalcNodeResultType>,
): CalcNodeResultType => {
  switch (node.t) {
    case CalcNodeType.Number:
      if (isReal(node)) {
        return "number";
      }

      return "vector2";
    case CalcNodeType.Variable:
      return vars[node.v] ?? "error";
    case CalcNodeType.FuncCall: {
      const signature = funcNameToSignature[node.n];

      if (
        !signature ||
        node.o.length !== signature.params.length ||
        !node.o.every((pnode, i) => {
          if (!map.has(pnode) || map.get(pnode) === "error") {
            return false;
          }

          // We accept numbers to vector parameters, but not the opposite
          if (signature.params[i] === "vector2") {
            return true;
          }

          return map.get(pnode) === signature.params[i];
        })
      ) {
        return "error";
      }

      return signature.return;
    }
    case CalcNodeType.Operation: {
      const leftP = map.get(node.c[0]);
      const rightP = map.get(node.c[1]);

      if (!leftP || leftP === "error" || !rightP || rightP === "error") {
        return "error";
      }

      if (
        node.v === "^" ||
        node.v === "+" ||
        node.v === "-" ||
        node.v === "/" ||
        node.v === "*"
      ) {
        if (leftP === rightP) {
          return leftP;
        }

        if (leftP === "number" && rightP === "vector2" && isReal(node.c[1])) {
          return "number";
        }

        if (rightP === "number" && leftP === "vector2" && isReal(node.c[0])) {
          return "number";
        }

        return "vector2";
      }

      return "error";
    }
    case CalcNodeType.Error:
      return "error";
    default:
      return "error";
  }
};
