/* ── Scoring logic & localStorage for personal best ── */

const STORAGE_KEY = "freeipa-policy-panic";

export interface RoundResult {
  questionId: number;
  correct: boolean;
  /** Seconds remaining when the player answered */
  timeLeft: number;
}

export interface GameScore {
  total: number;
  correct: number;
  streak: number;
  maxStreak: number;
}

/* ── Point calculation ── */

const BASE_POINTS = 100;
const TIME_BONUS_MULTIPLIER = 15; // per second remaining
const STREAK_BONUS = 25; // extra per consecutive correct answer

export function calculatePoints(
  timeLeft: number,
  currentStreak: number
): number {
  return BASE_POINTS + Math.round(timeLeft * TIME_BONUS_MULTIPLIER) + currentStreak * STREAK_BONUS;
}

/**
 * Reduce a list of round results into a final GameScore.
 */
export function tallyScore(results: RoundResult[]): GameScore {
  let total = 0;
  let correct = 0;
  let streak = 0;
  let maxStreak = 0;

  for (const r of results) {
    if (r.correct) {
      correct++;
      streak++;
      if (streak > maxStreak) maxStreak = streak;
      total += calculatePoints(r.timeLeft, streak);
    } else {
      streak = 0;
    }
  }

  return { total, correct, streak, maxStreak };
}

/* ── localStorage helpers (personal best only) ── */

interface StoredData {
  bestScore: number;
  gamesPlayed: number;
}

function load(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StoredData;
  } catch {
    /* corrupt data — ignore */
  }
  return { bestScore: 0, gamesPlayed: 0 };
}

function save(data: StoredData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getBestScore(): number {
  return load().bestScore;
}

export function getGamesPlayed(): number {
  return load().gamesPlayed;
}

/** Record a game locally. Returns true if it's a new personal best. */
export function recordGameLocal(score: number): boolean {
  const data = load();
  data.gamesPlayed++;
  const isNewBest = score > data.bestScore;
  if (isNewBest) data.bestScore = score;
  save(data);
  return isNewBest;
}

/* ── Shared leaderboard API helpers ── */

export interface LeaderboardEntry {
  name: string;
  score: number;
  created_at: string;
}

export interface AdminEntry {
  name: string;
  email: string;
  score: number;
  created_at: string;
}

/** Fetch the public leaderboard (name + score, no emails). */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch("/api/leaderboard");
    if (!res.ok) return [];
    const data = await res.json();
    return data.leaderboard ?? [];
  } catch {
    return [];
  }
}

/** Submit a score to the shared leaderboard. */
export async function submitScore(
  name: string,
  email: string,
  score: number
): Promise<boolean> {
  try {
    const res = await fetch("/api/submit-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, score }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Fetch the admin leaderboard (with emails). Requires PIN. */
export async function fetchAdminList(pin: string): Promise<AdminEntry[]> {
  try {
    const res = await fetch("/api/admin/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (!res.ok) throw new Error("Unauthorized");
    const data = await res.json();
    return data.entries ?? [];
  } catch {
    throw new Error("Unauthorized or server error");
  }
}
