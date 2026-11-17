"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, History, Moon, RotateCcw, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Collapsible } from "@/components/ui/Collapsible";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { UI_TEXTS } from "@/constants/app";
import { OracleMascot } from "@/features/tarot-reading/components/OracleMascot";
import type { ThemeMode } from "@/types/tarot";

interface AltarHeaderProps {
  readonly theme: ThemeMode;
  readonly historyCount: number;
  readonly hasActiveSession: boolean;
  readonly sessionKey: string | null;
  readonly onToggleTheme: () => void;
  readonly onOpenHistory: () => void;
  readonly onStartNewReading: () => void;
}

export function AltarHeader({
  theme,
  historyCount,
  hasActiveSession,
  sessionKey,
  onToggleTheme,
  onOpenHistory,
  onStartNewReading,
}: AltarHeaderProps) {
  const [isSmartExpanded, setIsSmartExpanded] = useState(false);
  const isDark = theme === "dark";

  // Tự động thu gọn thanh điều hướng sang góc trái ngay khi bước vào phiên trải bài
  useEffect(() => {
    setIsSmartExpanded(false);
  }, [sessionKey]);

  // Đóng menu phủ khi nhấn ESC
  useEffect(() => {
    if (!isSmartExpanded) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsSmartExpanded(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSmartExpanded]);

  // 1. TRẠNG THÁI CHƯA BẮT ĐẦU PHIÊN (Trang đặt câu hỏi): Header đầy đủ chuẩn mực
  if (!hasActiveSession) {
    return (
      <header className="shrink-0 z-30 surface-header safe-area-top">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full brand-orb">
              <OracleMascot variant="emblem" />
            </div>
            <span className="font-serif text-xl sm:text-2xl font-semibold tracking-[0.14em] ink-accent lowercase">
              {UI_TEXTS.HEADER.BRAND_NAME}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="icon"
              size="icon"
              onClick={onToggleTheme}
              aria-label={
                isDark
                  ? UI_TEXTS.HEADER.BTN_THEME_LIGHT
                  : UI_TEXTS.HEADER.BTN_THEME_DARK
              }
              icon={
                isDark ? (
                  <Sun className="h-4 w-4 ink-accent" />
                ) : (
                  <Moon className="h-4 w-4 ink-accent" />
                )
              }
            />

            <Button
              variant="outline"
              size="md"
              onClick={onOpenHistory}
              icon={<History className="h-4 w-4 ink-accent" />}
            >
              <span className="inline-flex items-center gap-1.5">
                <span>{UI_TEXTS.HEADER.BTN_HISTORY}</span>
                {historyCount > 0 && (
                  <StatusBadge variant="accent" shape="pill">
                    {historyCount}
                  </StatusBadge>
                )}
              </span>
            </Button>
          </div>
        </div>
      </header>
    );
  }

  // 2. TRẠNG THÁI TRONG PHIÊN TRẢI BÀI (Hít thở -> Xào -> Rút -> Luận giải):
  // Tự động thu về góc trái chỉ còn Huy hiệu Logo; chạm để bung ngang trên PC hoặc phủ lớp kính mờ trên Mobile
  return (
    <>
      <header className="pointer-events-none fixed top-0 left-0 z-40 px-4 pt-3 md:px-6 md:pt-4 safe-area-top">
        <div className="pointer-events-auto inline-flex items-center rounded-full surface-floating-capsule p-1">
          {/* Huy hiệu Logo luôn hiện diện ở góc trái */}
          <Button
            variant="icon"
            size="icon"
            onClick={() => setIsSmartExpanded((prev) => !prev)}
            aria-expanded={isSmartExpanded}
            aria-label={
              isSmartExpanded
                ? UI_TEXTS.HEADER.BTN_COLLAPSE_MENU
                : UI_TEXTS.HEADER.BTN_EXPAND_MENU
            }
            icon={<OracleMascot variant="emblem" />}
          />

          {/* PC (>= md): Trải ngang trực tiếp bằng hiệu ứng motion-morph-x dùng chung */}
          <div className="hidden md:block">
            <Collapsible isOpen={isSmartExpanded} direction="horizontal">
              <div className="flex items-center gap-2 pl-2.5 pr-1">
                <span className="font-serif text-lg font-semibold tracking-[0.14em] ink-accent lowercase pr-2 border-r line-neutral-subtle">
                  {UI_TEXTS.HEADER.BRAND_NAME}
                </span>

                <Button
                  variant="icon"
                  size="icon"
                  onClick={onToggleTheme}
                  aria-label={
                    isDark
                      ? UI_TEXTS.HEADER.BTN_THEME_LIGHT
                      : UI_TEXTS.HEADER.BTN_THEME_DARK
                  }
                  icon={
                    isDark ? (
                      <Sun className="h-4 w-4 ink-accent" />
                    ) : (
                      <Moon className="h-4 w-4 ink-accent" />
                    )
                  }
                />

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setIsSmartExpanded(false);
                    onOpenHistory();
                  }}
                  icon={<History className="h-4 w-4 ink-accent" />}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <span>{UI_TEXTS.HEADER.BTN_HISTORY}</span>
                    {historyCount > 0 && (
                      <StatusBadge variant="accent" shape="pill">
                        {historyCount}
                      </StatusBadge>
                    )}
                  </span>
                </Button>

                <Button
                  variant="subtle"
                  size="md"
                  onClick={() => {
                    setIsSmartExpanded(false);
                    onStartNewReading();
                  }}
                  icon={<RotateCcw className="h-4 w-4 ink-accent" />}
                >
                  {UI_TEXTS.HEADER.BTN_NEW_READING}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSmartExpanded(false)}
                  aria-label={UI_TEXTS.HEADER.BTN_COLLAPSE_MENU}
                  icon={<ChevronLeft className="h-4 w-4" />}
                />
              </div>
            </Collapsible>
          </div>
        </div>
      </header>

      {/* MOBILE (< md): Mở lớp phủ menu kính mờ đè lên trên khi chạm Logo */}
      {isSmartExpanded && (
        <div
          className="fixed inset-0 z-50 md:hidden flex flex-col justify-start p-4 safe-area-top"
          role="dialog"
          aria-modal="true"
          aria-label={UI_TEXTS.HEADER.MENU_TITLE}
        >
          <div
            aria-hidden="true"
            onClick={() => setIsSmartExpanded(false)}
            className="fixed inset-0 surface-overlay-backdrop motion-veil-backdrop cursor-pointer"
          />

          <div className="relative z-10 w-full rounded-2xl surface-elevated p-4 space-y-3 motion-veil-panel">
            <div className="flex items-center justify-between border-b line-accent-subtle pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full brand-orb">
                  <OracleMascot variant="emblem" />
                </div>
                <span className="font-serif text-xl font-semibold tracking-[0.14em] ink-accent lowercase">
                  {UI_TEXTS.HEADER.BRAND_NAME}
                </span>
              </div>

              <Button
                variant="icon"
                size="icon"
                onClick={() => setIsSmartExpanded(false)}
                aria-label={UI_TEXTS.HEADER.BTN_COLLAPSE_MENU}
                icon={<X className="h-4 w-4" />}
              />
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => {
                  setIsSmartExpanded(false);
                  onOpenHistory();
                }}
                icon={<History className="h-4 w-4 ink-accent" />}
              >
                <span className="inline-flex items-center gap-2">
                  <span>{UI_TEXTS.HEADER.BTN_HISTORY}</span>
                  {historyCount > 0 && (
                    <StatusBadge variant="accent" shape="pill">
                      {historyCount}
                    </StatusBadge>
                  )}
                </span>
              </Button>

              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => {
                  onToggleTheme();
                  setIsSmartExpanded(false);
                }}
                icon={
                  isDark ? (
                    <Sun className="h-4 w-4 ink-accent" />
                  ) : (
                    <Moon className="h-4 w-4 ink-accent" />
                  )
                }
              >
                {isDark
                  ? UI_TEXTS.HEADER.BTN_THEME_LIGHT
                  : UI_TEXTS.HEADER.BTN_THEME_DARK}
              </Button>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => {
                  setIsSmartExpanded(false);
                  onStartNewReading();
                }}
                icon={<RotateCcw className="h-4 w-4" />}
              >
                {UI_TEXTS.HEADER.BTN_NEW_READING}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
