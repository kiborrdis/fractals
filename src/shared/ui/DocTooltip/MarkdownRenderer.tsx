import React from "react";
import { type Token, type Tokens } from "marked";
import { Text, Title, Code, List } from "@mantine/core";
import styles from "./MarkdownRenderer.module.css";

export function MarkdownRenderer({
  tokens,
  parentKey,
}: {
  tokens: Token[];
  parentKey?: string | number;
}): React.ReactNode {
  return tokens.map((token, i) => {
    const tokenKey = parentKey !== undefined ? `${parentKey}-${i}` : i;

    switch (token.type) {
      case "heading": {
        const headingToken = token as Tokens.Heading;
        return (
          <HeadingTag key={tokenKey} level={headingToken.depth}>
            <MarkdownRenderer
              tokens={headingToken.tokens || []}
              parentKey={tokenKey}
            />
          </HeadingTag>
        );
      }
      case "paragraph": {
        const paragraphToken = token as Tokens.Paragraph;
        return (
          <Text key={tokenKey}>
            <MarkdownRenderer
              tokens={paragraphToken.tokens || []}
              parentKey={tokenKey}
            />
          </Text>
        );
      }
      case "list_item": {
        const listItemToken = token as Tokens.ListItem;
        return (
          <List.Item key={tokenKey}>
            <MarkdownRenderer
              key={tokenKey}
              tokens={listItemToken.tokens || []}
              parentKey={tokenKey}
            />
          </List.Item>
        );
      }
      case "list": {
        const listToken = token as Tokens.List;

        return (
          <List key={tokenKey} className={styles.list}>
            <MarkdownRenderer
              tokens={listToken.items || []}
              parentKey={tokenKey}
            />
          </List>
        );
      }
      case "code": {
        const codeToken = token as Tokens.Code;
        return (
          <Text key={tokenKey} component='pre' className={styles.pre}>
            <Code>{codeToken.text}</Code>
          </Text>
        );
      }
      case "blockquote": {
        const blockquoteToken = token as Tokens.Blockquote;
        return (
          <Text
            key={tokenKey}
            component='blockquote'
            className={styles.blockquote}
          >
            <MarkdownRenderer
              tokens={blockquoteToken.tokens || []}
              parentKey={tokenKey}
            />
          </Text>
        );
      }
      case "space": {
        return null;
      }
      case "text": {
        const textToken = token as Tokens.Text;

        if (textToken.tokens && textToken.tokens.length > 0) {
          return (
            <MarkdownRenderer
              key={tokenKey}
              tokens={textToken.tokens}
              parentKey={tokenKey}
            />
          );
        }

        return (token as Tokens.Text).text;
      }
      case "strong": {
        return (
          <Text key={tokenKey} fw={700} component='span'>
            <MarkdownRenderer
              tokens={(token as Tokens.Strong).tokens || []}
              parentKey={tokenKey}
            />
          </Text>
        );
      }
      case "em": {
        return (
          <Text key={tokenKey} fs='italic' component='span'>
            <MarkdownRenderer
              tokens={(token as Tokens.Em).tokens || []}
              parentKey={tokenKey}
            />
          </Text>
        );
      }
      case "codespan": {
        return <Code key={tokenKey}>{(token as Tokens.Codespan).text}</Code>;
      }
      case "link": {
        const linkToken = token as Tokens.Link;
        return (
          <a
            key={tokenKey}
            href={linkToken.href}
            target='_blank'
            rel='noopener noreferrer'
            className={styles.link}
          >
            <MarkdownRenderer
              tokens={linkToken.tokens || []}
              parentKey={tokenKey}
            />
          </a>
        );
      }
      case "image": {
        const imageToken = token as Tokens.Image;
        return (
          <img
            key={tokenKey}
            src={imageToken.href}
            alt={imageToken.text || ""}
            className={styles.image}
          />
        );
      }
      default: {
        return null;
      }
    }
  });
}

const orderMap: Record<number, 1 | 2 | 3 | 4 | 5 | 6> = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
};
const heardingFontSizes: Record<number, number> = {
  1: 24,
  2: 22,
  3: 20,
  4: 18,
  5: 16,
  6: 14,
};
const HeadingTag = ({
  level,
  children,
}: {
  level: number;
  children: React.ReactNode;
}) => {
  const order = orderMap[level] || 1;
  return (
    <Title size={heardingFontSizes[level] || 24} order={order}>
      {children}
    </Title>
  );
};
