"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { IssuesSidebar } from "@/components/issues/IssuesSidebar";
import { ContextMenu } from "@/components/ui/ContextMenu";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { MemeOverlay } from "@/components/memes/MemeOverlay";
import { selectMeme, type Meme } from "@/components/memes/memeData";
import { CardSelector } from "@/components/game/CardSelector";
import { PokerTable } from "@/components/game/PokerTable";
import { ProfileModals } from "@/components/game/ProfileModals";
import { KickedModal } from "@/components/game/KickedModal";
import { ConfidenceVoteModal } from "@/components/confidence/ConfidenceVoteModal";
import { GameHeader } from "@/components/layout/GameHeader";
import { usePlayerStore } from "@/lib/store/playerStore";
import { useGameStore } from "@/lib/store/gameStore";
import { useGameRealtime } from "@/lib/hooks/useGameRealtime";
import { calculateAverage } from "@/lib/utils/calculations";
import GameNotFound from "./not-found";

function GameRoomContent() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  const { showToast } = useToast();

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
  const isGameLoaded = useGameStore((state) => state.isGameLoaded);
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
  const [isVoting, setIsVoting] = useState(false);

  // Meme state
  const [currentMeme, setCurrentMeme] = useState<Meme | null>(null);
  const prevIsRevealedRef = useRef<boolean | null>(null); // Track previous state to detect transitions

  // Track previous players to detect kicks (vs initial load)
  const prevPlayersRef = useRef<typeof players | null>(null);

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
  }, [countdown, gameId, isPlayerAdmin, currentPlayer?.id]);

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
      } else {
        showToast("Failed to update name. Please try again.");
      }
    } catch {
      showToast("Failed to update name. Please try again.");
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
      } else {
        showToast("Failed to update avatar. Please try again.");
      }
    } catch {
      showToast("Failed to update avatar. Please try again.");
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
      } else {
        showToast("Failed to kick player.");
      }
    } catch {
      showToast("Failed to kick player.");
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
      } else {
        showToast("Failed to update player status.");
      }
    } catch {
      showToast("Failed to update player status.");
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
      } else {
        showToast("Failed to transfer admin.");
      }
    } catch {
      showToast("Failed to transfer admin.");
    } finally {
      setIsContextMenuLoading(false);
    }
  };

  // Detect if current player was kicked
  // Only trigger if player WAS in previous players list and is now missing
  // This prevents false positives during initial load or session restoration
  useEffect(() => {
    const prevPlayers = prevPlayersRef.current;
    prevPlayersRef.current = players;

    // Skip if no current player or players not loaded yet
    if (!currentPlayer || players.length === 0) return;

    // Skip if this is the first time we have players (initial load)
    if (!prevPlayers || prevPlayers.length === 0) return;

    // Check if player was in previous list but is now missing
    const wasInGame = prevPlayers.some((p) => p.id === currentPlayer.id);
    const stillInGame = players.some((p) => p.id === currentPlayer.id);

    if (wasInGame && !stillInGame) {
      setWasKicked(true);
    }
  }, [players, currentPlayer]);

  const handleReveal = async () => {
    if (!isPlayerAdmin) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/games/${gameId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "revealed", playerId: currentPlayer?.id }),
      });
      if (!res.ok) {
        showToast("Failed to reveal votes.");
      }
    } catch {
      showToast("Failed to reveal votes.");
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
      const res = await fetch(`/api/games/${gameId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "voting", playerId: currentPlayer?.id }),
      });

      if (!res.ok) {
        showToast("Failed to start new round.");
        return;
      }

      // Clear local vote
      setMyVote(null);

      // Clear votes in store
      useGameStore.getState().clearVotes();
    } catch {
      showToast("Failed to start new round.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardSelect = async (value: string) => {
    if (isRevealed || !currentPlayer || !game?.current_issue_id || isVoting) return;

    const previousVote = myVote;
    const newVote = myVote === value ? null : value;
    setMyVote(newVote);

    if (newVote) {
      setIsVoting(true);
      try {
        const res = await fetch("/api/votes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            issueId: game.current_issue_id,
            playerId: currentPlayer.id,
            value: newVote,
          }),
        });
        if (!res.ok) {
          setMyVote(previousVote);
          showToast("Failed to submit vote.");
        }
      } catch {
        // Revert on error
        setMyVote(previousVote);
        showToast("Failed to submit vote.");
      } finally {
        setIsVoting(false);
      }
    }
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
      const res = await fetch(`/api/games/${gameId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confidenceStatus: "voting", playerId: currentPlayer?.id }),
      });

      if (!res.ok) {
        showToast("Failed to start confidence vote.");
        return;
      }

      setHideConfidence(false);
      setShowConfidence(true);
    } catch {
      showToast("Failed to start confidence vote.");
    }
  };

  // Submit confidence vote
  const handleConfidenceSubmit = async (value: number) => {
    if (!currentPlayer) return;
    try {
      const res = await fetch("/api/confidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, playerId: currentPlayer.id, value }),
      });
      if (!res.ok) {
        showToast("Failed to submit confidence vote.");
      }
    } catch {
      showToast("Failed to submit confidence vote.");
    }
  };

  // Reveal confidence votes (admin only)
  const handleRevealConfidence = async () => {
    if (!isPlayerAdmin) return;
    try {
      const res = await fetch(`/api/games/${gameId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confidenceStatus: "revealed", playerId: currentPlayer?.id }),
      });
      if (!res.ok) {
        showToast("Failed to reveal confidence votes.");
      }
    } catch {
      showToast("Failed to reveal confidence votes.");
    }
  };

  // Calculate average from revealed votes
  const average = isRevealed ? calculateAverage(votes) : null;

  // Check if at least one player has voted
  const hasVotes = votes.length > 0 || !!myVote;

  // Show 404 if game loaded but not found
  if (isGameLoaded && !game) {
    return <GameNotFound />;
  }

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
      <PokerTable
        countdown={countdown}
        isRevealing={isRevealing}
        isRevealed={isRevealed}
        average={average}
        hasVotes={hasVotes}
        allVoted={allVoted}
        isLoading={isLoading}
        players={players}
        currentPlayerId={currentPlayer?.id ?? null}
        myVote={myVote}
        votes={votes}
        confidenceVotes={confidenceVotes}
        isConfidenceRevealed={isConfidenceRevealed}
        creatorId={game?.creator_id ?? null}
        isPlayerAdmin={isPlayerAdmin}
        showCountdown={game?.show_countdown ?? false}
        onReveal={handleReveal}
        onNewRound={handleNewRound}
        onStartCountdown={() => setCountdown(3)}
        onPlayerContextMenu={handlePlayerContextMenu}
      />

      {/* Card selector */}
      <CardSelector
        selectedValue={myVote}
        onSelect={handleCardSelect}
        disabled={isRevealed}
        isSubmitting={isVoting}
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

        {/* Profile Modals */}
        <ProfileModals
          currentPlayer={currentPlayer}
          takenAvatars={takenAvatars}
          showNameModal={showNameModal}
          newName={newName}
          onNameChange={setNewName}
          onSaveName={handleUpdateName}
          onCloseNameModal={() => {
            setShowNameModal(false);
            setNewName("");
          }}
          showAvatarModal={showAvatarModal}
          onSelectAvatar={handleUpdateAvatar}
          onCloseAvatarModal={() => setShowAvatarModal(false)}
          isUpdating={isUpdatingProfile}
        />

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
        <KickedModal
          isOpen={wasKicked}
          onRejoin={() => {
            clearSession(gameId);
            router.push(`/game/${gameId}/join`);
          }}
        />

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

export default function GameRoomPage() {
  return (
    <ToastProvider>
      <GameRoomContent />
    </ToastProvider>
  );
}
