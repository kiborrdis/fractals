import { Grammar, regex } from "@/shared/libs/parseFormula";
import {
  CalcNodeFuncCall,
  CalcNodeNumber,
  CalcNodeOperation,
  CalcNodeVariable,
  CalcNodeType,
} from "@/shared/libs/calcGraph";

type PossibleCalcNode =
  | CalcNodeNumber
  | CalcNodeVariable
  | CalcNodeOperation
  | CalcNodeFuncCall;
type PossibleCalcNodeArray = PossibleCalcNode[];

export const formulaGrammar = new Grammar()
  .addTerminal("oBracket", regex(/\(/))
  .addTerminal("cBracket", regex(/\)/))
  .addTerminal("comma", regex(/,/))
  .addTerminal(
    "addOperator",
    regex(/[-+]/),
    (str, r) =>
      ({
        str: str as "+" | "-",
        r,
      }) as const,
  )
  .addTerminal(
    "mulOperator",
    regex(/[*/]/),
    (str, r) =>
      ({
        str: str as "*" | "/",
        r,
      }) as const,
  )
  .addTerminal(
    "powOperator",
    regex(/[\^]/),
    (str, r) =>
      ({
        str: str as "^",
        r,
      }) as const,
  )
  .addTerminal(
    "numberOperand",
    regex(/-?\d*\.?\d+/),
    (str, r): CalcNodeNumber => {
      if (!isNaN(Number(str))) {
        return {
          t: CalcNodeType.Number,
          r,
          v: Number(str),
        };
      }
      throw new Error("numberOperator match error");
    },
  )
  .addTerminal(
    "variableOperand",
    regex(/[a-zA-Z][a-zA-Z0-9а-яА-Я-]*/),
    (str, r): CalcNodeVariable => ({
      t: CalcNodeType.Variable,
      r,
      v: str,
    }),
  )
  .addRecursiveRule<"add", PossibleCalcNode>()
  .addRecursiveRule<"mul", PossibleCalcNode>()
  .addRecursiveRule<"pow", PossibleCalcNode>()
  .addRecursiveRule<"funcParams", PossibleCalcNodeArray>()
  .addRecursiveRule<"func_call", CalcNodeFuncCall>()
  .addRecursiveRule<"expression", PossibleCalcNode>()

  .addRule("operand", ["func_call"], (num) => num)
  .addRuleVariant("operand", ["expression"], (v) => v)
  .addRuleVariant("operand", ["variableOperand"], (v) => v)
  .addRuleVariant("operand", ["numberOperand"], (v) => v)

  .addRule(
    "pow",
    ["operand", "powOperator", "pow"],
    (left, op, right): CalcNodeOperation => ({
      c: [left, right],
      r: op.r,
      t: CalcNodeType.Operation,
      v: op.str,
    }),
  )
  .addRuleVariant("pow", ["operand"], (operand) => operand)

  .addRule(
    "mul",
    ["pow", "mulOperator", "mul"],
    (left, op, right): CalcNodeOperation => ({
      c: [left, right],
      r: op.r,
      t: CalcNodeType.Operation,
      v: op.str,
    }),
  )
  .addRuleVariant("mul", ["pow"], (pow) => pow)

  .addRule(
    "add",
    ["mul", "addOperator", "add"],
    (left, op, right): CalcNodeOperation => ({
      c: [left, right],
      r: op.r,
      t: CalcNodeType.Operation,
      v: op.str,
    }),
  )
  .addRuleVariant("add", ["mul"], (mul) => mul)

  .addRule(
    "funcParams",
    ["add", "comma", "funcParams"],
    (add, _comma, rest) => [add, ...rest],
  )
  .addRuleVariant("funcParams", ["add"], (add) => [add])

  .addRule("expression", ["oBracket", "add", "cBracket"], (_1, add, _2) => add)

  .addRule(
    "func_call",
    ["variableOperand", "oBracket", "funcParams", "cBracket"],
    (variable, _1, params, _2): CalcNodeFuncCall => {
      return {
        t: CalcNodeType.FuncCall,
        o: params,
        r: variable.r,
        n: variable.v,
      };
    },
  )
  .setRootRule("add");
