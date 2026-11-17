"use client";

import { History, Moon, RotateCcw, Sparkles, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { UI_TEXTS } from "@/constants/app";
import type { ThemeMode } from "@/types/tarot";

interface AltarHeaderProps {
  readonly theme: ThemeMode;
  readonly historyCount: number;
  readonly hasActiveSession: boolean;
  readonly onToggleTheme: () => void;
  readonly onOpenHistory: () => void;
  readonly onStartNewReading: () => void;
}

export function AltarHeader({
  theme,
  historyCount,
  hasActiveSession,
  onToggleTheme,
  onOpenHistory,
  onStartNewReading,
}: AltarHeaderProps) {
  const isDark = theme === "dark";

  return (
    <header className="shrink-0 z-30 surface-header safe-area-top">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        {/* Thương hiệu */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full brand-orb">
            <Sparkles className="h-4 w-4 ink-accent" />
          </div>
          <div className="min-w-0">
            <span className="block font-serif text-base sm:text-lg md:text-xl font-bold tracking-[0.18em] ink-accent truncate">
              {UI_TEXTS.HEADER.BRAND_NAME}
            </span>
            <span className="hidden sm:block text-[11px] tracking-wider ink-secondary">
              {UI_TEXTS.HEADER.SUBTITLE}
            </span>
          </div>
        </div>

        {/* Cụm điều hướng tái sử dụng Button UI chuẩn Mobile & PC */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
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
                <StatusBadge variant="accent">{historyCount}</StatusBadge>
              )}
            </span>
          </Button>

          {hasActiveSession && (
            <Button
              variant="outline"
              size="md"
              hideLabelOnMobile
              onClick={onStartNewReading}
              aria-label={UI_TEXTS.HEADER.BTN_NEW_READING}
              icon={<RotateCcw className="h-4 w-4 ink-accent" />}
            >
              {UI_TEXTS.HEADER.BTN_NEW_READING}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
