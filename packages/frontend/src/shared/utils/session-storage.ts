import { getStorageAdapter } from "../../core/storage/storage.adapter";

const SESSION_KEY = "game_session";

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
