import { CalcNode, CalcNodeType } from "./CalcNode";

export const forEachNodeChild = (
  node: CalcNode,
  cb: (node: CalcNode) => void,
  options: {
    parentAfterChildren?: boolean;
  } = {}
) => {
  if (!options.parentAfterChildren) {
    cb(node);
  }

  if (node.t === CalcNodeType.Operation) {
    forEachNodeChild(node.c[0], cb, options);
    forEachNodeChild(node.c[1], cb, options);
  } else if (node.t === CalcNodeType.FuncCall) {
    for (const child of node.o) {
      forEachNodeChild(child, cb, options);
    }
  }

  if (options.parentAfterChildren) {
    cb(node);
  }
};
