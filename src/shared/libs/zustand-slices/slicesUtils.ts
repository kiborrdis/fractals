/* eslint-disable @typescript-eslint/no-empty-object-type */

export type CombineSlices<
  Args extends unknown[],
  Accum extends {} = {},
> = Args extends []
  ? Accum
  : Args extends [infer Slice, ...infer RestArgs]
    ? Slice extends {}
      ? CombineSlices<RestArgs, CombineTwoSlices<Accum, Slice>>
      : CombineSlices<RestArgs, Accum>
    : never;

type CombineTwoSlices<A extends {}, B extends {}> = Omit<A, "actions"> &
  Omit<B, "actions"> &
  CombineSlicesActions<A, B>;

type CombineSlicesActions<A extends {}, B extends {}> = A extends {
  actions: infer AActions;
}
  ? B extends { actions: infer BActions }
    ? { actions: AActions & BActions }
    : { actions: AActions }
  : B extends { actions: infer BActions }
    ? { actions: BActions }
    : { actions: {} };

export const combineSlices = <S extends {}[]>(
  ...slices: S
): CombineSlices<S> => {
  const actions = Object.assign(
    {},
    ...slices.map((s) => ("actions" in s ? s.actions : {})),
  );
  const state = Object.assign(
    {},
    ...slices.map((slice) => {
      if ("actions" in slice) {
        const { actions: _, ...rest } = slice;
        return rest;
      }
      return slice;
    }),
  );
  return { ...state, actions } as CombineSlices<S>;
};
