import { DocTooltip } from "@/shared/ui/DocTooltip";
import { ThemeIcon } from "@mantine/core";
import { BiQuestionMark } from "react-icons/bi";

export const EditorDocTooltip = ({
  docKeys,
  size = "sm",
}: {
  docKeys?: string;
  size?: "sm" | "xs";
}) => {
  if (!docKeys || docKeys.length === 0) {
    return null;
  }

  return (
    <DocTooltip
      docKeys={docKeys}
      anchor={
        <ThemeIcon size={"xs"} variant='transparent' color='dark.2'>
          <BiQuestionMark size={size === "sm" ? 16 : 14} />
        </ThemeIcon>
      }
    />
  );
};
