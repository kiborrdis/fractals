import React, { createContext, useState } from "react";
import { Modal, Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { parseMarkdown } from "./parseMarkdown";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { docMap } from "../../../generated/docMap";

interface DocModalContextType {
  openDoc: (keys: string[]) => void;
}

const DocModalContext = createContext<DocModalContextType>({
  openDoc: () => {},
});

export const useDocModal = () => {
  const context = React.useContext(DocModalContext);
  if (!context) {
    throw new Error("useDocModal must be used within DocModalProvider");
  }
  return context;
};

export const DocModalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [opened, setOpened] = useState(false);
  const [docKeys, setDocKeys] = useState<string[]>([]);
  const keysWithRemoteDocs = docKeys.filter((key) => {
    const doc = docMap[key];
    return doc?.hasLong;
  });

  const { data: fullContent, isLoading } = useQuery({
    queryKey: ["doc-full", keysWithRemoteDocs.join(",")],
    queryFn: async () => {
      const contents: string[] = [];

      for (const key of keysWithRemoteDocs) {
        try {
          const response = await fetch(`/assets/docs/${key}.md`);
          if (!response.ok) continue;
          contents.push(await response.text());
        } catch (err) {
          console.error(`Failed to load doc: ${key}`, err);
        }
      }

      return contents.join("\n\n");
    },
    enabled: opened && keysWithRemoteDocs.length > 0,
  });

  const openDoc = (keys: string[]) => {
    setDocKeys(keys);
    setOpened(true);
  };

  const closeModal = () => {
    setOpened(false);
  };

  return (
    <DocModalContext.Provider value={{ openDoc }}>
      {children}

      {opened && (
        <Modal
          opened={opened}
          onClose={closeModal}
          size='md'
          styles={{
            header: {
              position: "absolute",
              right: 0,
            },
          }}
          centered
          overlayProps={{
            backgroundOpacity: 0.55,
            blur: 3,
          }}
        >
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <Stack gap='sm' pt='sm'>
              <MarkdownRenderer tokens={parseMarkdown(fullContent || "")} />
            </Stack>
          )}
        </Modal>
      )}
    </DocModalContext.Provider>
  );
};
