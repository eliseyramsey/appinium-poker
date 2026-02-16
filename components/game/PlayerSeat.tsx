"use client";

import { Avatar } from "@/components/ui/Avatar";
import { VOTING_CARDS } from "@/lib/constants";

// Confidence emojis mapping (Fist of Five)
const CONFIDENCE_EMOJIS: Record<number, string> = {
  1: "☝️",
  2: "✌️",
  3: "🤟",
  4: "🖖",
  5: "🖐️",
};

interface PlayerSeatProps {
  player: { id: string; name: string; avatar: string | null };
  vote: string | null;
  isRevealed: boolean;
  isCurrentPlayer: boolean;
  confidenceVote?: number | null;
  showConfidence?: boolean;
  isCreator?: boolean;
  position: "top" | "bottom";
  isSpectator?: boolean;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export function PlayerSeat({
  player,
  vote,
  isRevealed,
  isCurrentPlayer,
  confidenceVote,
  showConfidence,
  isCreator,
  position,
  isSpectator,
  onContextMenu,
}: PlayerSeatProps) {
  const hasVoted = vote !== null;
  const hasConfidenceVote = confidenceVote !== null && confidenceVote !== undefined;

  // Convert vote value to display label (e.g., "coffee" -> "coffee emoji")
  const voteLabel = vote ? (VOTING_CARDS.find(c => c.value === vote)?.label ?? vote) : null;

  const card = (
    <div
      className={`
        w-14 h-20 rounded-lg flex items-center justify-center font-mono font-bold text-lg
        transition-all duration-300 shadow-md
        ${showConfidence
          ? hasConfidenceVote
            ? "bg-[var(--accent)]/20 text-2xl"
            : "bg-[var(--border)] text-transparent"
          : hasVoted
            ? "bg-[var(--primary)] text-white"
            : "bg-[var(--border)] text-transparent"
        }
        ${isCurrentPlayer ? "ring-2 ring-[var(--accent)]" : ""}
      `}
    >
      {showConfidence
        ? hasConfidenceVote
          ? CONFIDENCE_EMOJIS[confidenceVote!]
          : "?"
        : isRevealed && hasVoted
          ? voteLabel
          : hasVoted
            ? "\u2713"
            : "?"
      }
    </div>
  );

  const avatar = (
    <div
      onContextMenu={onContextMenu}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full shadow-sm cursor-default select-none ${isCurrentPlayer ? "bg-[var(--primary-light)]" : "bg-white"} ${onContextMenu ? "hover:ring-2 hover:ring-[var(--primary)]/30" : ""}`}
    >
      {isCreator && (
        <span className="text-sm" title="Game Admin">{"\uD83D\uDC51"}</span>
      )}
      <Avatar src={player.avatar} size={40} />
      <span className={`text-sm font-medium ${isSpectator ? "text-[var(--text-secondary)] italic" : "text-[var(--text-primary)]"}`}>
        {player.name}
        {isSpectator && <span className="ml-1 text-xs">(spectator)</span>}
      </span>
    </div>
  );

  // Top: avatar above card, Bottom: card above avatar
  return (
    <div className="flex flex-col items-center gap-2">
      {position === "top" ? avatar : card}
      {position === "top" ? card : avatar}
    </div>
  );
}
