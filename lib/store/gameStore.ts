import { create } from "zustand";
import type { Game, Player, Issue, Vote } from "@/lib/supabase/types";

interface GameState {
  // Data
  game: Game | null;
  players: Player[];
  issues: Issue[];
  votes: Vote[];

  // Computed
  currentIssue: Issue | null;
  isRevealed: boolean;

  // Actions
  setGame: (game: Game | null) => void;
  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  setIssues: (issues: Issue[]) => void;
  addIssue: (issue: Issue) => void;
  updateIssue: (issueId: string, updates: Partial<Issue>) => void;
  removeIssue: (issueId: string) => void;
  setVotes: (votes: Vote[]) => void;
  addVote: (vote: Vote) => void;
  clearVotes: () => void;
  setRevealed: (revealed: boolean) => void;
  reset: () => void;
}

const initialState = {
  game: null,
  players: [],
  issues: [],
  votes: [],
  currentIssue: null,
  isRevealed: false,
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  setGame: (game) =>
    set({
      game,
      isRevealed: game?.status === "revealed",
      currentIssue: game?.current_issue_id
        ? get().issues.find((i) => i.id === game.current_issue_id) || null
        : null,
    }),

  setPlayers: (players) => set({ players }),

  addPlayer: (player) =>
    set((state) => ({
      players: [...state.players.filter((p) => p.id !== player.id), player],
    })),

  removePlayer: (playerId) =>
    set((state) => ({
      players: state.players.filter((p) => p.id !== playerId),
    })),

  setIssues: (issues) =>
    set((state) => ({
      issues,
      currentIssue: state.game?.current_issue_id
        ? issues.find((i) => i.id === state.game?.current_issue_id) || null
        : null,
    })),

  addIssue: (issue) =>
    set((state) => ({
      issues: [...state.issues.filter((i) => i.id !== issue.id), issue],
    })),

  updateIssue: (issueId, updates) =>
    set((state) => ({
      issues: state.issues.map((i) =>
        i.id === issueId ? { ...i, ...updates } : i
      ),
    })),

  removeIssue: (issueId) =>
    set((state) => ({
      issues: state.issues.filter((i) => i.id !== issueId),
    })),

  setVotes: (votes) => set({ votes }),

  addVote: (vote) =>
    set((state) => ({
      votes: [
        ...state.votes.filter(
          (v) => !(v.player_id === vote.player_id && v.issue_id === vote.issue_id)
        ),
        vote,
      ],
    })),

  clearVotes: () => set({ votes: [] }),

  setRevealed: (revealed) => set({ isRevealed: revealed }),

  reset: () => set(initialState),
}));
