import {
  parseFormula,
  validateFormula,
  calcTypesOfNodes,
} from "@/features/fractals";
import { TextInput } from "@mantine/core";
import { useMemo, useState } from "react";
import { useCustomVars } from "./store/data/useCustomVars";
import { CalcNodeResultType } from "@/features/fractals/formula/types";

export const FormulaInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (newFormula: string) => void;
}) => {
  const customVars = useCustomVars();

  const [formula, setFormula] = useState(value);
  const [error, setError] = useState<string | null>(null);

  const customVarTypes: Record<string, CalcNodeResultType> = useMemo(() => {
    return Object.entries(customVars).reduce((acc, [key, type]) => {
      acc[key] = Array.isArray(type) ? "vector2" : "number";
      return acc;
    }, {} as Record<string, CalcNodeResultType>);
  }, [customVars]);

  const customVarsSet = useMemo(() => {
    return new Set(Object.keys(customVars));
  }, [customVars]);

  return (
    <TextInput
      onBlur={() => {
        if (error) {
          setFormula(value);
          setError(null);
        } else {
          onChange(formula);
        }
      }}
      placeholder="Fractal formula"
      error={error ? error : undefined}
      value={formula}
      onChange={(e) => {
        const newFormula = e.target.value;
        setFormula(newFormula);

        try {
          const node = parseFormula(newFormula);
          const typeMap = calcTypesOfNodes(node, customVarTypes);

          const [valid, message] = validateFormula(
            node,
            customVarsSet
          );
          if (!valid) {
            setError(message);
            return;
          }

          if (
            [...typeMap.entries()].some(([, type]) => {
              return type === "error";
            })
          ) {
            setError("Mismatched types");
            return;
          }

          setError(null);
        } catch (e) {
          console.log(e);
          setError("Wrong formula");
        }
      }}
    />
  );
};
