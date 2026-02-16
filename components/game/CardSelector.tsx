"use client";

import { VOTING_CARDS } from "@/lib/constants";

interface CardSelectorProps {
  selectedValue: string | null;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export function CardSelector({ selectedValue, onSelect, disabled }: CardSelectorProps) {
  return (
    <div className="bg-white border-t border-[var(--border)] p-4">
      <div className="max-w-4xl mx-auto">
        <p className="text-center text-sm text-[var(--text-secondary)] mb-3">
          Choose your card
        </p>
        <div className="flex justify-center gap-2 flex-wrap">
          {VOTING_CARDS.map((card) => (
            <button
              key={card.value}
              onClick={() => onSelect(card.value)}
              disabled={disabled}
              className={`
                w-14 h-20 rounded-lg border-2 font-mono font-bold text-lg
                transition-all duration-200
                ${
                  selectedValue === card.value
                    ? "bg-[var(--primary)] text-white border-[var(--primary)] -translate-y-2 shadow-lg"
                    : "bg-white text-[var(--text-primary)] border-[var(--border)] hover:border-[var(--primary)] hover:-translate-y-1"
                }
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
              `}
            >
              {card.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
