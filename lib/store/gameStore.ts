import { create } from "zustand";
import type { Game, Player, Issue, Vote, ConfidenceVote, ConfidenceStatus } from "@/lib/supabase/types";

interface GameState {
  // Data
  game: Game | null;
  players: Player[];
  issues: Issue[];
  votes: Vote[];
  confidenceVotes: ConfidenceVote[];

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
  setConfidenceVotes: (votes: ConfidenceVote[]) => void;
  addConfidenceVote: (vote: ConfidenceVote) => void;
  clearConfidenceVotes: () => void;
  setConfidenceStatus: (status: ConfidenceStatus) => void;
  reset: () => void;

  // Selectors
  isAdmin: (playerId: string | null) => boolean;
  allIssuesEstimated: () => boolean;
  averageConfidence: () => number | null;
}

const initialState = {
  game: null,
  players: [],
  issues: [],
  votes: [],
  confidenceVotes: [],
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

  setConfidenceVotes: (confidenceVotes) => set({ confidenceVotes }),

  addConfidenceVote: (vote) =>
    set((state) => ({
      confidenceVotes: [
        ...state.confidenceVotes.filter((v) => v.player_id !== vote.player_id),
        vote,
      ],
    })),

  clearConfidenceVotes: () => set({ confidenceVotes: [] }),

  setConfidenceStatus: (status) =>
    set((state) => ({
      game: state.game ? { ...state.game, confidence_status: status } : null,
    })),

  reset: () => set(initialState),

  // Selectors
  isAdmin: (playerId) => {
    const { game } = get();
    if (!game || !playerId) return false;
    return game.creator_id === playerId;
  },

  allIssuesEstimated: () => {
    const { issues } = get();
    if (issues.length === 0) return false;
    return issues.every((issue) => issue.status === "voted" && issue.final_score !== null);
  },

  averageConfidence: () => {
    const { confidenceVotes } = get();
    if (confidenceVotes.length === 0) return null;
    const sum = confidenceVotes.reduce((acc, v) => acc + v.value, 0);
    return Math.round((sum / confidenceVotes.length) * 10) / 10;
  },
}));
