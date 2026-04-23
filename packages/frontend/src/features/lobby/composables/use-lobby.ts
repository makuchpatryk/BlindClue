import { useLobbyStore } from '../stores/lobby.store.js';
import { useRouter } from 'vue-router';
import { getSocket } from '../../shared/utils/socket.js';

export function useLobby() {
  const lobbyStore = useLobbyStore();
  const router = useRouter();

  async function createGame(playerName: string): Promise<string> {
    try {
      const response = await fetch('http://localhost:3000/games', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to create game');

      const data = await response.json();
      const gameId = data.gameId;

      lobbyStore.setPlayerName(playerName);
      lobbyStore.setGameCode(gameId);

      return gameId;
    } catch (error) {
      lobbyStore.setError((error as Error).message);
      throw error;
    }
  }

  function joinGame(gameId: string, playerName: string): void {
    const socket = getSocket();
    socket.emit('joinGame', { gameId, playerName });
    lobbyStore.setPlayerName(playerName);
    lobbyStore.setGameCode(gameId);
  }

  function reset(): void {
    lobbyStore.reset();
  }

  return {
    createGame,
    joinGame,
    reset,
  };
}
