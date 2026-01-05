import { Label } from "@/shared/ui/Label/Label";
import { Box, Group } from "@mantine/core";
import { EditorDocTooltip } from "./EditorDocTooltip";
import { ComponentProps } from "react";

export const EditorLabel = ({
  children,
  htmlFor,
  size = "sm",
  leftSection,
  docKeys,
  maw,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  size?: "sm" | "xs";
  leftSection?: React.ReactNode;
  docKeys?: string;
  maw?: ComponentProps<typeof Group>["maw"];
}) => {
  return (
    <Group gap={0} maw={maw} wrap='nowrap'>
      {leftSection && <Box pr={4}>{leftSection}</Box>}
      <Label htmlFor={htmlFor} size={size}>
        {children}
      </Label>
      {docKeys && <EditorDocTooltip size={size} docKeys={docKeys} />}
    </Group>
  );
};
