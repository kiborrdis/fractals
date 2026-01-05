import { TextInput } from "@mantine/core";
import { ComponentProps } from "react";
import {
  useInputHighlight,
  InputOverlay,
  HighlightedText,
  type HighlightedRange,
} from "@brightgoose/react-highlight";
import styles from "./HighlightInput.module.css";

const renderRange = (key: string, text: string, data?: { color: string }) => (
  <span key={key} style={{ color: data?.color ?? "var(--mantine-color-text)" }}>
    {text}
  </span>
);

export type HighlightedInputRange = HighlightedRange<{
  color: string;
}>;

export const HightlightInput = ({
  ranges = [],
  ...props
}: ComponentProps<typeof TextInput> & {
  ranges?: HighlightedInputRange[];
}) => {
  const {
    containerRef,
    inputRef,
    overlayRef,
    overlayStyle,
    displaying,
    onScroll,
  } = useInputHighlight();

  return (
    <div ref={containerRef} className={styles.container}>
      <TextInput
        {...props}
        ref={inputRef}
        onScroll={onScroll}
        styles={{
          input: {
            color: displaying ? "transparent" : undefined,
            caretColor: displaying ? "var(--mantine-color-text)" : undefined,
          },
        }}
      />
      {displaying && (
        <InputOverlay ref={overlayRef} style={overlayStyle}>
          <HighlightedText
            text={String(props.value || "")}
            ranges={ranges}
            renderRange={renderRange}
          />
        </InputOverlay>
      )}
    </div>
  );
};
