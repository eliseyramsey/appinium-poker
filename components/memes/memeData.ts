// Meme categories and selection logic for Planning Poker
export type MemeCategory = "consensus" | "chaos" | "confused" | "break" | "random";

export interface Meme {
  src: string;
  alt: string;
  caption?: string; // Fallback caption if image fails to load
}

/**
 * HOW TO ADD MEMES:
 *
 * 1. Add your meme images to public/memes/[category]/
 *    Categories: consensus, chaos, confused, break, random
 *
 * 2. Name files sequentially: 01.jpg, 02.png, 03.jpg, etc.
 *
 * 3. Add entries to the MEMES object below
 *
 * Recommended Russian memes 2005-2020:
 * - consensus: Ждун улыбается, "Всё по плану", Success Kid
 * - chaos: Disaster Girl, "Это фиаско братан", Гарольд в панике
 * - confused: Philosoraptor, "Не понимаю", confused math lady
 * - break: Kermit sipping tea, "Мне пофиг", coffee memes
 * - random: Дратути, Толик, classic memes
 *
 * Find memes: Google Images, imgflip.com, or save from social media
 */

// All memes from public/memes/ folder (21 images, skipping 13.mp4)
const ALL_MEMES: Meme[] = [
  { src: "/memes/01.jpg", alt: "Meme 1" },
  { src: "/memes/02.jpg", alt: "Meme 2" },
  { src: "/memes/03.png", alt: "Meme 3" },
  { src: "/memes/04.jpg", alt: "Meme 4" },
  { src: "/memes/05.jpg", alt: "Meme 5" },
  { src: "/memes/06.jpg", alt: "Meme 6" },
  { src: "/memes/07.jpg", alt: "Meme 7" },
  { src: "/memes/08.jpg", alt: "Meme 8" },
  { src: "/memes/09.jpg", alt: "Meme 9" },
  { src: "/memes/10.jpg", alt: "Meme 10" },
  { src: "/memes/11.jpg", alt: "Meme 11" },
  { src: "/memes/12.jpg", alt: "Meme 12" },
  // 13.mp4 skipped (video not supported)
  { src: "/memes/14.jpg", alt: "Meme 14" },
  { src: "/memes/15.jpg", alt: "Meme 15" },
  { src: "/memes/16.jpg", alt: "Meme 16" },
  { src: "/memes/17.jpg", alt: "Meme 17" },
  { src: "/memes/18.jpg", alt: "Meme 18" },
  { src: "/memes/19.jpg", alt: "Meme 19" },
  { src: "/memes/20.jpg", alt: "Meme 20" },
  { src: "/memes/21.png", alt: "Meme 21" },
  { src: "/memes/22.jpg", alt: "Meme 22" },
];

// Memes organized by category
// All categories share the same meme pool — random selection from 21 images
export const MEMES: Record<MemeCategory, Meme[]> = {
  // All voted the same — consensus achieved!
  consensus: ALL_MEMES,

  // Vote spread > 5 points — total chaos!
  chaos: ALL_MEMES,

  // Someone voted "?" — need clarification
  confused: ALL_MEMES,

  // Someone voted "☕" — time for a break!
  break: ALL_MEMES,

  // Default fallback
  random: ALL_MEMES,
};

// Fibonacci values for spread calculation
const FIBONACCI_VALUES: Record<string, number> = {
  "0": 0,
  "1": 1,
  "2": 2,
  "3": 3,
  "5": 5,
  "8": 8,
  "13": 13,
  "21": 21,
  "34": 34,
  "55": 55,
  "89": 89,
};

/**
 * Determine meme category based on voting pattern
 */
export function getMemeCategory(votes: string[]): MemeCategory {
  if (votes.length === 0) return "random";

  // Check for special cards first
  if (votes.some((v) => v === "☕" || v === "coffee")) {
    return "break";
  }

  if (votes.some((v) => v === "?")) {
    return "confused";
  }

  // Filter to numeric votes only
  const numericVotes = votes
    .map((v) => FIBONACCI_VALUES[v])
    .filter((v) => v !== undefined);

  if (numericVotes.length === 0) return "random";

  // Check for consensus (all same)
  const uniqueVotes = new Set(numericVotes);
  if (uniqueVotes.size === 1) {
    return "consensus";
  }

  // Check for chaos (spread > 5)
  const min = Math.min(...numericVotes);
  const max = Math.max(...numericVotes);
  if (max - min > 5) {
    return "chaos";
  }

  return "random";
}

/**
 * Select a random meme from the appropriate category
 */
export function selectMeme(votes: string[]): Meme | null {
  const category = getMemeCategory(votes);
  const memes = MEMES[category];

  if (memes.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * memes.length);
  return memes[randomIndex];
}

/**
 * Get all memes for a category
 */
export function getMemesForCategory(category: MemeCategory): Meme[] {
  return MEMES[category];
}
