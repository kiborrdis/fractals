import React from "react";
import { HoverCard, Stack } from "@mantine/core";
import { parseMarkdown } from "./parseMarkdown";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { useDocModal } from "./DocModalContext";
import { docMap } from "../../../generated/docMap";

export type DocMap = Record<string, string>;

const renderContent = (markdown: string): React.ReactNode => {
  const tokens = parseMarkdown(markdown);

  return <MarkdownRenderer tokens={tokens} />;
};

export const DocTooltip = ({
  docKeys,
  anchor,
}: {
  docKeys: string;
  anchor: React.ReactElement;
}) => {
  const { openDoc } = useDocModal();
  const docKeysArray = docKeys.split(",").map((key) => key.trim());

  const content = docKeysArray
    .map((key) => docMap[key]?.short)
    .filter(Boolean)
    .join("\n\n");

  if (!content) {
    return anchor;
  }

  return (
    <HoverCard openDelay={500}>
      <HoverCard.Target>
        <div
          style={{ display: "inline-block", cursor: "pointer", lineHeight: 0 }}
          onClick={() => openDoc(docKeysArray)}
        >
          {anchor}
        </div>
      </HoverCard.Target>
      <HoverCard.Dropdown maw={300}>
        <Stack gap='xs'>{renderContent(content)}</Stack>
      </HoverCard.Dropdown>
    </HoverCard>
  );
};

export { useDocModal } from "./DocModalContext";
