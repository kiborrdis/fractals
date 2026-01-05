import { FiEye, FiMap, FiMoreVertical } from "react-icons/fi";
import { Menu } from "@mantine/core";
import {
  GraphToolbar as BaseGraphToolbar,
  ToolbarItem,
} from "../../ui/GraphToolbar";

export const GraphToolbar = ({
  previewMode,
  canEditMap,
  onPreviewModeToggle,
  onMapEditModeToggle,
}: {
  previewMode: boolean;
  canEditMap: boolean;
  onPreviewModeToggle: () => void;
  onMapEditModeToggle?: () => void;
}) => {
  return (
    <BaseGraphToolbar
      left={
        <ToolbarItem
          icon={FiEye}
          label={previewMode ? "Disable preview" : "Enable preview"}
          onClick={onPreviewModeToggle}
          color={previewMode ? "blue" : "gray"}
        />
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
