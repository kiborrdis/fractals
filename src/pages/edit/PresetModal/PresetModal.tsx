import { useState } from "react";
import { Button, Group, Modal, Select, Stack, Text } from "@mantine/core";
import { useActions } from "../store/data/useActions";

const presetData = [
  { value: "mandelbrot", label: "Classic Mandelbrot Set" },
  { value: "julia", label: "Julia Set" },
  { value: "burningship", label: "Burning Ship" },
  { value: "tricorn", label: "Tricorn" },
  { value: "multibrot", label: "Multibrot Set" },
];

export function PresetModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const { presetPicked } = useActions();
  
  const handleClose = () => {
    setSelectedPreset(null);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title='Load Fractal Preset'
      centered
      size='md'
    >
      <Stack gap='md'>
        <Text size='sm' c='dimmed'>
          Choose a preset to load into the editor. This will replace your
          current fractal configuration.
        </Text>

        <Select
          label='Available Presets'
          placeholder='Select a preset...'
          value={selectedPreset}
          onChange={setSelectedPreset}
          data={presetData}
        />

        <Group justify='flex-end'>
          <Button variant='default' onClick={handleClose}>
            Cancel
          </Button>
          <Button
            disabled={!selectedPreset}
            onClick={() => {
              if (selectedPreset ) {
                presetPicked(selectedPreset);
              }

              handleClose();
            }}
          >
            Load Preset
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
