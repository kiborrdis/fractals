import { GradientStop, randomRange } from "@/features/fractals";
import { extractMaxValueFromRule } from "@/shared/libs/numberRule";
import { NumberInput, Button, Group, Stack, Text } from "@mantine/core";
import { useState } from "react";
import { useDynamicRule } from "../store/data/useDynamicRule";
import { Label } from "@/shared/ui/Label/Label";

export const GradientGenerator = ({
  onChange,
}: {
  onChange: (val: GradientStop[]) => void;
}) => {
  const [val, setValue] = useState(0);
  const [iterations] = useDynamicRule("maxIterations");

  let maxValue = 10;
  if (Array.isArray(iterations)) {
    maxValue = extractMaxValueFromRule(iterations[1]);
  } else {
    maxValue = extractMaxValueFromRule(iterations);
  }

  return (
    <Stack>
      <Label>Generate gradient</Label>
      <Group>
        <Text size='xs' fw={500}>
          Stops number
        </Text>
        <NumberInput
          miw={100}
          flex={1}
          size='xs'
          value={val}
          onChange={(newVal) => {
            if (isNaN(Number(newVal))) {
              setValue(0);
            }

            setValue(Number(newVal));
          }}
        />
        <Button
          variant='light'
          onClick={() => {
            if (val < 2) {
              return;
            }

            const stops: GradientStop[] = [];
            for (let i = 0; i <= val; i++) {
              const position = (maxValue * i) / val;
              const r = randomRange(0, 1);
              const g = randomRange(0, 1);
              const b = randomRange(0, 1);
              stops.push([position, r, g, b, 1]);
            }

            onChange(stops);
          }}
        >
          Generate
        </Button>
      </Group>
    </Stack>
  );
};
