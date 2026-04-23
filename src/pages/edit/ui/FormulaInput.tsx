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
  calcTypesOfNodes,
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

  const [formulaNode, formulaTypes, error] = useMemo(() => {
    try {
      const node = parseFormula(formula);
      let [valid, message] = validateFormula(node, customVarsSet);
      const types = calcTypesOfNodes(node, customVarTypes);

      if (valid && types.get(node) === "error") {
        valid = false;
        message = "Type error in formula";
      }

      return [node, types, valid ? null : message] as const;
    } catch {
      return [null, new Map(), "Wrong formula"] as const;
    }
  }, [formula, customVarsSet, customVarTypes]);

  const ranges: HighlightedInputRange[] = useMemo(() => {
    if (!formulaNode) {
      return [];
    }

    const ranges: HighlightedInputRange[] = [];

    forEachNodeChild(formulaNode, (child) => {
      if (child.t === CalcNodeType.Variable) {
        ranges.push({
          r: child.r as [number, number],
          data: { color: "#81C7FF" },
        });
      }

      if (child.t === CalcNodeType.FuncCall) {
        // If the function call itself is not valid, highlight it as an error
        if (
          formulaTypes.get(child) === "error" &&
          child.o.every((c) => formulaTypes.get(c) !== "error")
        ) {
          ranges.push({
            r: child.r as [number, number],
            data: { color: "#FF6E6E" },
          });
          return;
        }

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
  }, [formulaNode, formulaTypes]);

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
        } else {
          onChange(formula);
        }
      }}
      error={error ? error : undefined}
      value={formula}
      onChange={(e) => {
        const newFormula = e.target.value;
        setFormula(newFormula);
      }}
    />
  );
};
