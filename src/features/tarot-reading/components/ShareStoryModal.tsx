'use client';

import { useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Download, Loader2 } from 'lucide-react';
import { BottomDrawer } from '@/components/ui/BottomDrawer';
import { Button } from '@/components/ui/Button';
import { UI_TEXTS } from '@/constants/app';
import { ShareStoryTemplate } from '@/features/tarot-reading/components/ShareStoryTemplate';
import type { ReadingSession } from '@/types/tarot';

interface ShareStoryModalProps {
  readonly isOpen: boolean;
  readonly session: ReadingSession;
  readonly onClose: () => void;
}

export function ShareStoryModal({
  isOpen,
  session,
  onClose,
}: ShareStoryModalProps) {
  const templateRef = useRef<HTMLDivElement | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isCancelled = false;

    async function renderStorySnapshot() {
      setIsGenerating(true);
      setHasError(false);
      setStatusMessage(null);

      await new Promise((resolve) => setTimeout(resolve, 120));
      if (isCancelled || !templateRef.current) return;

      try {
        const dataUrl = await toPng(templateRef.current, {
          cacheBust: true,
          pixelRatio: 1.5,
        });
        if (!isCancelled) {
          setPreviewDataUrl(dataUrl);
          setIsGenerating(false);
        }
      } catch {
        if (!isCancelled) {
          setHasError(true);
          setStatusMessage(UI_TEXTS.CLOSURE.IMAGE_ERROR);
          setIsGenerating(false);
        }
      }
    }

    void renderStorySnapshot();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, session]);

  function handleDownload() {
    if (!previewDataUrl) return;
    const link = document.createElement('a');
    link.download = `${UI_TEXTS.CLOSURE.TEMPLATE_FILENAME_PREFIX}${session.id}.png`;
    link.href = previewDataUrl;
    link.click();
    setHasError(false);
    setStatusMessage(UI_TEXTS.CLOSURE.DOWNLOAD_SUCCESS);
  }

  return (
    <>
      <ShareStoryTemplate templateRef={templateRef} session={session} />

      <BottomDrawer
        isOpen={isOpen}
        onClose={onClose}
        title={UI_TEXTS.CLOSURE.SHARE_MODAL_TITLE}
        subtitle={UI_TEXTS.CLOSURE.SHARE_MODAL_SUBTITLE}
        maxWidthClass="md:max-w-md"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex aspect-[9/16] w-full max-w-[230px] items-center justify-center overflow-hidden rounded-xl surface-inset">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-2 px-4 text-center">
                <Loader2 className="h-6 w-6 ink-accent animate-spin" />
                <span className="text-xs ink-secondary">
                  {UI_TEXTS.CLOSURE.GENERATING_IMAGE}
                </span>
              </div>
            ) : previewDataUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={previewDataUrl}
                alt={UI_TEXTS.CLOSURE.SHARE_MODAL_TITLE}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>

          {statusMessage && (
            <p
              className={`text-center text-xs ${
                hasError ? 'ink-warning' : 'ink-accent'
              }`}
            >
              {statusMessage}
            </p>
          )}

          <div className="flex w-full gap-2.5">
            <Button variant="outline" fullWidth onClick={onClose}>
              {UI_TEXTS.CLOSURE.BTN_CLOSE_MODAL}
            </Button>
            <Button
              variant="primary"
              fullWidth
              isLoading={isGenerating}
              disabled={!previewDataUrl}
              onClick={handleDownload}
              icon={<Download className="h-4 w-4" />}
            >
              {UI_TEXTS.CLOSURE.BTN_DOWNLOAD_IMAGE}
            </Button>
          </div>
        </div>
      </BottomDrawer>
    </>
  );
}