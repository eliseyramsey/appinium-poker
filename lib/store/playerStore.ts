import { create } from "zustand";
import type { Player } from "@/lib/supabase/types";

const SESSIONS_KEY = "appinium-poker-sessions";

// Helper functions for direct localStorage access
function getSessions(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(SESSIONS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function setSessions(sessions: Record<string, string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {
    // Ignore
  }
}

interface PlayerState {
  // Current player in this session
  currentPlayer: Player | null;
  myVote: string | null;

  // Actions
  setCurrentPlayer: (player: Player | null) => void;
  setMyVote: (value: string | null) => void;

  // Session management (uses localStorage directly)
  saveSession: (gameId: string, playerId: string) => void;
  getSession: (gameId: string) => string | null;
  clearSession: (gameId?: string) => void;
}

export const usePlayerStore = create<PlayerState>()((set) => ({
  currentPlayer: null,
  myVote: null,

  setCurrentPlayer: (player) => set({ currentPlayer: player }),

  setMyVote: (value) => set({ myVote: value }),

  saveSession: (gameId, playerId) => {
    const sessions = getSessions();
    sessions[gameId] = playerId;
    setSessions(sessions);
  },

  getSession: (gameId) => {
    const sessions = getSessions();
    return sessions[gameId] || null;
  },

  clearSession: (gameId) => {
    if (gameId) {
      const sessions = getSessions();
      delete sessions[gameId];
      setSessions(sessions);
    } else {
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(SESSIONS_KEY);
        } catch {
          // Ignore
        }
      }
    }
    set({ currentPlayer: null, myVote: null });
  },
}));
