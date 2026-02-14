import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Player } from "@/lib/supabase/types";

interface PlayerState {
  // Current player in this session
  currentPlayer: Player | null;
  myVote: string | null;

  // Actions
  setCurrentPlayer: (player: Player | null) => void;
  setMyVote: (value: string | null) => void;
  clearSession: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      currentPlayer: null,
      myVote: null,

      setCurrentPlayer: (player) => set({ currentPlayer: player }),

      setMyVote: (value) => set({ myVote: value }),

      clearSession: () => set({ currentPlayer: null, myVote: null }),
    }),
    {
      name: "appinium-poker-player",
      partialize: (state) => ({ currentPlayer: state.currentPlayer }),
    }
  )
);
