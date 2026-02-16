"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { DEFAULT_GAME_SETTINGS, DEFAULT_GAME_NAME, type GameSettings, type VotingSystem } from "@/lib/constants";

export default function CreateGamePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [gameName, setGameName] = useState("");
  const [settings, setSettings] = useState<GameSettings>({ ...DEFAULT_GAME_SETTINGS });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: gameName || DEFAULT_GAME_NAME,
          votingSystem: settings.votingSystem,
          whoCanReveal: settings.whoCanReveal,
          whoCanManage: settings.whoCanManage,
          autoReveal: settings.autoReveal,
          funFeatures: settings.funFeatures,
          showAverage: settings.showAverage,
          showCountdown: settings.showCountdown,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create game");
      }

      const game = await response.json();
      router.push(`/game/${game.id}/join?host=true`);
    } catch (error) {
      // TODO: Show error toast
      setIsLoading(false);
    }
  };

  const updateSetting = <K extends keyof typeof settings>(
    key: K,
    value: (typeof settings)[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
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
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
            Create New Game
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Game Name */}
            <Input
              label="Game Name"
              placeholder="Sprint 42 Planning"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
            />

            {/* Voting System */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Voting System
              </label>
              <select
                value={settings.votingSystem}
                onChange={(e) => updateSetting("votingSystem", e.target.value as VotingSystem)}
                className="w-full px-4 py-2.5 bg-white border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="fibonacci">Fibonacci (0, 1, 2, 3, 5, 8, 13, 21...)</option>
              </select>
            </div>

            {/* Divider */}
            <hr className="border-[var(--border)]" />

            {/* Options */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                Options
              </h3>

              <Toggle
                label="Auto-reveal cards"
                description="Reveal when all players have voted"
                checked={settings.autoReveal}
                onChange={(e) => updateSetting("autoReveal", e.target.checked)}
              />

              <Toggle
                label="Show average"
                description="Display average score after reveal"
                checked={settings.showAverage}
                onChange={(e) => updateSetting("showAverage", e.target.checked)}
              />

              <Toggle
                label="Countdown animation"
                description="3-2-1 countdown before reveal"
                checked={settings.showCountdown}
                onChange={(e) => updateSetting("showCountdown", e.target.checked)}
              />

              <Toggle
                label="Fun features"
                description="Team memes and reactions"
                checked={settings.funFeatures}
                onChange={(e) => updateSetting("funFeatures", e.target.checked)}
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              Create Game
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
