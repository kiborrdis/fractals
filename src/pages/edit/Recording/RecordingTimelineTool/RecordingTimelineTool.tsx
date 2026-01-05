import { useMemo, useState } from "react";
import { Collapse, Group, Stack } from "@mantine/core";
import styles from "./RecordingTimelineTool.module.css";
import { useRecordingSettings } from "../store/data/useRecordingSettings";
import { RecordingTimelineGraph } from "./RecordingTimelineGraph";
import { useActions } from "../../stores/editStore/data/useActions";
import { useDynamicNumberRules } from "../../stores/editStore/data/useTimelineRules";
import { calcPeriod } from "../../helpers/timelineUtils";
import { TimelineCollapseButton } from "../../layout/Timeline/TimelineCollapseButton";

export const RecordingTimelineTool = ({
  currentTime,
}: {
  currentTime: number;
}) => {
  const [collapsed, setCollapsed] = useState(true);
  const [collapseEnded, setCollapseEnded] = useState(true);

  return (
    <>
      <div className={styles.collapseButton}>
        <TimelineCollapseButton
          collapsed={collapsed}
          onClick={() => {
            setCollapseEnded(false);
            setTimeout(() => {
              if (collapsed) {
                setCollapsed(false);
              }
            }, 100);
          }}
        />
      </div>

      {(!collapsed || !collapseEnded) && (
        <div className={styles.timelineContent}>
          <RecordingTimelineToolInner
            currentTime={currentTime}
            collapsed={collapsed}
            onCollapseToggle={() => setCollapsed(true)}
            onCollapseEnd={() => setCollapseEnded(true)}
          />
        </div>
      )}
    </>
  );
};

const RecordingTimelineToolInner = ({
  currentTime,
  collapsed,
  onCollapseToggle,
  onCollapseEnd,
}: {
  currentTime: number;
  collapsed: boolean;
  onCollapseToggle: () => void;
  onCollapseEnd: () => void;
}) => {
  const settings = useRecordingSettings();
  const { dynamicParamOverride, customParamOverride } = useActions();

  const allRules = useDynamicNumberRules();
  const fullPeriod = useMemo(() => calcPeriod(allRules), [allRules]);

  const overrideRule = (
    route: string[],
    newValue: number | [number, number] | undefined,
  ) => {
    if (route[0] === "d") {
      dynamicParamOverride(route.slice(1), newValue);
      return;
    } else if (route[0] === "c") {
      customParamOverride(route.slice(1), newValue);
      return;
    }
  };

  const handleDynamicParamOverride = (
    vals: Array<number | [number, number]>,
  ) => {
    vals.forEach((val, i) => {
      overrideRule(allRules[i].route, val);
    });
  };

  const handleDynamicParamOverrideReset = () => {
    allRules.forEach((r) => {
      if (r.route) {
        overrideRule(r.route, undefined);
      }
    });
  };

  return (
    <Collapse
      in={!collapsed}
      transitionDuration={300}
      transitionTimingFunction='ease'
      onTransitionEnd={() => {
        if (collapsed) {
          onCollapseEnd();
        }
      }}
    >
      <Stack bg='var(--mantine-color-body)' p='sm' gap='sm'>
        <Group>
          <TimelineCollapseButton
            collapsed={false}
            onClick={onCollapseToggle}
          />
        </Group>
        <RecordingTimelineGraph
          rules={allRules}
          period={fullPeriod}
          displayTime={currentTime}
          recordStartTime={settings.startTime}
          recordDuration={settings.duration}
          onDynamicParamOverride={handleDynamicParamOverride}
          onDynamicParamOverrideReset={handleDynamicParamOverrideReset}
        />
      </Stack>
    </Collapse>
  );
};
