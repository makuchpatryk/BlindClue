const SESSION_KEY = "game_session";

interface GameSession {
  gameId: string;
  playerId: string;
}

export function saveGameSession(gameId: string, playerId: string): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ gameId, playerId }));
}

export function getGameSession(): GameSession | null {
  const str = localStorage.getItem(SESSION_KEY);
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

export function clearGameSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
