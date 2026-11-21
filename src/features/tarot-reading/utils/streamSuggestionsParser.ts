import { SUGGESTIONS_DELIMITER } from "@/features/tarot-reading/prompts/tarotPrompts";

export interface ParsedStreamOutput {
  readonly bodyText: string;
  readonly suggestions: readonly string[];
}

function cleanSuggestionLine(line: string): string {
  return line
    .trim()
    .replace(/^[-*•\d.)\]]+\s*/, "")
    .replace(/^["'“”]+|["'“”]+$/g, "")
    .trim();
}

function getTrailingDelimiterPrefixLength(
  text: string,
  delimiter: string,
): number {
  const maxCheck = Math.min(text.length, delimiter.length - 1);
  for (let len = maxCheck; len >= 1; len -= 1) {
    if (text.endsWith(delimiter.slice(0, len))) {
      return len;
    }
  }
  return 0;
}

export function parseStreamWithSuggestions(
  rawBuffer: string,
  isFinal: boolean,
): ParsedStreamOutput {
  const delimiterIndex = rawBuffer.indexOf(SUGGESTIONS_DELIMITER);

  if (delimiterIndex !== -1) {
    const bodyText = rawBuffer.slice(0, delimiterIndex).trimEnd();
    const rawSuggestionsBlock = rawBuffer.slice(
      delimiterIndex + SUGGESTIONS_DELIMITER.length,
    );

    const suggestions = rawSuggestionsBlock
      .split("\n")
      .map(cleanSuggestionLine)
      .filter((line) => line.length >= 8 && line.length <= 140)
      .slice(0, 3);

    return { bodyText, suggestions };
  }

  if (!isFinal) {
    const pendingPrefixLen = getTrailingDelimiterPrefixLength(
      rawBuffer,
      SUGGESTIONS_DELIMITER,
    );
    if (pendingPrefixLen > 0) {
      return {
        bodyText: rawBuffer
          .slice(0, rawBuffer.length - pendingPrefixLen)
          .trimEnd(),
        suggestions: [],
      };
    }
  }

  return {
    bodyText: isFinal ? rawBuffer.trimEnd() : rawBuffer,
    suggestions: [],
  };
}
