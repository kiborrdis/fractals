import { MirroringPassType } from "@/features/fractals";
import { Stack, SegmentedControl } from "@mantine/core";
import { EditorLabel } from "../../ui/EditorLabel";
import { useMirroringPasses } from "../../stores/editStore/data/useMirroringPasses";
import { NumberRuleEdit } from "../NumberRuleEdit/NumberRuleEdit";
import { makeRuleFromNumber } from "@/shared/libs/numberRule/ruleConversion";
import { NumberBuildRule } from "@/shared/libs/numberRule";

type MirroringTypeOption = "off" | "square" | "hex" | "radial";

const typeToPassType: Record<
  Exclude<MirroringTypeOption, "off">,
  MirroringPassType
> = {
  square: MirroringPassType.Linear,
  hex: MirroringPassType.Hex,
  radial: MirroringPassType.Radial,
};

const passTypeToType: Record<number, MirroringTypeOption> = {
  [MirroringPassType.Linear]: "square",
  [MirroringPassType.Hex]: "hex",
  [MirroringPassType.Radial]: "radial",
};

const factorConfig: Record<
  Exclude<MirroringTypeOption, "off">,
  { label: string; min: number; max: number; step: number; default: number }
> = {
  square: { label: "Factor", min: 0.01, max: 4, step: 0.01, default: 1 },
  hex: { label: "Factor", min: 0.01, max: 4, step: 0.01, default: 1 },
  radial: { label: "Angle (deg)", min: 1, max: 360, step: 1, default: 45 },
};

const variationConfig: Record<
  Exclude<MirroringTypeOption, "off">,
  { label: string; min: number; max: number; step: number; default: number }
> = {
  square: { label: "Dist. Variation", min: -4, max: 4, step: 0.01, default: 0 },
  hex: { label: "Dist. Variation", min: -4, max: 4, step: 0.01, default: 0 },
  radial: {
    label: "Dist. Variation (deg)",
    min: -180,
    max: 180,
    step: 0.1,
    default: 0,
  },
};

export const BasicMirroringEdit = () => {
  const [passes, setPasses] = useMirroringPasses();

  const firstPass = passes[0];
  const currentType: MirroringTypeOption = firstPass
    ? (passTypeToType[firstPass[0]] ?? "off")
    : "off";

  const factor = firstPass?.[1] ?? makeRuleFromNumber(1);
  const variation = firstPass?.[2] ?? makeRuleFromNumber(0);

  const handleTypeChange = (value: string) => {
    const newType = value as MirroringTypeOption;
    if (newType === "off") {
      setPasses([]);
    } else {
      const passType = typeToPassType[newType];
      const cfg = factorConfig[newType];
      const varCfg = variationConfig[newType];

      setPasses([
        [
          passType,
          makeRuleFromNumber(cfg.default),
          makeRuleFromNumber(varCfg.default),
        ],
      ]);
    }
  };

  const handleFactorChange = (_: string, value: NumberBuildRule) => {
    if (currentType === "off" || !firstPass) return;
    setPasses([[firstPass[0], value, firstPass[2]]]);
  };

  const handleVariationChange = (_: string, value: NumberBuildRule) => {
    if (currentType === "off" || !firstPass) return;
    setPasses([[firstPass[0], firstPass[1], value]]);
  };

  const cfg = currentType !== "off" ? factorConfig[currentType] : null;
  const varCfg = currentType !== "off" ? variationConfig[currentType] : null;

  return (
    <Stack gap='md'>
      <Stack gap='xs'>
        <EditorLabel>Mirroring Type</EditorLabel>
        <SegmentedControl
          value={currentType}
          data={[
            { value: "off", label: "Off" },
            { value: "square", label: "Square" },
            { value: "hex", label: "Hex" },
            { value: "radial", label: "Radial" },
          ]}
          size='sm'
          onChange={handleTypeChange}
        />
      </Stack>

      {cfg && (
        <NumberRuleEdit
          name='1'
          minRange={1}
          label={cfg.label}
          value={factor}
          min={cfg.min}
          max={cfg.max}
          step={cfg.step}
          onChange={handleFactorChange}
        />
      )}

      {varCfg && (
        <NumberRuleEdit
          name='2'
          minRange={1}
          label={varCfg.label}
          value={variation}
          min={varCfg.min}
          max={varCfg.max}
          step={varCfg.step}
          onChange={handleVariationChange}
        />
      )}
    </Stack>
  );
};
