import { GradientStop } from "@/features/fractals";
import { EditorLabel } from "../../ui/EditorLabel";
import { useActions } from "../../stores/editStore/data/useActions";
import {
  GradientStopsInput,
  stopsToLinearGradient,
} from "@/shared/ui/GradientStopsInput/GradientStopsInput";
import { useEffect } from "react";

export const TrapColoringGradient = ({
  value,
  onChange,
  name,
}: {
  value: GradientStop[];
  onChange: (name: "trapGradient", value: GradientStop[]) => void;
  name: "trapGradient";
}) => {
  const { staticParamOverride } = useActions();

  return (
    <>
      <EditorLabel>Trap Gradient</EditorLabel>
      <TrapGradientInput
        stops={value}
        onChange={(newStops) => onChange(name, newStops)}
        onPreview={(newStops) => staticParamOverride(name, newStops)}
      />
    </>
  );
};

export const TrapGradientInput = ({
  stops,
  onChange,
  onPreview,
}: {
  stops: GradientStop[];
  onChange: (stops: GradientStop[]) => void;
  onPreview?: (stops: GradientStop[] | undefined) => void;
}) => {
  useEffect(() => {
    return () => {
      onPreview?.(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maxPos = Math.max(...stops.map((s) => s[0]), 1);
  const gradientString = stopsToLinearGradient(stops, maxPos);

  return (
    <GradientStopsInput
      stops={stops}
      onChange={onChange}
      stopLabel='Distance'
      colorLabel='Color'
      gradientTooltip='Trap distance gradient'
      gradientString={gradientString}
      stopNumberInputProps={{ step: 0.1, decimalScale: 3 }}
      defaultNewStop={[50, 0.5, 0.5, 0.5, 1] as GradientStop}
    />
  );
};
