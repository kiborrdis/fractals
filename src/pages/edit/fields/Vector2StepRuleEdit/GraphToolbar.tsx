import {
  FiNavigation,
  FiScissors,
  FiMap,
  FiMoreVertical,
} from "react-icons/fi";
import { Menu } from "@mantine/core";
import {
  GraphToolbar as BaseGraphToolbar,
  ToolbarItem,
} from "../../ui/GraphToolbar";
import { DocTooltip, mergeDocKeys } from "@/shared/ui/DocTooltip";
import { BiQuestionMark } from "react-icons/bi";

export const GraphToolbar = ({
  mode,
  canEditMap,
  onModeToggle,
  onNormalize,
  onMapEditModeToggle,
}: {
  mode: "view" | "addPoint";
  canEditMap: boolean;
  onModeToggle: () => void;
  onNormalize?: () => void;
  onMapEditModeToggle?: () => void;
}) => {
  return (
    <BaseGraphToolbar
      left={
        <>
          <DocTooltip
            docKeys={mergeDocKeys("graph-step-rule")}
            anchor={<ToolbarItem icon={BiQuestionMark} color='gray' />}
          />
          <ToolbarItem
            icon={FiScissors}
            label={mode === "addPoint" ? "Cancel adding point" : "Add point"}
            onClick={onModeToggle}
            color={mode === "addPoint" ? "green" : "gray"}
          />
          {onNormalize && (
            <ToolbarItem
              icon={FiNavigation}
              label='Normalize step lengths'
              onClick={onNormalize}
            />
          )}
        </>
      }
      right={
        <>
          {canEditMap && onMapEditModeToggle && (
            <Menu shadow='md' width={200}>
              <Menu.Target>
                <ToolbarItem
                  icon={FiMoreVertical}
                  label='More options'
                  onClick={() => {}}
                />
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<FiMap size={14} />}
                  onClick={onMapEditModeToggle}
                >
                  Edit fractal map
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </>
      }
    />
  );
};
