import {
  Alert,
  Anchor,
  Button,
  Group,
  Progress,
  Stack,
  Text,
} from "@mantine/core";
import { TbDownload, TbPlayerStop, TbVideo } from "react-icons/tb";
import { useRecordingStatus } from "../store/data/useRecordingStatus";
import { useRecordingActions } from "../store/data/useRecordingActions";
import { useRecordingProgress } from "../store/data/useRecordingProgress";
import { useRecordingVideo } from "../store/data/useRecordingVideo";

export const RecordingActions = ({
  onStartRecording,
}: {
  onStartRecording: () => void;
}) => {
  const status = useRecordingStatus();
  const actions = useRecordingActions();
  const progress = useRecordingProgress();
  const { videoUrl, errorMessage } = useRecordingVideo();
  const isRecording = status === "recording";
  const isCompleted = status === "completed";

  const progressPercent =
    progress.totalFrames > 0
      ? Math.round((progress.framesRendered / progress.totalFrames) * 100)
      : 0;

  return (
    <>
      {isRecording && (
        <Stack gap='xs'>
          <Text size='sm' fw={500}>
            Recording Progress
          </Text>
          <Progress value={progressPercent} animated />
          <Text size='xs' c='dimmed'>
            {progress.framesRendered} / {progress.totalFrames} frames (
            {progressPercent}%)
          </Text>
        </Stack>
      )}

      {errorMessage && (
        <Alert color='red' title='Recording Error'>
          {errorMessage}
        </Alert>
      )}

      {isCompleted && videoUrl && (
        <Stack gap='xs'>
          <Alert color='green' title='Recording Complete'>
            Your video is ready for download.
          </Alert>
          <Group>
            <Button
              leftSection={<TbDownload />}
              onClick={actions.downloadVideo}
            >
              Download Video
            </Button>
            <Anchor href={videoUrl} target='_blank'>
              Preview
            </Anchor>
          </Group>
          <Button variant='subtle' size='xs' onClick={actions.resetRecording}>
            Record Another
          </Button>
        </Stack>
      )}

      {!isCompleted && (
        <Group grow>
          {!isRecording ? (
            <Button
              leftSection={<TbVideo />}
              onClick={onStartRecording}
              color='red'
            >
              Start Recording
            </Button>
          ) : (
            <Button
              leftSection={<TbPlayerStop />}
              onClick={actions.stopRecording}
              color='orange'
            >
              Stop Recording
            </Button>
          )}
        </Group>
      )}
    </>
  );
};
