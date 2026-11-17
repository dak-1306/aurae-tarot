"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { UI_TEXTS } from "@/constants/app";
import { cn } from "@/utils/cn";

interface BottomDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly subtitle?: string;
  readonly children: React.ReactNode;
  readonly maxWidthClass?: string;
}

export function BottomDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidthClass = "md:max-w-lg",
}: BottomDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-heading"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 surface-overlay-backdrop motion-veil-backdrop cursor-pointer"
      />

      <div
        className={cn(
          "relative z-10 w-full rounded-t-3xl md:rounded-2xl surface-elevated flex flex-col max-h-[88dvh] overflow-hidden motion-veil-panel",
          maxWidthClass,
        )}
      >
        <div className="flex justify-center pt-2.5 pb-1 md:hidden shrink-0">
          <span className="h-1 w-10 rounded-full drawer-grab-pill" />
        </div>

        <div className="flex items-start justify-between gap-3 border-b line-accent-subtle px-5 py-3.5 shrink-0">
          <div className="min-w-0">
            <h2
              id="drawer-heading"
              className="font-serif text-xl md:text-2xl font-semibold ink-accent truncate"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-xs ink-secondary">{subtitle}</p>
            )}
          </div>

          <Button
            variant="icon"
            size="icon"
            onClick={onClose}
            aria-label={UI_TEXTS.ARIA.CLOSE_OVERLAY}
            icon={<X className="h-4 w-4" />}
          />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto mystic-scrollbar px-5 py-4 safe-area-bottom">
          {children}
        </div>
      </div>
    </div>
  );
}
