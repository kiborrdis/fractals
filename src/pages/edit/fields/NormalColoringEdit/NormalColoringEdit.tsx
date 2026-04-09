import { ColorInput } from "@mantine/core";
import { GradientStop } from "@/features/fractals";
import { useColoringEntry } from "../../stores/editStore/data/useColoringRules";
import { useStaticRule } from "../../stores/editStore/data/useStaticRule";
import { useActions } from "../../stores/editStore/data/useActions";
import { NumberRuleEdit } from "../NumberRuleEdit/NumberRuleEdit";
import { NumberBuildRule } from "@/shared/libs/numberRule";

const rgbaToColorInputValue = (rgba: [number, number, number, number]) =>
  `rgba(${Math.floor(rgba[0] * 255)}, ${Math.floor(rgba[1] * 255)}, ${Math.floor(rgba[2] * 255)}, ${rgba[3]})`;

const colorInputToRgba = (color: string): [number, number, number, number] => {
  const parts = color
    .replace("rgba(", "")
    .replace("rgb(", "")
    .replace(")", "")
    .split(",")
    .map((v) => v.trim());
  return [
    parseInt(parts[0], 10) / 255,
    parseInt(parts[1], 10) / 255,
    parseInt(parts[2], 10) / 255,
    parts.length === 4 ? parseFloat(parts[3]) : 1,
  ];
};

export const NormalColoringEdit = ({
  coloringIndex,
}: {
  coloringIndex: number;
}) => {
  const entry = useColoringEntry(coloringIndex);
  const { editColoringParams } = useActions();
  const gradientId = entry[1][0] as number;
  const [gradients, setGradients] = useStaticRule("gradients");
  const gradientsArr = gradients as GradientStop[][];

  const gradient = gradientsArr[gradientId] ?? [
    [0, [0, 0, 0, 1]],
    [1, [1, 1, 1, 1]],
  ];
  const shadowColor = (gradient[0]?.[1] ?? [0, 0, 0, 1]) as [
    number,
    number,
    number,
    number,
  ];
  const lightColor = (gradient[1]?.[1] ?? [1, 1, 1, 1]) as [
    number,
    number,
    number,
    number,
  ];

  const updateColor = (
    stopIndex: number,
    rgba: [number, number, number, number],
  ) => {
    const updated = [...gradientsArr];
    const currentGrad: GradientStop[] = [
      ...(updated[gradientId] ?? [
        [0, [0, 0, 0, 1]],
        [1, [1, 1, 1, 1]],
      ]),
    ];
    currentGrad[stopIndex] = [currentGrad[stopIndex][0], rgba] as GradientStop;
    updated[gradientId] = currentGrad;
    setGradients("gradients", updated);
  };

  return (
    <>
      <ColorInput
        label='Shadow Color'
        size='xs'
        format='rgba'
        value={rgbaToColorInputValue(shadowColor)}
        onChange={(color) => updateColor(0, colorInputToRgba(color))}
      />
      <ColorInput
        label='Light Color'
        size='xs'
        format='rgba'
        value={rgbaToColorInputValue(lightColor)}
        onChange={(color) => updateColor(1, colorInputToRgba(color))}
      />
      <NumberRuleEdit
        name='lightAngle'
        label='Light Source Angle'
        min={-Math.PI}
        max={Math.PI}
        step={0.01}
        minRange={0.01}
        value={entry[2][0] as NumberBuildRule}
        onChange={(_name, rule) => editColoringParams(coloringIndex, 0, rule)}
      />
    </>
  );
};
