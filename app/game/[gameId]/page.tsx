"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Users, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { VOTING_CARDS } from "@/lib/constants";
import { usePlayerStore } from "@/lib/store/playerStore";
import { useGameStore } from "@/lib/store/gameStore";
import Image from "next/image";

export default function GameRoomPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;

  const currentPlayer = usePlayerStore((state) => state.currentPlayer);
  const myVote = usePlayerStore((state) => state.myVote);
  const setMyVote = usePlayerStore((state) => state.setMyVote);

  const isRevealed = useGameStore((state) => state.isRevealed);
  const setRevealed = useGameStore((state) => state.setRevealed);

  const [copied, setCopied] = useState(false);
  const [showConfidence, setShowConfidence] = useState(false);

  // Redirect to join if no player
  useEffect(() => {
    if (!currentPlayer) {
      router.push(`/game/${gameId}/join`);
    }
  }, [currentPlayer, gameId, router]);

  // Mock players for demo
  const players = [
    currentPlayer,
    { id: "2", name: "Sarah", avatar: "https://randomuser.me/api/portraits/women/44.jpg", vote: "5" },
    { id: "3", name: "Mike", avatar: "https://randomuser.me/api/portraits/men/22.jpg", vote: "8" },
    { id: "4", name: "Anna", avatar: "https://randomuser.me/api/portraits/women/68.jpg", vote: null },
  ].filter(Boolean);

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/game/${gameId}/join`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReveal = () => {
    setRevealed(true);
  };

  const handleNewRound = () => {
    setRevealed(false);
    setMyVote(null);
  };

  const handleCardSelect = (value: string) => {
    if (isRevealed) return;
    setMyVote(myVote === value ? null : value);
  };

  if (!currentPlayer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-surface)] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[var(--border)] px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Logo + Game Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--primary)] rounded-lg flex items-center justify-center text-white text-xl">
              🃏
            </div>
            <div className="px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg text-sm font-medium text-[var(--text-primary)]">
              Planning Session
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
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Poker Table */}
        <div className="relative w-full max-w-3xl">
          {/* Table */}
          <div className="bg-[var(--primary-light)] border-4 border-[var(--primary)]/20 rounded-[100px] h-64 flex items-center justify-center">
            {/* Center content */}
            <div className="text-center">
              {isRevealed ? (
                <div className="space-y-4">
                  <div className="text-4xl font-bold text-[var(--primary)]">
                    Average: 6.5
                  </div>
                  <Button onClick={handleNewRound}>
                    Start New Round
                  </Button>
                </div>
              ) : (
                <Button
                  size="lg"
                  onClick={handleReveal}
                  disabled={!myVote}
                >
                  Reveal Cards
                </Button>
              )}
            </div>
          </div>

          {/* Players around table */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex gap-8">
            {players.slice(0, 2).map((player, i) => (
              <PlayerSeat
                key={player?.id || i}
                player={player}
                isRevealed={isRevealed}
                isCurrentPlayer={player?.id === currentPlayer.id}
                myVote={myVote}
              />
            ))}
          </div>

          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex gap-8">
            {players.slice(2, 4).map((player, i) => (
              <PlayerSeat
                key={player?.id || i}
                player={player}
                isRevealed={isRevealed}
                isCurrentPlayer={player?.id === currentPlayer.id}
                myVote={myVote}
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
  );
}

// Player seat component
function PlayerSeat({
  player,
  isRevealed,
  isCurrentPlayer,
  myVote,
}: {
  player: { id: string; name: string; avatar: string | null; vote?: string | null } | null;
  isRevealed: boolean;
  isCurrentPlayer: boolean;
  myVote: string | null;
}) {
  if (!player) return null;

  const vote = isCurrentPlayer ? myVote : player.vote;
  const hasVoted = vote !== null && vote !== undefined;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Card */}
      <div
        className={`
          w-12 h-16 rounded-lg flex items-center justify-center font-mono font-bold
          transition-all duration-300
          ${
            hasVoted
              ? isRevealed
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--primary)] text-white"
              : "bg-[var(--border)] text-transparent"
          }
        `}
      >
        {isRevealed && hasVoted ? vote : hasVoted ? "✓" : "?"}
      </div>

      {/* Avatar + Name */}
      <div className="flex items-center gap-2 px-2 py-1 bg-white rounded-full shadow-sm">
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
