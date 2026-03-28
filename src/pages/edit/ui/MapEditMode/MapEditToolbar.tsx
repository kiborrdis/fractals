import { FiX, FiCheck } from "react-icons/fi";
import { GraphToolbar, ToolbarItem } from "../GraphToolbar";
import { DocTooltip, mergeDocKeys } from "@/shared/ui/DocTooltip";
import { BiQuestionMark } from "react-icons/bi";

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
          <DocTooltip
            docKeys={mergeDocKeys("graph-map-edit")}
            anchor={<ToolbarItem icon={BiQuestionMark} color='gray' />}
          />
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
