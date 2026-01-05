import { FiX, FiCheck } from "react-icons/fi";
import { GraphToolbar, ToolbarItem } from "../GraphToolbar";

export const MapEditToolbar = ({
  onCancel,
  onApply,
}: {
  onCancel: () => void;
  onApply: () => void;
}) => {
  return (
    <GraphToolbar
      right={
        <>
          <ToolbarItem
            icon={FiX}
            label='Cancel'
            onClick={onCancel}
            color='gray'
          />
          <ToolbarItem
            icon={FiCheck}
            label='Apply'
            onClick={onApply}
            color='green'
          />
        </>
      }
    />
  );
};
