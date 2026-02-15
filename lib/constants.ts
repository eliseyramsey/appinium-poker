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

// Team avatars with face-centered positions and zoom
export const TEAM_AVATARS = [
  { src: "/avatars/IMG_2292.PNG", zoom: 180, x: 45, y: 37 },
  { src: "/avatars/IMG_2816.jpg", zoom: 180, x: 63, y: 33 },
  { src: "/avatars/IMG_2872.jpg", zoom: 250, x: 60, y: 46 },
  { src: "/avatars/IMG_5777.JPG", zoom: 120, x: 54, y: 20 },
  { src: "/avatars/IMG_5982.jpg", zoom: 320, x: 30, y: 51 },
  { src: "/avatars/IMG_6838.jpg", zoom: 220, x: 59, y: 17 },
  { src: "/avatars/IMG_6846.jpg", zoom: 140, x: 50, y: 50 },
  { src: "/avatars/IMG_8637.jpg", zoom: 400, x: 48, y: 21 },
  { src: "/avatars/IMG_8952.jpg", zoom: 240, x: 67, y: 61 },
  { src: "/avatars/IMG_9369.jpg", zoom: 280, x: 33, y: 27 },
  { src: "/avatars/IMG_9372.jpg", zoom: 220, x: 98, y: 69 },
  { src: "/avatars/IMG_9443.jpg", zoom: 210, x: 59, y: 40 },
  { src: "/avatars/IMG_9444.jpg", zoom: 230, x: 58, y: 50 },
  { src: "/avatars/IMG_9445.JPG", zoom: 190, x: 61, y: 50 },
  { src: "/avatars/IMG_9503.jpg", zoom: 150, x: 73, y: 29 },
  { src: "/avatars/IMG_9524.jpg", zoom: 100, x: 50, y: 50 },
  { src: "/avatars/IMG_9661.JPG", zoom: 100, x: 50, y: 50 },
  { src: "/avatars/IMG_9690.jpg", zoom: 100, x: 50, y: 50 },
  { src: "/avatars/IMG_9737.JPG", zoom: 100, x: 50, y: 50 },
  { src: "/avatars/IMG_9738.JPG", zoom: 100, x: 50, y: 50 },
  { src: "/avatars/elisey_old.jpg", zoom: 150, x: 43, y: 32 },
  { src: "/avatars/R0000830.jpeg", zoom: 100, x: 0, y: 50 },
  { src: "/avatars/olya.png", zoom: 320, x: 29, y: 24 },
  { src: "/avatars/Subject.png", zoom: 220, x: 62, y: 49 },
  { src: "/avatars/meet1.png", zoom: 190, x: 43, y: 100 },
  { src: "/avatars/meet2.png", zoom: 220, x: 43, y: 58 },
] as const;

export type TeamAvatar = (typeof TEAM_AVATARS)[number];

// Helper to get avatar style by src (for background-image approach)
export function getAvatarStyle(src: string | null): { backgroundSize: string; backgroundPosition: string } {
  if (!src) return { backgroundSize: "100%", backgroundPosition: "50% 50%" };
  const avatar = TEAM_AVATARS.find((a) => a.src === src);
  if (!avatar) return { backgroundSize: "100%", backgroundPosition: "50% 50%" };
  return {
    backgroundSize: `${avatar.zoom}%`,
    backgroundPosition: `${avatar.x}% ${avatar.y}%`,
  };
}

// ID length for nanoid
export const GAME_ID_LENGTH = 8;
export const PLAYER_ID_LENGTH = 12;
