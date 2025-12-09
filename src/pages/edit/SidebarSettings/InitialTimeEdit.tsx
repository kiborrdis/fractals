import { Stack, Text, Group, Button } from "@mantine/core";
import { useCurrentTime } from "../store/data/useCurrentTime";
import { useActions } from "../store/data/useActions";
import { Label } from "@/shared/ui/Label/Label";

export const InitialTimeEdit = ({
  value: initialTime,
  onChange: setInitialTime,
}: {
  value: number | undefined;
  onChange: (value: number) => void;
}) => {
  const currentTime = useCurrentTime();
  const { initialLoopStateChange } = useActions();
  console.log('itialTime', initialTime, currentTime);
  return (
    <Stack>
      <Label>Initial Time</Label>
      <Group justify="space-between">
        <Text size='sm'>{formatMsToHumanReadable(initialTime ?? 0)}</Text>
        <Button
          variant="outline"
          onClick={() => {
            initialLoopStateChange(0);
            setInitialTime(currentTime + (initialTime ?? 0));
          }}
        >
          Set to current time
        </Button>
      </Group>
    </Stack>
  );
};

const formatMsToHumanReadable = (ms: number) => {
  // millisecond part
  const milliseconds = Math.floor(ms % 1000);

  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s.${milliseconds}ms`);

  return parts.join(" ");
}
