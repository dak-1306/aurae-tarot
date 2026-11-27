"use client";

import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { UI_TEXTS } from "@/constants/app";
import { useAmbientAudio } from "@/contexts/AmbientAudioContext";

interface AmbientSoundButtonProps {
  readonly variant?: "icon" | "menu-row";
  readonly onAfterToggle?: () => void;
}

export function AmbientSoundButton({
  variant = "icon",
  onAfterToggle,
}: AmbientSoundButtonProps) {
  const { isSoundEnabled, toggleSound } = useAmbientAudio();

  const label = isSoundEnabled
    ? UI_TEXTS.AUDIO.BTN_MUTE
    : UI_TEXTS.AUDIO.BTN_UNMUTE;

  const handleClick = () => {
    toggleSound();
    onAfterToggle?.();
  };

  if (variant === "menu-row") {
    return (
      <Button
        variant="outline"
        size="lg"
        fullWidth
        onClick={handleClick}
        aria-pressed={isSoundEnabled}
        icon={
          isSoundEnabled ? (
            <Volume2 className="h-4 w-4 ink-accent" />
          ) : (
            <VolumeX className="h-4 w-4 ink-secondary" />
          )
        }
      >
        {isSoundEnabled ? UI_TEXTS.AUDIO.LABEL_ON : UI_TEXTS.AUDIO.LABEL_OFF}
      </Button>
    );
  }

  return (
    <Button
      variant="icon"
      size="icon"
      onClick={handleClick}
      aria-label={label}
      aria-pressed={isSoundEnabled}
      title={label}
      icon={
        isSoundEnabled ? (
          <Volume2 className="h-4 w-4 ink-accent" />
        ) : (
          <VolumeX className="h-4 w-4 ink-secondary" />
        )
      }
    />
  );
}
