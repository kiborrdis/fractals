import { GradientStop } from "@/features/fractals";
import { EditorLabel } from "../../ui/EditorLabel";
import { useActions } from "../../stores/editStore/data/useActions";
import {
  GradientStopsInput,
  stopsToLinearGradient,
} from "@/shared/ui/GradientStopsInput/GradientStopsInput";
import { useEffect, useState } from "react";
import { ActionIcon, Group, Menu, Tooltip } from "@mantine/core";
import { FiMenu, FiPlus } from "react-icons/fi";
import { GradientGenerator } from "./GradientGenerator";
import { GradientPresets } from "./GradientPresets";

export const TrapColoringGradient = ({
  value,
  onChange,
  name,
}: {
  value: GradientStop[];
  onChange: (name: "trapGradient", value: GradientStop[]) => void;
  name: "trapGradient";
}) => {
  const { staticParamOverride } = useActions();
  const [activePanel, setActivePanel] = useState<
    "generator" | "presets" | null
  >(null);

  useEffect(() => {
    return () => {
      staticParamOverride(name, undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
        <Menu.Item onClick={() => setActivePanel("generator")}>
          Generate gradient
        </Menu.Item>
        <Menu.Item onClick={() => setActivePanel("presets")}>
          Apply preset
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );

  const handleApply = (newStops: GradientStop[]) => {
    onChange(name, newStops);
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
        <EditorLabel docKeys="trap-gradient">Trap Gradient</EditorLabel>
        {activePanel === null && (
          <Group gap={4} wrap='nowrap'>
            <Tooltip label='New stop' position='left'>
              <ActionIcon
                size='sm'
                variant='transparent'
                onClick={() =>
                  onChange(name, [
                    ...value,
                    [50, [0.5, 0.5, 0.5, 1]] as GradientStop,
                  ])
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
          initialMaxPosition={value[value.length - 1][0] || 100}
          canEditMaxPosition
          maxPositionLabel='Max Distance'
        />
      ) : activePanel === "presets" ? (
        <GradientPresets
          onPreview={(newStops: GradientStop[]) =>
            staticParamOverride(name, newStops)
          }
          onApply={handleApply}
          onCancel={handleCancel}
          initialMaxPosition={value[value.length - 1][0] || 100}
          canEditMaxPosition
          maxPositionLabel='Max Distance'
          reverse
        />
      ) : (
        <TrapGradientInput
          stops={value}
          onChange={(newStops) => onChange(name, newStops)}
        />
      )}
    </>
  );
};

export const TrapGradientInput = ({
  stops,
  onChange,
}: {
  stops: GradientStop[];
  onChange: (stops: GradientStop[]) => void;
}) => {
  const maxPos = Math.max(...stops.map((s) => s[0]), 1);
  const gradientString = stopsToLinearGradient(stops, maxPos);

  return (
    <GradientStopsInput
      stops={stops}
      onChange={onChange}
      stopLabel='Distance'
      colorLabel='Color'
      gradientTooltip='Trap distance gradient'
      gradientString={gradientString}
      stopNumberInputProps={{ step: 0.1, decimalScale: 3 }}
      defaultNewStop={[50, [0.5, 0.5, 0.5, 1]] as GradientStop}
      hideAddButton
    />
  );
};
