import { Stack, Button, Group, Text } from "@mantine/core";
import { EditorLabel } from "../../ui/EditorLabel";
import { useActions } from "../../stores/editStore/data/useActions";
import { useTrapEditMode } from "../../stores/editStore/data/useTrapEditMode";
import { useFractalTraps } from "../../stores/editStore/data/useFractalTraps";

export const TrapEditor = () => {
  const { toggleTrapEditMode } = useActions();
  const trapEditMode = useTrapEditMode();
  const traps = useFractalTraps();

  return (
    <Stack gap='xs'>
      <Group justify='space-between' align='center'>
        <EditorLabel docKeys="trap-edit-sidebar" size="xs">Traps</EditorLabel>
        <Text size='xs' c='dimmed'>
          {traps.length} trap{traps.length !== 1 ? "s" : ""}
        </Text>
      </Group>
      <Button
        size='xs'
        variant={trapEditMode ? "filled" : "light"}
        color={trapEditMode ? "red" : undefined}
        onClick={toggleTrapEditMode}
      >
        {trapEditMode ? "Exit edit mode" : "Edit traps"}
      </Button>
    </Stack>
  );
};
