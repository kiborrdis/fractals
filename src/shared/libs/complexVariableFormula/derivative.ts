import { CalcNode, CalcNodeType } from "@/shared/libs/complexVariableFormula";

export type StdFnNames = {
  exp: string;
  ln: string;
  sin: string;
  sinh: string;
  cos: string;
  cosh: string;
  tan: string;
};

export type CustomDerivatives = Record<
  string,
  (
    node: CalcNode,
    variable: string,
    stdFnNames: StdFnNames,
    custom: CustomDerivatives,
  ) => CalcNode
>;

export const derivative = (
  node: CalcNode,
  variable: "z",
  stdFnNames: StdFnNames,
  custom: CustomDerivatives = {},
): CalcNode => {
  if (node.t === CalcNodeType.Number) {
    return {
      t: CalcNodeType.Number,
      re: 0,
      im: 0,
      r: [0, 0],
    };
  }

  if (node.t === CalcNodeType.Variable) {
    const varName = node.v;

    if (custom[varName]) {
      return custom[varName](node, variable, stdFnNames, custom);
    }

    if (node.v === variable) {
      return {
        t: CalcNodeType.Number,
        re: 1,
        im: 0,
        r: [0, 0],
      };
    }

    return {
      t: CalcNodeType.Number,
      re: 0,
      im: 0,
      r: [0, 0],
    };
  }

  if (node.t === CalcNodeType.Operation && (node.v === "+" || node.v === "-")) {
    return {
      t: CalcNodeType.Operation,
      c: [
        derivative(node.c[0], variable, stdFnNames, custom),
        derivative(node.c[1], variable, stdFnNames, custom),
      ],
      v: node.v,
      r: [0, 0],
    };
  }

  if (node.t === CalcNodeType.Operation && node.v === "*") {
    // Product rule: (f*g)' = f'*g + f*g'
    return {
      t: CalcNodeType.Operation,
      v: "+",
      c: [
        {
          t: CalcNodeType.Operation,
          v: "*",
          c: [derivative(node.c[0], variable, stdFnNames, custom), node.c[1]],
          r: [0, 0],
        },
        {
          t: CalcNodeType.Operation,
          v: "*",
          c: [node.c[0], derivative(node.c[1], variable, stdFnNames, custom)],
          r: [0, 0],
        },
      ],
      r: [0, 0],
    };
  }

  if (node.t === CalcNodeType.Operation && node.v === "/") {
    // Quotient rule: (f/g)' = (f'*g - f*g') / (g*g)
    return {
      t: CalcNodeType.Operation,
      v: "/",
      c: [
        {
          t: CalcNodeType.Operation,
          v: "-",
          c: [
            {
              t: CalcNodeType.Operation,
              v: "*",
              c: [
                derivative(node.c[0], variable, stdFnNames, custom),
                node.c[1],
              ],
              r: [0, 0],
            },
            {
              t: CalcNodeType.Operation,
              v: "*",
              c: [
                node.c[0],
                derivative(node.c[1], variable, stdFnNames, custom),
              ],
              r: [0, 0],
            },
          ],
          r: [0, 0],
        },
        {
          t: CalcNodeType.Operation,
          v: "*",
          c: [node.c[1], node.c[1]],
          r: [0, 0],
        },
      ],
      r: [0, 0],
    };
  }

  if (node.t === CalcNodeType.Operation && node.v === "^") {
    // Power rule for constant exponents
    if (node.c[1].t === CalcNodeType.Number) {
      // x^b = b * x^(b-1) * dx/dx
      return {
        t: CalcNodeType.Operation,
        v: "*",
        c: [
          {
            t: CalcNodeType.Operation,
            v: "*",
            c: [
              node.c[1],
              {
                t: CalcNodeType.Operation,
                v: "^",
                c: [
                  node.c[0],
                  {
                    t: CalcNodeType.Number,
                    re: node.c[1].re - 1,
                    im: node.c[1].im,
                    r: [0, 0],
                  },
                ],
                r: [0, 0],
              },
            ],
            r: [0, 0],
          },
          derivative(node.c[0], variable, stdFnNames, custom),
        ],
        r: [0, 0],
      };
    }

    // General case: f(x)^g(x)
    // f(x)^g(x) = f(x)^g(x) * (g'(x)*ln(f(x))  + g(x)*f'(x)/f(x))
    const fx_pow_gx: CalcNode = {
      t: CalcNodeType.Operation,
      v: "^",
      c: [node.c[0], node.c[1]],
      r: [0, 0],
    };

    const gdx_ln_fx: CalcNode = {
      t: CalcNodeType.Operation,
      v: "*",
      c: [
        derivative(node.c[1], variable, stdFnNames, custom),
        {
          t: CalcNodeType.FuncCall,
          n: stdFnNames.ln,
          o: [node.c[0]],
          r: [0, 0],
        },
      ],
      r: [0, 0],
    };

    const gx_fdx_over_fx: CalcNode = {
      t: CalcNodeType.Operation,
      v: "*",
      c: [
        node.c[1],
        {
          t: CalcNodeType.Operation,
          v: "/",
          c: [derivative(node.c[0], variable, stdFnNames, custom), node.c[0]],
          r: [0, 0],
        },
      ],
      r: [0, 0],
    };

    return {
      t: CalcNodeType.Operation,
      v: "*",
      c: [
        fx_pow_gx,
        {
          t: CalcNodeType.Operation,
          v: "+",
          c: [gdx_ln_fx, gx_fdx_over_fx],
          r: [0, 0],
        },
      ],
      r: [0, 0],
    };
  }

  if (node.t === CalcNodeType.FuncCall) {
    if (custom[node.n]) {
      return custom[node.n](node, variable, stdFnNames, custom);
    }

    if (node.n === stdFnNames.exp) {
      // d/dx exp(f(x)) = exp(f(x)) * f'(x)
      return {
        t: CalcNodeType.Operation,
        v: "*",
        c: [
          {
            t: CalcNodeType.FuncCall,
            n: "exp",
            o: node.o,
            r: [0, 0],
          },
          derivative(node.o[0], variable, stdFnNames, custom),
        ],
        r: [0, 0],
      };
    }

    if (node.n === stdFnNames.ln) {
      // d/dx ln(f(x)) = f'(x) / f(x)
      return {
        t: CalcNodeType.Operation,
        v: "/",
        c: [derivative(node.o[0], variable, stdFnNames, custom), node.o[0]],
        r: [0, 0],
      };
    }

    if (node.n === stdFnNames.sin) {
      // d/dx sin(f(x)) = cos(f(x)) * f'(x)
      return {
        t: CalcNodeType.Operation,
        v: "*",
        c: [
          {
            t: CalcNodeType.FuncCall,
            n: stdFnNames.cos,
            o: node.o,
            r: [0, 0],
          },
          derivative(node.o[0], variable, stdFnNames, custom),
        ],
        r: [0, 0],
      };
    }

    if (node.n === stdFnNames.cos) {
      // d/dx cos(f(x)) = -sin(f(x)) * f'(x)
      const negSin: CalcNode = {
        t: CalcNodeType.Operation,
        v: "*",
        c: [
          {
            t: CalcNodeType.Number,
            re: -1,
            im: 0,
            r: [0, 0],
          },
          {
            t: CalcNodeType.FuncCall,
            n: stdFnNames.sin,
            o: node.o,
            r: [0, 0],
          },
        ],
        r: [0, 0],
      };

      return {
        t: CalcNodeType.Operation,
        v: "*",
        c: [negSin, derivative(node.o[0], variable, stdFnNames, custom)],
        r: [0, 0],
      };
    }

    if (node.n === stdFnNames.tan) {
      // d/dx tan(f(x)) = sec^2(f(x)) * f'(x)
      const tanInSinOverCos: CalcNode = {
        t: CalcNodeType.Operation,
        v: "/",
        c: [
          {
            t: CalcNodeType.FuncCall,
            n: stdFnNames.sin,
            o: node.o,
            r: [0, 0],
          },
          {
            t: CalcNodeType.FuncCall,
            n: stdFnNames.cos,
            o: node.o,
            r: [0, 0],
          },
        ],
        r: [0, 0],
      };

      return derivative(tanInSinOverCos, variable, stdFnNames, custom);
    }

    if (node.n === stdFnNames.sinh) {
      // d/dx sinh(f(x)) = cosh(f(x)) * f'(x)
      return {
        t: CalcNodeType.Operation,
        v: "*",
        c: [
          {
            t: CalcNodeType.FuncCall,
            n: stdFnNames.cosh,
            o: node.o,
            r: [0, 0],
          },
          derivative(node.o[0], variable, stdFnNames, custom),
        ],
        r: [0, 0],
      };
    }

    if (node.n === stdFnNames.cosh) {
      // d/dx cosh(f(x)) = sinh(f(x)) * f'(x)
      return {
        t: CalcNodeType.Operation,
        v: "*",
        c: [
          {
            t: CalcNodeType.FuncCall,
            n: stdFnNames.sinh,
            o: node.o,
            r: [0, 0],
          },
          derivative(node.o[0], variable, stdFnNames, custom),
        ],
        r: [0, 0],
      };
    }

    throw new Error(`Derivative not implemented for function: ${node.n}`);
  }

  throw new Error(
    `Derivative not implemented for node type: ${node.t} with value:`,
  );
};
