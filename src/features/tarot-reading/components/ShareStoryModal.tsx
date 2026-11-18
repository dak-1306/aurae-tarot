"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Check, Download, FileText, Smartphone, X } from "lucide-react";
import { AuraeLoader } from "@/components/ui/AuraeLoader";
import { Button } from "@/components/ui/Button";
import { TAROT_CONFIG } from "@/constants/app";
import {
  ShareStoryTemplate,
  type ShareExportMode,
} from "@/features/tarot-reading/components/ShareStoryTemplate";
import { prepareSessionCardDataUrls } from "@/features/tarot-reading/utils/cardImageToDataUrl";
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

  // Khóa định danh bộ lá bài của phiên hiện tại
  const sessionCardsKey = useMemo(() => {
    const ids = [
      ...session.initialCards.map((c) => c.cardId),
      ...session.deepDiveRounds.map((r) => r.clarifierCard.cardId),
    ];
    return `${session.id}:${ids.join(",")}`;
  }, [session]);

  // Suy diễn trực tiếp trạng thái loading & dữ liệu ảnh mà không cần setState đồng bộ trong Effect
  const isPreparingImages =
    isOpen && resolvedCardState?.key !== sessionCardsKey;
  const cardDataUrls =
    resolvedCardState?.key === sessionCardsKey ? resolvedCardState.urls : {};

  // Tải và mã hóa hình ảnh tất cả lá bài sang Base64 khi mở Modal
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

  // Đồng bộ chiều cao khung xem trước theo kích thước thật của mẫu đang chọn
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
      const images = Array.from(targetNode.querySelectorAll("img"));
      await Promise.all(
        images.map((img) =>
          img.complete
            ? img.decode().catch(() => undefined)
            : new Promise<void>((resolve) => {
                img.onload = () => resolve();
                img.onerror = () => resolve();
              }),
        ),
      );

      const nodeHeight =
        targetNode.offsetHeight || TAROT_CONFIG.SHARE_IMAGE_HEIGHT;
      const safePixelRatio = nodeHeight > 2600 ? 1.5 : 2;

      const pngDataUrl = await toPng(targetNode, {
        cacheBust: true,
        pixelRatio: safePixelRatio,
        width: TAROT_CONFIG.SHARE_IMAGE_WIDTH,
        height: nodeHeight,
      });

      const link = document.createElement("a");
      const dateSlug = session.createdAt.slice(0, 10);
      const modeSlug = exportMode === "full" ? "tron-ven" : "story-9-16";
      link.download = `aurae-tarot-${modeSlug}-${dateSlug}.png`;
      link.href = pngDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadDone(true);
    } catch {
      setExportError(
        "Không thể tạo tệp ảnh lúc này. Vui lòng thử lại sau giây lát.",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Lưu thẻ chiêm nghiệm"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <div className="relative flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-2xl surface-glass shadow-2xl">
        {/* Thanh tiêu đề Modal */}
        <div className="flex items-center justify-between border-b line-accent-subtle px-5 py-4">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-semibold ink-accent">
              Lưu Thẻ Chiêm Nghiệm
            </h2>
            <p className="text-xs ink-secondary mt-0.5">
              Chọn định dạng lưu trữ phù hợp với nhu cầu của bạn
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Đóng cửa sổ"
            className="rounded-full p-2 ink-secondary hover:ink-primary cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Thanh chuyển đổi 2 chế độ: Bản Trọn Vẹn vs Thẻ Story 9:16 */}
        <div className="px-5 pt-4">
          <div className="grid grid-cols-2 gap-2 rounded-xl surface-card p-1">
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
              <span>Bản Trọn Vẹn</span>
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
              <span>Thẻ Story 9:16</span>
            </button>
          </div>

          <p className="mt-2.5 text-center text-xs ink-secondary">
            {exportMode === "full"
              ? "Lưu đầy đủ câu hỏi chính, hình ảnh tất cả lá bài, các câu hỏi phụ và trọn vẹn lời luận giải."
              : "Khung dọc 9:16 tinh gọn gồm 3 lá bài chính, tóm tắt lá bổ trợ và thông điệp đọng lại để đăng Story."}
          </p>
        </div>

        {/* Vùng xem trước thu nhỏ có thanh cuộn */}
        <div className="flex-1 min-h-0 overflow-y-auto mystic-scrollbar px-5 py-4 flex justify-center">
          {isPreparingImages ? (
            <AuraeLoader
              variant="block"
              label="Đang chuẩn bị hình ảnh các lá bài..."
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

        {/* Mẫu kích thước thật ẩn ngoài màn hình dùng để xuất ảnh PNG */}
        <ShareStoryTemplate
          templateRef={exportTemplateRef}
          session={session}
          mode={exportMode}
          cardDataUrls={cardDataUrls}
        />

        {/* Thanh hành động tải xuống */}
        <div className="shrink-0 border-t line-accent-subtle px-5 py-4 space-y-2.5">
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
              ? "Đang kết xuất hình ảnh..."
              : downloadDone
                ? "Đã tải ảnh xuống máy"
                : exportMode === "full"
                  ? "Tải ảnh Bản Trọn Vẹn (.PNG)"
                  : "Tải ảnh Thẻ Story 9:16 (.PNG)"}
          </Button>
        </div>
      </div>
    </div>
  );
}
