import { lexer, type Token } from "marked";

/**
 * Parse markdown string into tokens using marked lexer
 */
export const parseMarkdown = (markdown: string): Token[] => {
  return lexer(markdown);
};
