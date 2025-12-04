import { Stack, Group, Text, ActionIcon, Tooltip } from "@mantine/core";
import { FiEye, FiEyeOff, FiEdit2 } from "react-icons/fi";
import { TimelineNumberRuleItem } from "./TimelineTool";

export const TimelineRulesList = ({
  numberRules,
  activeRangesIds,
  editingRangeId,
  onRuleActivityChange,
  onRuleEditChange,
}: {
  numberRules: TimelineNumberRuleItem[];
  activeRangesIds: Record<string, boolean>;
  editingRangeId: string | null;
  onRuleActivityChange: (id: string, newVal: boolean) => void;
  onRuleEditChange: (id: string | null) => void;
}) => {
  return (
    <Stack w='100%' gap='xs'>
      {numberRules.map((rule) => {
        const id = rule.route.join(".");

        return (
          <Group
            wrap='nowrap'
            key={id}
            p={4}
            gap={4}
            align='center'
            justify='space-between'
          >
            <Group
              wrap='nowrap'
              gap={4}
              style={{
                overflow: "hidden",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  backgroundColor: rule.color,
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  flexShrink: 0,
                }}
              />
              <Tooltip label={rule.name} openDelay={750}>
                <Text truncate='end' size='sm' fw={500}>
                  {rule.name}
                </Text>
              </Tooltip>
            </Group>
            <Group wrap='nowrap' gap={4}>
              <ActionIcon
                color={activeRangesIds[id] ? "yellow" : "gray"}
                variant='transparent'
                onClick={() => onRuleActivityChange(id, !activeRangesIds[id])}
                size={16}
              >
                {activeRangesIds[id] ? <FiEye /> : <FiEyeOff />}
              </ActionIcon>
              <ActionIcon
                color={editingRangeId === id ? "green" : "gray"}
                variant='transparent'
                onClick={() => {
                  onRuleEditChange(id);
                }}
                size={16}
              >
                <FiEdit2 />
              </ActionIcon>
            </Group>
          </Group>
        );
      })}
    </Stack>
  );
};
