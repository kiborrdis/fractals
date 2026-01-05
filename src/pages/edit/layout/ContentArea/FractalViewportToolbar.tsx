import { memo, useState } from "react";
import {
  Button,
  Divider,
  Group,
  Stack,
  Tooltip,
  Collapse,
  Text,
} from "@mantine/core";
import { FiMaximize, FiRefreshCcw } from "react-icons/fi";
import { HiMagnifyingGlassMinus, HiMagnifyingGlassPlus } from "react-icons/hi2";
import { TbHandMove, TbChevronUp, TbChevronDown } from "react-icons/tb";
import { ToolbarItem } from "../../ui/GraphToolbar";
import { useActions } from "../../stores/editStore/data/useActions";

import { useTrapEditMode } from "../../stores/editStore/data/useTrapEditMode";
import styles from "./FractalViewportToolbar.module.css";
import { FloatingPanel } from "../../ui/FloatingPanel/FloatingPanel";

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
    const { resetViewport, magnifyViewport, toggleTrapEditMode } = useActions();
    const trapEditMode = useTrapEditMode();
    const [collapsed, setCollapsed] = useState(true);

    return (
      <div className={styles.toolbar}>
        <FloatingPanel>
          <Stack gap='sm' align='center'>
            <Tooltip
              label={
                collapsed ? "Open viewport settings" : "Close viewport settings"
              }
              position='bottom'
              withArrow
            >
              <Button
                size='compact-xs'
                variant='outline'
                color={collapsed ? "gray" : "green"}
                fullWidth
                onClick={() => setCollapsed((p) => !p)}
                className={styles.pointerEventsAll}
              >
                {collapsed ? (
                  <TbChevronDown size={12} />
                ) : (
                  <TbChevronUp size={12} />
                )}
              </Button>
            </Tooltip>
            <Collapse
              in={!collapsed}
              transitionDuration={300}
              transitionTimingFunction='ease'
            >
              <Stack gap='xs' align='center'>
                <Stack gap={4} align='center'>
                  <Text size='xs' c='dimmed'>
                    Zoom
                  </Text>

                  <Text
                    size='xs'
                    c='dimmed'
                  >{`${zoomValue.toPrecision(1)}x`}</Text>
                </Stack>
                <Group gap='xs'>
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
                </Group>
                <ToolbarItem
                  icon={FiRefreshCcw}
                  label='Reset viewport'
                  onClick={resetViewport}
                  color='red'
                />
                <Divider className={styles.dividerFullWidth} />
                <Group gap='xs'>
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
                </Group>
              </Stack>
            </Collapse>
            {trapEditMode && (
              <Tooltip label='Exit trap edit mode' position='bottom' withArrow>
                <Button
                  size='compact-xs'
                  color='red'
                  variant='outline'
                  fullWidth
                  onClick={toggleTrapEditMode}
                  className={styles.pointerEventsAll}
                >
                  Exit mode
                </Button>
              </Tooltip>
            )}
          </Stack>
        </FloatingPanel>
      </div>
    );
  },
);

FractalViewportToolbar.displayName = "FractalViewportToolbar";
