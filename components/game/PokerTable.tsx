"use client";

import { Button } from "@/components/ui/Button";
import { PlayerSeat } from "@/components/game/PlayerSeat";
import type { Player, Vote, ConfidenceVote } from "@/lib/supabase/types";

interface PokerTableProps {
  // State
  countdown: number | null;
  isRevealing: boolean;
  isRevealed: boolean;
  average: number | null;
  hasVotes: boolean;
  allVoted: boolean;
  isLoading: boolean;

  // Players
  players: Player[];
  currentPlayerId: string | null;
  myVote: string | null;
  votes: Vote[];
  confidenceVotes: ConfidenceVote[];
  isConfidenceRevealed: boolean;
  creatorId: string | null;

  // Admin
  isPlayerAdmin: boolean;
  showCountdown: boolean;

  // Handlers
  onReveal: () => void;
  onNewRound: () => void;
  onStartCountdown: () => void;
  onPlayerContextMenu?: (e: React.MouseEvent, player: Player) => void;
}

export function PokerTable({
  countdown,
  isRevealing,
  isRevealed,
  average,
  hasVotes,
  allVoted,
  isLoading,
  players,
  currentPlayerId,
  myVote,
  votes,
  confidenceVotes,
  isConfidenceRevealed,
  creatorId,
  isPlayerAdmin,
  showCountdown,
  onReveal,
  onNewRound,
  onStartCountdown,
  onPlayerContextMenu,
}: PokerTableProps) {
  // Get vote for a player
  const getPlayerVote = (playerId: string) => {
    return votes.find((v) => v.player_id === playerId)?.value ?? null;
  };

  // Get confidence vote for a player
  const getPlayerConfidenceVote = (playerId: string) => {
    return confidenceVotes.find((v) => v.player_id === playerId)?.value ?? null;
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 bg-[var(--bg-surface)]">
      {/* Poker Table */}
      <div className="relative w-full max-w-3xl">
        {/* Table */}
        <div className="bg-[var(--primary-light)] border-4 border-[var(--primary)]/20 rounded-[100px] h-64 flex items-center justify-center">
          {/* Center content */}
          <div className="text-center">
            {countdown !== null || isRevealing ? (
              <div className="space-y-2">
                <div className="text-6xl font-bold text-[var(--primary)] animate-pulse">
                  {countdown !== null ? countdown : "..."}
                </div>
                <div className="text-sm text-[var(--text-secondary)]">
                  Revealing...
                </div>
              </div>
            ) : isRevealed ? (
              <div className="space-y-4">
                <div className="text-4xl font-bold text-[var(--primary)]">
                  {average !== null ? `Average: ${average}` : "No votes"}
                </div>
                {isPlayerAdmin ? (
                  <Button onClick={onNewRound} isLoading={isLoading}>
                    Start New Round
                  </Button>
                ) : (
                  <p className="text-sm text-[var(--text-secondary)]">
                    Waiting for admin to start new round...
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {isPlayerAdmin ? (
                  <Button
                    size="lg"
                    onClick={() => showCountdown ? onStartCountdown() : onReveal()}
                    disabled={!hasVotes}
                    isLoading={isLoading}
                  >
                    Reveal Cards
                  </Button>
                ) : (
                  <p className="text-sm text-[var(--text-secondary)]">
                    {hasVotes ? "Waiting for admin to reveal..." : "Cast your vote below"}
                  </p>
                )}
                {allVoted && (
                  <div className="text-sm text-[var(--success)] font-medium">
                    {"\u2713"} All voted!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Players around table */}
        <div className="absolute -top-28 left-1/2 -translate-x-1/2 flex gap-8">
          {players.slice(0, Math.ceil(players.length / 2)).map((player) => (
            <PlayerSeat
              key={player.id}
              player={player}
              vote={player.id === currentPlayerId ? myVote : getPlayerVote(player.id)}
              isRevealed={isRevealed}
              isCurrentPlayer={player.id === currentPlayerId}
              confidenceVote={getPlayerConfidenceVote(player.id)}
              showConfidence={isConfidenceRevealed}
              isCreator={creatorId === player.id}
              position="top"
              isSpectator={player.is_spectator}
              onContextMenu={isPlayerAdmin && player.id !== currentPlayerId && onPlayerContextMenu
                ? (e) => onPlayerContextMenu(e, player)
                : undefined
              }
            />
          ))}
        </div>

        <div className="absolute -bottom-28 left-1/2 -translate-x-1/2 flex gap-8">
          {players.slice(Math.ceil(players.length / 2)).map((player) => (
            <PlayerSeat
              key={player.id}
              player={player}
              vote={player.id === currentPlayerId ? myVote : getPlayerVote(player.id)}
              isRevealed={isRevealed}
              isCurrentPlayer={player.id === currentPlayerId}
              confidenceVote={getPlayerConfidenceVote(player.id)}
              showConfidence={isConfidenceRevealed}
              isCreator={creatorId === player.id}
              position="bottom"
              isSpectator={player.is_spectator}
              onContextMenu={isPlayerAdmin && player.id !== currentPlayerId && onPlayerContextMenu
                ? (e) => onPlayerContextMenu(e, player)
                : undefined
              }
            />
          ))}
        </div>
      </div>
    </main>
  );
}
