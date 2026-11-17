"use client";

import { Sparkles } from "lucide-react";
import { UI_TEXTS } from "@/constants/app";
import { CardBackArt } from "@/features/tarot-reading/components/CardBackArt";

export function StepShuffle() {
  return (
    <section className="mx-auto flex h-full max-w-lg flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="relative h-44 w-32 sm:h-48 sm:w-36 shrink-0">
        <div className="absolute inset-0 -rotate-12 -translate-x-5 rounded-xl opacity-80 animate-pulse">
          <CardBackArt />
        </div>
        <div className="absolute inset-0 rotate-12 translate-x-5 rounded-xl opacity-80 animate-pulse">
          <CardBackArt />
        </div>
        <div className="relative h-full w-full rounded-xl">
          <CardBackArt />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full shuffle-center-orb">
              <Sparkles className="h-5 w-5 ink-accent animate-spin" />
            </div>
          </div>
        </div>
      </div>

      <h2 className="mt-7 font-serif text-2xl sm:text-3xl font-semibold ink-accent">
        {UI_TEXTS.SHUFFLING.STATUS}
      </h2>
      <p className="mt-2 text-xs sm:text-sm ink-secondary">
        {UI_TEXTS.SHUFFLING.SUBSTATUS}
      </p>
    </section>
  );
}
