import { defineStore } from "pinia";
import { ref, computed, reactive, Ref, ComputedRef } from "vue";
import { PlayerDTO, JoinStatus } from "@/shared/types/game.js";
import { GameStatus } from "@/shared/utils/game-status.js";
import { MAX_ROUNDS } from "@/shared/utils/constants.js";
import {
  clearGameSession,
  getRoundNumber,
  saveRoundNumber,
  clearRoundNumber,
} from "@/shared/utils/session-storage.js";

export interface GameStore {
  gameId: Ref<string>;
  status: Ref<GameStatus>;
  currentRound: Ref<number>;
  numberOfRounds: Ref<number>;
  category: Ref<string>;
  word: Ref<string>;
  isImpostor: Ref<boolean>;
  impostorId: Ref<string | null>;
  players: Ref<PlayerDTO[]>;
  descriptions: Map<number, any[]>;
  votes: Ref<Map<string, number> | null>;
  mostVoted: Ref<string | null>;
  myPlayerId: Ref<string>;
  myPlayerName: Ref<string>;
  roundNumber: Ref<number>;
  pendingJoinRequests: Ref<Array<{ requestId: string; playerName: string }>>;
  joinStatus: Ref<JoinStatus>;
  currentPlayer: ComputedRef<PlayerDTO | null>;
  currentPlayerIndex: Ref<number>;
  playersClickedThisRound: Ref<Set<string>>;
  selectedImpostorGuess: Ref<string | null>;
  isNextButtonBlocked: Ref<boolean>;
  votedPlayersThisRound: Ref<Set<string>>;
  impostorDoneGuessing: Ref<boolean>;
  impostorGuess: Ref<string | null>;
  guessResult: Ref<boolean | null>;
  guessPhaseActive: Ref<boolean>;
  playerWords: Map<string, string[]>;
  currentPlayerWord: Ref<string>;
  canShowShowImpostorButton: ComputedRef<boolean>;
  setGameStarted: (data: {
    gameId: string;
    category: string;
    impostorId: string;
    players: PlayerDTO[];
    numberOfRounds?: number;
  }) => void;
  setRoundSubmitted: (round: number, descs?: any[]) => void;
  addPlayer: (player: PlayerDTO) => void;
  setVotes: (voteMap: Record<string, number>, mostVotedId: string) => void;
  setMyPlayer: (id: string, name: string) => void;
  setPlayers: (list: PlayerDTO[]) => void;
  addJoinRequest: (request: { requestId: string; playerName: string }) => void;
  removeJoinRequest: (requestId: string) => void;
  setJoinStatus: (status: JoinStatus) => void;
  setWord: (wordText: string) => void;
  setCurrentPlayerIndex: (index: number) => void;
  setPlayersClicked: (players: string[]) => void;
  setNextButtonBlocked: (blocked: boolean) => void;
  addVotedPlayer: (playerId: string) => void;
  hasPlayerVoted: (playerId: string) => boolean;
  resetVotedPlayers: () => void;
  setImpostorDoneGuessing: (done: boolean) => void;
  setGuessPhaseActive: (active: boolean) => void;
  setImpostorGuess: (guess: string) => void;
  setGuessResult: (isCorrect: boolean) => void;
  advancePlayerTurn: (currentPlayerId: string) => void;
  resetRoundClicks: () => void;
  selectImpostorGuess: (playerId: string) => void;
  submitPlayerWord: (playerId: string, word: string) => void;
  updatePlayerWords: (words: Record<string, string[]>) => void;
  setStatus: (forceState?: GameStatus) => void;
  reset: () => void;
  resetGameProgress: () => void;
  resetForNewGame: () => void;
}

export const useGameStore = defineStore("game", (): GameStore => {
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
  const myPlayerId = ref<string>("");
  const myPlayerName = ref<string>("");
  const roundNumber = ref<number>(getRoundNumber());
  const pendingJoinRequests = ref<
    Array<{ requestId: string; playerName: string }>
  >([]);
  const joinStatus = ref<JoinStatus>(JoinStatus.IDLE);
  const currentPlayerIndex = ref<number>(0);
  const playersClickedThisRound = ref<Set<string>>(new Set());
  const selectedImpostorGuess = ref<string | null>(null);
  const isNextButtonBlocked = ref<boolean>(false);
  const votedPlayersThisRound = ref<Set<string>>(new Set());
  const impostorDoneGuessing = ref<boolean>(false);
  const impostorGuess = ref<string | null>(null);
  const guessResult = ref<boolean | null>(null);
  const guessPhaseActive = ref<boolean>(false);
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
    roundNumber.value++;
    saveRoundNumber(roundNumber.value);
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

  const setJoinStatus = (status: JoinStatus) => {
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

  const setGuessPhaseActive = (active: boolean) => {
    guessPhaseActive.value = active;
  };

  const setImpostorGuess = (guess: string) => {
    impostorGuess.value = guess;
  };

  const setGuessResult = (isCorrect: boolean) => {
    guessResult.value = isCorrect;
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

  const resetRoundClicks = () => {
    playersClickedThisRound.value = new Set();
  };

  const selectImpostorGuess = (playerId: string) => {
    selectedImpostorGuess.value = playerId;
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
    myPlayerId.value = "";
    myPlayerName.value = "";
    pendingJoinRequests.value = [];
    joinStatus.value = JoinStatus.IDLE;
    currentPlayerIndex.value = 0;
    playersClickedThisRound.value = new Set();
    selectedImpostorGuess.value = null;
    isNextButtonBlocked.value = false;
    votedPlayersThisRound.value = new Set();
    impostorDoneGuessing.value = false;
    impostorGuess.value = null;
    guessResult.value = null;
    guessPhaseActive.value = false;
    playerWords.clear();
    currentPlayerWord.value = "";
  };

  const resetGameProgress = () => {
    status.value = GameStatus.LOBBY;
    currentRound.value = 1;
    category.value = "";
    word.value = "";
    isImpostor.value = false;
    impostorId.value = null;
    descriptions.clear();
    votes.value = null;
    mostVoted.value = null;
    pendingJoinRequests.value = [];
    joinStatus.value = JoinStatus.IDLE;
    currentPlayerIndex.value = 0;
    playersClickedThisRound.value = new Set();
    selectedImpostorGuess.value = null;
    isNextButtonBlocked.value = false;
    votedPlayersThisRound.value = new Set();
    impostorDoneGuessing.value = false;
    impostorGuess.value = null;
    guessResult.value = null;
    guessPhaseActive.value = false;
    playerWords.clear();
    currentPlayerWord.value = "";
  };

  const resetForNewGame = () => {
    reset();
    clearGameSession();
    clearRoundNumber();
    roundNumber.value = 1;
  };

  function setStatus(forceState?: GameStatus): void {
    let nextStatus: GameStatus | null = null;

    if (forceState) status.value = forceState;

    const currentStatus = status.value;

    switch (currentStatus) {
      case GameStatus.RUNNING:
        // Transition to VOTING when all rounds done and all players submitted
        if (
          currentRound.value === numberOfRounds.value &&
          playersClickedThisRound.value.size === players.value.length
        ) {
          nextStatus = GameStatus.VOTING;
        }
        break;

      case GameStatus.VOTING:
        // Transition to GUESSING when all players voted
        if (votedPlayersThisRound.value.size === players.value.length) {
          if (mostVoted.value === impostorId.value) {
            nextStatus = GameStatus.GUESSING;
          } else {
            nextStatus = GameStatus.ENDED;
          }
        }
        break;

      case GameStatus.GUESSING:
        // Transition to ENDED when impostor done guessing
        if (impostorDoneGuessing.value) {
          nextStatus = GameStatus.ENDED;
        }
        break;
    }

    if (nextStatus) {
      status.value = nextStatus;
    }
  }

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
    myPlayerId,
    myPlayerName,
    roundNumber,
    pendingJoinRequests,
    joinStatus,
    currentPlayer,
    currentPlayerIndex,
    playersClickedThisRound,
    selectedImpostorGuess,
    isNextButtonBlocked,
    votedPlayersThisRound,
    impostorDoneGuessing,
    impostorGuess,
    guessResult,
    guessPhaseActive,
    playerWords,
    currentPlayerWord,
    canShowShowImpostorButton,
    setGameStarted,
    setStatus,
    setRoundSubmitted,
    addPlayer,
    setVotes,
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
    setGuessPhaseActive,
    setImpostorGuess,
    setGuessResult,
    advancePlayerTurn,
    resetRoundClicks,
    selectImpostorGuess,
    submitPlayerWord,
    updatePlayerWords,
    reset,
    resetGameProgress,
    resetForNewGame,
  };
});
