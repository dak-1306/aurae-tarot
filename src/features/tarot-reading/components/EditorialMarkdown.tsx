import type { ReactNode } from "react";
import { AuraeLoader } from "@/components/ui/AuraeLoader";

interface EditorialMarkdownProps {
  readonly content: string;
  readonly isStreaming?: boolean;
}

/**
 * Làm sạch tạm thời các dấu * mở chưa kịp đóng ở cuối dòng đang stream
 * để tránh chớp ký tự thô trên màn hình.
 */
function sanitizeStreamingTail(text: string): string {
  return text.replace(
    /(\*{1,3})([^*]*)$/,
    (_match, _stars: string, tail: string) => tail,
  );
}

/**
 * Phân tách định dạng nội dòng: ***nhấn mạnh nghiêng***, **in đậm**, *in nghiêng*
 */
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
}: EditorialMarkdownProps) {
  const normalized = content.replace(/\r\n/g, "\n").trim();
  if (!normalized) return null;

  const rawLines = normalized.split("\n");

  // Xác định chỉ số dòng có nội dung cuối cùng để gắn con trỏ loading inline
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

    // 1. Đường phân cách ngang (***, ---, ___)
    if (/^(\*{3,}|-{3,}|_{3,})$/.test(trimmed)) {
      elements.push(
        <hr
          key={`hr_${idx}`}
          className="my-3.5 h-px border-0 editorial-guide-divider"
        />,
      );
      return;
    }

    // 2. Tiêu đề phân đoạn (###, ##, #)
    const headingMatch = /^#{1,3}\s+(.+)$/.exec(trimmed);
    if (headingMatch) {
      const headingText = headingMatch[1] ?? "";
      elements.push(
        <h3
          key={`h_${idx}`}
          className="font-serif text-base sm:text-[17px] font-semibold tracking-wide ink-accent pt-2.5 first:pt-0"
        >
          {renderInlineNodes(headingText, isLastActiveLine)}
          {inlineCursor}
        </h3>,
      );
      return;
    }

    // 3. Gạch đầu dòng (- , * , • )
    const bulletMatch = /^[-*•]\s+(.+)$/.exec(trimmed);
    if (bulletMatch) {
      const itemText = bulletMatch[1] ?? "";
      elements.push(
        <div key={`li_${idx}`} className="flex items-start gap-2.5 pl-0.5">
          <span
            aria-hidden="true"
            className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-current ink-gold opacity-80"
          />
          <p className="flex-1 text-sm sm:text-[15px] leading-[1.78] ink-primary">
            {renderInlineNodes(itemText, isLastActiveLine)}
            {inlineCursor}
          </p>
        </div>,
      );
      return;
    }

    // 4. Đoạn văn chiêm nghiệm thông thường
    elements.push(
      <p
        key={`p_${idx}`}
        className="text-sm sm:text-[15px] leading-[1.78] ink-primary"
      >
        {renderInlineNodes(trimmed, isLastActiveLine)}
        {inlineCursor}
      </p>,
    );
  });

  return <div className="space-y-3">{elements}</div>;
}
