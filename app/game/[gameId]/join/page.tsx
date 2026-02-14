"use client";

import { useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { AVATAR_OPTIONS } from "@/lib/constants";
import { usePlayerStore } from "@/lib/store/playerStore";

export default function JoinGamePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const gameId = params.gameId as string;
  const isHost = searchParams.get("host") === "true";
  const gameName = searchParams.get("name") || "Planning Session";

  const [playerName, setPlayerName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATAR_OPTIONS[0]);
  const [isSpectator, setIsSpectator] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const setCurrentPlayer = usePlayerStore((state) => state.setCurrentPlayer);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    setIsLoading(true);

    try {
      // Save player to Supabase
      const response = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId,
          name: playerName.trim(),
          avatar: selectedAvatar,
          isSpectator,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to join game");
      }

      const player = await response.json();

      // Store player in local state
      setCurrentPlayer(player);

      // If host, create a default issue and set up game
      if (isHost) {
        const issueResponse = await fetch("/api/issues", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameId,
            title: "Story 1",
          }),
        });

        const issue = await issueResponse.json();

        // Set host player ID and current issue on game
        await fetch(`/api/games/${gameId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hostPlayerId: player.id,
            currentIssueId: issue.id,
          }),
        });
      }

      router.push(`/game/${gameId}`);
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg-surface)] py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Game badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--primary-light)] text-[var(--primary)] rounded-full text-sm font-medium mb-4">
            <span>🃏</span>
            <span>{gameName}</span>
          </div>

          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            {isHost ? "Set Your Display Name" : "Join Game"}
          </h1>
          <p className="text-[var(--text-secondary)] mb-6">
            Choose a name and avatar to join the session
          </p>

          <form onSubmit={handleJoin} className="space-y-6">
            {/* Display Name */}
            <Input
              label="Display Name"
              placeholder="Your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              required
              autoFocus
            />

            {/* Avatar Selection */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
                Choose Avatar
              </label>
              <div className="grid grid-cols-4 gap-3">
                {AVATAR_OPTIONS.map((avatar, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`
                      relative w-full aspect-square rounded-xl overflow-hidden
                      border-2 transition-all duration-200
                      ${
                        selectedAvatar === avatar
                          ? "border-[var(--primary)] ring-2 ring-[var(--primary)] ring-offset-2"
                          : "border-[var(--border)] hover:border-[var(--border-hover)]"
                      }
                    `}
                  >
                    <Image
                      src={avatar}
                      alt={`Avatar ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Spectator Toggle */}
            <Toggle
              label="Join as Spectator"
              description="Watch without voting"
              checked={isSpectator}
              onChange={(e) => setIsSpectator(e.target.checked)}
            />

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              isLoading={isLoading}
              disabled={!playerName.trim()}
              className="w-full"
            >
              Continue to Game
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
