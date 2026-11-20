"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Download, FileText, Smartphone, X } from "lucide-react";
import { AuraeLoader } from "@/components/ui/AuraeLoader";
import { Button } from "@/components/ui/Button";
import { TAROT_CONFIG, UI_TEXTS } from "@/constants/app";
import {
  ShareStoryTemplate,
  type ShareExportMode,
} from "@/features/tarot-reading/components/ShareStoryTemplate";
import { prepareSessionCardDataUrls } from "@/features/tarot-reading/utils/cardImageToDataUrl";
import { downloadElementAsPng } from "@/features/tarot-reading/utils/exportCanvasToPng";
import type { ReadingSession } from "@/types/tarot";
import { cn } from "@/utils/cn";

interface ShareStoryModalProps {
  readonly isOpen: boolean;
  readonly session: ReadingSession;
  readonly onClose: () => void;
}

const PREVIEW_SCALE = 0.34;
const PREVIEW_WIDTH = Math.round(
  TAROT_CONFIG.SHARE_IMAGE_WIDTH * PREVIEW_SCALE,
);

export function ShareStoryModal({
  isOpen,
  session,
  onClose,
}: ShareStoryModalProps) {
  const [exportMode, setExportMode] = useState<ShareExportMode>("full");
  const [resolvedCardState, setResolvedCardState] = useState<{
    key: string;
    urls: Record<string, string>;
  } | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportTemplateRef = useRef<HTMLDivElement | null>(null);
  const [previewHeight, setPreviewHeight] = useState<number>(
    Math.round(TAROT_CONFIG.SHARE_IMAGE_HEIGHT * PREVIEW_SCALE),
  );

  const sessionCardsKey = useMemo(() => {
    const ids = [
      ...session.initialCards.map((c) => c.cardId),
      ...session.deepDiveRounds.map((r) => r.clarifierCard.cardId),
    ];
    return `${session.id}:${ids.join(",")}`;
  }, [session]);

  const isPreparingImages =
    isOpen && resolvedCardState?.key !== sessionCardsKey;
  const cardDataUrls =
    resolvedCardState?.key === sessionCardsKey ? resolvedCardState.urls : {};

  useEffect(() => {
    if (!isOpen || resolvedCardState?.key === sessionCardsKey) return;

    let isMounted = true;
    void prepareSessionCardDataUrls(session).then((urls) => {
      if (isMounted) {
        setResolvedCardState({ key: sessionCardsKey, urls });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, resolvedCardState?.key, session, sessionCardsKey]);

  useEffect(() => {
    if (!isOpen) return;
    const measureTimer = setTimeout(() => {
      const actualHeight =
        exportTemplateRef.current?.offsetHeight ??
        TAROT_CONFIG.SHARE_IMAGE_HEIGHT;
      setPreviewHeight(Math.round(actualHeight * PREVIEW_SCALE));
    }, 60);

    return () => clearTimeout(measureTimer);
  }, [isOpen, exportMode, isPreparingImages, session]);

  if (!isOpen) return null;

  function handleClose() {
    setExportError(null);
    setDownloadDone(false);
    onClose();
  }

  async function handleDownloadPng() {
    const targetNode = exportTemplateRef.current;
    if (!targetNode || isDownloading) return;

    setIsDownloading(true);
    setExportError(null);
    setDownloadDone(false);

    try {
      const dateSlug = session.createdAt.slice(0, 10);
      const modeSlug = exportMode === "full" ? "day-du" : "story-9-16";
      const filename = `${UI_TEXTS.CLOSURE.TEMPLATE_FILENAME_PREFIX}${modeSlug}-${dateSlug}.png`;

      await downloadElementAsPng(targetNode, filename);
      setDownloadDone(true);
    } catch {
      setExportError(UI_TEXTS.CLOSURE.IMAGE_ERROR);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={UI_TEXTS.CLOSURE.SHARE_MODAL_TITLE}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <div className="relative flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-3xl surface-glass shadow-2xl">
        {/* Thanh tiêu đề Modal */}
        <div className="flex items-center justify-between gap-3 px-6 pt-5 pb-3.5">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-semibold ink-accent">
              {UI_TEXTS.CLOSURE.SHARE_MODAL_TITLE}
            </h2>
            <p className="text-xs ink-secondary mt-0.5">
              {UI_TEXTS.CLOSURE.SHARE_MODAL_SUBTITLE}
            </p>
          </div>

          <Button
            variant="icon"
            size="icon"
            onClick={handleClose}
            aria-label={UI_TEXTS.ARIA.CLOSE_OVERLAY}
            icon={<X className="h-4 w-4" />}
          />
        </div>

        <div
          aria-hidden="true"
          className="h-px w-full editorial-guide-divider opacity-65"
        />

        {/* Thanh chọn định dạng ảnh */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 gap-2 rounded-xl surface-inset p-1">
            <button
              type="button"
              onClick={() => {
                setExportMode("full");
                setDownloadDone(false);
                setExportError(null);
              }}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-xs sm:text-sm font-medium transition-all cursor-pointer",
                exportMode === "full"
                  ? "slot-label-pill-active shadow-sm"
                  : "ink-secondary hover:ink-primary",
              )}
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span>Bản đầy đủ</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setExportMode("story");
                setDownloadDone(false);
                setExportError(null);
              }}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-xs sm:text-sm font-medium transition-all cursor-pointer",
                exportMode === "story"
                  ? "slot-label-pill-active shadow-sm"
                  : "ink-secondary hover:ink-primary",
              )}
            >
              <Smartphone className="h-4 w-4 shrink-0" />
              <span>Ảnh Story 9:16</span>
            </button>
          </div>

          <p className="mt-2.5 text-center text-xs ink-secondary">
            {exportMode === "full"
              ? "Lưu trọn vẹn câu hỏi, các lá bài đã rút và toàn bộ lời nhắn dành cho bạn."
              : "Khung dọc 9:16 tinh gọn để bạn dễ dàng chia sẻ lên Story."}
          </p>
        </div>

        {/* Vùng xem trước thu nhỏ */}
        <div className="flex-1 min-h-0 overflow-y-auto mystic-scrollbar px-6 py-4 flex justify-center">
          {isPreparingImages ? (
            <AuraeLoader
              variant="block"
              label={UI_TEXTS.CLOSURE.GENERATING_IMAGE}
            />
          ) : (
            <div
              style={{
                width: `${PREVIEW_WIDTH}px`,
                height: `${previewHeight}px`,
              }}
              className="relative shrink-0 overflow-hidden rounded-2xl shadow-xl border line-accent-subtle"
            >
              <div
                style={{
                  transform: `scale(${PREVIEW_SCALE})`,
                  transformOrigin: "top left",
                }}
              >
                <ShareStoryTemplate
                  session={session}
                  mode={exportMode}
                  cardDataUrls={cardDataUrls}
                  inlinePreview
                />
              </div>
            </div>
          )}
        </div>

        {/* Mẫu kích thước thật ẩn ngoài màn hình dùng để xuất PNG */}
        <ShareStoryTemplate
          templateRef={exportTemplateRef}
          session={session}
          mode={exportMode}
          cardDataUrls={cardDataUrls}
        />

        <div
          aria-hidden="true"
          className="h-px w-full editorial-guide-divider opacity-65"
        />

        {/* Thanh hành động tải xuống */}
        <div className="shrink-0 px-6 py-4 space-y-2.5 safe-area-bottom">
          {exportError && (
            <p className="text-center text-xs ink-warning">{exportError}</p>
          )}

          <Button
            variant="gold"
            size="lg"
            fullWidth
            disabled={isPreparingImages || isDownloading}
            onClick={() => void handleDownloadPng()}
            icon={
              downloadDone ? (
                <Check className="h-4 w-4" />
              ) : (
                <Download className="h-4 w-4" />
              )
            }
          >
            {isDownloading
              ? "Đang gói ghém hình ảnh..."
              : downloadDone
                ? UI_TEXTS.CLOSURE.DOWNLOAD_SUCCESS
                : exportMode === "full"
                  ? "Tải bản đầy đủ (.PNG)"
                  : "Tải ảnh Story 9:16 (.PNG)"}
          </Button>
        </div>
      </div>
    </div>
  );
}
