// Fibonacci voting cards
export const VOTING_CARDS = [
  { value: "0", label: "0" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "5", label: "5" },
  { value: "8", label: "8" },
  { value: "13", label: "13" },
  { value: "21", label: "21" },
  { value: "34", label: "34" },
  { value: "55", label: "55" },
  { value: "89", label: "89" },
  { value: "?", label: "?" },
  { value: "coffee", label: "☕" },
] as const;

export type VoteValue = (typeof VOTING_CARDS)[number]["value"];

// Confidence vote scale (Fist of Five)
export const CONFIDENCE_SCALE = [
  { value: 1, label: "1", emoji: "✊" },
  { value: 2, label: "2", emoji: "✌️" },
  { value: 3, label: "3", emoji: "🤟" },
  { value: 4, label: "4", emoji: "🖖" },
  { value: 5, label: "5", emoji: "🖐️" },
] as const;

// Game settings types
export type VotingSystem = "fibonacci";
export type Permission = "all" | "moderator";

export interface GameSettings {
  votingSystem: VotingSystem;
  whoCanReveal: Permission;
  whoCanManage: Permission;
  autoReveal: boolean;
  funFeatures: boolean;
  showAverage: boolean;
  showCountdown: boolean;
}

// Game settings defaults
export const DEFAULT_GAME_SETTINGS: GameSettings = {
  votingSystem: "fibonacci",
  whoCanReveal: "all",
  whoCanManage: "all",
  autoReveal: false,
  funFeatures: true,
  showAverage: true,
  showCountdown: true,
};

// Avatar options (placeholder URLs)
export const AVATAR_OPTIONS = [
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/men/22.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
  "https://randomuser.me/api/portraits/men/75.jpg",
  "https://randomuser.me/api/portraits/women/90.jpg",
  "https://randomuser.me/api/portraits/men/36.jpg",
  "https://randomuser.me/api/portraits/women/26.jpg",
] as const;

// ID length for nanoid
export const GAME_ID_LENGTH = 8;
export const PLAYER_ID_LENGTH = 12;
