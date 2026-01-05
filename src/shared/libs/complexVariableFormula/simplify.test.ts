import { expect, test, describe } from "vitest";
import { CalcNode, CalcNodeType } from "@/shared/libs/complexVariableFormula";
import { simplify } from "./simplify";
import { parseFormula } from "./parseFormula";

const simplifyFormula = (formula: string): CalcNode => {
  const node = simplify(parseFormula(formula));

  return node;
};

const transformCalcNodeToString = (node: CalcNode): string => {
  switch (node.t) {
    case CalcNodeType.Number:
      if (node.im === 0) {
        return node.re.toString();
      } else if (node.re === 0) {
        return `${node.im}i`;
      } else {
        return `${node.re}+${node.im}i`;
      }
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

describe("simplify", () => {
  describe("addition", () => {
    test("number + number", () => {
      const result = simplifyFormula("2+3");
      expect(transformCalcNodeToString(result)).toBe("5");
    });

    test("variable + 0", () => {
      const result = simplifyFormula("z+0");
      expect(transformCalcNodeToString(result)).toBe("z");
    });

    test("0 + variable", () => {
      const result = simplifyFormula("0+z");
      expect(transformCalcNodeToString(result)).toBe("z");
    });

    test("complex expression + 0", () => {
      const result = simplifyFormula("(z+1)+0");
      expect(transformCalcNodeToString(result)).toBe("(z+1)");
    });

    test("0 + complex expression", () => {
      const result = simplifyFormula("0+(z*2)");
      expect(transformCalcNodeToString(result)).toBe("(z*2)");
    });
  });

  describe("subtraction", () => {
    test("number - number", () => {
      const result = simplifyFormula("5-3");
      expect(transformCalcNodeToString(result)).toBe("2");
    });

    test("variable - 0", () => {
      const result = simplifyFormula("z-0");
      expect(transformCalcNodeToString(result)).toBe("z");
    });

    test("0 - number", () => {
      const result = simplifyFormula("0-5");
      expect(transformCalcNodeToString(result)).toBe("-5");
    });

    test("0 - variable", () => {
      const result = simplifyFormula("0-z");
      expect(transformCalcNodeToString(result)).toBe("(-1*z)");
    });

    test("negative number subtraction", () => {
      const result = simplifyFormula("10-3");
      expect(transformCalcNodeToString(result)).toBe("7");
    });
  });

  describe("multiplication", () => {
    test("number * number", () => {
      const result = simplifyFormula("2*3");
      expect(transformCalcNodeToString(result)).toBe("6");
    });

    test("variable * 0", () => {
      const result = simplifyFormula("z*0");
      expect(transformCalcNodeToString(result)).toBe("0");
    });

    test("0 * variable", () => {
      const result = simplifyFormula("0*z");
      expect(transformCalcNodeToString(result)).toBe("0");
    });

    test("variable * 1", () => {
      const result = simplifyFormula("z*1");
      expect(transformCalcNodeToString(result)).toBe("z");
    });

    test("1 * variable", () => {
      const result = simplifyFormula("1*z");
      expect(transformCalcNodeToString(result)).toBe("z");
    });

    test("complex * 0", () => {
      const result = simplifyFormula("(z+1)*0");
      expect(transformCalcNodeToString(result)).toBe("0");
    });

    test("0 * complex", () => {
      const result = simplifyFormula("0*(z^2)");
      expect(transformCalcNodeToString(result)).toBe("0");
    });

    test("complex * 1", () => {
      const result = simplifyFormula("(z+1)*1");
      expect(transformCalcNodeToString(result)).toBe("(z+1)");
    });

    test("1 * complex", () => {
      const result = simplifyFormula("1*(z*2)");
      expect(transformCalcNodeToString(result)).toBe("(z*2)");
    });
  });

  describe("division", () => {
    test("number / number", () => {
      const result = simplifyFormula("6/2");
      expect(transformCalcNodeToString(result)).toBe("3");
    });

    test("0 / variable", () => {
      const result = simplifyFormula("0/z");
      expect(transformCalcNodeToString(result)).toBe("0");
    });

    test("variable / 1", () => {
      const result = simplifyFormula("z/1");
      expect(transformCalcNodeToString(result)).toBe("z");
    });

    test("complex / 1", () => {
      const result = simplifyFormula("(z+1)/1");
      expect(transformCalcNodeToString(result)).toBe("(z+1)");
    });

    test("division with decimals", () => {
      const result = simplifyFormula("5/2");
      expect(transformCalcNodeToString(result)).toBe("2.5");
    });
  });

  describe("power", () => {
    test("number ^ number", () => {
      const result = simplifyFormula("2^3");
      expect(transformCalcNodeToString(result)).toBe("8");
    });

    test("variable ^ 0", () => {
      const result = simplifyFormula("z^0");
      expect(transformCalcNodeToString(result)).toBe("1");
    });

    test("variable ^ 1", () => {
      const result = simplifyFormula("z^1");
      expect(transformCalcNodeToString(result)).toBe("z");
    });

    test("complex ^ 0", () => {
      const result = simplifyFormula("(z+1)^0");
      expect(transformCalcNodeToString(result)).toBe("1");
    });

    test("complex ^ 1", () => {
      const result = simplifyFormula("(z*2)^1");
      expect(transformCalcNodeToString(result)).toBe("(z*2)");
    });

    test("0 ^ positive number", () => {
      const result = simplifyFormula("0^5");
      expect(transformCalcNodeToString(result)).toBe("0");
    });

    test("1 ^ any number", () => {
      const result = simplifyFormula("1^100");
      expect(transformCalcNodeToString(result)).toBe("1");
    });
  });

  describe("nested simplifications", () => {
    test("nested additions with zeros", () => {
      const result = simplifyFormula("(0+z)+0");
      expect(transformCalcNodeToString(result)).toBe("z");
    });

    test("nested multiplications with 1", () => {
      const result = simplifyFormula("(z*1)*1");
      expect(transformCalcNodeToString(result)).toBe("z");
    });

    test("mixed operations", () => {
      const result = simplifyFormula("(z*1)+(0+2)");
      expect(transformCalcNodeToString(result)).toBe("(z+2)");
    });

    test("complex nested", () => {
      const result = simplifyFormula("((z+0)*(z^1))/1");
      expect(transformCalcNodeToString(result)).toBe("(z*z)");
    });
  });

  describe("function calls", () => {
    test("function with constant simplifies", () => {
      const result = simplifyFormula("sin(0+1)");
      expect(transformCalcNodeToString(result)).toContain("sin(1)");
    });

    test("function with multiple arguments simplifies args", () => {
      const result = simplifyFormula("pow(2+3, 1)");
      expect(transformCalcNodeToString(result)).toContain("pow(5, 1)");
    });
  });

  describe("edge cases", () => {
    test("single number", () => {
      const result = simplifyFormula("42");
      expect(transformCalcNodeToString(result)).toBe("42");
    });

    test("single variable", () => {
      const result = simplifyFormula("z");
      expect(transformCalcNodeToString(result)).toBe("z");
    });

    test("deeply nested expression", () => {
      const result = simplifyFormula("(((z+0)+0)+0)");
      expect(transformCalcNodeToString(result)).toBe("z");
    });
  });

  describe("complex number arithmetic", () => {
    test("chain of sums with variable at the end sum as start", () => {
      const result = simplifyFormula("2+3i-4+5i+z");

      expect(transformCalcNodeToString(result)).toBe("(-2+8i+z)");
    });

    test("chain of sums with variable at the end sum as start", () => {
      const result = simplifyFormula("2-3i-4+5i+z");

      expect(transformCalcNodeToString(result)).toBe("(-2+2i+z)");
    });

    test("chain of sums with variable in the middle", () => {
      const result = simplifyFormula("2+z+2");
      expect(transformCalcNodeToString(result)).toBe("(2+(z+2))");
    });

    test("chain of sums with variable at the start", () => {
      const result = simplifyFormula("z+2+2");
      expect(transformCalcNodeToString(result)).toBe("(z+4)");
    });

    test("imaginary + imaginary", () => {
      const result = simplifyFormula("2i+3i");
      expect(transformCalcNodeToString(result)).toBe("5i");
    });

    test("real + imaginary", () => {
      const result = simplifyFormula("2+3i");
      expect(transformCalcNodeToString(result)).toBe("2+3i");
    });

    test("complex + complex", () => {
      const result = simplifyFormula("(2+3i)+(4+5i)");
      expect(transformCalcNodeToString(result)).toBe("6+8i");
    });

    test("complex - complex", () => {
      const result = simplifyFormula("(5+7i)-(2+3i)");
      expect(transformCalcNodeToString(result)).toBe("3+4i");
    });

    test("imaginary * imaginary", () => {
      const result = simplifyFormula("2i*3i");
      expect(transformCalcNodeToString(result)).toBe("-6");
    });

    test("real * imaginary", () => {
      const result = simplifyFormula("2*3i");
      expect(transformCalcNodeToString(result)).toBe("6i");
    });

    test("complex * complex", () => {
      const result = simplifyFormula("(2+3i)*(4+5i)");
      // (2+3i)(4+5i) = 8+10i+12i+15i² = 8+22i-15 = -7+22i
      expect(transformCalcNodeToString(result)).toBe("-7+22i");
    });

    test("complex / real", () => {
      const result = simplifyFormula("(6+8i)/2");
      expect(transformCalcNodeToString(result)).toBe("3+4i");
    });

    test("imaginary / real", () => {
      const result = simplifyFormula("6i/2");
      expect(transformCalcNodeToString(result)).toBe("3i");
    });

    test("complex * 0", () => {
      const result = simplifyFormula("(2+3i)*0");
      expect(transformCalcNodeToString(result)).toBe("0");
    });

    test("0 * complex", () => {
      const result = simplifyFormula("0*(2+3i)");
      expect(transformCalcNodeToString(result)).toBe("0");
    });

    test("complex * 1", () => {
      const result = simplifyFormula("(2+3i)*1");
      expect(transformCalcNodeToString(result)).toBe("2+3i");
    });

    test("1 * complex", () => {
      const result = simplifyFormula("1*(2+3i)");
      expect(transformCalcNodeToString(result)).toBe("2+3i");
    });
  });
});
