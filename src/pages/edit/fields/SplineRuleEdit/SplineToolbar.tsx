import { Menu } from "@mantine/core";
import {
  FiScissors,
  FiTrash2,
  FiEye,
  FiPenTool,
  FiMoreVertical,
  FiMap,
} from "react-icons/fi";
import { GraphToolbar, ToolbarItem } from "../../ui/GraphToolbar";

export const SplineToolbar = ({
  mode,
  previewValueMode,
  canEditMap,
  onPreviewValueModeToggle,
  onAddPointModeToggle,
  onDeletePointModeToggle,
  onDrawModeToggle,
  onMapEditModeToggle,
}: {
  mode: "view" | "addPoint" | "deletePoint";
  previewValueMode: boolean;
  canEditMap: boolean;
  onPreviewValueModeToggle: () => void;
  onAddPointModeToggle: () => void;
  onDeletePointModeToggle: () => void;
  onDrawModeToggle?: () => void;
  onMapEditModeToggle?: () => void;
}) => {
  return (
    <GraphToolbar
      left={
        <>
          <ToolbarItem
            icon={FiEye}
            label={previewValueMode ? "Disable preview" : "Enable preview"}
            onClick={onPreviewValueModeToggle}
            color={previewValueMode ? "blue" : "gray"}
          />
          <ToolbarItem
            icon={FiScissors}
            label={mode === "addPoint" ? "Cancel adding point" : "Add point"}
            onClick={onAddPointModeToggle}
            color={mode === "addPoint" ? "green" : "gray"}
          />
          <ToolbarItem
            icon={FiTrash2}
            label={
              mode === "deletePoint" ? "Cancel deleting point" : "Delete point"
            }
            onClick={onDeletePointModeToggle}
            color={mode === "deletePoint" ? "red" : "gray"}
          />
          {onDrawModeToggle && (
            <ToolbarItem
              icon={FiPenTool}
              label='Draw new spline'
              onClick={onDrawModeToggle}
            />
          )}
        </>
      }
      right={
        canEditMap &&
        onMapEditModeToggle && (
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
        )
      }
    />
  );
};
