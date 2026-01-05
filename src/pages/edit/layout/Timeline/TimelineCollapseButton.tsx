import { Button } from "@mantine/core";
import { TbChevronDown, TbChevronUp } from "react-icons/tb";

export const TimelineCollapseButton = ({
  collapsed,
  onClick,
}: {
  collapsed: boolean;
  onClick: () => void;
}) => {
  return (
    <Button
      variant='outline'
      color={collapsed ? "gray" : "green"}
      leftSection={
        collapsed ? <TbChevronUp size={12} /> : <TbChevronDown size={12} />
      }
      onClick={onClick}
    >
      Timeline
    </Button>
  );
};
