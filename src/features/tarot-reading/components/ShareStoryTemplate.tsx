import { ShareFullCanvas } from "@/features/tarot-reading/components/share/ShareFullCanvas";
import { ShareStoryCanvas } from "@/features/tarot-reading/components/share/ShareStoryCanvas";
import type { ReadingSession } from "@/types/tarot";

export type ShareExportMode = "full" | "story";

interface ShareStoryTemplateProps {
  readonly templateRef?: React.RefObject<HTMLDivElement | null>;
  readonly session: ReadingSession;
  readonly mode?: ShareExportMode;
  readonly cardDataUrls?: Readonly<Record<string, string>>;
  readonly inlinePreview?: boolean;
}

export function ShareStoryTemplate({
  templateRef,
  session,
  mode = "full",
  cardDataUrls,
  inlinePreview = false,
}: ShareStoryTemplateProps) {
  const canvasElement =
    mode === "story" ? (
      <ShareStoryCanvas
        templateRef={templateRef}
        session={session}
        cardDataUrls={cardDataUrls}
      />
    ) : (
      <ShareFullCanvas
        templateRef={templateRef}
        session={session}
        cardDataUrls={cardDataUrls}
      />
    );

  if (inlinePreview) {
    return canvasElement;
  }

  return (
    <div
      aria-hidden="true"
      className="fixed left-0 top-0 -z-50 opacity-0 pointer-events-none select-none overflow-hidden"
    >
      {canvasElement}
    </div>
  );
}
