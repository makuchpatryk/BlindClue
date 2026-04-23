import { defineStore } from 'pinia';
import { ref, computed, reactive } from 'vue';
import { PlayerDTO, ScoreDTO } from '../../shared/types/game.js';

export const useGameStore = defineStore('game', () => {
  const gameId = ref<string>('');
  const status = ref<'LOBBY' | 'RUNNING' | 'VOTING' | 'ENDED'>('LOBBY');
  const currentRound = ref<number>(1);
  const category = ref<string>('');
  const isImpostor = ref<boolean>(false);
  const impostorId = ref<string | null>(null);
  const players = ref<PlayerDTO[]>([]);
  const descriptions = reactive<Map<number, any[]>>(new Map());
  const votes = ref<Map<string, number> | null>(null);
  const mostVoted = ref<string | null>(null);
  const finalScores = ref<ScoreDTO[]>([]);

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
  };

  const setStatus = (newStatus: 'LOBBY' | 'RUNNING' | 'VOTING' | 'ENDED') => {
    status.value = newStatus;
  };

  const setRoundSubmitted = (round: number) => {
    currentRound.value = round;
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

  const reset = () => {
    gameId.value = '';
    status.value = 'LOBBY';
    currentRound.value = 1;
    category.value = '';
    isImpostor.value = false;
    impostorId.value = null;
    players.value = [];
    descriptions.clear();
    votes.value = null;
    mostVoted.value = null;
    finalScores.value = [];
  };

  return {
    gameId,
    status,
    currentRound,
    category,
    isImpostor,
    impostorId,
    players,
    descriptions,
    votes,
    mostVoted,
    finalScores,
    currentPlayer,
    setGameStarted,
    setStatus,
    setRoundSubmitted,
    addPlayer,
    setVotes,
    setFinalScores,
    reset,
  };
});
