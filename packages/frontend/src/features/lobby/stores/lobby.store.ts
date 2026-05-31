import { defineStore } from "pinia";
import { ref } from "vue";
import { getStorageAdapter } from "../../../core/storage/storage.adapter";

const PLAYER_NAME_KEY = "impostor_playerName";
const PLAYER_AVATAR_KEY = "impostor_playerAvatar";

export const useLobbyStore = defineStore("lobby", () => {
  const storage = getStorageAdapter();
  const playerName = ref<string>(storage.getItem(PLAYER_NAME_KEY) || "");
  const playerAvatar = ref<string>(
    storage.getItem(PLAYER_AVATAR_KEY) || "avatar-001",
  );
  const gameCode = ref<string>("");
  const numberOfRounds = ref<number>(3);
  const isCreatingGame = ref<boolean>(false);
  const isJoiningGame = ref<boolean>(false);
  const error = ref<string | null>(null);

  const setPlayerName = (name: string) => {
    playerName.value = name;
    storage.setItem(PLAYER_NAME_KEY, name);
  };

  const setPlayerAvatar = (avatar: string) => {
    playerAvatar.value = avatar;
    storage.setItem(PLAYER_AVATAR_KEY, avatar);
  };

  const setGameCode = (code: string) => {
    gameCode.value = code;
  };

  const setNumberOfRounds = (rounds: number) => {
    numberOfRounds.value = rounds;
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
    playerName.value = "";
    playerAvatar.value = "avatar-001";
    gameCode.value = "";
    numberOfRounds.value = 3;
    isCreatingGame.value = false;
    isJoiningGame.value = false;
    error.value = null;
    storage.removeItem(PLAYER_NAME_KEY);
    storage.removeItem(PLAYER_AVATAR_KEY);
  };

  return {
    playerName,
    playerAvatar,
    gameCode,
    numberOfRounds,
    isCreatingGame,
    isJoiningGame,
    error,
    setPlayerName,
    setPlayerAvatar,
    setGameCode,
    setNumberOfRounds,
    setIsCreatingGame,
    setIsJoiningGame,
    setError,
    reset,
  };
});
