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
      transform: (d: any) => [infer V, MatchContext];
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

export type TransformRule<R> = {
  isEqual: (rule: TransformRule<any>) => boolean;
  transform: (matchContext: MatchContext) => [R | undefined, MatchContext];
};

export const createTransformRule = <
  A extends ReadonlyArray<TransformRule<any>>,
  R
>(
  _: string,
  rules: A,
  fn: (args: ExtractReturnTypesFromTuple<A>) => R
): TransformRule<R> => {
  const rule: TransformRule<R> = {
    isEqual: (testRule) => testRule === rule,
    transform: (matchContext) => {
      let lastMatchContext = matchContext;
      const data: any[] = [];

      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];

        const [res, matchRes] = rule.transform({
          ...lastMatchContext,
          depth: matchContext.depth + " ",
        });

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

  return rule;
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
    transform: (matchContext) => {
      const lastMatchcontext = matchContext;

      for (const rule of args) {
        try {
          const [res, matchRes] = rule.transform({
            ...lastMatchcontext,
            depth: matchContext.depth + " ",
          });
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

  return rule;
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

  return rule;
};
