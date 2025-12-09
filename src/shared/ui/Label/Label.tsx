import { Text } from "@mantine/core";

export const Label = ({
  children,
  htmlFor,
  size = "sm",
}: {
  children: React.ReactNode;
  htmlFor?: string;
  size?: "sm" | "xs";
}) => {
  return (
    <Text component='label' size={size} fw={500} htmlFor={htmlFor}>
      {children}
    </Text>
  );
};
