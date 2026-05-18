import { memo } from "react";
import { Divider, Group, Text } from "@mantine/core";
import { FiMaximize, FiRefreshCcw } from "react-icons/fi";
import { HiMagnifyingGlassMinus, HiMagnifyingGlassPlus } from "react-icons/hi2";
import { TbHandMove } from "react-icons/tb";
import { ToolbarItem } from "../../ui/GraphToolbar";
import { useActions } from "../../stores/editStore/data/useActions";
import { FloatingPanel } from "../../ui/FloatingPanel/FloatingPanel";
import { DocTooltip, mergeDocKeys } from "@/shared/ui/DocTooltip";
import { BiQuestionMark } from "react-icons/bi";

export const FractalViewportToolbar = memo(
  ({
    zoomValue,
    panEnabled,
    onPanToggle,
    selectAreaActive,
    onSelectAreaToggle,
  }: {
    zoomValue: number;
    panEnabled: boolean;
    onPanToggle: () => void;
    selectAreaActive: boolean;
    onSelectAreaToggle: () => void;
  }) => {
    const { resetViewport, magnifyViewport } = useActions();

    return (
      <FloatingPanel>
        <Group gap='xs' align='center'>
          <Text size='xs' c='dimmed'>{`${zoomValue.toPrecision(1)}x`}</Text>
          <Divider orientation='vertical' />
          <ToolbarItem
            icon={TbHandMove}
            label={panEnabled ? "Disable pan" : "Enable pan"}
            onClick={onPanToggle}
            color={panEnabled ? "blue" : "gray"}
          />
          <ToolbarItem
            icon={FiMaximize}
            label='Select area'
            onClick={onSelectAreaToggle}
            color={selectAreaActive ? "blue" : "gray"}
          />
          <ToolbarItem
            icon={FiRefreshCcw}
            label='Reset viewport'
            onClick={resetViewport}
            color='red'
          />
          <Divider orientation='vertical' />
          <ToolbarItem
            icon={HiMagnifyingGlassPlus}
            label='Zoom in'
            onClick={() => magnifyViewport(0.5)}
          />
          <ToolbarItem
            icon={HiMagnifyingGlassMinus}
            label='Zoom out'
            onClick={() => magnifyViewport(2)}
          />
          <Divider orientation='vertical' />
          <DocTooltip
            docKeys={mergeDocKeys("introduction")}
            anchor={<ToolbarItem icon={BiQuestionMark} color='gray' />}
          />
        </Group>
      </FloatingPanel>
    );
  },
);

FractalViewportToolbar.displayName = "FractalViewportToolbar";
