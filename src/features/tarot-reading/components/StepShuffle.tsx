"use client";

import { UI_TEXTS } from "@/constants/app";
import { CardBackArt } from "@/features/tarot-reading/components/CardBackArt";
import { OracleMascot } from "@/features/tarot-reading/components/OracleMascot";

export function StepShuffle() {
  return (
    <section className="mx-auto flex h-full max-w-lg flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* Sân khấu tráo bài Overhand Cut + vòng tinh bàn */}
      <div className="relative flex h-56 w-64 sm:h-60 sm:w-72 items-center justify-center shrink-0">
        {/* Quầng sáng mờ & vòng tinh bàn xoay phía sau */}
        <div
          aria-hidden="true"
          className="absolute inset-4 rounded-full shuffle-stage-aura blur-2xl"
        />
        <div
          aria-hidden="true"
          className="absolute h-48 w-48 sm:h-52 sm:w-52 rounded-full shuffle-orbit-ring"
        />

        {/* Cỗ bài 4 lớp chuyển động thuần GPU */}
        <div className="relative h-44 w-32 sm:h-48 sm:w-36">
          {/* Lớp đáy tạo chiều dày cố định cho cỗ bài */}
          <div
            aria-hidden="true"
            className="absolute inset-0 z-0 rounded-xl opacity-50 translate-y-1.5 rotate-1"
          >
            <CardBackArt />
          </div>

          {/* Tụ bài cắt bên trái: rút từ dưới đáy (z-1) và xếp lên mặt trên (z-20) */}
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-xl shuffle-card-left"
          >
            <CardBackArt />
          </div>

          {/* Tụ bài cắt bên phải: lệch nửa nhịp để đan xen liên tục */}
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-xl shuffle-card-right"
          >
            <CardBackArt />
          </div>

          {/* Thân cỗ bài trung tâm nhún nhẹ mỗi khi có tụ bài xếp lên */}
          <div className="relative z-10 h-full w-full rounded-xl shuffle-card-center">
            <CardBackArt />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full shuffle-center-orb">
                <OracleMascot variant="emblem" className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="mt-5 font-serif text-2xl sm:text-3xl font-semibold ink-accent">
        {UI_TEXTS.SHUFFLING.STATUS}
      </h2>
      <p className="mt-1.5 text-xs sm:text-sm ink-secondary">
        {UI_TEXTS.SHUFFLING.SUBSTATUS}
      </p>
    </section>
  );
}
