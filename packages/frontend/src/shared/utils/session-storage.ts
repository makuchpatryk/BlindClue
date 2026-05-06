import { getStorageAdapter } from "../../core/storage/storage.adapter";

const SESSION_KEY = "game_session";
const ROUND_NUMBER_KEY = "game_round_number";

interface GameSession {
  gameId: string;
  playerId: string;
}

export function saveGameSession(gameId: string, playerId: string): void {
  const storage = getStorageAdapter();
  storage.setItem(SESSION_KEY, JSON.stringify({ gameId, playerId }));
}

export function getGameSession(): GameSession | null {
  const storage = getStorageAdapter();
  const str = storage.getItem(SESSION_KEY);
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

export function clearGameSession(): void {
  const storage = getStorageAdapter();
  storage.removeItem(SESSION_KEY);
}

export function saveRoundNumber(roundNumber: number): void {
  const storage = getStorageAdapter();
  storage.setItem(ROUND_NUMBER_KEY, roundNumber.toString());
}

export function getRoundNumber(): number {
  const storage = getStorageAdapter();
  const value = storage.getItem(ROUND_NUMBER_KEY);
  return value ? parseInt(value, 10) : 1;
}

export function clearRoundNumber(): void {
  const storage = getStorageAdapter();
  storage.removeItem(ROUND_NUMBER_KEY);
}
