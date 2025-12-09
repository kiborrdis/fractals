import {
  Stack,
  Button,
  ColorInput,
  NumberInput,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import React from "react";
import { GradientStop } from "@/features/fractals/types";
import { FiTrash } from "react-icons/fi";
import { Label } from "@/shared/ui/Label/Label";
import styles from "./GradientInput.module.css";
import { useMaxIteration } from "../../store/data/useMaxIteration";

export const GradientInput = ({
  stops,
  onChange,
}: {
  stops: GradientStop[];
  onChange: (stops: GradientStop[]) => void;
}) => {
  const [stopsInternal, setStopsInternal] = React.useState<GradientStop[]>(
    [...stops].sort((a, b) => a[0] - b[0]),
  );
  const [focused, setFocused] = React.useState<boolean>(false);
  const maxPosition = useMaxIteration();

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

  const generateGradientString = () => {
    const sortedStops = [...stops].sort((a, b) => a[0] - b[0]);
    const gradientStops = sortedStops.map((stop) => {
      const percentage = (stop[0] / maxPosition) * 100;
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

  const generateAlignedGradientString = () => {
    const sortedStops = [...stops].sort((a, b) => a[0] - b[0]);

    const rowHeight = 36;
    const gapHeight = 8;
    const headerHeight = 24;
    const totalContentHeight =
      headerHeight + stops.length * (rowHeight + gapHeight) - gapHeight;

    const gradientStops = sortedStops.map((stop, index) => {
      // Calculate the position of each row's center
      const rowPosition =
        headerHeight + index * (rowHeight + gapHeight) + rowHeight / 2;
      const percentage = (rowPosition / totalContentHeight) * 100;

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

  return (
    <Stack gap='sm'>
      <div className={styles.container}>
        <div className={styles.gradientPreviewContainer}>
          <Tooltip.Floating
            label='Gradient up to current max iteration'
            position='left'
          >
            <div
              className={styles.gradientPreview}
              style={{ background: generateGradientString() }}
            />
          </Tooltip.Floating>
          <Tooltip.Floating
            label='Full gradient without proportion'
            position='left'
          >
          <div
            className={styles.gradientPreview}
            style={{ background: generateAlignedGradientString() }}
          />
          </Tooltip.Floating>
        </div>
        <div className={styles.gridContainer}>
          <Label size='xs'>Iteration</Label>
          <Label size='xs'>Color</Label>
          <div />
          {(focused ? stopsInternal : stops).map((stop, index) => (
            <React.Fragment key={index}>
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
                onBlur={() => {
                  setFocused(false);
                }}
                min={0}
                max={maxPosition}
                step={1}
                size='xs'
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
                size='sm'
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
            </React.Fragment>
          ))}
        </div>
      </div>
      <Button
        size='xs'
        variant='transparent'
        onClick={() => {
          const newStops = [...stops, [500, 1, 1, 1, 1] as GradientStop];
          setStops(newStops);
        }}
        fullWidth
      >
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
