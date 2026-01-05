import { ActionIcon, Text, Tooltip } from "@mantine/core";
import { FiEye, FiEyeOff, FiEdit2 } from "react-icons/fi";
import { TimelineItem } from "../../stores/editStore/data/useTimelineRules";
import styles from "./TimelineRulesList.module.css";

export const TimelineRulesList = ({
  numberRules,
  disabledRangeIds,
  editingRangeId,
  onRuleActivityChange,
  onRuleEditChange,
}: {
  numberRules: TimelineItem[];
  disabledRangeIds: Record<string, boolean>;
  editingRangeId: string | null;
  onRuleActivityChange: (id: string, newActive: boolean) => void;
  onRuleEditChange: (id: string | null) => void;
}) => {
  return (
    <div className={styles.grid}>
      {numberRules.map((rule) => {
        const id = rule.route.join(".");
        const isActive = !disabledRangeIds[id];
        const isVector2 = rule.kind === "vector2";

        return (
          <Tooltip key={id} label={rule.name} openDelay={500}>
            <div
              className={`${styles.item}${isActive ? "" : " " + styles.itemDisabled}`}
            >
              <div className={styles.content}>
                <div
                  className={styles.colorDot}
                  style={{ backgroundColor: rule.color }}
                />
                <Text className={styles.name} size='sm' fw={500}>
                  {rule.name}
                  {isVector2 && (
                    <Text component='span' size='xs' c='dimmed'>
                      {" "}
                      2D
                    </Text>
                  )}
                </Text>
              </div>
              <div className={styles.actions}>
                <ActionIcon
                  color={isActive ? "yellow" : "gray"}
                  variant='transparent'
                  onClick={() => onRuleActivityChange(id, !isActive)}
                  size={16}
                >
                  {isActive ? <FiEye /> : <FiEyeOff />}
                </ActionIcon>
                {!isVector2 && (
                  <ActionIcon
                    color={editingRangeId === id ? "green" : "gray"}
                    variant='transparent'
                    onClick={() =>
                      onRuleEditChange(editingRangeId === id ? null : id)
                    }
                    size={16}
                  >
                    <FiEdit2 />
                  </ActionIcon>
                )}
              </div>
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
};
