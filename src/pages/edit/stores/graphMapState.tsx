import { createStorageSlot } from "@/shared/hooks/useStorageSlot";
import { Vector2 } from "@/shared/libs/vectors";
import { ReactNode } from "react";
import { useFractalFormula } from "./editStore/data/useFractalFormula";

const { SlotProvider, useSlot } = createStorageSlot<Vector2>();

export const GraphMapParamProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const formula = useFractalFormula();

  return (
    <SlotProvider storageKey={formula} initialValue={[0, 0] as const}>
      {children}
    </SlotProvider>
  );
};

export const useGraphMapParam = useSlot;
