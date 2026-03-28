import { GradientStop } from "@/features/fractals";
import {
  Stack,
  Group,
  Button,
  Divider,
  NumberInput,
  ScrollArea,
  UnstyledButton,
  Text,
} from "@mantine/core";
import { useState } from "react";
import { EditorLabel } from "../../ui/EditorLabel";
import { GRADIENT_PRESETS } from "./gradientPresetData";
import { FiCheck, FiX } from "react-icons/fi";
import styles from "./GradientPresets.module.css";

const presetToHorizontalGradient = (stops: GradientStop[]): string => {
  const sorted = [...stops].sort((a, b) => a[0] - b[0]);
  const maxPos = sorted[sorted.length - 1]?.[0] ?? 1;
  const stopsStr = sorted.map((stop) => {
    const pct = (stop[0] / maxPos) * 100;
    const color = `rgba(${Math.round(stop[1] * 255)}, ${Math.round(stop[2] * 255)}, ${Math.round(stop[3] * 255)}, ${stop[4]})`;
    return `${color} ${pct}%`;
  });
  return `linear-gradient(to right, ${stopsStr.join(", ")})`;
};

const scaleStops = (
  stops: GradientStop[],
  maxPosition: number,
  reverse = false,
): GradientStop[] => {
  let stopsToScale = stops;
  
  if (reverse) {
    stopsToScale = stops.map(([, r, g, b, a], i) => [stops[stops.length - 1 - i][0], r, g, b, a] as GradientStop).reverse();
  }

  const maxPresetPos = stops[stops.length - 1][0] || 1;

  return stopsToScale.map(
    ([pos, r, g, b, a]) => [(pos / maxPresetPos) * maxPosition, r, g, b, a] as GradientStop,
  );
};

export const GradientPresets = ({
  onApply,
  onCancel,
  onPreview,
  initialMaxPosition,
  canEditMaxPosition = false,
  reverse = false,
  maxPositionLabel = "Max Position",
}: {
  onApply: (stops: GradientStop[]) => void;
  onCancel: () => void;
  onPreview: (stops: GradientStop[]) => void;
  initialMaxPosition: number;
  canEditMaxPosition?: boolean;
  maxPositionLabel?: string;
  reverse?: boolean;
}) => {
  const [maxPosition, setMaxPosition] = useState(initialMaxPosition);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSelectPreset = (index: number) => {
    setSelectedIndex(index);
    onPreview(scaleStops(GRADIENT_PRESETS[index].stops, maxPosition, reverse));
  };

  const handleMaxPositionChange = (val: number) => {
    setMaxPosition(val);
    if (selectedIndex !== null) {
      onPreview(scaleStops(GRADIENT_PRESETS[selectedIndex].stops, val, reverse));
    }
  };

  return (
    <Stack gap='md'>
      {canEditMaxPosition && (
        <Group justify='space-between'>
          <EditorLabel size='xs'>{maxPositionLabel}</EditorLabel>
          <NumberInput
            w={80}
            size='xs'
            min={0.001}
            step={0.1}
            decimalScale={3}
            value={maxPosition}
            onChange={(val) => handleMaxPositionChange(Number(val) || 1)}
          />
        </Group>
      )}

      <ScrollArea.Autosize mah={260}>
        <Stack gap={4}>
          {GRADIENT_PRESETS.map((preset, i) => (
            <UnstyledButton
              key={i}
              onClick={() => handleSelectPreset(i)}
              className={`${styles.presetItem} ${selectedIndex === i ? styles.presetItemSelected : ""}`}
            >
              <Stack gap={4}>
                <Text size='xs'>{preset.name}</Text>
                <div
                  className={styles.gradientBar}
                  style={{ background: presetToHorizontalGradient(preset.stops) }}
                />
              </Stack>
            </UnstyledButton>
          ))}
        </Stack>
      </ScrollArea.Autosize>

      <Divider />

      <Group grow>
        <Button
          variant='default'
          size='xs'
          onClick={onCancel}
          leftSection={<FiX />}
        >
          Cancel
        </Button>
        <Button
          variant='filled'
          size='xs'
          color='green'
          disabled={selectedIndex === null}
          onClick={() => {
            if (selectedIndex !== null) {
              onApply(
                scaleStops(GRADIENT_PRESETS[selectedIndex].stops, maxPosition, reverse),
              );
            }
          }}
          leftSection={<FiCheck />}
        >
          Apply
        </Button>
      </Group>
    </Stack>
  );
};
