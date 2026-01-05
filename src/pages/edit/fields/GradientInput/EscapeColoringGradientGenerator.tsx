import { GradientStop, randomRange } from "@/features/fractals";
import { extractMaxValueFromRule, RuleType } from "@/shared/libs/numberRule";
import {
  NumberInput,
  Button,
  Group,
  Stack,
  SegmentedControl,
  Divider,
} from "@mantine/core";
import { useDynamicRule } from "../../stores/editStore/data/useDynamicRule";
import { useState, useRef } from "react";
import { EditorLabel } from "../../ui/EditorLabel";
import { distributeStops, DistributionType } from "./distributeStops";
import { FiRefreshCw, FiCheck, FiX } from "react-icons/fi";

export const GradientGenerator = ({
  onApply,
  onCancel,
  onPreview,
}: {
  onApply: (previewStops: GradientStop[]) => void;
  onCancel: () => void;
  onPreview: (val: GradientStop[]) => void;
}) => {
  const [val, setValue] = useState(5);
  const [distributionType, setDistributionType] =
    useState<DistributionType>("linear");
  const previewStopsRef = useRef<GradientStop[]>([]);
  const rawStopsRef = useRef<GradientStop[]>([]);
  const [iterations] = useDynamicRule("maxIterations");

  let maxValue = 10;
  if (Array.isArray(iterations)) {
    maxValue = extractMaxValueFromRule(iterations[1]);
  } else if (
    iterations.t === RuleType.RangeNumber ||
    iterations.t === RuleType.StaticNumber
  ) {
    maxValue = extractMaxValueFromRule(iterations);
  }

  const applyDistribution = (stops: GradientStop[], type: DistributionType) => {
    const distributedStops = distributeStops(stops, maxValue, type);
    previewStopsRef.current = distributedStops;
    onPreview(distributedStops);
  };

  const generateGradient = () => {
    if (val < 2) {
      return;
    }

    const stops: GradientStop[] = [];
    for (let i = 0; i < val; i++) {
      const r = randomRange(0, 1);
      const g = randomRange(0, 1);
      const b = randomRange(0, 1);
      stops.push([0, r, g, b, 1]);
    }

    rawStopsRef.current = stops;
    applyDistribution(stops, distributionType);
  };

  const handleDistributionChange = (value: string) => {
    const newType = value as DistributionType;
    setDistributionType(newType);
    if (rawStopsRef.current.length > 0) {
      applyDistribution(rawStopsRef.current, newType);
    } else {
      // Should not happen really if we generate on mount, but fallback
      generateGradient();
    }
  };

  return (
    <Stack gap='md'>
      <Stack gap='xs'>
        <Group justify='space-between'>
          <EditorLabel size='xs'>Stops Count</EditorLabel>
          <NumberInput
            w={80}
            size='xs'
            min={2}
            max={100}
            value={val}
            onChange={(newVal) => {
              if (isNaN(Number(newVal))) {
                setValue(0);
              }
              setValue(Number(newVal));
            }}
          />
        </Group>

        <Group>
          <EditorLabel size='xs'>Distribution</EditorLabel>
          <SegmentedControl
            flex={1}
            size='xs'
            value={distributionType}
            onChange={handleDistributionChange}
            data={[
              { label: "Linear", value: "linear" },
              { label: "Exponential", value: "exponential" },
            ]}
          />
        </Group>
      </Stack>

      <Button
        variant='light'
        leftSection={<FiRefreshCw />}
        size='xs'
        onClick={generateGradient}
        fullWidth
      >
        Generate Colors
      </Button>

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
          onClick={() => {
            if (previewStopsRef.current.length === 0) {
              onCancel();
            } else {
              onApply(previewStopsRef.current);
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
