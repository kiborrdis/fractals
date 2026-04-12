import { useState } from "react";
import { serializeBuildRules } from "@/features/fractals";
import { fractalsApiClient } from "@/shared/api/fractalStorageApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ActionIcon,
  Button,
  Divider,
  Modal,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { FiShare2 } from "react-icons/fi";
import { useEditStore } from "./stores/editStore/provider";
import { copyToClipboard } from "./ShareButton";

export const ShareModal = ({ onClose }: { onClose: () => void }) => {
  const fractal = useEditStore((state) => state.fractal);
  const [fractalName, setFractalName] = useState("");

  const { data: serializedFractal } = useQuery({
    queryKey: ["serializedFractal", fractal],
    queryFn: () => serializeBuildRules(fractal),
  });

  const shareUrl = serializedFractal
    ? `${window.location.origin}/view?s=${encodeURIComponent(serializedFractal)}`
    : "";

  const {
    mutate: publish,
    isPending,
    isSuccess,
    error,
  } = useMutation({
    mutationFn: async (name: string) => {
      const encoded = serializedFractal ?? (await serializeBuildRules(fractal));
      const response = await fractalsApiClient.post_fractals_publish({
        serializedFractal: encoded,
        name,
      });
      if (response[0] === 429) {
        throw new Error(
          "You've reached the daily publish limit. Please try again tomorrow.",
        );
      }

      if (response[0] === 409) {
        throw new Error("A fractal like this is already published.");
      }
      if (response[0] !== 200) {
        throw new Error(
          response[1].error || "Failed to publish. Please try again.",
        );
      }
      return response[1];
    },
  });

  return (
    <Modal opened withCloseButton={false} onClose={onClose} centered size='md'>
      <Stack gap='sm'>
        <Stack gap='xs'>
          <Text fw={500}>Share Via Link</Text>

          <TextInput
            label='Share link'
            value={shareUrl}
            readOnly
            onClick={(e) => e.currentTarget.select()}
            rightSection={
              <ActionIcon
                variant='subtle'
                onClick={() => copyToClipboard(shareUrl)}
                title='Copy link'
              >
                <FiShare2 />
              </ActionIcon>
            }
          />
          <Text size='sm' c='dimmed'>
            Share this link with anyone to let them view your fractal.
          </Text>
        </Stack>

        <Divider />

        <Stack gap='xs'>
          <Text fw={500}>Publish to the public gallery</Text>
          <TextInput
            label='Fractal name'
            placeholder='Enter a name...'
            value={fractalName}
            onChange={(e) => setFractalName(e.currentTarget.value)}
          />
          <Text size='sm' c='dimmed'>
            Publishing adds your fractal to the public gallery where anyone can
            see it.
          </Text>
          {error && (
            <Text size='sm' c='red'>
              {error.message}
            </Text>
          )}
          {isSuccess && (
            <Text size='sm' c='green'>
              Fractal published successfully!
            </Text>
          )}
          <Button
            onClick={() => publish(fractalName.trim())}
            loading={isPending}
            disabled={!fractalName.trim() || isSuccess}
          >
            Publish
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
};
