import { CalcNode, CalcNodeType } from "@/shared/libs/complexVariableFormula";
import { expect, test, describe } from "vitest";
import { derivative as baseDerivative } from "./derivative";
import { parseFormula } from "./parseFormula";

const derivative = (node: CalcNode, variable: "z") => {
  return baseDerivative(node, variable, {
    cos: "cos",
    sin: "sin",
    tan: "tan",
    exp: "exp",
    ln: "ln",
    cosh: "cosh",
    sinh: "sinh",
  });
};

describe("derivative", () => {
  // Basic rules
  describe("constants and variables", () => {
    test("derivative of constant is 0", () => {
      const calcNode = derivative(parseFormula("5"), "z");
      expect(transformCalcNodeToString(calcNode)).toBe("0");
    });

    test("derivative of variable z with respect to z is 1", () => {
      const calcNode = derivative(parseFormula("z"), "z");
      expect(transformCalcNodeToString(calcNode)).toBe("1");
    });

    test("derivative of different variable with respect to z is 0", () => {
      const calcNode = derivative(parseFormula("x"), "z");
      expect(transformCalcNodeToString(calcNode)).toBe("0");
    });
  });

  // Addition and Subtraction
  describe("addition and subtraction", () => {
    test("derivative of sum: d/dz(z + 5)", () => {
      const calcNode = derivative(parseFormula("z+5"), "z");
      expect(transformCalcNodeToString(calcNode)).toBe("(1+0)");
    });

    test("derivative of difference: d/dz(z - 3)", () => {
      const calcNode = derivative(parseFormula("z-3"), "z");
      expect(transformCalcNodeToString(calcNode)).toBe("(1-0)");
    });

    test("derivative of complex sum: d/dz(z + z + 2)", () => {
      const calcNode = derivative(parseFormula("z+z+2"), "z");
      expect(transformCalcNodeToString(calcNode)).toBe("(1+(1+0))");
    });
  });

  // Multiplication (Product Rule)
  describe("multiplication (product rule)", () => {
    test("derivative of z * z: d/dz(z*z)", () => {
      const calcNode = derivative(parseFormula("z*z"), "z");
      expect(transformCalcNodeToString(calcNode)).toBe("((1*z)+(z*1))");
    });

    test("derivative of z * 5: d/dz(z*5)", () => {
      const calcNode = derivative(parseFormula("z*5"), "z");
      expect(transformCalcNodeToString(calcNode)).toBe("((1*5)+(z*0))");
    });

    test("derivative of (z+1) * (z+2): d/dz((z+1)*(z+2))", () => {
      const calcNode = derivative(parseFormula("(z+1)*(z+2)"), "z");
      expect(transformCalcNodeToString(calcNode)).toBe(
        "(((1+0)*(z+2))+((z+1)*(1+0)))",
      );
    });
  });

  // Division
  describe("division (quotient rule)", () => {
    // Quotient rule: (f/g)' = (f'*g - f*g') / (g*g)

    test("derivative of z / 2: d/dz(z/2)", () => {
      const calcNode = derivative(parseFormula("z/2"), "z");
      expect(transformCalcNodeToString(calcNode)).toBe("(((1*2)-(z*0))/(2*2))");
    });

    test("derivative of 1 / z: d/dz(1/z)", () => {
      const calcNode = derivative(parseFormula("1/z"), "z");
      expect(transformCalcNodeToString(calcNode)).toBe("(((0*z)-(1*1))/(z*z))");
    });

    test("derivative of z / (z+1): d/dz(z/(z+1))", () => {
      const calcNode = derivative(parseFormula("z/(z+1)"), "z");
      expect(transformCalcNodeToString(calcNode)).toBe(
        "(((1*(z+1))-(z*(1+0)))/((z+1)*(z+1)))",
      );
    });
  });

  // Power Rule with constant exponents
  describe("power rule (constant exponents)", () => {
    test("derivative of z^2: d/dz(z^2)", () => {
      const calcNode = derivative(parseFormula("z^2"), "z");
      expect(transformCalcNodeToString(calcNode)).toBe("((2*(z^1))*1)");
    });

    test("derivative of z^3: d/dz(z^3)", () => {
      const calcNode = derivative(parseFormula("z^3"), "z");
      expect(transformCalcNodeToString(calcNode)).toBe("((3*(z^2))*1)");
    });

    test("derivative of z^0: d/dz(z^0)", () => {
      const calcNode = derivative(parseFormula("z^0"), "z");
      expect(transformCalcNodeToString(calcNode)).toBe("((0*(z^-1))*1)");
    });

    test("derivative of (2*z)^2: d/dz((2*z)^2)", () => {
      const calcNode = derivative(parseFormula("(2*z)^2"), "z");

      // 4*z^2 = 4*2*z = 8*z
      expect(transformCalcNodeToString(calcNode)).toBe(
        "((2*((2*z)^1))*((0*z)+(2*1)))",
      );
    });
  });

  // General Power Rule with variable exponents
  describe("power rule (general case f(x)^g(x))", () => {
    test("derivative of z^z: d/dz(z^z)", () => {
      // f(x)^g(x) = f(x)^g(x) * (g'(x)*ln(f(x))  + g(x)*f'(x)/f(x))

      const calcNode = derivative(parseFormula("z^z"), "z");

      // z^z = z^z * (1*ln(z) + z/z)
      expect(transformCalcNodeToString(calcNode)).toBe(
        "((z^z)*((1*ln(z))+(z*(1/z))))",
      );
    });

    test("derivative of z^(z+1): d/dz(z^(z+1))", () => {
      const calcNode = derivative(parseFormula("z^(z+1)"), "z");
      // z^(z+1) = z^(z+1) * ((1+0)*ln(z) + (z+1)*1/z)

      expect(transformCalcNodeToString(calcNode)).toBe(
        "((z^(z+1))*(((1+0)*ln(z))+((z+1)*(1/z))))",
      );
    });
  });

  // Exponential function
  describe("exponential function", () => {
    test("derivative of exp(z): d/dz(exp(z))", () => {
      const calcNode = derivative(parseFormula("exp(z)"), "z");
      expect(transformCalcNodeToString(calcNode)).toBe("(exp(z)*1)");
    });

    test("derivative of exp(2*z): d/dz(exp(2*z))", () => {
      const calcNode = derivative(parseFormula("exp(2*z)"), "z");
      expect(transformCalcNodeToString(calcNode)).toBe(
        "(exp((2*z))*((0*z)+(2*1)))",
      );
    });

    test("derivative of exp(z^2): d/dz(exp(z^2))", () => {
      const calcNode = derivative(parseFormula("exp(z^2)"), "z");

      // exp(z^2) = exp(z^2) * 2z
      expect(transformCalcNodeToString(calcNode)).toBe(
        "(exp((z^2))*((2*(z^1))*1))",
      );
    });
  });

  // Natural logarithm
  describe("natural logarithm (ln)", () => {
    // d/dx ln(f(x)) = f'(x) / f(x)

    test("derivative of ln(z): d/dz(ln(z))", () => {
      const calcNode = derivative(parseFormula("ln(z)"), "z");
      expect(transformCalcNodeToString(calcNode)).toBe("(1/z)");
    });

    test("derivative of ln(z^2): d/dz(ln(z^2))", () => {
      const calcNode = derivative(parseFormula("ln(z^2)"), "z");
      expect(transformCalcNodeToString(calcNode)).toContain(
        "(((2*(z^1))*1)/(z^2))",
      );
    });
  });

  // Sine
  describe("sine", () => {
    test("derivative of sin(z): d/dz(sin(z))", () => {
      const calcNode = derivative(parseFormula("sin(z)"), "z");
      expect(transformCalcNodeToString(calcNode)).toBe("(cos(z)*1)");
    });

    test("derivative of sin(2*z): d/dz(sin(2*z))", () => {
      const calcNode = derivative(parseFormula("sin(2*z)"), "z");
      expect(transformCalcNodeToString(calcNode)).toBe(
        "(cos((2*z))*((0*z)+(2*1)))",
      );
    });

    test("derivative of sin(z^2): d/dz(sin(z^2))", () => {
      const calcNode = derivative(parseFormula("sin(z^2)"), "z");
      expect(transformCalcNodeToString(calcNode)).toBe(
        "(cos((z^2))*((2*(z^1))*1))",
      );
    });
  });

  // Cosine
  describe("cosine", () => {
    test("derivative of cos(z): d/dz(cos(z))", () => {
      const calcNode = derivative(parseFormula("cos(z)"), "z");
      expect(transformCalcNodeToString(calcNode)).toBe("((-1*sin(z))*1)");
    });

    test("derivative of cos(2*z): d/dz(cos(2*z))", () => {
      const calcNode = derivative(parseFormula("cos(2*z)"), "z");
      expect(transformCalcNodeToString(calcNode)).toBe(
        "((-1*sin((2*z)))*((0*z)+(2*1)))",
      );
    });

    test("derivative of cos(z^2): d/dz(cos(z^2))", () => {
      const calcNode = derivative(parseFormula("cos(z^2)"), "z");
      expect(transformCalcNodeToString(calcNode)).toBe(
        "((-1*sin((z^2)))*((2*(z^1))*1))",
      );
    });
  });

  // Tangent
  describe("tangent", () => {
    test("derivative of tan(z): d/dz(tan(z))", () => {
      const calcNode = derivative(parseFormula("tan(z)"), "z");

      // (sin(x)/cos(x))' =
      // (sin(x)'cos(x) - sin(x)cos(x)')/cos(x)^2 =
      // (cos(x) * cos(x) + sin(x)*sin(x))/cos(x)^2
      expect(transformCalcNodeToString(calcNode)).toBe(
        "((((cos(z)*1)*cos(z))-(sin(z)*((-1*sin(z))*1)))/(cos(z)*cos(z)))",
      );
    });

    test("derivative of tan(2*z): d/dz(tan(2*z))", () => {
      // (sin(2*x)/cos(2*x))' =
      // (sin(x)'cos(x) - sin(x)cos(x)')/cos(x)^2 =
      // (2*cos(x) * cos(x) + 2*sin(x)*sin(x))/cos(x)^2
      const calcNode = derivative(parseFormula("tan(2*z)"), "z");
      expect(transformCalcNodeToString(calcNode)).toBe(
        "((((cos((2*z))*((0*z)+(2*1)))*cos((2*z)))-(sin((2*z))*((-1*sin((2*z)))*((0*z)+(2*1)))))/(cos((2*z))*cos((2*z))))",
      );
    });
  });

  // Complex combinations
  describe("complex expressions", () => {
    test("derivative of sin(z) + z^2: d/dz(sin(z)+z^2)", () => {
      // sin(z)+z^2 = cos(z) + 2*z
      const calcNode = derivative(parseFormula("sin(z)+z^2"), "z");
      expect(transformCalcNodeToString(calcNode)).toBe(
        "((cos(z)*1)+((2*(z^1))*1))",
      );
    });

    test("derivative of exp(z) * sin(z): d/dz(exp(z)*sin(z))", () => {
      // exp(z)*sin(z) = exp(z)*sin(z) + exp(z)*cos(z)
      const calcNode = derivative(parseFormula("exp(z)*sin(z)"), "z");
      expect(transformCalcNodeToString(calcNode)).toBe(
        "(((exp(z)*1)*sin(z))+(exp(z)*(cos(z)*1)))",
      );
    });

    test("derivative of sin(z) / cos(z): d/dz(sin(z)/cos(z))", () => {
      // sin(z) / cos(z) = (cos(z)*cos(z) + sin(z)*sin(z))/cos(z)^2
      const calcNode = derivative(parseFormula("sin(z)/cos(z)"), "z");
      expect(transformCalcNodeToString(calcNode)).toBe(
        "((((cos(z)*1)*cos(z))-(sin(z)*((-1*sin(z))*1)))/(cos(z)*cos(z)))",
      );
    });

    test("derivative of exp(sin(z)): d/dz(exp(sin(z)))", () => {
      // exp(sin(z^2)) = exp(sin(z^2)) * cos(z^2)*2z
      const calcNode = derivative(parseFormula("exp(sin(z^2))"), "z");
      expect(transformCalcNodeToString(calcNode)).toBe(
        "(exp(sin((z^2)))*(cos((z^2))*((2*(z^1))*1)))",
      );
    });

    test("derivative of (z^2 + 1)^3: d/dz((z^2+1)^3)", () => {
      // (z^2 + 1)^3 = 3*(z^2 + 1)^2*(2z)
      const calcNode = derivative(parseFormula("(z^2+1)^3"), "z");
      expect(transformCalcNodeToString(calcNode)).toBe(
        "((3*(((z^2)+1)^2))*(((2*(z^1))*1)+0))",
      );
    });
  });
});

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
