import { Paper, Text } from "@mantine/core";
import { ComponentProps, ReactNode } from "react";
import styles from "./FloatingPanel.module.css";

export const FloatingPanel = ({
  children,
  w,
  title,
  ...props
}: {
  children: ReactNode;
  w?: number;
  title?: string;
} & ComponentProps<typeof Paper>) => {
  return (
    <Paper className={styles.panel} p='xs' w={w} {...props}>
      {title && (
        <Text size='xs' fw={600} mb={6} c='dimmed'>
          {title}
        </Text>
      )}
      {children}
    </Paper>
  );
};
