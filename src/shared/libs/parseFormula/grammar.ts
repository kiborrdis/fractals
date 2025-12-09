/* eslint-disable @typescript-eslint/no-explicit-any */

type ConvertTupleTypeWithMap<
  K extends string | number | symbol,
  T extends [K, ...K[]] | [],
  M extends { [key in K]: any },
> = {
  [I in keyof T]: T[I] extends K ? M[T[I]] : undefined;
};

export class GrammarParser<G extends Grammar<any, any, any, any>> {
  constructor(
    private grammar: G,
    private indentRegex: RegExp = /\s/,
  ) {}

  private lastIndex: number = 0;
  private skipIndent(str: string, index: number): number {
    while (this.indentRegex.test(str[index])) {
      index += 1;
    }

    return index;
  }

  private parseRuleWithCache(
    str: string,
    ruleName: string,
    index: number,
    cache: { [key: string]: { [index: number]: [any, number] | null } },
  ): [unknown, number] | null {
    if (!cache[ruleName]) {
      cache[ruleName] = {};
    }

    if (cache[ruleName][index] !== undefined) {
      return cache[ruleName][index];
    }

    index = this.skipIndent(str, index);

    const result = this.parseRule(str, ruleName, index, cache);
    cache[ruleName][index] = result;

    if (result && result[0] !== undefined && result[1] > this.lastIndex) {
      this.lastIndex = result[1];
    }

    return result;
  }

  private parseRule(
    str: string,
    ruleName: string,
    index: number,
    cache: { [key: string]: { [index: number]: [unknown, number] | null } },
  ): [unknown, number] | null {
    const rule = this.grammar.rulesDefinition[ruleName];
    const ruleTransforms = this.grammar.transformsDefinition[ruleName];

    if (!rule || !ruleTransforms) {
      throw new Error(`Rule "${ruleName}" or it's transform not found.`);
    }

    if (rule[0] === "term") {
      return this.parseTerminal(str, rule[1], ruleTransforms[0], index);
    } else if (rule[0] === "or") {
      return this.parseOrRule(str, rule[1], ruleTransforms, index, cache);
    } else if (rule[0] === "nonterm") {
      return this.parseNonTerminal(
        str,
        rule[1],
        ruleTransforms[0],
        index,
        cache,
      );
    }

    return null;
  }

  private parseTerminal(
    str: string,
    matcher: (str: string, index: number) => [string, number] | null,
    transform: (arg: string, r: readonly [number, number]) => unknown,
    index: number,
  ): [unknown, number] | null {
    const matchResult = matcher(str, index);

    if (matchResult) {
      return [
        transform(matchResult[0], [index, matchResult[1] - 1]),
        matchResult[1],
      ];
    }

    return null;
  }

  private parseNonTerminal(
    str: string,
    definition: [string, ...string[]] | [],
    transform: (...args: unknown[]) => unknown,
    index: number,
    cache: { [key: string]: { [index: number]: [unknown, number] | null } },
  ): [unknown, number] | null {
    let currentIndex = index;
    const args: unknown[] = [];

    for (let i = 0; i < definition.length; i++) {
      const subRuleName = definition[i];
      const result = this.parseRuleWithCache(
        str,
        subRuleName,
        currentIndex,
        cache,
      );

      if (!result) {
        this.lastIndex = index;
        return null;
      }

      args.push(result[0]);
      currentIndex = result[1];
    }

    return [transform(...args), currentIndex];
  }

  private parseOrRule(
    str: string,
    definitions: ([string, ...string[]] | [])[],
    transforms: ((...args: unknown[]) => unknown)[],
    index: number,
    cache: { [key: string]: { [index: number]: [unknown, number] | null } },
  ): [unknown, number] | null {
    const orArgs: unknown[] = [];
    // Try each sub-rule in order until one matches
    for (let i = 0; i < definitions.length; i++) {
      const result = this.parseNonTerminal(
        str,
        definitions[i],
        transforms[i],
        index,
        cache,
      );

      if (!result) {
        this.lastIndex = index;
        orArgs.push(undefined);

        continue;
      }

      return result;
    }

    return null;
  }

  public parse(str: string): [
    (G extends Grammar<any, any, infer T, infer R> ? T[R] : null) | null,
    {
      lastIndex: number;
    },
  ] {
    this.lastIndex = 0;

    const cache: { [key: string]: { [index: number]: [any, number] | null } } =
      {};
    const result = this.parseRuleWithCache(
      str,
      this.grammar.rootRule,
      0,
      cache,
    );

    const lastIndex = this.skipIndent(str, this.lastIndex);

    if (result && lastIndex === str.length) {
      return [
        result[0] as G extends Grammar<any, any, infer T, infer R>
          ? T[R]
          : null,
        { lastIndex: lastIndex },
      ];
    }

    return [null, { lastIndex: this.lastIndex }];
  }
}

export class Grammar<
  Rules extends string = "$",
  Variants = string,
  Trnsf extends { [K in Rules]: Variants } = { [K in Rules]: Variants },
  Root extends Rules = Rules,
> {
  private root: Rules = "$" as Rules;
  private rules: {
    [l: string]:
      | ["nonterm", [string, ...string[]] | []]
      | ["term", (str: string, index: number) => [string, number] | null]
      | ["or", ([string, ...string[]] | [])[]];
  } = {};
  private transforms: {
    [l: string]: ((...args: any[]) => any)[];
  } = {};

  get rulesDefinition() {
    return this.rules;
  }

  get transformsDefinition() {
    return this.transforms;
  }

  get rootRule(): Root {
    return this.root as unknown as Root;
  }

  // private parseWithStack(str: string): Trnsf[Root] | undefined {
  //   // 0 start processing, either by pushing sub-rules or matching terminals, 1 apply transform
  //   const stack: [0 | 1, string][] = [[0, this.root]];
  //   const argStack: any[] = [];

  //   while (stack.length > 0) {
  //     const currentRule = stack.pop();

  //     if (!currentRule) {
  //       break;
  //     }

  //     if (currentRule[0] === 1) {
  //       const transform = this.transforms[currentRule[1]];

  //       const args = [];

  //       for (let i = 0; i < this.rules[currentRule[1]][1].length; i++) {
  //         if (argStack.length === 0) {
  //           throw new Error(
  //             "Invalid stack state during transform application."
  //           );
  //         };
  //         const arg = argStack.pop();
  //         args.push(arg);
  //       }
  //       argStack.push(transform(...args));
  //       continue;
  //     }

  //     const currentRuleName = currentRule[1];

  //     if (!currentRuleName) {
  //       break;
  //     }

  //     stack.push([1, currentRuleName]);

  //     const rule = this.rules[currentRuleName];
  //     if (!rule) {
  //       throw new Error(`Rule "${currentRuleName}" not found.`);
  //     }

  //     if (rule[0] === "term") {
  //       const matcher = rule[1];
  //       const matchResult = matcher(str, 0);
  //       const matchTransform = this.transforms[currentRuleName];

  //       if (matchResult) {
  //         argStack.push(matchTransform(matchResult[0]));
  //       }
  //     } else if (rule[0] === "nonterm") {
  //       const definition = rule[1];

  //       // Push sub-rules onto the stack in reverse order
  //       for (let i = definition.length - 1; i >= 0; i--) {
  //         stack.push([0, definition[i]]);
  //       }
  //       // Handle non-terminal rule
  //     }
  //   }

  //   return undefined;
  // }

  setRootRule<R extends Rules>(root: R): Grammar<Rules, Variants, Trnsf, R> {
    this.root = root;
    return this as unknown as Grammar<Rules, Variants, Trnsf, R>;
  }

  addTerminal<NR extends string, NTr = string>(
    name: NR,
    matcher: (str: string, index: number) => [string, number] | null,
    transform: (str: string, r: readonly [number, number]) => NTr = (s) =>
      s as NTr,
  ): Grammar<Rules | NR, Variants | NTr, Trnsf & { [K in NR]: NTr }> {
    this.rules[name] = ["term", matcher];
    this.transforms[name] = [transform];
    this.transforms[name].push(transform);

    return this as Grammar<
      Rules | NR,
      Variants | NTr,
      Trnsf & { [K in NR]: NTr }
    >;
  }
  addRecursiveRule<NR extends string, NTr = string>(): Grammar<
    Rules | NR,
    Variants | NTr,
    Trnsf & { [K in NR]: NTr }
  > {
    return this as Grammar<
      Rules | NR,
      Variants | NTr,
      Trnsf & { [K in NR]: NTr }
    >;
  }

  addRule<
    NTr,
    NR extends string,
    NDef extends [Rules | NR, ...(Rules | NR)[]] | [],
  >(
    name: NR,
    definition: NDef,
    transform: (
      ...args: NoInfer<
        ConvertTupleTypeWithMap<
          Rules | NR,
          NDef,
          Trnsf & { [K in NR]: unknown }
        >
      >
    ) => NTr,
  ): Grammar<Rules | NR, Variants | NTr, Trnsf & { [K in NR]: NTr }> {
    this.rules[name] = ["nonterm", definition];
    this.transforms[name] = [transform];

    return this as Grammar<
      Rules | NR,
      Variants | NTr,
      Trnsf & { [K in NR]: NTr }
    >;
  }

  addRuleVariant<
    NTr,
    NR extends Rules,
    NDef extends [Rules | NR, ...(Rules | NR)[]] | [],
  >(
    name: NR,
    definition: NDef,
    transform: (
      ...args: NoInfer<
        ConvertTupleTypeWithMap<
          Rules | NR,
          NDef,
          Trnsf & { [K in NR]: unknown }
        >
      >
    ) => NTr,
  ): Grammar<
    Rules | NR,
    Variants | NTr,
    {
      [K in keyof Trnsf]: K extends NR ? Trnsf[K] | NTr : Trnsf[K];
    }
  > {
    const rule = this.rules[name];

    if (rule[0] === "term") {
      throw new Error("Cannot add rule variant to a terminal rule.");
    }

    if (rule[0] !== "or") {
      this.rules[name] = ["or", [rule[1]]];
    }

    const orRule = this.rules[name];

    if (orRule[0] !== "or") {
      throw new Error("Expected 'or' rule type.");
    }

    orRule[1].push(definition);
    this.transforms[name].push(transform);

    return this as Grammar<
      Rules | NR,
      Variants | NTr,
      {
        [K in keyof Trnsf]: K extends NR ? Trnsf[K] | NTr : Trnsf[K];
      }
    >;
  }
}

export const regex = (regex: RegExp) => {
  const anchoredRegex = new RegExp(`^(${regex.source})`, regex.flags);

  return (str: string, index: number): [string, number] | null => {
    const substring = str.slice(index);
    const match = substring.match(anchoredRegex);
    if (match && match.index === 0) {
      return [match[0], index + match[0].length];
    }
    return null;
  };
};
