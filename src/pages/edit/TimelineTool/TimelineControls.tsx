import { Group, Tooltip, ActionIcon, Divider } from "@mantine/core";
import { FiPenTool } from "react-icons/fi";
import { VisibleRangeSettings } from "./VisibleRangeSettings";

export const TimelineControls = ({
  previewValueOnHover,
  onPreviewValueOnHoverChange,
  visibleTo,
  period,
  lockToPeriod,
  onLockToPeriodChange,
  onRangeChange,
}: {
  previewValueOnHover: boolean;
  onPreviewValueOnHoverChange: (v: boolean) => void;
  visibleTo: number;
  period: number;
  lockToPeriod: boolean;
  onLockToPeriodChange: (v: boolean) => void;
  onRangeChange: (v: number) => void;
}) => {
  return (
    <Group>
      <Group>
        <Tooltip label='Preview values on hover'>
          <ActionIcon
            title='Preview values on hover'
            color={previewValueOnHover ? "green" : "gray"}
            onClick={() => onPreviewValueOnHoverChange(!previewValueOnHover)}
          >
            <FiPenTool />
          </ActionIcon>
        </Tooltip>
      </Group>
      <Divider size='xs' orientation='vertical' />
      <VisibleRangeSettings
        to={visibleTo}
        period={period}
        lockToPeriod={lockToPeriod}
        onLockToPeriodChange={onLockToPeriodChange}
        onRangeChange={onRangeChange}
      />
    </Group>
  );
};
