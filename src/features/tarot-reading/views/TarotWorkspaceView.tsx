"use client";

import { AltarHeader } from "@/components/layout/AltarHeader";
import { UI_TEXTS } from "@/constants/app";
import { AltarStage } from "@/features/tarot-reading/components/AltarStage";
import { CardDetailDrawer } from "@/features/tarot-reading/components/CardDetailDrawer";
import { HistoryDrawer } from "@/features/tarot-reading/components/HistoryDrawer";
import { ReadingPanel } from "@/features/tarot-reading/components/ReadingPanel";
import { ShareStoryModal } from "@/features/tarot-reading/components/ShareStoryModal";
import { StepBreathing } from "@/features/tarot-reading/components/StepBreathing";
import { StepIntention } from "@/features/tarot-reading/components/StepIntention";
import { StepShuffle } from "@/features/tarot-reading/components/StepShuffle";
import { useTarotFlow } from "@/features/tarot-reading/hooks/useTarotFlow";
import { cn } from "@/utils/cn";

export function TarotWorkspaceView() {
  const {
    theme,
    session,
    history,
    isHydrated,
    breathingPhase,
    canSkipBreathing,
    isStreamingSynthesis,
    streamingDeepDiveRound,
    inspectedCard,
    isHistoryOpen,
    isShareModalOpen,
    errorMessage,
    toggleTheme,
    startNewIntention,
    skipBreathingStep,
    pickCardFromInitialFan,
    requestClarifierFanDraw,
    cancelClarifierFanDraw,
    pickClarifierFromFan,
    resetToNewReading,
    openHistorySession,
    removeHistoryItem,
    setInspectedCard,
    setHistoryOpen,
    setShareModalOpen,
  } = useTarotFlow();

  const isDrawingStep = session?.step === "drawing";

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden surface-canvas ink-primary">
      <AltarHeader
        theme={theme}
        historyCount={history.length}
        hasActiveSession={Boolean(session)}
        sessionKey={session?.id ?? null}
        onToggleTheme={toggleTheme}
        onOpenHistory={() => setHistoryOpen(true)}
        onStartNewReading={() => void resetToNewReading()}
      />

      <main className="flex-1 min-h-0 overflow-hidden">
        {!isHydrated ? (
          <div className="flex h-full items-center justify-center">
            <span className="text-sm ink-secondary">
              {UI_TEXTS.COMMON.LOADING}
            </span>
          </div>
        ) : !session ? (
          <StepIntention
            errorMessage={errorMessage}
            onSubmitIntention={(topicId, question, allowReversed) =>
              void startNewIntention(topicId, question, allowReversed)
            }
          />
        ) : session.step === "breathing" ? (
          <StepBreathing
            question={session.question}
            phase={breathingPhase}
            canSkip={canSkipBreathing}
            onSkip={skipBreathingStep}
          />
        ) : session.step === "shuffling" ? (
          <StepShuffle />
        ) : (
          <div
            className={cn(
              "flex h-full w-full flex-col overflow-hidden lg:grid lg:grid-cols-12",
              !isDrawingStep && "mx-auto max-w-[1680px]",
            )}
          >
            {/* Bàn Thờ Chiêm Tinh */}
            <div
              className={
                isDrawingStep
                  ? "h-full w-full overflow-hidden lg:col-span-12"
                  : "shrink-0 lg:col-span-7 lg:h-full lg:overflow-hidden"
              }
            >
              <AltarStage
                session={session}
                onPickInitialFanCard={(fanId) =>
                  void pickCardFromInitialFan(fanId)
                }
                onPickClarifierFanCard={(fanId) =>
                  void pickClarifierFromFan(fanId)
                }
                onCancelClarifierFan={cancelClarifierFanDraw}
                onInspectCard={(card) => setInspectedCard(card)}
              />
            </div>

            {/* Bảng Luận Giải AI Streaming & Đào Sâu */}
            {!isDrawingStep && (
              <div className="flex flex-1 min-h-0 flex-col overflow-hidden lg:col-span-5 lg:h-full">
                <ReadingPanel
                  session={session}
                  isStreamingSynthesis={isStreamingSynthesis}
                  streamingDeepDiveRound={streamingDeepDiveRound}
                  errorMessage={errorMessage}
                  onRequestDeepDiveDraw={requestClarifierFanDraw}
                  onOpenShareModal={() => setShareModalOpen(true)}
                />
              </div>
            )}
          </div>
        )}
      </main>

      <CardDetailDrawer
        card={inspectedCard}
        onClose={() => setInspectedCard(null)}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        history={history}
        onClose={() => setHistoryOpen(false)}
        onSelectSession={(item) => void openHistorySession(item)}
        onDeleteSession={(id) => void removeHistoryItem(id)}
      />

      {session && (
        <ShareStoryModal
          isOpen={isShareModalOpen}
          session={session}
          onClose={() => setShareModalOpen(false)}
        />
      )}
    </div>
  );
}
