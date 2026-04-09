import { Stack, ActionIcon, Tooltip, Menu, Group } from "@mantine/core";
import { useState, useEffect } from "react";
import { GradientStop } from "@/features/fractals";
import { FiMenu, FiPlus } from "react-icons/fi";
import { useMaxIteration } from "../../stores/editStore/data/useMaxIteration";
import { GradientGenerator } from "./GradientGenerator";
import { GradientPresets } from "./GradientPresets";
import { distributeStops } from "./distributeStops";
import {
  stopsToLinearGradient,
  GradientStopsInput,
} from "@/shared/ui/GradientStopsInput/GradientStopsInput";
import { EditorLabel } from "../../ui/EditorLabel";

export const EscapeColoringGradient = ({
  value,
  onChange,
  onPreview,
}: {
  value: GradientStop[];
  onChange: (value: GradientStop[]) => void;
  onPreview: (stops: GradientStop[] | undefined) => void;
}) => {
  const maxPosition = useMaxIteration();
  const [activePanel, setActivePanel] = useState<
    "generator" | "presets" | null
  >(null);

  useEffect(() => {
    return () => {
      onPreview(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setStops = (newStops: GradientStop[]) => {
    onChange([...newStops].sort((a, b) => a[0] - b[0]));
  };

  const actions = (
    <Menu position='bottom-end' shadow='md'>
      <Menu.Target>
        <Tooltip label='Actions' position='left'>
          <ActionIcon size='sm' variant='transparent'>
            <FiMenu />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          onClick={() =>
            setStops(distributeStops(value, maxPosition, "linear"))
          }
        >
          Redistribute linearly
        </Menu.Item>
        <Menu.Item
          onClick={() =>
            setStops(distributeStops(value, maxPosition, "exponential"))
          }
        >
          Redistribute exponentially
        </Menu.Item>
        <Menu.Item onClick={() => setActivePanel("generator")}>
          Generate gradient
        </Menu.Item>
        <Menu.Item onClick={() => setActivePanel("presets")}>
          Apply preset
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );

  const handleApply = (previewStops: GradientStop[]) => {
    onChange(previewStops);
    onPreview(undefined);
    setActivePanel(null);
  };

  const handleCancel = () => {
    onPreview(undefined);
    setActivePanel(null);
  };

  return (
    <>
      <Group justify='space-between' wrap='nowrap'>
        <EditorLabel docKeys={"iterations-gradient"}>
          Iterations Gradient
        </EditorLabel>
        {activePanel === null && (
          <Group gap={4} wrap='nowrap'>
            <Tooltip label='New stop' position='left'>
              <ActionIcon
                size='sm'
                variant='transparent'
                onClick={() =>
                  setStops([...value, [500, [1, 1, 1, 1]] as GradientStop])
                }
              >
                <FiPlus />
              </ActionIcon>
            </Tooltip>
            {actions}
          </Group>
        )}
      </Group>
      {activePanel === "generator" ? (
        <GradientGenerator
          onPreview={onPreview}
          onApply={handleApply}
          onCancel={handleCancel}
          initialMaxPosition={maxPosition}
        />
      ) : activePanel === "presets" ? (
        <GradientPresets
          onPreview={onPreview}
          onApply={handleApply}
          onCancel={handleCancel}
          initialMaxPosition={maxPosition}
        />
      ) : (
        <EscapeColoringGradientContent
          stops={value}
          onChange={(newStops) => onChange(newStops)}
        />
      )}
    </>
  );
};

export const EscapeColoringGradientContent = ({
  stops,
  onChange,
}: {
  stops: GradientStop[];
  onChange: (stops: GradientStop[]) => void;
}) => {
  return (
    <Stack>
      <GradientEditInputContent stops={stops} onChange={onChange} />
    </Stack>
  );
};

const GradientEditInputContent = ({
  stops,
  onChange,
}: {
  stops: GradientStop[];
  onChange: (stops: GradientStop[]) => void;
}) => {
  const maxPosition = useMaxIteration();
  const gradientString = stopsToLinearGradient(stops, maxPosition);

  return (
    <GradientStopsInput
      stops={stops}
      onChange={onChange}
      stopLabel='Iteration'
      colorLabel='Color'
      gradientTooltip='Gradient up to current max iteration'
      gradientString={gradientString}
      stopNumberInputProps={{ max: maxPosition }}
      defaultNewStop={[500, [1, 1, 1, 1]] as GradientStop}
      hideAddButton
    />
  );
};
