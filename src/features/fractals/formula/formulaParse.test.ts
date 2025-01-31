import { expect, test, describe } from "vitest";
import { parseFormula } from "./parseFormula";
import { CalcNode, CalcNodeType } from "@/shared/libs/calcGraph";

describe("parseFormula", () => {
  test("parses funcCall", () => {
    const calcNode = parseFormula("123 * sin(3)");

    expect(transformCalcNodeToString(calcNode));
    expect(calcNode).toMatchSnapshot();
  });

  test("parses funcCall with 2 params", () => {
    const calcNode = parseFormula("123 * pow(3, 2)");

    expect(transformCalcNodeToString(calcNode)).toMatchSnapshot();
    expect(calcNode).toMatchSnapshot();
  });
  test("parses empty string", () => {
    const calcNode = parseFormula("");

    expect(transformCalcNodeToString(calcNode)).toMatchSnapshot();

    expect(calcNode).toMatchSnapshot();
  });

  test("parses single number", () => {
    const calcNode = parseFormula("222");

    expect(transformCalcNodeToString(calcNode)).toMatchSnapshot();
    expect(calcNode).toMatchSnapshot();
  });

   test("parses single float number", () => {
    const calcNode = parseFormula("222.232");

    expect(transformCalcNodeToString(calcNode)).toMatchSnapshot();
    expect(calcNode).toMatchSnapshot();
  });

  test("parses single negative number", () => {
    const calcNode = parseFormula("-222");

    expect(transformCalcNodeToString(calcNode)).toMatchSnapshot();
    expect(calcNode).toMatchSnapshot();
  });

  test("parses single negative float number", () => {
    const calcNode = parseFormula("-222.2");

    expect(transformCalcNodeToString(calcNode)).toMatchSnapshot();
    expect(calcNode).toMatchSnapshot();
  });

  test("parses single variable", () => {
    const calcNode = parseFormula("abc");

    expect(transformCalcNodeToString(calcNode)).toMatchSnapshot();

    expect(calcNode).toMatchSnapshot();
  });

  test("parses single variable with spaces", () => {
    const calcNode = parseFormula("       abc      ");

    expect(transformCalcNodeToString(calcNode)).toMatchSnapshot();

    expect(calcNode).toMatchSnapshot();
  });

  test("parses single number with spaces", () => {
    const calcNode = parseFormula("       2323      ");

    expect(calcNode).toMatchSnapshot();
  });

  test("parses add operation with number operands", () => {
    const calcNode = parseFormula(" 123 + 456     ");

    expect(transformCalcNodeToString(calcNode)).toMatchSnapshot();

    expect(calcNode).toMatchSnapshot();
  });

  test("parses add operation with number operands, one of them negative", () => {
    const calcNode = parseFormula(" 123 + -456 ");

    expect(transformCalcNodeToString(calcNode)).toMatchSnapshot();

    expect(calcNode).toMatchSnapshot();
  });

  test("parses add operation with variable operands", () => {
    const calcNode = parseFormula(" ab + cd     ");

    expect(transformCalcNodeToString(calcNode)).toMatchSnapshot();

    expect(calcNode).toMatchSnapshot();
  });

  test("parses add operation with diffrent operands", () => {
    const calcNode = parseFormula(" 24 + cd     ");
    const calcNode1 = parseFormula(" cd + 24     ");

    expect(transformCalcNodeToString(calcNode)).toMatchSnapshot();
    expect(transformCalcNodeToString(calcNode1)).toMatchSnapshot();

    expect(calcNode).toMatchSnapshot();
    expect(calcNode1).toMatchSnapshot();
  });

  test("parses add operation minus", () => {
    const calcNode = parseFormula(" 123 - 456     ");

    expect(transformCalcNodeToString(calcNode)).toMatchSnapshot();

    expect(calcNode).toMatchSnapshot();
  });

  test("parses mul operation with number operands", () => {
    const calcNode = parseFormula(" 123 * 456     ");

    expect(transformCalcNodeToString(calcNode)).toMatchSnapshot();

    expect(calcNode).toMatchSnapshot();
  });

  test("parses mul operation with variable operands", () => {
    const calcNode = parseFormula(" ab * cd     ");

    expect(transformCalcNodeToString(calcNode)).toMatchSnapshot();

    expect(calcNode).toMatchSnapshot();
  });

  test("parses mul operation with diffrent operands", () => {
    const calcNode = parseFormula(" 24 * cd     ");
    const calcNode1 = parseFormula(" cd * 24     ");

    expect(transformCalcNodeToString(calcNode)).toMatchSnapshot();

    expect(transformCalcNodeToString(calcNode1)).toMatchSnapshot();

    expect(calcNode).toMatchSnapshot();
    expect(calcNode1).toMatchSnapshot();
  });

  test("parses mul operation division", () => {
    const calcNode = parseFormula(" 123 / 456     ");

    expect(transformCalcNodeToString(calcNode)).toMatchSnapshot();

    expect(calcNode).toMatchSnapshot();
  });

  test("parses add and mul operations with proper order of operations", () => {
    const calcNode = parseFormula(" 21 * 23 + ab  ");
    const calcNode1 = parseFormula(" 21 + 23 * ab * pow(2, z)  ");

    expect(calcNode).toMatchSnapshot();
    expect(calcNode1).toMatchSnapshot();

    expect(transformCalcNodeToString(calcNode)).toMatchSnapshot();
    expect(transformCalcNodeToString(calcNode1)).toMatchSnapshot();
  });

  test("parses add, mul and pow operations with proper order of operations", () => {
    const calcNode = parseFormula(" 21^3 * 23 + ab^2  ");
    expect(calcNode).toMatchSnapshot();

    expect(transformCalcNodeToString(calcNode)).toMatchSnapshot();
  });

  test("var in power of var", () => {
    const calcNode = parseFormula("a^a");
    expect(calcNode).toMatchSnapshot();

    expect(transformCalcNodeToString(calcNode)).eq("(a^a)");
  });

  test("throws when unknown symbol instead of operator", () => {
    let err: Error | null = null;
    try {
      parseFormula(" 21 d 23 ");
    } catch (e) {
      if (e instanceof Error) {
        err = e;
      }
    }

    expect(err).toBeTruthy();
  });
});

const transformCalcNodeToString = (node: CalcNode): string => {
  switch (node.t) {
    case CalcNodeType.Number:
      return node.v.toString();
    case CalcNodeType.Variable:
      return `${node.v}`;
    case CalcNodeType.Operation:
      return `(${transformCalcNodeToString(node.c[0])}${
        node.v
      }${transformCalcNodeToString(node.c[1])})`;
    case CalcNodeType.FuncCall:
      return `${node.n}(${node.o.map(transformCalcNodeToString).join(", ")})`;
    case CalcNodeType.Error:
      return `Error: ${node.expT}`;
  }
};
