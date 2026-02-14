"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Copy, Check, PanelRightOpen, PanelRightClose } from "lucide-react";
import { IssuesSidebar } from "@/components/issues/IssuesSidebar";
import { Button } from "@/components/ui/Button";
import { VOTING_CARDS } from "@/lib/constants";
import { usePlayerStore } from "@/lib/store/playerStore";
import { useGameStore } from "@/lib/store/gameStore";
import { useGameRealtime } from "@/lib/hooks/useGameRealtime";
import { calculateAverage } from "@/lib/utils/calculations";
import Image from "next/image";

export default function GameRoomPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;

  const currentPlayer = usePlayerStore((state) => state.currentPlayer);
  const myVote = usePlayerStore((state) => state.myVote);
  const setMyVote = usePlayerStore((state) => state.setMyVote);

  const game = useGameStore((state) => state.game);
  const players = useGameStore((state) => state.players);
  const votes = useGameStore((state) => state.votes);
  const isRevealed = useGameStore((state) => state.isRevealed);
  const currentIssue = useGameStore((state) => state.currentIssue);

  const [copied, setCopied] = useState(false);
  const [showConfidence, setShowConfidence] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const countdownStartedRef = useRef(false);

  // Subscribe to realtime updates
  useGameRealtime(gameId);

  // Check if all non-spectators have voted
  const votingPlayers = players.filter((p) => !p.is_spectator);
  const allVoted = votingPlayers.length > 0 &&
    votingPlayers.every((p) =>
      votes.some((v) => v.player_id === p.id) ||
      (p.id === currentPlayer?.id && myVote)
    );

  // Reset when game resets to voting (new round)
  useEffect(() => {
    if (!isRevealed && game?.status === "voting") {
      countdownStartedRef.current = false;
      setMyVote(null); // Clear local vote for all users
    }
  }, [isRevealed, game?.status, setMyVote]);

  // Auto-reveal when all voted (if enabled)
  useEffect(() => {
    if (!game?.auto_reveal || isRevealed || !allVoted || countdownStartedRef.current) return;

    // Mark as started to prevent double trigger
    countdownStartedRef.current = true;
    setCountdown(3);
  }, [game?.auto_reveal, isRevealed, allVoted]);

  // Countdown timer
  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      setCountdown(null);
      setIsRevealing(true); // Prevent flash between countdown and reveal
      // Call reveal API
      fetch(`/api/games/${gameId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "revealed" }),
      });
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((c) => (c !== null ? c - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, gameId]);

  // Clear isRevealing when actually revealed
  useEffect(() => {
    if (isRevealed) {
      setIsRevealing(false);
    }
  }, [isRevealed]);

  // Redirect to join if no player
  useEffect(() => {
    if (!currentPlayer) {
      router.push(`/game/${gameId}/join`);
    }
  }, [currentPlayer, gameId, router]);

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/game/${gameId}/join`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReveal = async () => {
    setIsLoading(true);
    try {
      await fetch(`/api/games/${gameId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "revealed" }),
      });
    } catch (error) {
      // Error handled by realtime
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewRound = async () => {
    setIsLoading(true);
    try {
      // Clear votes from database
      if (game?.current_issue_id) {
        await fetch(`/api/votes?issueId=${game.current_issue_id}`, {
          method: "DELETE",
        });
      }

      // Reset game status
      await fetch(`/api/games/${gameId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "voting" }),
      });

      // Clear local vote
      setMyVote(null);

      // Clear votes in store
      useGameStore.getState().clearVotes();
    } catch (error) {
      // Error handled by realtime
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardSelect = async (value: string) => {
    if (isRevealed || !currentPlayer || !game?.current_issue_id) return;

    const newVote = myVote === value ? null : value;
    setMyVote(newVote);

    if (newVote) {
      try {
        await fetch("/api/votes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            issueId: game.current_issue_id,
            playerId: currentPlayer.id,
            value: newVote,
          }),
        });
      } catch (error) {
        // Revert on error
        setMyVote(myVote);
      }
    }
  };

  // Get vote for a player
  const getPlayerVote = (playerId: string) => {
    return votes.find((v) => v.player_id === playerId)?.value ?? null;
  };

  // Calculate average from revealed votes
  const average = isRevealed ? calculateAverage(votes) : null;

  // Check if at least one player has voted
  const hasVotes = votes.length > 0 || myVote;

  if (!currentPlayer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-[var(--border)] px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Logo + Game Name */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--primary)] rounded-lg flex items-center justify-center text-white text-xl">
                🃏
              </div>
              <div className="px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg text-sm font-medium text-[var(--text-primary)]">
                {currentIssue?.title || "Planning Session"}
              </div>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfidence(true)}
              >
                ✊ Confidence
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyLink}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied!" : "Invite"}
              </Button>

              {/* User pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-surface)] rounded-full">
                <div className="w-7 h-7 rounded-full overflow-hidden">
                  <Image
                    src={currentPlayer.avatar || "https://randomuser.me/api/portraits/men/32.jpg"}
                    alt="Avatar"
                    width={28}
                    height={28}
                    className="object-cover"
                  />
                </div>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {currentPlayer.name}
                </span>
              </div>

              {/* Sidebar toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-lg transition-colors"
                title={sidebarOpen ? "Hide Issues" : "Show Issues"}
              >
                {sidebarOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
              </button>
            </div>
          </div>
        </header>

      {/* Main content */}
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
                  <Button onClick={handleNewRound} isLoading={isLoading}>
                    Start New Round
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    size="lg"
                    onClick={() => game?.show_countdown ? setCountdown(3) : handleReveal()}
                    disabled={!hasVotes}
                    isLoading={isLoading}
                  >
                    Reveal Cards
                  </Button>
                  {allVoted && (
                    <div className="text-sm text-[var(--success)] font-medium">
                      ✓ All voted!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Players around table */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex gap-8">
            {players.slice(0, Math.ceil(players.length / 2)).map((player) => (
              <PlayerSeat
                key={player.id}
                player={player}
                vote={player.id === currentPlayer?.id ? myVote : getPlayerVote(player.id)}
                isRevealed={isRevealed}
                isCurrentPlayer={player.id === currentPlayer?.id}
              />
            ))}
          </div>

          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex gap-8">
            {players.slice(Math.ceil(players.length / 2)).map((player) => (
              <PlayerSeat
                key={player.id}
                player={player}
                vote={player.id === currentPlayer?.id ? myVote : getPlayerVote(player.id)}
                isRevealed={isRevealed}
                isCurrentPlayer={player.id === currentPlayer?.id}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Card selector */}
      <div className="bg-white border-t border-[var(--border)] p-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm text-[var(--text-secondary)] mb-3">
            Choose your card
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            {VOTING_CARDS.map((card) => (
              <button
                key={card.value}
                onClick={() => handleCardSelect(card.value)}
                disabled={isRevealed}
                className={`
                  w-14 h-20 rounded-lg border-2 font-mono font-bold text-lg
                  transition-all duration-200
                  ${
                    myVote === card.value
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

        {/* Confidence Vote Modal */}
        {showConfidence && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                Confidence Vote
              </h2>
              <p className="text-[var(--text-secondary)] mb-6">
                How confident are you in this sprint?
              </p>
              <div className="flex justify-center gap-4 mb-6">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    className="w-14 h-14 rounded-full bg-[var(--bg-surface)] text-2xl hover:bg-[var(--primary-light)] transition-colors"
                  >
                    {n === 1 ? "✊" : n === 2 ? "✌️" : n === 3 ? "🤟" : n === 4 ? "🖖" : "🖐️"}
                  </button>
                ))}
              </div>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setShowConfidence(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Issues Sidebar */}
      <IssuesSidebar
        gameId={gameId}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </div>
  );
}

// Player seat component
function PlayerSeat({
  player,
  vote,
  isRevealed,
  isCurrentPlayer,
}: {
  player: { id: string; name: string; avatar: string | null };
  vote: string | null;
  isRevealed: boolean;
  isCurrentPlayer: boolean;
}) {
  const hasVoted = vote !== null;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Card */}
      <div
        className={`
          w-12 h-16 rounded-lg flex items-center justify-center font-mono font-bold
          transition-all duration-300
          ${
            hasVoted
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--border)] text-transparent"
          }
          ${isCurrentPlayer ? "ring-2 ring-[var(--accent)]" : ""}
        `}
      >
        {isRevealed && hasVoted ? vote : hasVoted ? "✓" : "?"}
      </div>

      {/* Avatar + Name */}
      <div className={`flex items-center gap-2 px-2 py-1 rounded-full shadow-sm ${isCurrentPlayer ? "bg-[var(--primary-light)]" : "bg-white"}`}>
        <div className="w-6 h-6 rounded-full overflow-hidden">
          <Image
            src={player.avatar || "https://randomuser.me/api/portraits/men/32.jpg"}
            alt={player.name}
            width={24}
            height={24}
            className="object-cover"
          />
        </div>
        <span className="text-xs font-medium text-[var(--text-primary)]">
          {player.name}
        </span>
      </div>
    </div>
  );
}
