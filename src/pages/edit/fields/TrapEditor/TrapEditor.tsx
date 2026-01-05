import { Stack, Button, Group, Text, ActionIcon, Badge } from "@mantine/core";
import { FractalTrap } from "@/features/fractals";
import { FiTrash } from "react-icons/fi";
import { EditorLabel } from "../../ui/EditorLabel";

export const TrapEditor = ({
  traps,
  onChange,
}: {
  traps: FractalTrap[];
  onChange: (traps: FractalTrap[]) => void;
}) => {
  const addLineTrap = () => {
    const newTrap: FractalTrap = { type: "line", a: 0, b: 1, c: 0 };
    onChange([...traps, newTrap]);
  };

  const addCircleTrap = () => {
    const newTrap: FractalTrap = {
      type: "circle",
      center: [0, 0],
      radius: 0.5,
    };
    onChange([...traps, newTrap]);
  };

  const removeTrap = (index: number) => {
    const newTraps = [...traps];
    newTraps.splice(index, 1);
    onChange(newTraps);
  };

  return (
    <Stack gap='xs'>
      <EditorLabel>Traps</EditorLabel>
      <Group gap='xs'>
        <Button size='xs' variant='light' onClick={addLineTrap}>
          Add line trap
        </Button>
        <Button size='xs' variant='light' onClick={addCircleTrap}>
          Add circle trap
        </Button>
      </Group>

      {traps.length === 0 && (
        <Text size='xs' c='dimmed'>
          No traps added
        </Text>
      )}

      <Stack gap={4}>
        {traps.map((trap, index) => (
          <Group key={index} justify='space-between' gap='xs'>
            <Group gap='xs'>
              <Badge size='sm' variant='light'>
                {trap.type}
              </Badge>
            </Group>
            <ActionIcon
              size='sm'
              variant='transparent'
              color='red'
              onClick={() => removeTrap(index)}
            >
              <FiTrash />
            </ActionIcon>
          </Group>
        ))}
      </Stack>
    </Stack>
  );
};
