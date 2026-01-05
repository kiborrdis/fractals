import { Group, Tooltip, ActionIcon, Divider } from "@mantine/core";
import { FiPenTool, FiList } from "react-icons/fi";
import { VisibleRangeSettings } from "./VisibleRangeSettings";
import { TimelineCollapseButton } from "./TimelineCollapseButton";
import { useSetting } from "../../stores/settings";

export const TimelineControls = ({
  collapsed,
  onCollapseToggle,
  previewValueOnHover,
  onPreviewValueOnHoverChange,
  visibleTo,
  period,
  lockToPeriod,
  onLockToPeriodChange,
  onRangeChange,
  showRulesList,
  onToggleRulesList,
}: {
  collapsed: boolean;
  onCollapseToggle: () => void;
  previewValueOnHover: boolean;
  onPreviewValueOnHoverChange: (v: boolean) => void;
  visibleTo: number;
  period: number;
  lockToPeriod: boolean;
  onLockToPeriodChange: (v: boolean) => void;
  onRangeChange: (v: number) => void;
  showRulesList: boolean;
  onToggleRulesList: () => void;
}) => {
  const timelineRangeEnabled = useSetting("timelineRange");

  return (
    <Group>
      <Group>
        <Tooltip label={collapsed ? "Expand timeline" : "Collapse timeline"}>
          <TimelineCollapseButton
            collapsed={collapsed}
            onClick={onCollapseToggle}
          />
        </Tooltip>
        <Tooltip label='Toggle tracks'>
          <ActionIcon
            variant='outline'
            color={showRulesList ? "green" : "gray"}
            onClick={onToggleRulesList}
          >
            <FiList />
          </ActionIcon>
        </Tooltip>
        <Tooltip label='Preview values on hover'>
          <ActionIcon
            variant='outline'
            title='Preview values on hover'
            color={previewValueOnHover ? "green" : "gray"}
            onClick={() => onPreviewValueOnHoverChange(!previewValueOnHover)}
          >
            <FiPenTool />
          </ActionIcon>
        </Tooltip>
      </Group>
      {timelineRangeEnabled && (
        <>
          <Divider size='xs' orientation='vertical' />
          <VisibleRangeSettings
            to={visibleTo}
            period={period}
            lockToPeriod={lockToPeriod}
            onLockToPeriodChange={onLockToPeriodChange}
            onRangeChange={onRangeChange}
          />
        </>
      )}
    </Group>
  );
};
