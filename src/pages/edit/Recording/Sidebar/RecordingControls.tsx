import { ActionIcon, Group, NumberInput } from "@mantine/core";
import { FaPause, FaPlay } from "react-icons/fa";
import { useRecordingStatus } from "../store/data/useRecordingStatus";
import { useRecordingSettings } from "../store/data/useRecordingSettings";
import styles from "./RecordingControls.module.css";

export const RecordingControls = ({
  play,
  onToggleAnimation,
  onChangeSpeed,
}: {
  play: boolean;
  onToggleAnimation: () => void;
  onChangeSpeed: (multiplier: number) => void;
}) => {
  const status = useRecordingStatus();
  const settings = useRecordingSettings();
  const isRecording = status === "recording";

  return (
    <Group gap='sm'>
      <ActionIcon
        variant='subtle'
        onClick={onToggleAnimation}
        disabled={isRecording}
      >
        {play ? <FaPause /> : <FaPlay />}
      </ActionIcon>
      <NumberInput
        size='xs'
        value={settings.timeMultiplier}
        onChange={(val) => {
          const multiplier = Number(val) || 1;
          onChangeSpeed(multiplier);
        }}
        min={0.1}
        max={100}
        step={0.1}
        suffix='x'
        disabled={isRecording}
        className={styles.input}
      />
    </Group>
  );
};
