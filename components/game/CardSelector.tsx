"use client";

import { VOTING_CARDS } from "@/lib/constants";

// Keyboard shortcut mapping: key -> card value
// 1->0, 2->1, 3->2, 4->3, 5->5, 6->8, 7->13, 8->21, 9->?, 0->coffee
const KEYBOARD_HINTS: Record<string, string> = {
  "0": "1",
  "1": "2",
  "2": "3",
  "3": "4",
  "5": "5",
  "8": "6",
  "13": "7",
  "21": "8",
  "?": "9",
  "coffee": "0",
};

interface CardSelectorProps {
  selectedValue: string | null;
  onSelect: (value: string) => void;
  disabled?: boolean;
  isSubmitting?: boolean;
}

export function CardSelector({ selectedValue, onSelect, disabled, isSubmitting }: CardSelectorProps) {
  return (
    <div className="bg-white border-t border-[var(--border)] p-4">
      <div className="max-w-4xl mx-auto">
        <p className="text-center text-sm text-[var(--text-secondary)] mb-3">
          Choose your card <span className="hidden md:inline text-xs opacity-60">(or press 1-0)</span>
        </p>
        <div className="flex justify-center gap-2 flex-wrap">
          {VOTING_CARDS.map((card) => {
            const isSelected = selectedValue === card.value;
            const showSpinner = isSelected && isSubmitting;
            const keyHint = KEYBOARD_HINTS[card.value];

            return (
              <button
                key={card.value}
                onClick={() => onSelect(card.value)}
                disabled={disabled || isSubmitting}
                className={`
                  w-14 h-20 rounded-lg border-2 font-mono font-bold text-lg
                  transition-all duration-200 relative group
                  ${
                    isSelected
                      ? "bg-[var(--primary)] text-white border-[var(--primary)] -translate-y-2 shadow-lg"
                      : "bg-white text-[var(--text-primary)] border-[var(--border)] hover:border-[var(--primary)] hover:-translate-y-1"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
                `}
              >
                {/* Keyboard hint badge - hidden on mobile, visible on hover for desktop */}
                {keyHint && (
                  <span className={`
                    absolute -top-1 -right-1 w-4 h-4 text-[10px] font-sans font-medium
                    rounded-full flex items-center justify-center
                    hidden md:flex
                    transition-opacity
                    ${isSelected
                      ? "bg-white text-[var(--primary)]"
                      : "bg-[var(--bg-surface)] text-[var(--text-secondary)] opacity-0 group-hover:opacity-100"
                    }
                  `}>
                    {keyHint}
                  </span>
                )}
                {showSpinner ? (
                  <svg
                    className="animate-spin h-5 w-5 mx-auto"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  card.label
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
