import { ActionIcon, Divider, Group, Stack, Title } from "@mantine/core";
import { FaArrowLeft } from "react-icons/fa";
import { useRecordingStatus } from "../store/data/useRecordingStatus";
import { RecordingControls } from "./RecordingControls";
import { RecordingSettings } from "./RecordingSettings";
import { RecordingActions } from "./RecordingActions";

export const RecordingSidebar = ({
  play,
  onBack,
  onToggleAnimation,
  onChangeSpeed,
  onStartRecording,
}: {
  play: boolean;
  onBack: () => void;
  onToggleAnimation: () => void;
  onChangeSpeed: (multiplier: number) => void;
  onStartRecording: () => void;
}) => {
  const status = useRecordingStatus();
  const isRecording = status === "recording";

  return (
    <Stack gap='sm' p='sm'>
      <Group justify='space-between'>
        <Group gap='xs'>
          <ActionIcon variant='subtle' onClick={onBack} disabled={isRecording}>
            <FaArrowLeft />
          </ActionIcon>
          <Title order={4}>Recording Mode</Title>
        </Group>
      </Group>

      <Divider />

      <RecordingControls
        play={play}
        onToggleAnimation={onToggleAnimation}
        onChangeSpeed={onChangeSpeed}
      />

      <Divider />

      <RecordingSettings />

      <Divider />

      <RecordingActions onStartRecording={onStartRecording} />
    </Stack>
  );
};
