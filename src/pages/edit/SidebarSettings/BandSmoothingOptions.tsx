import { Label } from "@/shared/ui/Label/Label";
import { Stack, SegmentedControl, NumberInput } from "@mantine/core";

export const BandSmoothingOptions = ({
  value = 0, onChange,
}: {
  value?: number;
  onChange: (value: number) => void;
}) => {
  let smoothingType: "auto" | "disabled" | "custom" = "auto";

  if (value >= 2) {
    smoothingType = "custom";
  } else if (value < 0) {
    smoothingType = "disabled";
  }

  return (
    <Stack>
      <Label>Band Smoothing</Label>
      <SegmentedControl
        value={smoothingType}
        data={[
          { value: "auto", label: "Auto" },
          { value: "disabled", label: "Disabled" },
          { value: "custom", label: "Custom" },
        ]}
        size='sm'
        onChange={(newValue) => {
          let smoothingValue = 0;
          if (newValue === "custom") {
            smoothingValue = 2;
          } else if (newValue === "disabled") {
            smoothingValue = -1;
          }

          onChange(smoothingValue);
        }} />
      {smoothingType === "custom" && (
        <NumberInput
          value={value}
          min={2}
          step={1}
          disabled={smoothingType !== "custom"}
          onChange={(newValue) => {
            if (isNaN(Number(newValue))) {
              onChange(2);
              return;
            }

            onChange(Number(newValue));
          }} />
      )}
    </Stack>
  );
};
