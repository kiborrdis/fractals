import {
  parseFormula,
  validateFormula,
  VarNameToTypeMap,
} from "@/features/fractals";
import { useMemo, useState } from "react";
import { useCustomVars } from "../stores/editStore/data/useCustomVars";
import { EditorDocTooltip } from "./EditorDocTooltip";
import { mergeDocKeys } from "@/shared/ui/DocTooltip";
import { HighlightedInputRange, HightlightInput } from "./HighlightInput";
import {
  CalcNodeType,
  forEachNodeChild,
} from "@/shared/libs/complexVariableFormula";

const defaultVars: VarNameToTypeMap = {};

export const FormulaInput = ({
  value,
  onChange,
  vars = defaultVars,
  placeholder = "Fractal formula",
  docKey,
  label,
}: {
  value: string;
  onChange: (newFormula: string) => void;
  vars?: VarNameToTypeMap;
  label?: string;
  docKey?: string;
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

  const ranges: HighlightedInputRange[] = useMemo(() => {
    try {
      const node = parseFormula(formula);
      const ranges: HighlightedInputRange[] = [];

      forEachNodeChild(node, (child) => {
        if (child.t === CalcNodeType.Variable) {
          ranges.push({
            r: child.r as [number, number],
            data: { color: "#81C7FF" },
          });
        }

        if (child.t === CalcNodeType.FuncCall) {
          ranges.push({
            r: child.r as [number, number],
            data: { color: "#D4A5D4" },
          });
        }

        if (child.t === CalcNodeType.Number) {
          ranges.push({
            r: child.r as [number, number],
            data: { color: child.im ? "#80CBC4" : "#FFB366" },
          });
        }
      });

      return ranges;
    } catch {
      return [];
    }
  }, [formula]);

  return (
    <HightlightInput
      ranges={ranges}
      label={label}
      placeholder={placeholder}
      size='sm'
      rightSection={
        docKey ? <EditorDocTooltip docKeys={mergeDocKeys(docKey)} /> : null
      }
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

          const [valid, message] = validateFormula(node, customVarsSet);
          if (!valid) {
            setError(message);
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
