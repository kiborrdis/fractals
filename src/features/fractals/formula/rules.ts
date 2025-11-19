import {
  createOrTransformRule,
  TransformRule,
  createTransformRule,
  createRegexpRule,
} from "@/shared/libs/parseFormula";
import {
  CalcNodeError,
  CalcNodeFuncCall,
  CalcNodeNumber,
  CalcNodeOperation,
  CalcNodeType,
  CalcNodeVariable,
} from "@/shared/libs/parseFormula";

// addOperand = [mulOperand][addOperator][addOperand]
// addOperand = [mulOperand]
// addOperand = _
// mulOperand = [powOperand][mulOperator][mulOperand]
// mulOperand = [operand]
// powOperand = [operand][powOperand][powOperand]
// powOperand = [operand]

// operand = [number]
// operand = [variable]
// funcCall = [funcName]([funcParams])
// funcParams = [addOperand],[funcParams]
// funcParams = [addOperand]
// operand = [expression]
// expression = ([addOperand])
// expression = [addOperand]
// funcName = [a-zA-Z][a-zA-Z0-9]*
// number = [1-9][0-9]*
// variable = ::[a-z0-9\-]::
// mulOperand = [*/]
// addOperand = [+-]

const createSelfRefRule = (): TransformRule<
  CalcNodeNumber | CalcNodeVariable | CalcNodeOperation | CalcNodeError | CalcNodeFuncCall
> => {
  return {
    isEqual: () => true,
    transform(matchContext) {
      return [
        {
          t: CalcNodeType.Number,
          r: [0, 0],
          v: 3,
        },
        matchContext,
      ];
    },
  };
};

const createFuncParamsSelfRefRule = (): TransformRule<
  (CalcNodeNumber | CalcNodeVariable | CalcNodeOperation | CalcNodeFuncCall | CalcNodeError)[]
> => {
  return {
    isEqual: () => true,
    transform(matchContext) {
      return [
        [
          {
            t: CalcNodeType.Number,
            r: [0, 0],
            v: 3,
          },
        ],
        matchContext,
      ];
    },
  };
};

const addRule = createSelfRefRule();
const powRule = createSelfRefRule();
const mulRule = createSelfRefRule();
const funcParams = createFuncParamsSelfRefRule();

const oBracket = createRegexpRule(/\(/, (v) => v.matchedStr);
const cBracket = createRegexpRule(/\)/, (v) => v.matchedStr);
const comma = createRegexpRule(/,/, (v) => v.matchedStr);
const addOperator = createRegexpRule(/[-+]/, (m) => ({
  str: m.matchedStr as "+" | "-",
  r: m.range,
}));
const mulOperator = createRegexpRule(/[*/]/, (m) => ({
  str: m.matchedStr as "*" | "/",
  r: m.range,
}));
const powOperator = createRegexpRule(/[\\^]/, (m) => ({
  str: m.matchedStr as "^",
  r: m.range,
}));
const numberOperand = createRegexpRule(
  /-?\d*\.?\d+/,
  (m): CalcNodeNumber => {
    if (m.matched && !isNaN(Number(m.matchedStr))) {
      return {
        t: CalcNodeType.Number,
        r: m.range,
        v: Number(m.matchedStr),
      };
    }

    throw new Error("numberOperator match error");
  }
);
const variableOperand = createRegexpRule(
  /[a-zA-Z][a-zA-Z0-9а-яА-Я-]*/,
  (m): CalcNodeVariable =>  ({
    t: CalcNodeType.Variable,
    r: m.range,
    v: m.matchedStr,
  })
);

const funcCallRule = createTransformRule(
  "func_call",
  [variableOperand, oBracket, funcParams, cBracket] as const,
  (params): CalcNodeFuncCall => {
    return {
      t: CalcNodeType.FuncCall,
      o: params[2],
      r: params[0].r,
      n: params[0].v,
    };
  }
);

const funcParamsTemp = createOrTransformRule(
  "funcParams",
  [
    createTransformRule(
      "reqursiveFuncParams",
      [addRule, comma, funcParams] as const,
      (res) => [res[0], ...res[2]]
    ),
    createTransformRule(
      "funcParam",
      [addRule] as const,
      (res) => res[0]
    ),
  ] as const,
  (r) => {
    if (!Array.isArray(r)) {
      return [r];
    }

    return r;
  }
);
funcParams.transform = funcParamsTemp.transform;

const expressionRule = createTransformRule(
  "expression",
  [oBracket, addRule, cBracket] as const,
  (params) => {
    return params[1];
  }
);

const operandRule = createOrTransformRule(
  "operand",
  [numberOperand, funcCallRule, variableOperand, expressionRule] as const,
  (r) => r
);

const powSelfRefRule = createOrTransformRule(
  "pow",
  [
    createTransformRule(
      "powFull",
      [operandRule, powOperator, powRule] as const,
      (r): CalcNodeOperation => {
        return {
          c: [r[0], r[2]],
          r: r[1].r,
          t: CalcNodeType.Operation,
          v: r[1].str,
        };
      }
    ),
    createTransformRule("powOperand", [operandRule] as const, (r) => r[0]),
  ] as const,
  (r) => r
);
powRule.transform = powSelfRefRule.transform;

const mulSelfRefRule = createOrTransformRule(
  "mul",
  [
    createTransformRule(
      "mulFull",
      [powRule, mulOperator, mulRule] as const,
      (r): CalcNodeOperation => {
        return {
          c: [r[0], r[2]],
          r: r[1].r,
          t: CalcNodeType.Operation,
          v: r[1].str,
        };
      }
    ),
    createTransformRule("mulOperand", [powRule] as const, (r) => r[0]),
  ] as const,
  (r) => r
);
mulRule.transform = mulSelfRefRule.transform;

const addRuleTemp = createOrTransformRule(
  "add",
  [
    createTransformRule(
      "addFull",
      [mulRule, addOperator, addRule] as const,
      (r): CalcNodeOperation => {
        return {
          c: [r[0], r[2]],
          r: r[1].r,
          t: CalcNodeType.Operation,
          v: r[1].str,
        };
      }
    ),
    createTransformRule("add operand", [mulRule] as const, (r) => r[0]),
  ] as const,
  (r) => r
);
addRule.transform = addRuleTemp.transform;

export const rootRule = addRule;
