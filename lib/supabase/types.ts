// Database types - will be generated from Supabase schema
// For now, define manually based on PLANNING.md

export type GameStatus = "voting" | "revealed";
export type IssueStatus = "pending" | "voting" | "voted";
export type Permission = "all" | "moderator";

export interface Game {
  id: string;
  name: string;
  voting_system: string;
  who_can_reveal: Permission;
  who_can_manage: Permission;
  auto_reveal: boolean;
  fun_features: boolean;
  show_average: boolean;
  show_countdown: boolean;
  host_player_id: string | null;
  current_issue_id: string | null;
  status: GameStatus;
  created_at: string;
}

export interface Player {
  id: string;
  game_id: string;
  name: string;
  avatar: string | null;
  is_spectator: boolean;
  is_online: boolean;
  last_seen: string;
  created_at: string;
}

export interface Issue {
  id: string;
  game_id: string;
  title: string;
  description: string | null;
  status: IssueStatus;
  final_score: number | null;
  sort_order: number;
  created_at: string;
}

export interface Vote {
  id: string;
  issue_id: string;
  player_id: string;
  value: string;
  created_at: string;
}

export interface ConfidenceVote {
  id: string;
  game_id: string;
  player_id: string;
  value: number;
  session_name: string | null;
  created_at: string;
}

// Supabase Database type
export interface Database {
  public: {
    Tables: {
      games: {
        Row: Game;
        Insert: Omit<Game, "created_at">;
        Update: Partial<Omit<Game, "id" | "created_at">>;
      };
      players: {
        Row: Player;
        Insert: Omit<Player, "created_at" | "last_seen" | "is_online">;
        Update: Partial<Omit<Player, "id" | "created_at">>;
      };
      issues: {
        Row: Issue;
        Insert: Omit<Issue, "created_at">;
        Update: Partial<Omit<Issue, "id" | "created_at">>;
      };
      votes: {
        Row: Vote;
        Insert: Omit<Vote, "created_at">;
        Update: Partial<Omit<Vote, "id" | "created_at">>;
      };
      confidence_votes: {
        Row: ConfidenceVote;
        Insert: Omit<ConfidenceVote, "created_at">;
        Update: Partial<Omit<ConfidenceVote, "id" | "created_at">>;
      };
    };
  };
}
