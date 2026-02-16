"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

// Confidence emojis mapping (Fist of Five)
const CONFIDENCE_EMOJIS: Record<number, string> = {
  1: "\u261D\uFE0F",
  2: "\u270C\uFE0F",
  3: "\uD83E\uDD1F",
  4: "\uD83D\uDD96",
  5: "\uD83D\uDD90\uFE0F",
};

interface ConfidenceVoteModalProps {
  isOpen: boolean;
  isRevealed: boolean;
  isAdmin: boolean;
  players: { id: string; name: string; is_spectator: boolean }[];
  confidenceVotes: { player_id: string; value: number }[];
  currentPlayerId: string | null;
  onSubmit: (value: number) => void;
  onReveal: () => void;
  onClose: () => void;
}

export function ConfidenceVoteModal({
  isOpen,
  isRevealed,
  isAdmin,
  players,
  confidenceVotes,
  currentPlayerId,
  onSubmit,
  onReveal,
  onClose,
}: ConfidenceVoteModalProps) {
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  // Check if current player already voted
  const myVote = confidenceVotes.find((v) => v.player_id === currentPlayerId);

  // Calculate average
  const average = confidenceVotes.length > 0
    ? (confidenceVotes.reduce((sum, v) => sum + v.value, 0) / confidenceVotes.length).toFixed(1)
    : null;

  const handleSubmit = async (value: number) => {
    setSelectedValue(value);
    await onSubmit(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
          {"\u270A"} Confidence Vote
        </h2>
        <p className="text-[var(--text-secondary)] mb-6">
          {isRevealed
            ? "Results are in!"
            : "How confident are you in this sprint? You can change your vote anytime."
          }
        </p>

        {/* Hand selection */}
        <div className="flex justify-center gap-4 mb-6">
          {[1, 2, 3, 4, 5].map((n) => {
            const currentVote = selectedValue ?? myVote?.value;
            const isSelected = currentVote === n;

            return (
              <button
                key={n}
                onClick={() => !isRevealed && handleSubmit(n)}
                disabled={isRevealed}
                className={`
                  w-14 h-14 rounded-full text-2xl transition-all
                  ${isSelected
                    ? "bg-[var(--primary)] scale-110 ring-2 ring-[var(--primary)]"
                    : "bg-[var(--bg-surface)] hover:bg-[var(--primary-light)]"
                  }
                  disabled:opacity-50 disabled:cursor-default
                `}
              >
                {CONFIDENCE_EMOJIS[n]}
              </button>
            );
          })}
        </div>

        {/* Vote status */}
        <div className="text-center mb-4">
          <span className="text-sm text-[var(--text-secondary)]">
            {confidenceVotes.length} / {players.filter((p) => !p.is_spectator).length} voted
          </span>
        </div>

        {/* Average (only when revealed) */}
        {isRevealed && average && (
          <div className="text-center mb-4 p-3 bg-[var(--primary-light)] rounded-lg">
            <span className="text-sm text-[var(--text-secondary)]">Team Confidence: </span>
            <span className="font-mono font-bold text-xl text-[var(--primary)]">{average}</span>
            <span className="text-sm text-[var(--text-secondary)]"> / 5</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {isAdmin && confidenceVotes.length > 0 && !isRevealed && (
            <Button onClick={onReveal} className="flex-1">
              Reveal Results
            </Button>
          )}
          <Button
            variant="secondary"
            className={isAdmin && confidenceVotes.length > 0 && !isRevealed ? "" : "w-full"}
            onClick={onClose}
          >
            {isRevealed ? "Close" : "Hide"}
          </Button>
        </div>
      </div>
    </div>
  );
}
