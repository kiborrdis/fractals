import { memo } from "react";
import { Button, Tooltip } from "@mantine/core";
import { useActions } from "../../stores/editStore/data/useActions";
import { FloatingPanel } from "../../ui/FloatingPanel/FloatingPanel";

export const TrapEditModePanel = memo(() => {
  const { toggleTrapEditMode } = useActions();

  return (
    <FloatingPanel>
      <Tooltip label='Exit trap edit mode' position='bottom' withArrow>
        <Button
          size='compact-xs'
          color='red'
          variant='outline'
          fullWidth
          onClick={toggleTrapEditMode}
        >
          Exit mode
        </Button>
      </Tooltip>
    </FloatingPanel>
  );
});

TrapEditModePanel.displayName = "TrapEditModePanel";
