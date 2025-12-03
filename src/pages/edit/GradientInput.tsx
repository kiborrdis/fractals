import {
  Stack,
  Button,
  ColorInput,
  Group,
  NumberInput,
  ActionIcon,
} from "@mantine/core";
import React from "react";
import { GradientStop } from "@/features/fractals/types";
import { FiTrash } from "react-icons/fi";

const MAX_POSITION = 1000;

export const GradientInput = ({
  stops,
  onChange,
}: {
  stops: GradientStop[];
  onChange: (stops: GradientStop[]) => void;
}) => {
  const [stopsInternal, setStopsInternal] = React.useState<GradientStop[]>(
    [...stops].sort((a, b) => a[0] - b[0])
  );
  const [focused, setFocused] = React.useState<boolean>(false);

  const setStops = (newStops: GradientStop[]) => {
    const sorted = [...newStops].sort((a, b) => a[0] - b[0]);
    onChange(sorted);
  };

  const handlePositionChange = (index: number, newPosition: number) => {
    const newStops = [...stopsInternal];
    newStops[index] = [
      newPosition,
      ...stopsInternal[index].slice(1),
    ] as GradientStop;
    setStopsInternal(newStops);

    setStops(newStops);
  };

  const handlePositionBlur = () => {
    setFocused(false);
  };

  const handleColorChange = (index: number, color: string) => {
    const rgba = rgbaStringToNormalizedRgba(color);
    const newStops = [...stops];
    newStops[index] = [stops[index][0], ...rgba];
    setStops(newStops);
  };

  const handleDeleteStop = (index: number) => {
    const newStops = [...stops];
    newStops.splice(index, 1);
    setStops(newStops);
  };

  const handleAddStop = () => {
    const newStops = [...stops, [500, 1, 1, 1, 1] as GradientStop];
    setStops(newStops);
  };

  return (
    <Stack gap="sm">
      {(focused ? stopsInternal : stops).map((stop, index) => (
        <Group key={index} gap="xs" wrap="nowrap">
          <NumberInput
            value={stop[0]}
            onFocus={() => {
              setStopsInternal(stops);
              setFocused(true);
            }}
            onChange={(value) =>
              handlePositionChange(index, Number(value) || 0)
            }
            onBlur={handlePositionBlur}
            min={0}
            max={MAX_POSITION}
            step={1}
            style={{ flex: "0 0 100px" }}
            size="xs"
          />
          <ColorInput
            format="rgba"
            value={rgbaToRgbaString(
              Math.round(stop[1] * 255),
              Math.round(stop[2] * 255),
              Math.round(stop[3] * 255),
              stop[4]
            )}
            onChange={(color) => handleColorChange(index, color)}
            style={{ flex: 1 }}
            size="xs"
          />
          <ActionIcon
            size="sm"
            variant="light"
            color="red"
            onClick={() => handleDeleteStop(index)}
            disabled={stops.length <= 2}
          >
            <FiTrash />
          </ActionIcon>
        </Group>
      ))}
      <Button size="xs" variant="light" onClick={handleAddStop} fullWidth>
        Add Stop
      </Button>
    </Stack>
  );
};

const rgbaToRgbaString = (r: number, g: number, b: number, a: number) => {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const rgbaStringToNormalizedRgba = (str: string) => {
  const parts = str
    .trim()
    .replace(/[rgba()]/g, "")
    .split(",");

  const r = parseInt(parts[0]) / 255;
  const g = parseInt(parts[1]) / 255;
  const b = parseInt(parts[2]) / 255;
  const a = parseFloat(parts[3]);

  return [r, g, b, a] as [number, number, number, number];
};
