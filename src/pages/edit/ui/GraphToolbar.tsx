import {
  Group,
  ActionIcon,
  Tooltip,
  GroupProps,
  ActionIconProps,
} from "@mantine/core";
import React, { ReactNode } from "react";
import styles from "./GraphToolbar.module.css";

export const ToolbarItem = React.forwardRef<
  HTMLButtonElement,
  {
    icon: React.ComponentType<{ size: number | string }>;
    label: string;
    onClick: () => void;
    color?: ActionIconProps["color"];
    disabled?: boolean;
    size?: ActionIconProps["size"];
    variant?: ActionIconProps["variant"];
  }
>(
  (
    {
      icon: Icon,
      label,
      onClick,
      color = "gray",
      disabled = false,
      size = "sm",
      variant = "filled",
    },
    ref,
  ) => {
    return (
      <div className={styles.toolbarItemWrapper}>
        <Tooltip label={label}>
          <ActionIcon
            ref={ref}
            variant={variant}
            size={size}
            color={color}
            onClick={onClick}
            disabled={disabled}
          >
            <Icon size={12} />
          </ActionIcon>
        </Tooltip>
      </div>
    );
  },
);
ToolbarItem.displayName = "ToolbarItem";

export const GraphToolbar = ({
  left,
  right,
  zIndex = 10,
  style,
  ...props
}: Omit<GroupProps, "children" | "left" | "right"> & {
  left?: ReactNode;
  right?: ReactNode;
  zIndex?: number;
}) => {
  return (
    <Group
      className={styles.toolbar}
      style={{
        zIndex,
        ...style,
      }}
      justify='space-between'
      gap='xs'
      p='sm'
      {...props}
    >
      <Group gap='xs' justify='flex-start'>
        {left}
      </Group>
      <Group gap='xs' justify='flex-end'>
        {right}
      </Group>
    </Group>
  );
};
