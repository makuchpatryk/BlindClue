import { defineStore } from "pinia";
import { ref, computed, reactive } from "vue";
import { PlayerDTO, ScoreDTO } from "@/shared/types/game.js";
import { GameStatus } from "@/shared/utils/game-status.js";
import { MAX_ROUNDS } from "@/shared/utils/constants.js";
import { clearGameSession } from "@/shared/utils/session-storage.js";

export const useGameStore = defineStore("game", () => {
  const gameId = ref<string>("");
  const status = ref<GameStatus>(GameStatus.LOBBY);
  const currentRound = ref<number>(1);
  const numberOfRounds = ref<number>(MAX_ROUNDS);
  const category = ref<string>("");
  const word = ref<string>("");
  const isImpostor = ref<boolean>(false);
  const impostorId = ref<string | null>(null);
  const players = ref<PlayerDTO[]>([]);
  const descriptions = reactive<Map<number, any[]>>(new Map());
  const votes = ref<Map<string, number> | null>(null);
  const mostVoted = ref<string | null>(null);
  const finalScores = ref<ScoreDTO[]>([]);
  const myPlayerId = ref<string>("");
  const myPlayerName = ref<string>("");
  const pendingJoinRequests = ref<
    Array<{ requestId: string; playerName: string }>
  >([]);
  const joinStatus = ref<"idle" | "pending" | "approved" | "rejected">("idle");
  const currentPlayerIndex = ref<number>(0);
  const playersClickedThisRound = ref<Set<string>>(new Set());
  const selectedImpostorGuess = ref<string | null>(null);
  const isNextButtonBlocked = ref<boolean>(false);
  const votedPlayersThisRound = ref<Set<string>>(new Set());
  const impostorDoneGuessing = ref<boolean>(false);
  const playerWords = reactive<Map<string, string[]>>(new Map());
  const currentPlayerWord = ref<string>("");

  const currentPlayer = computed(
    () => players.value[currentPlayerIndex.value] || null,
  );

  const canShowShowImpostorButton = computed(() => {
    return (
      currentRound.value === numberOfRounds.value &&
      playersClickedThisRound.value.size === players.value.length
    );
  });

  const setGameStarted = (data: {
    gameId: string;
    category: string;
    impostorId: string;
    players: PlayerDTO[];
    numberOfRounds?: number;
  }) => {
    gameId.value = data.gameId;
    status.value = GameStatus.RUNNING;
    category.value = data.category;
    impostorId.value = data.impostorId;
    players.value = data.players;
    if (data.numberOfRounds) {
      numberOfRounds.value = data.numberOfRounds;
    }
    isImpostor.value = data.impostorId === myPlayerId.value;
  };

  const setStatus = (newStatus: GameStatus) => {
    status.value = newStatus;
  };

  const setRoundSubmitted = (round: number, descs?: any[]) => {
    currentRound.value = round;
    if (descs) {
      descriptions.set(round, descs);
    }
  };

  const addPlayer = (player: PlayerDTO) => {
    const exists = players.value.find((p) => p.id === player.id);
    if (!exists) {
      players.value.push(player);
    }
  };

  const setVotes = (voteMap: Record<string, number>, mostVotedId: string) => {
    votes.value = new Map(Object.entries(voteMap));
    mostVoted.value = mostVotedId;
  };

  const setFinalScores = (scores: ScoreDTO[]) => {
    finalScores.value = scores;
  };

  const setMyPlayer = (id: string, name: string) => {
    myPlayerId.value = id;
    myPlayerName.value = name;
  };

  const setPlayers = (list: PlayerDTO[]) => {
    players.value = list;
  };

  const addJoinRequest = (request: {
    requestId: string;
    playerName: string;
  }) => {
    pendingJoinRequests.value.push(request);
  };

  const removeJoinRequest = (requestId: string) => {
    pendingJoinRequests.value = pendingJoinRequests.value.filter(
      (r) => r.requestId !== requestId,
    );
  };

  const setJoinStatus = (
    status: "idle" | "pending" | "approved" | "rejected",
  ) => {
    joinStatus.value = status;
  };

  const setWord = (wordText: string) => {
    word.value = wordText;
  };

  const setCurrentPlayerIndex = (index: number) => {
    currentPlayerIndex.value = index;
  };

  const setPlayersClicked = (players: string[]) => {
    playersClickedThisRound.value = new Set(players);
  };

  const setNextButtonBlocked = (blocked: boolean) => {
    isNextButtonBlocked.value = blocked;
  };

  const addVotedPlayer = (playerId: string) => {
    votedPlayersThisRound.value.add(playerId);
  };

  const hasPlayerVoted = (playerId: string) => {
    return votedPlayersThisRound.value.has(playerId);
  };

  const resetVotedPlayers = () => {
    votedPlayersThisRound.value = new Set();
  };

  const setImpostorDoneGuessing = (done: boolean) => {
    impostorDoneGuessing.value = done;
  };

  const advancePlayerTurn = (currentPlayerId: string) => {
    if (!playersClickedThisRound.value.has(currentPlayerId)) {
      playersClickedThisRound.value.add(currentPlayerId);
    }

    if (playersClickedThisRound.value.size === players.value.length) {
      if (currentRound.value < MAX_ROUNDS) {
        currentRound.value++;
        playersClickedThisRound.value = new Set();
        currentPlayerIndex.value = 0;
        isNextButtonBlocked.value = false;
      }
    } else {
      currentPlayerIndex.value =
        (currentPlayerIndex.value + 1) % players.value.length;
      isNextButtonBlocked.value = true;
    }
  };

  const hasPlayerClickedThisRound = (playerId: string) => {
    return playersClickedThisRound.value.has(playerId);
  };

  const unblockNextButton = () => {
    isNextButtonBlocked.value = false;
  };

  const resetRoundClicks = () => {
    playersClickedThisRound.value = new Set();
  };

  const selectImpostorGuess = (playerId: string) => {
    selectedImpostorGuess.value = playerId;
  };

  const clearImpostorGuess = () => {
    selectedImpostorGuess.value = null;
  };

  const submitPlayerWord = (playerId: string, word: string) => {
    if (!playerWords.has(playerId)) {
      playerWords.set(playerId, []);
    }
    playerWords.get(playerId)!.push(word);
    currentPlayerWord.value = "";
  };

  const updatePlayerWords = (words: Record<string, string[]>) => {
    playerWords.clear();
    Object.entries(words).forEach(([playerId, wordList]) => {
      playerWords.set(playerId, wordList);
    });
  };

  const getCurrentPlayerWord = (): string => {
    return currentPlayerWord.value;
  };

  const setCurrentPlayerWord = (word: string) => {
    currentPlayerWord.value = word;
  };

  const reset = () => {
    gameId.value = "";
    status.value = GameStatus.LOBBY;
    currentRound.value = 1;
    numberOfRounds.value = MAX_ROUNDS;
    category.value = "";
    word.value = "";
    isImpostor.value = false;
    impostorId.value = null;
    players.value = [];
    descriptions.clear();
    votes.value = null;
    mostVoted.value = null;
    finalScores.value = [];
    myPlayerId.value = "";
    myPlayerName.value = "";
    pendingJoinRequests.value = [];
    joinStatus.value = "idle";
    currentPlayerIndex.value = 0;
    playersClickedThisRound.value = new Set();
    selectedImpostorGuess.value = null;
    isNextButtonBlocked.value = false;
    votedPlayersThisRound.value = new Set();
    impostorDoneGuessing.value = false;
    playerWords.clear();
    currentPlayerWord.value = "";
  };

  const resetForNewGame = () => {
    reset();
    clearGameSession();
  };

  return {
    gameId,
    status,
    currentRound,
    numberOfRounds,
    category,
    word,
    isImpostor,
    impostorId,
    players,
    descriptions,
    votes,
    mostVoted,
    finalScores,
    myPlayerId,
    myPlayerName,
    pendingJoinRequests,
    joinStatus,
    currentPlayer,
    currentPlayerIndex,
    playersClickedThisRound,
    selectedImpostorGuess,
    isNextButtonBlocked,
    votedPlayersThisRound,
    impostorDoneGuessing,
    playerWords,
    currentPlayerWord,
    canShowShowImpostorButton,
    setGameStarted,
    setStatus,
    setRoundSubmitted,
    addPlayer,
    setVotes,
    setFinalScores,
    setMyPlayer,
    setPlayers,
    addJoinRequest,
    removeJoinRequest,
    setJoinStatus,
    setWord,
    setCurrentPlayerIndex,
    setPlayersClicked,
    setNextButtonBlocked,
    addVotedPlayer,
    hasPlayerVoted,
    resetVotedPlayers,
    setImpostorDoneGuessing,
    advancePlayerTurn,
    resetRoundClicks,
    hasPlayerClickedThisRound,
    unblockNextButton,
    selectImpostorGuess,
    clearImpostorGuess,
    submitPlayerWord,
    updatePlayerWords,
    getCurrentPlayerWord,
    setCurrentPlayerWord,
    reset,
    resetForNewGame,
  };
});
