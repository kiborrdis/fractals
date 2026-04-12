import { useState } from "react";
import { ActionIcon } from "@mantine/core";
import { FiShare2 } from "react-icons/fi";
import { ShareModal } from "./ShareModal";

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).catch((err) => {
    console.error("Could not copy text: ", err);
  });
};

export const ShareButton = () => {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <ActionIcon variant='subtle' onClick={() => setOpened(true)}>
        <FiShare2 />
      </ActionIcon>
      {opened && <ShareModal onClose={() => setOpened(false)} />}
    </>
  );
};
