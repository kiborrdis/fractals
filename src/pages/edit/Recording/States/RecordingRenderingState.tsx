import { Center, Progress, Stack, Text } from "@mantine/core";
import { useRecordingProgress } from "../store/data/useRecordingProgress";

export const RecordingRenderingState = () => {
  const progress = useRecordingProgress();
  const progressPercent =
    progress.totalFrames > 0
      ? Math.round((progress.framesRendered / progress.totalFrames) * 100)
      : 0;

  return (
    <Center h='100%'>
      <Stack align='center' gap='lg'>
        <Progress
          value={progressPercent}
          size='xl'
          w='300px'
          animated
          striped
        />
        <Text size='lg' fw={500}>
          Recording in progress...
        </Text>
        {progress.totalFrames > 0 && (
          <Text size='sm' c='dimmed'>
            {progress.framesRendered} / {progress.totalFrames} frames
          </Text>
        )}
      </Stack>
    </Center>
  );
};
