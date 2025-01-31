import { NumberInput } from "@mantine/core";
import { useGlobalKeyMods } from "../hooks/useGlobalKeyMods";
import { ComponentProps, ReactNode, useCallback, useRef, useState } from "react";

export const EditorNumberInput = ({
  onChange,
  value,
  min = -Infinity,
  max = Infinity,
  step,
  decimalScale = 7,
  label,
  w,
  id,
}: {
  onChange: (newNumber: number) => void;
  value: number;
  step: number;
  min?: number;
  max?: number;
  decimalScale?: number;
  label?: ReactNode;
  id?: string;
  w?: ComponentProps<typeof NumberInput>['w'];
}) => {
  const { shift } = useGlobalKeyMods();
  const [focus, setFocus] = useState(false);
  const valueRef = useRef(value);
  valueRef.current = value;

  return (
    <NumberInput
      w={w}
      id={id}
      label={label}
      onFocus={useCallback(() => setFocus(true), [])}
      onBlur={useCallback(() => setFocus(false), [])}
      ref={useCallback((el: HTMLInputElement) => {
        if (!el || !focus) {
          return;
        }
        const handler = (e: WheelEvent) => {
          const newValue =
            valueRef.current + Math.sign(e.deltaY) * (step * (shift ? 10 : 1));

          if (newValue >= min && newValue <= max) {
            onChange(newValue);
          }
          e.preventDefault();
          e.stopPropagation();
        };
        el.addEventListener("wheel", handler, { passive: false });

        return () => {
          el.removeEventListener("wheel", handler);
        };
      }, [focus, max, min, onChange, shift, step])}
      size="xs"
      clampBehavior="blur"
      decimalScale={decimalScale}
      value={value}
      stepHoldInterval={1000}
      onChange={(newValue) => {
        const num = Number(newValue);

        if (!isNaN(num)) {
          onChange(num);
        }
      }}
      min={min}
      max={max}
      step={shift ? step * 10 : step}
    />
  );
};
