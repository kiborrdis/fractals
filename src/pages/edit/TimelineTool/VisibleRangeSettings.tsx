import { Group, Tooltip, ActionIcon, Stack, Text, Slider } from "@mantine/core";
import { FiLock } from "react-icons/fi";

export const VisibleRangeSettings = ({
  to, lockToPeriod, period, onRangeChange, onLockToPeriodChange,
}: {
  to: number;
  lockToPeriod?: boolean;
  period: number;
  onRangeChange: (to: number) => void;
  onLockToPeriodChange: (val: boolean) => void;
}) => {
  return (
    <Group>
      <Tooltip label="Lock visible range to period" openDelay={500}>
        <ActionIcon
          color={lockToPeriod ? "orange" : "gray"}
          onClick={() => onLockToPeriodChange(!lockToPeriod)}
        >
          <FiLock />
        </ActionIcon>
      </Tooltip>

      <Stack gap={0}>
        <Text size="xs" fw={500}>
          Visible range
        </Text>
        <Slider
          color={lockToPeriod ? "orange" : undefined}
          w={300}
          value={to}
          max={period}
          min={0}
          label={(v) => `${Math.round(v / 1000)} s`}
          onChange={(v) => {
            onLockToPeriodChange(false);
            onRangeChange(v);
          }} />
      </Stack>
    </Group>
  );
};
