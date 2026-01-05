import {
  Stack,
  ColorInput,
  NumberInput,
  ActionIcon,
  Tooltip,
  Group,
} from "@mantine/core";
import type { NumberInputProps } from "@mantine/core";
import { useState, Fragment, ReactNode } from "react";
import { GradientStop } from "@/features/fractals";
import { FiTrash, FiPlus } from "react-icons/fi";
import { Label } from "@/shared/ui/Label/Label";
import styles from "./GradientStopsInput.module.css";

export const rgbaToRgbaString = (r: number, g: number, b: number, a: number) =>
  `rgba(${r}, ${g}, ${b}, ${a})`;

export const stopsToLinearGradient = (
  stops: GradientStop[],
  maxPos: number,
) => {
  const sorted = [...stops].sort((a, b) => a[0] - b[0]);
  const gradientStops = sorted.map((stop) => {
    const percentage = (stop[0] / maxPos) * 100;
    const color = rgbaToRgbaString(
      Math.round(stop[1] * 255),
      Math.round(stop[2] * 255),
      Math.round(stop[3] * 255),
      stop[4],
    );
    return `${color} ${percentage}%`;
  });
  return `linear-gradient(to bottom, ${gradientStops.join(", ")})`;
};

const rgbaStringToNormalizedRgba = (str: string) => {
  const parts = str
    .trim()
    .replace(/[rgba()]/g, "")
    .split(",");
  return [
    parseInt(parts[0]) / 255,
    parseInt(parts[1]) / 255,
    parseInt(parts[2]) / 255,
    parseFloat(parts[3]),
  ] as [number, number, number, number];
};

export const GradientStopsInput = ({
  stops,
  onChange,
  stopLabel,
  colorLabel,
  gradientTooltip,
  gradientString,
  actions,
  stopNumberInputProps,
  defaultNewStop = [500, 1, 1, 1, 1] as GradientStop,
}: {
  stops: GradientStop[];
  onChange: (stops: GradientStop[]) => void;
  stopLabel: string;
  colorLabel: string;
  gradientTooltip: string;
  gradientString: string;
  actions?: ReactNode;
  stopNumberInputProps?: Partial<NumberInputProps>;
  defaultNewStop?: GradientStop;
}) => {
  const [stopsInternal, setStopsInternal] = useState<GradientStop[]>(
    [...stops].sort((a, b) => a[0] - b[0]),
  );
  const [focused, setFocused] = useState(false);

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

  const handleColorChange = (index: number, color: string) => {
    const rgba = rgbaStringToNormalizedRgba(color);
    const newStops = [...stops];
    newStops[index] = [stops[index][0], ...rgba];
    setStops(newStops);
  };

  return (
    <Stack gap='sm'>
      <div className={styles.container}>
        <div className={styles.gradientPreviewContainer}>
          <Tooltip.Floating label={gradientTooltip} position='left'>
            <div
              className={styles.gradientPreview}
              style={{ background: gradientString }}
            />
          </Tooltip.Floating>
        </div>
        <div className={styles.gridContainer}>
          <Label size='xs'>{stopLabel}</Label>
          <Label size='xs'>{colorLabel}</Label>
          <div />
          {(focused ? stopsInternal : stops).map((stop, index) => (
            <Fragment key={index}>
              <NumberInput
                w='100%'
                value={stop[0]}
                onFocus={() => {
                  setStopsInternal(stops);
                  setFocused(true);
                }}
                onChange={(value) =>
                  handlePositionChange(index, Number(value) || 0)
                }
                onBlur={() => setFocused(false)}
                min={0}
                step={1}
                size='xs'
                {...stopNumberInputProps}
              />
              <ColorInput
                format='rgba'
                value={rgbaToRgbaString(
                  Math.round(stop[1] * 255),
                  Math.round(stop[2] * 255),
                  Math.round(stop[3] * 255),
                  stop[4],
                )}
                onChange={(color) => handleColorChange(index, color)}
                size='xs'
              />
              <ActionIcon
                size='md'
                variant='transparent'
                color='red'
                onClick={() => {
                  const newStops = [...stops];
                  newStops.splice(index, 1);
                  setStops(newStops);
                }}
                disabled={stops.length <= 2}
              >
                <FiTrash />
              </ActionIcon>
            </Fragment>
          ))}
        </div>
      </div>
      <Group gap='sm' justify='flex-end'>
        {actions}
        <Tooltip label='Add stop' position='left'>
          <ActionIcon
            size='md'
            variant='outlined'
            onClick={() => {
              const newStops = [...stops, defaultNewStop];
              setStops(newStops);
            }}
          >
            <FiPlus />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Stack>
  );
};
