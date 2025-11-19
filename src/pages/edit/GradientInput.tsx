import { Stack, Button, ColorInput } from "@mantine/core";
import React from "react";
import { GradientStop } from "@/features/fractals/types";
import { useMove } from "@mantine/hooks";

export const GradientInput = ({
  initialStops,
  onChange,
}: {
  onChange: (stops: GradientStop[]) => void;
  initialStops: GradientStop[];
}) => {
  const [stops, rawSetStops] = React.useState<GradientStop[]>(initialStops);
  const [selectedStop, setSelectedStop] = React.useState<number | null>(null);

  const setStops = (newStops: GradientStop[]) => {
    rawSetStops(newStops);
    onChange(newStops.sort((a, b) => a[0] - b[0]));
  };

  return (
    <div>
      <div
        style={{
          position: "relative",
        }}
      >
        <div
          style={{
            width: "100%",
            height: 20,
            background: `linear-gradient(to right, ${stops
              .map(
                (stop) =>
                  `rgba(${stop[1] * 255}, ${stop[2] * 255}, ${stop[3] * 255}, ${
                    stop[4]
                  }) ${stop[0] * 100}%`
              )
              .join(", ")})`,
            borderRadius: 4,
            border: "1px solid #444",
          }}
        ></div>
        {stops.map((stop, index) => (
          <GradientPointHandle
            key={index}
            point={stop}
            onClick={() => {
              setSelectedStop(index);
            }}
            onPositionChange={(newPos) => {
              const newStops = [...stops];
              newStops[index] = [newPos, ...stop.slice(1)] as GradientStop;
              setStops(newStops);
            }}
          />
        ))}
      </div>
      <Stack pt="md">
        {selectedStop !== null && (
          <div>
            <ColorInput
              format="rgba"
              value={rgbaToRgbaString(
                Math.round(stops[selectedStop][1] * 255),
                Math.round(stops[selectedStop][2] * 255),
                Math.round(stops[selectedStop][3] * 255),
                stops[selectedStop][4]
              )}
              onChange={(hex) => {
                const rgb = rgbaStringToNormalizedRgba(hex);
                const newStops = [...stops];
                newStops[selectedStop] = [
                  newStops[selectedStop][0],
                  ...rgb,
                ];
                setStops(newStops);
              }}
            />

            <Button
              size="xs"
              variant="transparent"
              onClick={() => {
                const newStops = [...stops];
                newStops.splice(selectedStop, 1);
                setStops(newStops);
                setSelectedStop(null);
              }}
              disabled={stops.length <= 2}
            >
              Remove Stop
            </Button>
          </div>
        )}
        <Button
          size="xs"
          variant="light"
          onClick={() => {
            const newStops = [...stops, [0.5, 1, 1, 1, 1] as GradientStop];
            newStops.sort((a, b) => a[0] - b[0]);
            setStops(newStops);
          }}
        >
          Add Stop
        </Button>
      </Stack>
    </div>
  );
};

const rgbToHex = (r: number, g: number, b: number) => {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const rgbaToRgbaString = (r: number, g: number, b: number, a: number) => {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const toHex = (c: number) => {
  const hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
};

const hexToNormalizedRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  return [r, g, b] as [number, number, number];
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

        console.log('str', str, parts, r,g,b,a);


  return [r, g, b, a] as [number, number, number, number];
};

const GradientPointHandle = ({
  point,
  onPositionChange,
  onClick,
}: {
  point: GradientStop;
  onClick?: () => void;
  onPositionChange?: (newPos: number) => void;
}) => {
  const { ref } = useMove(({ x }) => {
    if (onPositionChange) {
      onPositionChange(Math.min(1, Math.max(0, x)));
    }
  });

  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
      }}
      ref={ref}
    >
      <div
        style={{
          position: "absolute",
          left: `${point[0] * 100}%`,
          transform: "translate(-50%, 100%)",
          cursor: "pointer",
          bottom: 0,
        }}
        onClick={() => {
          if (onClick) {
            onClick();
          }
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            background: `rgba(${point[1] * 255}, ${point[2] * 255}, ${
              point[3] * 255
            }, ${point[4]})`,
            borderRadius: "50%",
          }}
        ></div>
      </div>
    </div>
  );
};
