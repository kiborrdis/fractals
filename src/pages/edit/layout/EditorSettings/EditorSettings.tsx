import { ActionIcon, Divider, Group, Stack, Switch, Tooltip } from "@mantine/core";
import { useSettings } from "../../stores/settings";
import { EditorLabel } from "../../ui/EditorLabel";
import { TbX } from "react-icons/tb";

export const EditorSettings = ({ onClose }: { onClose: () => void }) => {
  const { settings, setSetting } = useSettings();

  return (
    <Stack p="md" gap="md">
      <Group justify="space-between" align="center">
        <EditorLabel>Editor Settings</EditorLabel>
        <Tooltip label="Close settings">
          <ActionIcon variant="subtle" size="sm" onClick={onClose}>
            <TbX />
          </ActionIcon>
        </Tooltip>
      </Group>
      <Divider />
      <Switch
        label="Timeline range"
        description="Show range selector in the timeline"
        checked={settings.timelineRange}
        onChange={(e) => setSetting("timelineRange", e.currentTarget.checked)}
      />
    </Stack>
  );
};
