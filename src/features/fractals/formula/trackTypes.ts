import { CalcNode, CalcNodeType, forEachNodeChild } from "@/shared/libs/calcGraph";
import { CalcNodeResultType, CalcNodeResultTypeMap } from "./types";
import { funcNameToSignature, varNameToType } from "./fnAndVarDescr";

export const calcTypesOfNodes = (
  calcNode: CalcNode,
  customVars: Record<string, CalcNodeResultType> = {}
): CalcNodeResultTypeMap => {
  const map: CalcNodeResultTypeMap = new Map();
  forEachNodeChild(calcNode, (node) => {
    const nodeType = getTypeForNode(node, map, { ...customVars, ...varNameToType });

    map.set(node, nodeType);
  }, { parentAfterChildren: true });

  return map;
};

const getTypeForNode = (node: CalcNode, map: CalcNodeResultTypeMap, vars: Record<string, CalcNodeResultType>): CalcNodeResultType => {
  switch (node.t) {
    case CalcNodeType.Number:
      return "number";
    case CalcNodeType.Variable:
      return vars[node.v] ?? "error";
    case CalcNodeType.FuncCall: {
      const signature = funcNameToSignature[node.n];

      if (
        !signature ||
        node.o.length !== signature.params.length ||
        !node.o.every((pnode, i) => {
          if (!map.has(pnode) && map.get(pnode) !== "error") {
            return false;
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

      if (node.v === "^") {
        if (rightP === "vector2") {
          return "error";
        }

        if (leftP === "vector2") {
          return "vector2";
        }

        return "number";
      } 

      if (node.v === '+' || node.v === '-' || node.v === '/' || node.v === '*') {
        if (leftP === 'number' && leftP === rightP) {
          return 'number';
        }

        return 'vector2';
      }

      return "error";
    }
    case CalcNodeType.Error:
      return "error";
    default:
      return "error";
  }
};

