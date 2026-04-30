import { defineStore } from 'pinia';
import { ref, computed, reactive } from 'vue';
import { PlayerDTO, ScoreDTO } from '../../shared/types/game.js';

export const useGameStore = defineStore('game', () => {
  const gameId = ref<string>('');
  const status = ref<'LOBBY' | 'RUNNING' | 'VOTING' | 'ENDED'>('LOBBY');
  const currentRound = ref<number>(1);
  const category = ref<string>('');
  const word = ref<string>('');
  const isImpostor = ref<boolean>(false);
  const impostorId = ref<string | null>(null);
  const players = ref<PlayerDTO[]>([]);
  const descriptions = reactive<Map<number, any[]>>(new Map());
  const votes = ref<Map<string, number> | null>(null);
  const mostVoted = ref<string | null>(null);
  const finalScores = ref<ScoreDTO[]>([]);
  const myPlayerId = ref<string>('');
  const myPlayerName = ref<string>('');
  const pendingJoinRequests = ref<Array<{ requestId: string; playerName: string }>>([]);
  const joinStatus = ref<'idle' | 'pending' | 'approved' | 'rejected'>('idle');

  const currentPlayer = computed(() => players.value[0] || null);

  const setGameStarted = (data: {
    gameId: string;
    category: string;
    impostorId: string;
    players: PlayerDTO[];
  }) => {
    gameId.value = data.gameId;
    status.value = 'RUNNING';
    category.value = data.category;
    impostorId.value = data.impostorId;
    players.value = data.players;
    isImpostor.value = data.impostorId === myPlayerId.value;
  };

  const setStatus = (newStatus: 'LOBBY' | 'RUNNING' | 'VOTING' | 'ENDED') => {
    status.value = newStatus;
  };

  const setRoundSubmitted = (round: number, descs?: any[]) => {
    currentRound.value = round;
    if (descs) {
      descriptions.set(round, descs);
    }
  };

  const addPlayer = (player: PlayerDTO) => {
    const exists = players.value.find(p => p.id === player.id);
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

  const addJoinRequest = (request: { requestId: string; playerName: string }) => {
    pendingJoinRequests.value.push(request);
  };

  const removeJoinRequest = (requestId: string) => {
    pendingJoinRequests.value = pendingJoinRequests.value.filter(r => r.requestId !== requestId);
  };

  const setJoinStatus = (status: 'idle' | 'pending' | 'approved' | 'rejected') => {
    joinStatus.value = status;
  };

  const setWord = (wordText: string) => {
    word.value = wordText;
  };

  const reset = () => {
    gameId.value = '';
    status.value = 'LOBBY';
    currentRound.value = 1;
    category.value = '';
    word.value = '';
    isImpostor.value = false;
    impostorId.value = null;
    players.value = [];
    descriptions.clear();
    votes.value = null;
    mostVoted.value = null;
    finalScores.value = [];
    myPlayerId.value = '';
    myPlayerName.value = '';
    pendingJoinRequests.value = [];
    joinStatus.value = 'idle';
  };

  return {
    gameId,
    status,
    currentRound,
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
    reset,
  };
});
