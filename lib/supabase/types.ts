// Database types - manually defined to match Supabase schema
// These types enable proper TypeScript inference with Supabase client operations
// NOTE: For full type inference, use `npx supabase gen types` to generate from DB schema

export type GameStatus = "voting" | "revealed";
export type IssueStatus = "pending" | "voting" | "voted";
export type Permission = "all" | "moderator";
export type ConfidenceStatus = "idle" | "voting" | "revealed";

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
  creator_id: string | null;
  confidence_status: ConfidenceStatus;
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

// Insert types with optional fields that have DB defaults
export type GameInsert = {
  id: string;
  name: string;
  voting_system?: string;
  who_can_reveal?: Permission;
  who_can_manage?: Permission;
  auto_reveal?: boolean;
  fun_features?: boolean;
  show_average?: boolean;
  show_countdown?: boolean;
  host_player_id?: string | null;
  current_issue_id?: string | null;
  status?: GameStatus;
  creator_id?: string | null;
  confidence_status?: ConfidenceStatus;
};

export type PlayerInsert = {
  id: string;
  game_id: string;
  name: string;
  avatar?: string | null;
  is_spectator?: boolean;
};

export type IssueInsert = {
  id: string;
  game_id: string;
  title: string;
  description?: string | null;
  status?: IssueStatus;
  final_score?: number | null;
  sort_order?: number;
};

export type VoteInsert = {
  id: string;
  issue_id: string;
  player_id: string;
  value: string;
};

export type ConfidenceVoteInsert = {
  id: string;
  game_id: string;
  player_id: string;
  value: number;
  session_name?: string | null;
};

// Update types - explicitly define to ensure type compatibility with Supabase operations
export interface GameUpdate {
  name?: string;
  voting_system?: string;
  who_can_reveal?: Permission;
  who_can_manage?: Permission;
  auto_reveal?: boolean;
  fun_features?: boolean;
  show_average?: boolean;
  show_countdown?: boolean;
  host_player_id?: string | null;
  current_issue_id?: string | null;
  status?: GameStatus;
  creator_id?: string | null;
  confidence_status?: ConfidenceStatus;
}

export interface PlayerUpdate {
  name?: string;
  avatar?: string | null;
  is_spectator?: boolean;
  is_online?: boolean;
  last_seen?: string;
}

export interface IssueUpdate {
  title?: string;
  description?: string | null;
  status?: IssueStatus;
  final_score?: number | null;
  sort_order?: number;
}

export interface VoteUpdate {
  value?: string;
}

export interface ConfidenceVoteUpdate {
  value?: number;
  session_name?: string | null;
}

// Supabase Database type - matches the generated schema format
export interface Database {
  public: {
    Tables: {
      games: {
        Row: Game;
        Insert: GameInsert;
        Update: GameUpdate;
      };
      players: {
        Row: Player;
        Insert: PlayerInsert;
        Update: PlayerUpdate;
      };
      issues: {
        Row: Issue;
        Insert: IssueInsert;
        Update: IssueUpdate;
      };
      votes: {
        Row: Vote;
        Insert: VoteInsert;
        Update: VoteUpdate;
      };
      confidence_votes: {
        Row: ConfidenceVote;
        Insert: ConfidenceVoteInsert;
        Update: ConfidenceVoteUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
