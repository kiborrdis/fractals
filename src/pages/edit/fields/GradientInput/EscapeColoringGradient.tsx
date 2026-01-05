import { Stack, ActionIcon, Tooltip, Menu } from "@mantine/core";
import { useState, useEffect } from "react";
import { GradientStop } from "@/features/fractals";
import { FiMenu } from "react-icons/fi";
import { useMaxIteration } from "../../stores/editStore/data/useMaxIteration";
import { GradientGenerator } from "./EscapeColoringGradientGenerator";
import { distributeStops } from "./distributeStops";
import {
  stopsToLinearGradient,
  GradientStopsInput,
} from "@/shared/ui/GradientStopsInput/GradientStopsInput";

export const EscapeColoringGradient = ({
  stops,
  onChange,
  onPreview,
}: {
  stops: GradientStop[];
  onChange: (stops: GradientStop[]) => void;
  onPreview?: (stops: GradientStop[] | undefined) => void;
}) => {
  const [showGenerator, setShowGenerator] = useState(false);

  useEffect(() => {
    return () => {
      onPreview?.(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApply = (previewStops: GradientStop[]) => {
    onChange(previewStops);
    onPreview?.(undefined);
    setShowGenerator(false);
  };

  const handleCancel = () => {
    onPreview?.(undefined);
    setShowGenerator(false);
  };

  return (
    <Stack>
      {showGenerator ? (
        <GradientGenerator
          onPreview={(newStops) => onPreview?.(newStops)}
          onApply={handleApply}
          onCancel={handleCancel}
        />
      ) : (
        <GradientEditInputContent
          stops={stops}
          onChange={onChange}
          onOpenGenerator={() => setShowGenerator(true)}
        />
      )}
    </Stack>
  );
};

const GradientEditInputContent = ({
  stops,
  onChange,
  onOpenGenerator,
}: {
  stops: GradientStop[];
  onChange: (stops: GradientStop[]) => void;
  onOpenGenerator: () => void;
}) => {
  const maxPosition = useMaxIteration();
  const gradientString = stopsToLinearGradient(stops, maxPosition);

  const setStops = (newStops: GradientStop[]) => {
    onChange([...newStops].sort((a, b) => a[0] - b[0]));
  };

  const actions = (
    <Menu position='bottom-end' shadow='md'>
      <Menu.Target>
        <Tooltip label='Actions' position='left'>
          <ActionIcon size='md' variant='transparent'>
            <FiMenu />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          onClick={() =>
            setStops(distributeStops(stops, maxPosition, "linear"))
          }
        >
          Redistribute linearly
        </Menu.Item>
        <Menu.Item
          onClick={() =>
            setStops(distributeStops(stops, maxPosition, "exponential"))
          }
        >
          Redistribute exponentially
        </Menu.Item>
        <Menu.Item onClick={onOpenGenerator}>Generate gradient</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );

  return (
    <GradientStopsInput
      stops={stops}
      onChange={onChange}
      stopLabel='Iteration'
      colorLabel='Color'
      gradientTooltip='Gradient up to current max iteration'
      gradientString={gradientString}
      actions={actions}
      stopNumberInputProps={{ max: maxPosition }}
      defaultNewStop={[500, 1, 1, 1, 1] as GradientStop}
    />
  );
};
