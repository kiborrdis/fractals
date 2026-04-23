import { describe, expect, test } from "vitest";
import { calcTypesOfNodes } from "./trackTypes";
import { parseFormula } from "./parseFormula";
import { CalcNodeResultType } from "./types";

const inferType = (
  formula: string,
  customVars: Record<string, CalcNodeResultType> = {},
): CalcNodeResultType => {
  const root = parseFormula(formula);
  const map = calcTypesOfNodes(root, customVars);
  const rootType = map.get(root);

  if (!rootType) {
    throw new Error("Root node type was not inferred");
  }

  return rootType;
};

const operators = ["+", "-", "*", "/", "^"] as const;

describe("calcTypesOfNodes", () => {
  describe("operations", () => {
    test.each(operators)("returns number for number %s number", (operator) => {
      expect(
        inferType(`left${operator}right`, {
          left: "number",
          right: "number",
        }),
      ).toBe("number");
    });

    test.each(operators)(
      "returns vector2 for vector2 %s number",
      (operator) => {
        expect(
          inferType(`left${operator}right`, {
            left: "vector2",
            right: "number",
          }),
        ).toBe("vector2");
      },
    );

    test.each(operators)(
      "returns vector2 for number %s vector2",
      (operator) => {
        expect(
          inferType(`left${operator}right`, {
            left: "number",
            right: "vector2",
          }),
        ).toBe("vector2");
      },
    );

    test.each(operators)(
      "returns vector2 for vector2 %s vector2",
      (operator) => {
        expect(
          inferType(`left${operator}right`, {
            left: "vector2",
            right: "vector2",
          }),
        ).toBe("vector2");
      },
    );

    test.each(operators)(
      "returns error when left operand is invalid for %s",
      (operator) => {
        expect(
          inferType(`unknown${operator}right`, {
            right: "number",
          }),
        ).toBe("error");
      },
    );

    test.each(operators)(
      "returns error when right operand is invalid for %s",
      (operator) => {
        expect(
          inferType(`left${operator}unknown`, {
            left: "number",
          }),
        ).toBe("error");
      },
    );
  });

  test("returns number for number node without imaginary part", () => {
    expect(inferType("42")).toBe("number");
  });

  test("returns vector2 for number node with imaginary part", () => {
    expect(inferType("1i")).toBe("vector2");
  });

  describe("function call argument types", () => {
    test("allows passing number to vector2 parameter", () => {
      expect(
        inferType("log(value)", {
          value: "number",
        }),
      ).toBe("vector2");
    });

    test("rejects passing vector2 to number parameter", () => {
      expect(
        inferType("abs(value)", {
          value: "vector2",
        }),
      ).toBe("error");
    });

    test("returns error for wrong number of arguments", () => {
      expect(
        inferType("rotate(value)", {
          value: "number",
        }),
      ).toBe("error");
    });

    test("returns error when second parameter of rotate is not a number", () => {
      expect(
        inferType("rotate(a, b)", {
          a: "number",
          b: "vector2",
        }),
      ).toBe("error");
    });

    test("returns error for unknown function", () => {
      expect(
        inferType("unknownFn(value)", {
          value: "number",
        }),
      ).toBe("error");
    });
  });
});
