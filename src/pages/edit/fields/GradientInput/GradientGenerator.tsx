import { GradientStop, randomRange } from "@/features/fractals";
import {
  NumberInput,
  Button,
  Group,
  Stack,
  SegmentedControl,
  Divider,
} from "@mantine/core";
import { useState, useRef } from "react";
import { EditorLabel } from "../../ui/EditorLabel";
import { distributeStops, DistributionType } from "./distributeStops";
import { FiRefreshCw, FiCheck, FiX } from "react-icons/fi";

export const GradientGenerator = ({
  onApply,
  onCancel,
  onPreview,
  initialMaxPosition,
  canEditMaxPosition = false,
  maxPositionLabel = "Max Position",
}: {
  onApply: (stops: GradientStop[]) => void;
  onCancel: () => void;
  onPreview: (stops: GradientStop[]) => void;
  initialMaxPosition: number;
  canEditMaxPosition?: boolean;
  maxPositionLabel?: string;
}) => {
  const [stopsCount, setStopsCount] = useState(5);
  const [maxPosition, setMaxPosition] = useState(initialMaxPosition);
  const [distributionType, setDistributionType] =
    useState<DistributionType>("linear");
  const previewStopsRef = useRef<GradientStop[]>([]);
  const rawStopsRef = useRef<GradientStop[]>([]);

  const applyDistribution = (stops: GradientStop[], type: DistributionType, max = maxPosition) => {
    const distributedStops = distributeStops(stops, max, type);
    previewStopsRef.current = distributedStops;
    onPreview(distributedStops);
  };

  const generateGradient = () => {
    if (stopsCount < 2) return;

    const stops: GradientStop[] = [];
    for (let i = 0; i < stopsCount; i++) {
      const r = randomRange(0, 1);
      const g = randomRange(0, 1);
      const b = randomRange(0, 1);
      stops.push([0, [r, g, b, 1]]);
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
      generateGradient();
    }
  };

  const handleMaxPositionChange = (val: number) => {
    setMaxPosition(val);
    if (rawStopsRef.current.length > 0) {
      applyDistribution(rawStopsRef.current, distributionType, val);
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
            value={stopsCount}
            onChange={(val) => setStopsCount(Number(val) || 2)}
          />
        </Group>

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
