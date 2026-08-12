"use client";

import { useState } from "react";
import type { FaqItem } from "@/lib/salesPageConfig";
import { interpolatePrice } from "@/lib/siteConfig";

export default function FaqAccordion({
  items,
  priceLabel,
}: {
  items: FaqItem[];
  priceLabel: string;
}) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div>
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id} className="border-b border-brand-ink/10">
            <button
              type="button"
              onClick={() => setOpenId(open ? null : item.id)}
              className="w-full flex items-center justify-between gap-4 py-5 text-left"
            >
              <span className="font-bold text-[17px] text-brand-ink">{item.question}</span>
              <span className="relative flex-shrink-0 w-6 h-6 rounded-full bg-brand-bg">
                <span className="absolute top-1/2 left-[5px] right-[5px] h-[2px] bg-brand-navy -translate-y-1/2" />
                <span
                  className={`absolute top-[5px] bottom-[5px] left-1/2 w-[2px] bg-brand-navy -translate-x-1/2 transition-transform ${
                    open ? "rotate-90" : "rotate-0"
                  }`}
                />
              </span>
            </button>
            {open && (
              <p className="text-[15px] leading-relaxed text-brand-muted pr-10 pb-6">
                {interpolatePrice(item.answer, priceLabel)}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
