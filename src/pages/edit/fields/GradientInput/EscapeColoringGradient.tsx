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
import { useActions } from "../../stores/editStore/data/useActions";

export const EscapeColoringGradient = ({
  value,
  onChange,
  name,
}: {
  value: GradientStop[];
  onChange: (name: "gradient", value: GradientStop[]) => void;
  name: "gradient";
}) => {
  const { staticParamOverride } = useActions();
  const maxPosition = useMaxIteration();
  const [activePanel, setActivePanel] = useState<
    "generator" | "presets" | null
  >(null);

  useEffect(() => {
    return () => {
      staticParamOverride(name, undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setStops = (newStops: GradientStop[]) => {
    onChange(
      name,
      [...newStops].sort((a, b) => a[0] - b[0]),
    );
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
    onChange(name, previewStops);
    staticParamOverride(name, undefined);
    setActivePanel(null);
  };

  const handleCancel = () => {
    staticParamOverride(name, undefined);
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
          onPreview={(newStops) => staticParamOverride(name, newStops)}
          onApply={handleApply}
          onCancel={handleCancel}
          initialMaxPosition={maxPosition}
        />
      ) : activePanel === "presets" ? (
        <GradientPresets
          onPreview={(newStops: GradientStop[]) =>
            staticParamOverride(name, newStops)
          }
          onApply={handleApply}
          onCancel={handleCancel}
          initialMaxPosition={maxPosition}
        />
      ) : (
        <EscapeColoringGradientContent
          stops={value}
          onChange={(newStops) => onChange(name, newStops)}
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
