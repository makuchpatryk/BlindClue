<<template>
  <div class="max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow">
    <form @submit.prevent="createGame" class="space-y-4">
      <button
        type="submit"
        :disabled="isCreating"
        class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {{ isCreating ? 'Creating...' : 'Create Game' }}
      </button>
      <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useLobbyStore } from '../stores/lobby.store.js';
import { useGameStore } from '../../game/stores/game.store.js';
import { useRouter } from 'vue-router';

const router = useRouter();
const lobbyStore = useLobbyStore();
const gameStore = useGameStore();
const isCreating = ref(false);
const error = ref<string | null>(null);

async function createGame() {
  if (!lobbyStore.playerName.trim()) {
    error.value = 'Please enter your name';
    return;
  }

  isCreating.value = true;
  error.value = null;

  try {
    const response = await fetch('http://localhost:3000/games', {
      method: 'POST',
    });

    if (!response.ok) throw new Error('Failed to create game');

    const data = await response.json();
    const gameId = data.gameId;

    gameStore.reset();
    localStorage.removeItem('game_session');
    lobbyStore.setGameCode(gameId);
    await router.push(`/game/${gameId}`);
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    isCreating.value = false;
  }
}
</script>
