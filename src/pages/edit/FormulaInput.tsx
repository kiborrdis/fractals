import { parseFormula, validateFormula, calcTypesOfNodes} from "@/features/fractals";
import { TextInput } from "@mantine/core";
import { useState } from "react";

export const FormulaInput = ({
  value, onChange,
}: {
  value: string;
  onChange: (newFormula: string) => void;
}) => {
  const [formula, setFormula] = useState(value);
  const [error, setError] = useState<string | null>(null);

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
          const typeMap = calcTypesOfNodes(node);

          const [valid, message] = validateFormula(node);

          if (!valid) {
            setError(message);
            return;
          }

          if ([...typeMap.entries()].some(([, type]) => {
            return type === 'error';
          })) {
            setError('Mismatched types')
            return;
          }

          setError(null);
        } catch(e) {
          console.log(e);
          setError("Wrong formula");
        }
      }} />
  );
};
