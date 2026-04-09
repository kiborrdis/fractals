import { MirroringPassType } from "@/features/fractals";
import { ActionIcon, Button, Group, Select, Stack, Text } from "@mantine/core";
import { TbTrash, TbPlus } from "react-icons/tb";
import { useMirroringPasses } from "../../stores/editStore/data/useMirroringPasses";
import { makeRuleFromNumber, NumberBuildRule } from "@/shared/libs/numberRule";
import { NumberRuleEdit } from "../NumberRuleEdit/NumberRuleEdit";

const PASS_TYPE_OPTIONS = [
  { value: String(MirroringPassType.Linear), label: "Square" },
  { value: String(MirroringPassType.Hex), label: "Hex" },
  { value: String(MirroringPassType.Radial), label: "Radial" },
];

const factorLabel: Record<number, string> = {
  [MirroringPassType.Linear]: "Factor",
  [MirroringPassType.Hex]: "Factor",
  [MirroringPassType.Radial]: "Angle (deg)",
};

const factorRange: Record<number, { min: number; max: number; step: number }> =
  {
    [MirroringPassType.Linear]: { min: 0.01, max: 4, step: 0.01 },
    [MirroringPassType.Hex]: { min: 0.01, max: 4, step: 0.01 },
    [MirroringPassType.Radial]: { min: 1, max: 180, step: 1 },
  };

const variationRange: Record<
  number,
  { min: number; max: number; step: number; label: string }
> = {
  [MirroringPassType.Linear]: {
    min: -4,
    max: 4,
    step: 0.01,
    label: "Dist. Variation",
  },
  [MirroringPassType.Hex]: {
    min: -4,
    max: 4,
    step: 0.01,
    label: "Dist. Variation",
  },
  [MirroringPassType.Radial]: {
    min: -180,
    max: 180,
    step: 0.1,
    label: "Dist. Variation (deg)",
  },
};

const PassRow = ({
  pass,
  index,
  onChange,
  onDelete,
}: {
  pass: [MirroringPassType, NumberBuildRule, NumberBuildRule];
  index: number;
  onChange: (
    index: number,
    pass: [MirroringPassType, NumberBuildRule, NumberBuildRule],
  ) => void;
  onDelete: (index: number) => void;
}) => {
  const [type, factor, variation] = pass;
  const fr = factorRange[type] ?? factorRange[MirroringPassType.Linear];
  const vr = variationRange[type] ?? variationRange[MirroringPassType.Linear];

  return (
    <Stack
      gap='xs'
      style={{
        padding: "8px",
        border: "1px solid var(--mantine-color-dark-4)",
        borderRadius: "4px",
      }}
    >
      <Group justify='space-between'>
        <Text size='xs' c='dimmed'>
          Pass {index + 1}
        </Text>
        <ActionIcon
          size='xs'
          variant='light'
          color='red'
          onClick={() => onDelete(index)}
          aria-label='Delete pass'
        >
          <TbTrash size={12} />
        </ActionIcon>
      </Group>
      <Select
        label='Type'
        size='xs'
        value={String(type)}
        data={PASS_TYPE_OPTIONS}
        onChange={(val) => {
          if (val) onChange(index, [Number(val), factor, variation]);
        }}
      />
      <NumberRuleEdit
        name='1'
        label={factorLabel[type] ?? "Factor"}
        value={factor}
        min={fr.min}
        max={fr.max}
        minRange={1}
        step={fr.step}
        onChange={(_, val) => onChange(index, [type, val, variation])}
      />
      <NumberRuleEdit
        name='2'
        minRange={1}
        label={vr.label}
        value={variation}
        min={vr.min}
        max={vr.max}
        step={vr.step}
        onChange={(_, val) => onChange(index, [type, factor, val])}
      />
    </Stack>
  );
};

export const AdvancedMirroringEdit = () => {
  const [passes, setPasses] = useMirroringPasses();

  const handleChange = (
    index: number,
    updated: [MirroringPassType, NumberBuildRule, NumberBuildRule],
  ) => {
    const next = passes.map((p, i) => (i === index ? updated : p));
    setPasses(next);
  };

  const handleDelete = (index: number) => {
    setPasses(passes.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    if (passes.length >= 8) return;
    setPasses([
      ...passes,
      [MirroringPassType.Linear, makeRuleFromNumber(1), makeRuleFromNumber(0)],
    ]);
  };

  return (
    <Stack gap='sm'>
      {passes.length === 0 && (
        <Text size='xs' c='dimmed'>
          No mirroring passes active.
        </Text>
      )}
      {passes.map((pass, i) => (
        <PassRow
          key={i}
          pass={pass}
          index={i}
          onChange={handleChange}
          onDelete={handleDelete}
        />
      ))}
      <Button
        size='xs'
        variant='light'
        leftSection={<TbPlus size={12} />}
        onClick={handleAdd}
        disabled={passes.length >= 8}
      >
        Add pass
      </Button>
    </Stack>
  );
};
