import { TextInput } from "@mantine/core";
import { useState } from "react";
import { parseFormula, validateFormula } from "../formula/parseFormula";

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
      error={error ? "Wrong formula" : undefined}
      value={formula}
      onChange={(e) => {
        const newFormula = e.target.value;
        setFormula(newFormula);

        try {
          const node = parseFormula(newFormula);

          const [valid, message] = validateFormula(node);

          if (!valid) {
            setError(message);
            return;
          }

          setError(null);
        } catch {
          setError("Wrong formula");
        }
      }} />
  );
};
