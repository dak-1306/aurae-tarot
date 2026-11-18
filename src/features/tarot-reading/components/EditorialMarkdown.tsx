import type { ReactNode } from "react";
import { AuraeLoader } from "@/components/ui/AuraeLoader";
import { cn } from "@/utils/cn";

interface EditorialMarkdownProps {
  readonly content: string;
  readonly isStreaming?: boolean;
  readonly variant?: "panel" | "export";
}

function sanitizeStreamingTail(text: string): string {
  return text.replace(
    /(\*{1,3})([^*]*)$/,
    (_match, _stars: string, tail: string) => tail,
  );
}

function renderInlineNodes(
  rawLine: string,
  stripUnclosedTail: boolean,
): ReactNode[] {
  const line = stripUnclosedTail ? sanitizeStreamingTail(rawLine) : rawLine;
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*\*[^*]+?\*\*\*|\*\*[^*]+?\*\*|\*[^*\n]+?\*)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyCounter = 0;

  while ((match = pattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(line.slice(lastIndex, match.index));
    }

    const token = match[0];
    keyCounter += 1;

    if (token.startsWith("***") && token.endsWith("***")) {
      nodes.push(
        <strong
          key={`bi_${keyCounter}`}
          className="font-semibold italic ink-accent"
        >
          {token.slice(3, -3)}
        </strong>,
      );
    } else if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong key={`b_${keyCounter}`} className="font-semibold ink-accent">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      nodes.push(
        <em key={`i_${keyCounter}`} className="italic ink-gold">
          {token.slice(1, -1)}
        </em>,
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < line.length) {
    nodes.push(line.slice(lastIndex));
  }

  return nodes;
}

export function EditorialMarkdown({
  content,
  isStreaming = false,
  variant = "panel",
}: EditorialMarkdownProps) {
  const normalized = content.replace(/\r\n/g, "\n").trim();
  if (!normalized) return null;

  const isExport = variant === "export";
  const rawLines = normalized.split("\n");

  let lastContentLineIdx = -1;
  for (let i = rawLines.length - 1; i >= 0; i -= 1) {
    if (rawLines[i]?.trim().length) {
      lastContentLineIdx = i;
      break;
    }
  }

  const elements: ReactNode[] = [];

  rawLines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const isLastActiveLine = isStreaming && idx === lastContentLineIdx;
    const inlineCursor = isLastActiveLine ? (
      <AuraeLoader
        variant="inline"
        size="sm"
        className="ml-1.5 inline-flex align-middle"
      />
    ) : null;

    if (/^(\*{3,}|-{3,}|_{3,})$/.test(trimmed)) {
      elements.push(
        <hr
          key={`hr_${idx}`}
          className={cn(
            "h-px border-0 editorial-guide-divider",
            isExport ? "my-5" : "my-3.5",
          )}
        />,
      );
      return;
    }

    const headingMatch = /^#{1,3}\s+(.+)$/.exec(trimmed);
    if (headingMatch) {
      const headingText = headingMatch[1] ?? "";
      elements.push(
        <h3
          key={`h_${idx}`}
          className={cn(
            "font-serif font-semibold tracking-wide ink-accent first:pt-0",
            isExport
              ? "text-[27px] pt-4 pb-0.5"
              : "text-base sm:text-[17px] pt-2.5",
          )}
        >
          {renderInlineNodes(headingText, isLastActiveLine)}
          {inlineCursor}
        </h3>,
      );
      return;
    }

    const bulletMatch = /^[-*•]\s+(.+)$/.exec(trimmed);
    if (bulletMatch) {
      const itemText = bulletMatch[1] ?? "";
      elements.push(
        <div
          key={`li_${idx}`}
          className={cn(
            "flex items-start pl-0.5",
            isExport ? "gap-3.5" : "gap-2.5",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "shrink-0 rounded-full bg-current ink-gold opacity-80",
              isExport ? "mt-[15px] h-2 w-2" : "mt-[9px] h-1.5 w-1.5",
            )}
          />
          <p
            className={cn(
              "flex-1 ink-primary",
              isExport
                ? "text-[22px] leading-[1.72]"
                : "text-sm sm:text-[15px] leading-[1.78]",
            )}
          >
            {renderInlineNodes(itemText, isLastActiveLine)}
            {inlineCursor}
          </p>
        </div>,
      );
      return;
    }

    elements.push(
      <p
        key={`p_${idx}`}
        className={cn(
          "ink-primary",
          isExport
            ? "text-[22px] leading-[1.72]"
            : "text-sm sm:text-[15px] leading-[1.78]",
        )}
      >
        {renderInlineNodes(trimmed, isLastActiveLine)}
        {inlineCursor}
      </p>,
    );
  });

  return (
    <div className={cn(isExport ? "space-y-4" : "space-y-3")}>{elements}</div>
  );
}
