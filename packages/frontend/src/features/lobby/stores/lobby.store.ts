import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLobbyStore = defineStore('lobby', () => {
  const playerName = ref<string>('');
  const gameCode = ref<string>('');
  const isCreatingGame = ref<boolean>(false);
  const isJoiningGame = ref<boolean>(false);
  const error = ref<string | null>(null);

  const setPlayerName = (name: string) => {
    playerName.value = name;
  };

  const setGameCode = (code: string) => {
    gameCode.value = code;
  };

  const setIsCreatingGame = (isCreating: boolean) => {
    isCreatingGame.value = isCreating;
  };

  const setIsJoiningGame = (isJoining: boolean) => {
    isJoiningGame.value = isJoining;
  };

  const setError = (err: string | null) => {
    error.value = err;
  };

  const reset = () => {
    playerName.value = '';
    gameCode.value = '';
    isCreatingGame.value = false;
    isJoiningGame.value = false;
    error.value = null;
  };

  return {
    playerName,
    gameCode,
    isCreatingGame,
    isJoiningGame,
    error,
    setPlayerName,
    setGameCode,
    setIsCreatingGame,
    setIsJoiningGame,
    setError,
    reset,
  };
});
