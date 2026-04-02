import { ReactNode } from "react";
import { Stack } from "@mantine/core";

export const SettingsSection = ({ children }: { children: ReactNode }) => {
  return (
    <Stack p='md' gap='md'>
      {children}
    </Stack>
  );
};
