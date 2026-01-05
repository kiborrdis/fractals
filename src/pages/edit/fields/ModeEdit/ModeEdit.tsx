import { SegmentedControl, Stack } from "@mantine/core";
import { useStaticRule } from "../../stores/editStore/data/useStaticRule";
import { useEffect, useRef, useState } from "react";
import { FormulaInput } from "../../ui/FormulaInput";
import { useFractalMode } from "../../stores/editStore/data/useFractalMode";
import { initialCFormulaVars, initialZFormulaVars } from "@/features/fractals";

export const ModeEdit = () => {
  const [initialZFormula, setInitialZFormula] =
    useStaticRule("initialZFormula");
  const [initialCFormula, setInitialCFormula] =
    useStaticRule("initialCFormula");
  const [forceCustomMode, setForceCustomMode] = useState(false);
  const subsecuentPressCountRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  let mode = useFractalMode();

  if (forceCustomMode) {
    mode = "custom";
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleModeChange = (value: string) => {
    if (value === "cplane") {
      setInitialZFormula("initialZFormula", "c0");
      setInitialCFormula("initialCFormula", "fCoord");
    } else if (value === "zplane") {
      setInitialZFormula("initialZFormula", "fCoord");
      setInitialCFormula("initialCFormula", "c0");
    }
  };

  if (mode === "custom") {
    return (
      <Stack>
        <FormulaInput
          value={initialZFormula || ""}
          onChange={(newFormula) => {
            if (newFormula.trim()) {
              setInitialZFormula("initialZFormula", newFormula);
            }
          }}
          label='Initial Z Formula'
          vars={initialZFormulaVars}
        />
        <FormulaInput
          value={initialCFormula || ""}
          onChange={(newFormula) => {
            if (newFormula.trim()) {
              setInitialCFormula("initialCFormula", newFormula);
            }
          }}
          label='Initial C Formula'
          vars={initialCFormulaVars}
        />
      </Stack>
    );
  }

  return (
    <SegmentedControl
      value={mode}
      onClick={() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        if (subsecuentPressCountRef.current >= 4) {
          setForceCustomMode(true);
        }

        subsecuentPressCountRef.current += 1;

        timeoutRef.current = setTimeout(() => {
          subsecuentPressCountRef.current = 0;
        }, 250);
      }}
      onChange={handleModeChange}
      data={[
        { label: "Z-Plane", value: "zplane" },
        { label: "C-Plane", value: "cplane" },
      ]}
    />
  );
};
