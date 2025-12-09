import {
  parseFormula,
  validateFormula,
  calcTypesOfNodes,
  VarNameToTypeMap,
} from "@/features/fractals";
import { TextInput } from "@mantine/core";
import { useMemo, useState } from "react";
import { useCustomVars } from "./store/data/useCustomVars";

const defaultVars: VarNameToTypeMap = {};

export const FormulaInput = ({
  value,
  onChange,
  vars = defaultVars,
  placeholder = "Fractal formula",
  label,
}: {
  value: string;
  onChange: (newFormula: string) => void;
  vars?: VarNameToTypeMap;
  label?: string;
  placeholder?: string;
}) => {
  const customVars = useCustomVars();

  const [formula, setFormula] = useState(value);
  const [error, setError] = useState<string | null>(null);

  const customVarTypes: VarNameToTypeMap = useMemo(() => {
    return Object.entries(customVars).reduce(
      (acc, [key, type]) => {
        acc[key] = Array.isArray(type) ? "vector2" : "number";
        return acc;
      },
      { ...vars },
    );
  }, [customVars, vars]);
  const customVarsSet = useMemo(() => {
    return new Set(Object.keys(customVarTypes));
  }, [customVarTypes]);

  return (
    <TextInput
      label={label}
      placeholder={placeholder}
      size='sm'
      onBlur={() => {
        if (error) {
          setFormula(value);
          setError(null);
        } else {
          onChange(formula);
        }
      }}
      error={error ? error : undefined}
      value={formula}
      onChange={(e) => {
        const newFormula = e.target.value;
        setFormula(newFormula);

        try {
          const node = parseFormula(newFormula);
          const typeMap = calcTypesOfNodes(node, customVarTypes);

          const [valid, message] = validateFormula(node, customVarsSet);
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

          if (typeMap.get(node) !== "vector2") {
            setError("Resulting type must be vector");
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
