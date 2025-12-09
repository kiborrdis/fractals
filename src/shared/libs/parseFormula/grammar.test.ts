import { describe, expect, it } from "vitest";
import { Grammar, GrammarParser, regex } from "./grammar";

describe("GrammarBuilder", () => {
  it("parses simple addition", () => {
    const grammar = new Grammar()
      .addTerminal("add", regex(/[+-]/))
      .addTerminal("num", regex(/\d+/), (str) => parseInt(str, 10))
      .addRule("expr", ["num", "add", "num"], (a, _, c) => a + c)
      .setRootRule("expr");
    const parser = new GrammarParser(grammar);

    const result = parser.parse("23+42");
    expect(result[0]).toBe(23 + 42);
  });

  it("parses nested expressions", () => {
    const grammar = new Grammar()
      .addRecursiveRule<"expr", number>()
      .addTerminal("add", regex(/[+-]/))
      .addTerminal("num", regex(/\d+/), (str) => parseInt(str, 10))
      .addRule("expr", ["num", "add", "expr"], (a, _, c) => a + c)
      .addRuleVariant("expr", ["num"], (a) => a)
      .setRootRule("expr");
    const parser = new GrammarParser(grammar);

    const result = parser.parse("  23  +42+10");
    expect(result[0]).toBe(23 + 42 + 10);
  });

  it("failes to parse nested expressions with forbidden symbols", () => {
    const grammar = new Grammar()
      .addTerminal("add", regex(/[+-]/))
      .addTerminal("num", regex(/\d+/), (str) => parseInt(str, 10))
      .addRule("expr", ["num", "add", "expr"], (a, _, c) => a + (c as number))
      .addRuleVariant("expr", ["num"], (a) => a)
      .setRootRule("expr");
    const parser = new GrammarParser(grammar);

    const result = parser.parse("  23  +42*10");
    expect(result[0]).toBe(null);
    expect(result[1].lastIndex).toBe(9);
  });

  it("does not return lastIndex from partial parsed term with variants", () => {
    const grammar = new Grammar()
      .addTerminal("(", regex(/\(/))
      .addTerminal(")", regex(/\)/))
      .addTerminal("num", regex(/[0-9]+/), (str) => parseInt(str, 10))
      .addRule("expr", ["(", "num", ")"], (_, n, __) => n)
      .addRuleVariant("expr", ["num"], (n) => n)
      .setRootRule("expr");
    const parser = new GrammarParser(grammar);

    const result = parser.parse("(123");
    expect(result[0]).toBe(null);
    expect(result[1].lastIndex).toBe(0);
  });

  it("does not return lastIndex from partial parsed term without variants", () => {
    const grammar = new Grammar()
      .addTerminal("(", regex(/\(/))
      .addTerminal(")", regex(/\)/))
      .addTerminal("var", regex(/[a-z]+/))
      .addTerminal("num", regex(/[0-9]+/), (str) => parseInt(str, 10))
      .addRule("expr", ["(", "num", ")"], (_, n, __) => n)
      .setRootRule("expr");
    const parser = new GrammarParser(grammar);

    const result = parser.parse("(123");
    expect(result[0]).toBe(null);
    expect(result[1].lastIndex).toBe(0);
  })
});
