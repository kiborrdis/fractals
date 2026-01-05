import { FiScissors, FiTrash2, FiX, FiCheck } from "react-icons/fi";
import { GraphToolbar, ToolbarItem } from "../../ui/GraphToolbar";

export const NewSplineRuleCreateToolbar = ({
  mode,
  onExitCancel,
  onExitApply,
  onAddPointModeToggle,
  onDeletePointModeToggle,
  canApply,
}: {
  mode: "addPoint" | "deletePoint" | "view";
  onExitCancel: () => void;
  onExitApply: () => void;
  onAddPointModeToggle: () => void;
  onDeletePointModeToggle: () => void;
  canApply: boolean;
}) => {
  return (
    <GraphToolbar
      left={
        <>
          <ToolbarItem
            icon={FiScissors}
            label={
              mode === "addPoint" ? "Exit new point mode" : "New points mode"
            }
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
        </>
      }
      right={
        <>
          <ToolbarItem
            icon={FiX}
            label='Exit without saving'
            onClick={onExitCancel}
            color='red'
          />
          <ToolbarItem
            icon={FiCheck}
            label={canApply ? "Apply spline" : "Need at least 5 control points"}
            onClick={onExitApply}
            color={canApply ? "green" : "gray"}
            disabled={!canApply}
          />
        </>
      }
    />
  );
};
