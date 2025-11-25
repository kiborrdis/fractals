/* eslint-disable @typescript-eslint/no-explicit-any */
export type TupleToUnion<T extends readonly unknown[]> = T[number];

function skipSpaces(formula: string, startIndex: number): number {
  while (/\s/.test(formula[startIndex])) {
    startIndex += 1;
  }

  return startIndex;
}

type ExtractReturnTypesFromTuple<T extends ReadonlyArray<TransformRule<any>>> =
  {
    [K in keyof T]: T[K] extends {
      transform: (
        matchContext: any,
        parseContext: any
      ) => [infer V, MatchContext];
    }
      ? Exclude<V, undefined>
      : undefined;
  };


type MatchContext = {
  matched: boolean;
  lastIndex: number;
  str: string;
  depth: string;
};

type CacheEntry<R> = {
  result: R | undefined;
  matchContext: MatchContext;
};

type ParseContext = {
  str: string;
  cache: Map<TransformRule<any>, Map<number, CacheEntry<any>>>;
};

export type TransformRule<R> = {
  isEqual: (rule: TransformRule<any>) => boolean;
  transform: (
    matchContext: MatchContext,
    parseContext: ParseContext
  ) => [R | undefined, MatchContext];
};

/**
 * Wraps a transform rule with caching functionality.
 * The cached rule will store results by position to avoid re-parsing.
 */
export const withCache = <R>(rule: TransformRule<R>): TransformRule<R> => {
  const cachedRule: TransformRule<R> = {
    isEqual: (testRule) => testRule === cachedRule,
    transform: (matchContext, context) => {
      // Check cache first
      const ruleCache = context.cache.get(cachedRule);
      if (ruleCache) {
        const cached = ruleCache.get(matchContext.lastIndex);
        if (cached) {
          return [
            cached.result,
            { ...cached.matchContext, depth: matchContext.depth },
          ];
        }
      }

      // Execute underlying rule
      const [result, resultContext] = rule.transform(matchContext, context);

      // Cache the result
      if (!context.cache.has(cachedRule)) {
        context.cache.set(cachedRule, new Map());
      }
      context.cache.get(cachedRule)!.set(matchContext.lastIndex, {
        result,
        matchContext: resultContext,
      });

      return [result, resultContext];
    },
  };

  return cachedRule;
};

export const createStubRule = <R>(): TransformRule<R> => {
  const rule: TransformRule<R> = {
    isEqual: (testRule) => testRule === rule,
    transform: () => {
      throw new Error("Stub rule should not be called directly");
    },
  };

  return rule;
};

export const assignRuleToStub = <R>(
  stubRule: TransformRule<R>,
  realRule: TransformRule<R>
): void => {
  (stubRule as any).transform = realRule.transform;
};

export const createTransformRule = <
  A extends readonly [TransformRule<any>, ...TransformRule<any>[]],
  R
>(
  _: string,
  rules: A,
  fn: (args: ExtractReturnTypesFromTuple<A>) => R
): TransformRule<R> => {
  const rule: TransformRule<R> = {
    isEqual: (testRule) => testRule === rule,
    transform: (matchContext, context) => {
      let lastMatchContext = matchContext;
      const data: any[] = [];

      for (let i = 0; i < rules.length; i++) {
        const childRule = rules[i];

        const [res, matchRes] = childRule.transform(
          {
            ...lastMatchContext,
            depth: matchContext.depth + " ",
          },
          context
        );

        if (!matchRes.matched || !res) {
          return [undefined, { ...matchContext, matched: false }];
        }

        lastMatchContext = matchRes;
        data.push(res);
      }

      return [
        fn(data as ExtractReturnTypesFromTuple<A>),
        { ...lastMatchContext, depth: matchContext.depth },
      ];
    },
  };

  return withCache(rule);
};

export const createOrTransformRule = <
  A extends ReadonlyArray<TransformRule<any>>,
  R
>(
  _: string,
  args: A,
  fn: (args: TupleToUnion<ExtractReturnTypesFromTuple<A>>) => R
): TransformRule<R> => {
  const rule: TransformRule<R> = {
    isEqual: (testRule) => testRule === rule,
    transform: (matchContext, context) => {
      const lastMatchcontext = matchContext;

      for (const childRule of args) {
        try {
          const [res, matchRes] = childRule.transform(
            {
              ...lastMatchcontext,
              depth: matchContext.depth + " ",
            },
            context
          );
          if (matchRes.matched) {
            return [fn(res), matchRes];
          }
        } catch (e) {
          console.log(e);
        }
      }

      throw new Error("Or transform error");
    },
  };

  return withCache(rule);
};

export const createRegexpRule = <R>(
  regexp: RegExp,
  fn: (args: {
    matchedStr: string;
    matched: boolean;
    range: [number, number];
  }) => R,
  {
    callOnFailedMatch = false,
  }: {
    callOnFailedMatch?: boolean;
  } = {}
): TransformRule<R> => {
  const rule: TransformRule<R> = {
    isEqual: (testRule) => testRule === rule,
    transform: (matchContext) => {
      const matchRegexp = new RegExp(
        regexp.source[0] === "^" ? regexp.source : `^${regexp.source}`
      );
      const noSpacesIndex = skipSpaces(
        matchContext.str,
        matchContext.lastIndex
      );

      const str = matchContext.str.slice(noSpacesIndex);

      const match = str.match(matchRegexp);
      if (!match) {
        if (callOnFailedMatch) {
          return [
            fn({
              matched: false,
              matchedStr: "",
              range: [noSpacesIndex, noSpacesIndex + 0],
            }),
            {
              matched: false,
              lastIndex: noSpacesIndex,
              str: matchContext.str,
              depth: matchContext.depth,
            },
          ];
        }

        return [undefined, { ...matchContext, matched: false }];
      }

      return [
        fn({
          matched: true,
          matchedStr: match[0],
          range: [noSpacesIndex, noSpacesIndex + match[0].length - 1],
        }),
        {
          matched: true,
          lastIndex: noSpacesIndex + match[0].length,
          str: matchContext.str,
          depth: matchContext.depth,
        },
      ];
    },
  };

  return withCache(rule);
};
