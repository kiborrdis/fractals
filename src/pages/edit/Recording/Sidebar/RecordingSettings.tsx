import { Group, NumberInput, Select, Stack } from "@mantine/core";
import { useRecordingSettings } from "../store/data/useRecordingSettings";
import { useRecordingActions } from "../store/data/useRecordingActions";
import { useRecordingStatus } from "../store/data/useRecordingStatus";
import { EditorLabel } from "../../ui/EditorLabel";

const RESOLUTION_PRESETS = [
  { value: "1920x1080", label: "1080p (1920×1080)" },
  { value: "1280x720", label: "720p (1280×720)" },
  { value: "854x480", label: "480p (854×480)" },
  { value: "640x360", label: "360p (640×360)" },
  { value: "320x180", label: "180p (320×180)" },
  { value: "custom", label: "Custom" },
];

const FPS_OPTIONS = ["24", "30", "60"];

export const RecordingSettings = () => {
  const status = useRecordingStatus();
  const settings = useRecordingSettings();
  const actions = useRecordingActions();
  const isRecording = status === "recording";

  const currentResolution = `${settings.width}x${settings.height}`;
  const isCustomResolution = !RESOLUTION_PRESETS.some(
    (p) => p.value === currentResolution && p.value !== "custom",
  );

  const updateResolution = (newWidth: number, newHeight: number) => {
    const scaleRatio = newWidth / settings.width;
    actions.updateSettings({
      width: newWidth,
      height: newHeight,
      offset: [
        settings.offset[0] * scaleRatio,
        settings.offset[1] * scaleRatio,
      ],
    });
  };

  const handleResolutionChange = (value: string | null) => {
    if (!value || value === "custom") return;
    const [newWidth, newHeight] = value.split("x").map(Number);
    updateResolution(newWidth, newHeight);
  };

  return (
    <Stack gap='md'>
      <Select
        label={
          <EditorLabel docKeys={"recording-resolution"}>Resolution</EditorLabel>
        }
        data={RESOLUTION_PRESETS}
        value={isCustomResolution ? "custom" : currentResolution}
        onChange={handleResolutionChange}
        disabled={isRecording}
      />
      {isCustomResolution && (
        <Group grow>
          <NumberInput
            label='Width'
            value={settings.width}
            onChange={(val) =>
              updateResolution(Number(val) || 1920, settings.height)
            }
            min={100}
            max={7680}
            disabled={isRecording}
          />
          <NumberInput
            label='Height'
            value={settings.height}
            onChange={(val) =>
              updateResolution(settings.width, Number(val) || 1080)
            }
            min={100}
            max={4320}
            disabled={isRecording}
          />
        </Group>
      )}
      <Select
        label={<EditorLabel docKeys='recording-fps'>Framerate</EditorLabel>}
        value={String(settings.fps)}
        data={FPS_OPTIONS.map((fpsOption) => ({
          value: fpsOption,
          label: `${fpsOption} fps`,
        }))}
        onChange={(val) => actions.updateSettings({ fps: Number(val) || 60 })}
        disabled={isRecording}
      />
      <NumberInput
        label={
          <EditorLabel docKeys={"recording-start-time"}>
            Start Time (seconds)
          </EditorLabel>
        }
        value={settings.startTime / 1000}
        onChange={(val) =>
          actions.updateSettings({ startTime: (Number(val) || 0) * 1000 })
        }
        min={0}
        max={3600}
        step={0.1}
        disabled={isRecording}
      />
      <NumberInput
        label={
          <EditorLabel docKeys={"recording-duration"}>
            Duration (seconds)
          </EditorLabel>
        }
        value={settings.duration / 1000}
        onChange={(val) =>
          actions.updateSettings({ duration: (Number(val) || 10) * 1000 })
        }
        min={1}
        max={300}
        step={1}
        disabled={isRecording}
      />
      <Select
        label={<EditorLabel docKeys='supersampling'>Supersampling</EditorLabel>}
        value={String(settings.supersampling ?? 1)}
        data={[
          { value: "1", label: "1x (No AA)" },
          { value: "2", label: "2x" },
          { value: "4", label: "4x" },
          { value: "8", label: "8x" },
          { value: "16", label: "16x" },
          { value: "32", label: "32x" },
        ]}
        onChange={(val) =>
          actions.updateSettings({ supersampling: Number(val) || 1 })
        }
        disabled={isRecording}
      />{" "}
    </Stack>
  );
};
