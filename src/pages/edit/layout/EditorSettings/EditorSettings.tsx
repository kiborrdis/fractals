import {
  ActionIcon,
  Divider,
  Group,
  Stack,
  Switch,
  Tooltip,
} from "@mantine/core";
import { useSettings } from "../../stores/settings";
import { EditorLabel } from "../../ui/EditorLabel";
import { TbX } from "react-icons/tb";
import { useStaticRule } from "../../stores/editStore/data/useStaticRule";

export const EditorSettings = ({ onClose }: { onClose: () => void }) => {
  const { settings, setSetting } = useSettings();
  const [coloring, setColoring] = useStaticRule("coloring");

  return (
    <Stack p='md' gap='md'>
      <Group justify='space-between' align='center'>
        <EditorLabel>Editor Settings</EditorLabel>
        <Tooltip label='Close settings'>
          <ActionIcon variant='subtle' size='sm' onClick={onClose}>
            <TbX />
          </ActionIcon>
        </Tooltip>
      </Group>
      <Divider />
      <Switch
        label='Timeline range'
        description='Show range selector in the timeline'
        checked={settings.timelineRange}
        onChange={(e) => setSetting("timelineRange", e.currentTarget.checked)}
      />
      <Switch
        label='Coloring layers'
        description='Enable multi-layer blending mode selector in the Coloring tab'
        checked={settings.coloringLayers}
        onChange={(e) => {
          {
            setSetting("coloringLayers", e.currentTarget.checked);
            if (!e.currentTarget.checked && coloring) {
              setColoring("coloring", [coloring[0]]);
            }
          }
        }}
      />
      <Switch
        label='Advanced mirroring'
        description='Enable multi-pass mirroring editor in the Mirroring tab'
        checked={settings.advancedMirroringSettings}
        onChange={(e) => setSetting("advancedMirroringSettings", e.currentTarget.checked)}
      />

       <Switch
        label='Normal coloring'
        description='Enable normal coloring mode in the Coloring tab'
        checked={settings.normalColoring}
        onChange={(e) => setSetting("normalColoring", e.currentTarget.checked)}
      />
    </Stack>
  );
};
