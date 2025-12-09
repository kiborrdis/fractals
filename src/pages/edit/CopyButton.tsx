import { ActionIcon } from "@mantine/core";
import { FiDownload } from "react-icons/fi";
import { copyToClipboard } from "./EditFractal";
import { useEditStore } from "./store/provider";

export const CopyButton = () => {
  const fractal = useEditStore((state) => state.fractal);

  return (
    <ActionIcon
      variant='subtle'
      onClick={() => {
        copyToClipboard(JSON.stringify(fractal, null, 2));
      }}
    >
      <FiDownload />
    </ActionIcon>
  );
};
