"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, UserX } from "lucide-react";
import { IssuesSidebar } from "@/components/issues/IssuesSidebar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { ContextMenu } from "@/components/ui/ContextMenu";
import { MemeOverlay } from "@/components/memes/MemeOverlay";
import { selectMeme, type Meme } from "@/components/memes/memeData";
import { PlayerSeat } from "@/components/game/PlayerSeat";
import { CardSelector } from "@/components/game/CardSelector";
import { ConfidenceVoteModal } from "@/components/confidence/ConfidenceVoteModal";
import { GameHeader } from "@/components/layout/GameHeader";
import { TEAM_AVATARS } from "@/lib/constants";
import { usePlayerStore } from "@/lib/store/playerStore";
import { useGameStore } from "@/lib/store/gameStore";
import { useGameRealtime } from "@/lib/hooks/useGameRealtime";
import { calculateAverage } from "@/lib/utils/calculations";

export default function GameRoomPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;

  const currentPlayer = usePlayerStore((state) => state.currentPlayer);
  const setCurrentPlayer = usePlayerStore((state) => state.setCurrentPlayer);
  const getSession = usePlayerStore((state) => state.getSession);
  const clearSession = usePlayerStore((state) => state.clearSession);
  const myVote = usePlayerStore((state) => state.myVote);
  const setMyVote = usePlayerStore((state) => state.setMyVote);

  const game = useGameStore((state) => state.game);
  const players = useGameStore((state) => state.players);
  const votes = useGameStore((state) => state.votes);
  const isRevealed = useGameStore((state) => state.isRevealed);
  const currentIssue = useGameStore((state) => state.currentIssue);
  const isAdmin = useGameStore((state) => state.isAdmin);
  const confidenceVotes = useGameStore((state) => state.confidenceVotes);

  const isPlayerAdmin = isAdmin(currentPlayer?.id ?? null);
  const isConfidenceVoting = game?.confidence_status === "voting";
  const isConfidenceRevealed = game?.confidence_status === "revealed";

  const [showConfidence, setShowConfidence] = useState(false);
  const [hideConfidence, setHideConfidence] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const countdownStartedRef = useRef(false);

  // Profile modal state
  const [showNameModal, setShowNameModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Context menu state (admin player management)
  const [contextMenu, setContextMenu] = useState<{
    playerId: string;
    playerName: string;
    isSpectator: boolean;
    x: number;
    y: number;
  } | null>(null);
  const [isContextMenuLoading, setIsContextMenuLoading] = useState(false);
  const [wasKicked, setWasKicked] = useState(false);

  // Meme state
  const [currentMeme, setCurrentMeme] = useState<Meme | null>(null);
  const prevIsRevealedRef = useRef<boolean | null>(null); // Track previous state to detect transitions

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

  // Show confidence modal for all when new confidence vote starts
  useEffect(() => {
    if (isConfidenceVoting) {
      setHideConfidence(false);
    }
  }, [isConfidenceVoting]);

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
      // Call reveal API (only admin can reveal)
      if (isPlayerAdmin) {
        fetch(`/api/games/${gameId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "revealed", playerId: currentPlayer?.id }),
        });
      }
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

  // Show meme when votes are revealed (only on transition, not on page reload)
  useEffect(() => {
    const wasRevealed = prevIsRevealedRef.current;
    prevIsRevealedRef.current = isRevealed;

    // Only show meme on transition from not-revealed to revealed
    // Skip if: already revealed on load (wasRevealed === null means first render)
    if (!isRevealed || wasRevealed === true || wasRevealed === null) return;
    if (!game?.current_issue_id) return;

    // Get all vote values
    const voteValues = votes.map((v) => v.value);
    if (myVote) voteValues.push(myVote);

    if (voteValues.length > 0) {
      // Use deterministic seed so all players see the same meme
      const seed = `${game.current_issue_id}-${voteValues.sort().join(",")}`;
      const meme = selectMeme(voteValues, seed);
      setCurrentMeme(meme);
    }
  }, [isRevealed, votes, myVote, game?.current_issue_id]);

  // Try to restore session or redirect to join
  useEffect(() => {
    if (currentPlayer) return; // Already have player

    // Try to restore from saved session
    const savedPlayerId = getSession(gameId);
    if (savedPlayerId && players.length > 0) {
      const existingPlayer = players.find((p) => p.id === savedPlayerId);
      if (existingPlayer) {
        // Restore session
        setCurrentPlayer(existingPlayer);
        return;
      } else {
        // Player was removed — clear stale session
        clearSession(gameId);
      }
    }

    // No valid session — redirect to join (but only after players loaded)
    if (players.length > 0 || !savedPlayerId) {
      router.push(`/game/${gameId}/join`);
    }
  }, [currentPlayer, players, gameId, router, getSession, setCurrentPlayer, clearSession]);

  const handleLeaveGame = () => {
    clearSession(gameId);
    router.push("/");
  };

  // Update player name
  const handleUpdateName = async () => {
    if (!currentPlayer || !newName.trim()) return;
    setIsUpdatingProfile(true);
    try {
      const res = await fetch(`/api/players/${currentPlayer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentPlayer({ ...currentPlayer, name: updated.name });
        setShowNameModal(false);
        setNewName("");
      }
    } catch (error) {
      // Silent error
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Update player avatar
  const handleUpdateAvatar = async (avatarSrc: string) => {
    if (!currentPlayer) return;
    setIsUpdatingProfile(true);
    try {
      const res = await fetch(`/api/players/${currentPlayer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: avatarSrc }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentPlayer({ ...currentPlayer, avatar: updated.avatar });
        setShowAvatarModal(false);
      }
    } catch (error) {
      // Silent error
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Get taken avatars (excluding current player)
  const takenAvatars = players
    .filter((p) => p.id !== currentPlayer?.id && p.avatar)
    .map((p) => p.avatar);

  // Handle right-click on player (admin only)
  const handlePlayerContextMenu = (
    e: React.MouseEvent,
    player: { id: string; name: string; is_spectator: boolean }
  ) => {
    e.preventDefault();
    if (!isPlayerAdmin || player.id === currentPlayer?.id) return;

    setContextMenu({
      playerId: player.id,
      playerName: player.name,
      isSpectator: player.is_spectator,
      x: e.clientX,
      y: e.clientY,
    });
  };

  // Kick player
  const handleKickPlayer = async () => {
    if (!contextMenu || !currentPlayer) return;
    setIsContextMenuLoading(true);
    try {
      const res = await fetch(
        `/api/players/${contextMenu.playerId}?adminPlayerId=${currentPlayer.id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        // Update store directly (realtime doesn't reliably send old.id on delete)
        useGameStore.getState().removePlayer(contextMenu.playerId);
        setContextMenu(null);
      }
    } catch (error) {
      // Silent error
    } finally {
      setIsContextMenuLoading(false);
    }
  };

  // Make spectator / voter
  const handleMakeSpectator = async () => {
    if (!contextMenu || !currentPlayer) return;
    setIsContextMenuLoading(true);
    try {
      const res = await fetch(`/api/players/${contextMenu.playerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_spectator: !contextMenu.isSpectator,
          adminPlayerId: currentPlayer.id,
        }),
      });
      if (res.ok) {
        setContextMenu(null);
      }
    } catch (error) {
      // Silent error
    } finally {
      setIsContextMenuLoading(false);
    }
  };

  // Transfer admin
  const handleTransferAdmin = async () => {
    if (!contextMenu || !currentPlayer) return;
    setIsContextMenuLoading(true);
    try {
      const res = await fetch(`/api/games/${gameId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newCreatorId: contextMenu.playerId,
          playerId: currentPlayer.id,
        }),
      });
      if (res.ok) {
        setContextMenu(null);
      }
    } catch (error) {
      // Silent error
    } finally {
      setIsContextMenuLoading(false);
    }
  };

  // Detect if current player was kicked
  useEffect(() => {
    if (!currentPlayer || players.length === 0) return;

    const stillInGame = players.some((p) => p.id === currentPlayer.id);
    if (!stillInGame) {
      setWasKicked(true);
    }
  }, [players, currentPlayer]);

  const handleReveal = async () => {
    if (!isPlayerAdmin) return;
    setIsLoading(true);
    try {
      await fetch(`/api/games/${gameId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "revealed", playerId: currentPlayer?.id }),
      });
    } catch (error) {
      // Error handled by realtime
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewRound = async () => {
    if (!isPlayerAdmin) return;
    setIsLoading(true);
    try {
      // Clear votes from database (admin only)
      if (game?.current_issue_id && currentPlayer?.id) {
        await fetch(`/api/votes?issueId=${game.current_issue_id}&adminPlayerId=${currentPlayer.id}`, {
          method: "DELETE",
        });
      }

      // Reset game status
      await fetch(`/api/games/${gameId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "voting", playerId: currentPlayer?.id }),
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

  // Get confidence vote for a player
  const getPlayerConfidenceVote = (playerId: string) => {
    return confidenceVotes.find((v) => v.player_id === playerId)?.value ?? null;
  };

  // Start confidence voting (admin only)
  const handleStartConfidenceVote = async () => {
    if (!isPlayerAdmin) return;
    try {
      // Clear previous votes
      await fetch(`/api/confidence?gameId=${gameId}&playerId=${currentPlayer?.id}`, {
        method: "DELETE",
      });

      // Set status to voting
      await fetch(`/api/games/${gameId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confidenceStatus: "voting", playerId: currentPlayer?.id }),
      });

      setHideConfidence(false);
      setShowConfidence(true);
    } catch (error) {
      // Error handled silently
    }
  };

  // Submit confidence vote
  const handleConfidenceSubmit = async (value: number) => {
    if (!currentPlayer) return;
    try {
      await fetch("/api/confidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, playerId: currentPlayer.id, value }),
      });
    } catch (error) {
      // Error handled silently
    }
  };

  // Reveal confidence votes (admin only)
  const handleRevealConfidence = async () => {
    if (!isPlayerAdmin) return;
    try {
      await fetch(`/api/games/${gameId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confidenceStatus: "revealed", playerId: currentPlayer?.id }),
      });
    } catch (error) {
      // Error handled silently
    }
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
        <GameHeader
          gameId={gameId}
          currentPlayer={currentPlayer}
          currentIssueTitle={currentIssue?.title ?? null}
          isAdmin={isPlayerAdmin}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onLeaveGame={handleLeaveGame}
          onOpenNameModal={() => {
            setNewName(currentPlayer.name);
            setShowNameModal(true);
          }}
          onOpenAvatarModal={() => setShowAvatarModal(true)}
        />

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
                  {isPlayerAdmin ? (
                    <Button onClick={handleNewRound} isLoading={isLoading}>
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
                      onClick={() => game?.show_countdown ? setCountdown(3) : handleReveal()}
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
                      ✓ All voted!
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
                vote={player.id === currentPlayer?.id ? myVote : getPlayerVote(player.id)}
                isRevealed={isRevealed}
                isCurrentPlayer={player.id === currentPlayer?.id}
                confidenceVote={getPlayerConfidenceVote(player.id)}
                showConfidence={isConfidenceRevealed}
                isCreator={game?.creator_id === player.id}
                position="top"
                isSpectator={player.is_spectator}
                onContextMenu={isPlayerAdmin && player.id !== currentPlayer?.id
                  ? (e) => handlePlayerContextMenu(e, player)
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
                vote={player.id === currentPlayer?.id ? myVote : getPlayerVote(player.id)}
                isRevealed={isRevealed}
                isCurrentPlayer={player.id === currentPlayer?.id}
                confidenceVote={getPlayerConfidenceVote(player.id)}
                showConfidence={isConfidenceRevealed}
                isCreator={game?.creator_id === player.id}
                position="bottom"
                isSpectator={player.is_spectator}
                onContextMenu={isPlayerAdmin && player.id !== currentPlayer?.id
                  ? (e) => handlePlayerContextMenu(e, player)
                  : undefined
                }
              />
            ))}
          </div>
        </div>
      </main>

      {/* Card selector */}
      <CardSelector
        selectedValue={myVote}
        onSelect={handleCardSelect}
        disabled={isRevealed}
      />

        {/* Confidence Vote Modal - shows for all when voting is active */}
        {(showConfidence || (isConfidenceVoting && !hideConfidence)) && (
          <ConfidenceVoteModal
            isOpen={true}
            isRevealed={isConfidenceRevealed}
            isAdmin={isPlayerAdmin}
            players={players}
            confidenceVotes={confidenceVotes}
            currentPlayerId={currentPlayer?.id ?? null}
            onSubmit={handleConfidenceSubmit}
            onReveal={handleRevealConfidence}
            onClose={() => {
              setShowConfidence(false);
              setHideConfidence(true);
            }}
          />
        )}

        {/* Change Name Modal */}
        {showNameModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
                Change Name
              </h2>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter new name"
                className="mb-4"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdateName();
                }}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleUpdateName}
                  disabled={!newName.trim() || newName.trim() === currentPlayer.name}
                  isLoading={isUpdatingProfile}
                  className="flex-1"
                >
                  Save
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowNameModal(false);
                    setNewName("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Change Avatar Modal */}
        {showAvatarModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                Change Avatar
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Select a new avatar ({TEAM_AVATARS.length - takenAvatars.length} available)
              </p>
              <div className="grid grid-cols-4 gap-4 mb-4">
                {TEAM_AVATARS.map((avatar) => {
                  const isTaken = takenAvatars.includes(avatar.src);
                  const isSelected = currentPlayer.avatar === avatar.src;
                  if (isTaken) return null;
                  return (
                    <button
                      key={avatar.src}
                      onClick={() => !isSelected && handleUpdateAvatar(avatar.src)}
                      disabled={isUpdatingProfile}
                      className={`
                        relative w-[72px] h-[72px] rounded-full overflow-hidden
                        transition-all duration-200
                        ${isSelected
                          ? "ring-3 ring-[var(--primary)] ring-offset-2"
                          : "hover:ring-2 hover:ring-[var(--primary)] hover:ring-offset-2"
                        }
                        disabled:opacity-50
                      `}
                    >
                      <Avatar src={avatar.src} size={72} />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[var(--primary)]/20 flex items-center justify-center">
                          <Check size={24} className="text-white drop-shadow-md" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setShowAvatarModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Context Menu (admin player management) */}
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            isSpectator={contextMenu.isSpectator}
            isLoading={isContextMenuLoading}
            onClose={() => setContextMenu(null)}
            onKick={handleKickPlayer}
            onMakeSpectator={handleMakeSpectator}
            onTransferAdmin={handleTransferAdmin}
          />
        )}

        {/* Kicked Modal */}
        {wasKicked && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
              <div className="w-16 h-16 bg-[var(--danger)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserX size={32} className="text-[var(--danger)]" />
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                Вас удалили из игры
              </h2>
              <p className="text-[var(--text-secondary)] mb-6">
                Администратор удалил вас из этой сессии
              </p>
              <Button onClick={() => {
                clearSession(gameId);
                router.push(`/game/${gameId}/join`);
              }}>
                Присоединиться снова
              </Button>
            </div>
          </div>
        )}

        {/* Meme Overlay */}
        <MemeOverlay
          meme={currentMeme}
          onClose={() => setCurrentMeme(null)}
          autoCloseDelay={5000}
        />
      </div>

      {/* Issues Sidebar */}
      <IssuesSidebar
        gameId={gameId}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onConfidenceVote={handleStartConfidenceVote}
      />
    </div>
  );
}
