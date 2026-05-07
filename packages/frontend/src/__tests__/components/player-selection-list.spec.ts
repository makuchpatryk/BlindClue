import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import PlayerSelectionList from '@/features/game/components/player-selection-list.vue';
import { useGameStore } from '@/features/game/stores/game.store';

// Mock Button component
vi.mock('@/shared/components/button.vue', () => ({
  default: {
    name: 'Button',
    template: '<button @click="$emit(\'click\')"><slot /></button>',
    props: ['disabled', 'noDefaults', 'class'],
  },
}));

describe('PlayerSelectionList', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should render all players', () => {
    const gameStore = useGameStore();
    gameStore.setPlayers([
      { id: 'player-1', name: 'Alice' },
      { id: 'player-2', name: 'Bob' },
      { id: 'player-3', name: 'Charlie' },
    ]);

    const wrapper = mount(PlayerSelectionList, {
      global: {
        provide: {
          gameClientService: null,
        },
      },
    });

    expect(wrapper.text()).toContain('Alice');
    expect(wrapper.text()).toContain('Bob');
    expect(wrapper.text()).toContain('Charlie');
  });

  it('should select player on button click', async () => {
    const gameStore = useGameStore();
    gameStore.setPlayers([
      { id: 'player-1', name: 'Alice' },
      { id: 'player-2', name: 'Bob' },
    ]);

    const wrapper = mount(PlayerSelectionList, {
      global: {
        provide: {
          gameClientService: null,
        },
      },
    });

    const buttons = wrapper.findAll('button');
    await buttons[0].trigger('click');

    expect(gameStore.selectedImpostorGuess).toBe('player-1');
  });

  it('should show checkmark for selected player', async () => {
    const gameStore = useGameStore();
    gameStore.setPlayers([
      { id: 'player-1', name: 'Alice' },
      { id: 'player-2', name: 'Bob' },
    ]);
    gameStore.selectImpostorGuess('player-1');

    const wrapper = mount(PlayerSelectionList, {
      global: {
        provide: {
          gameClientService: null,
        },
      },
    });

    expect(wrapper.text()).toContain('✓');
  });

  it('should show checkmark for voted players', () => {
    const gameStore = useGameStore();
    gameStore.setPlayers([
      { id: 'player-1', name: 'Alice' },
      { id: 'player-2', name: 'Bob' },
    ]);
    gameStore.addVotedPlayer('player-1');

    const wrapper = mount(PlayerSelectionList, {
      global: {
        provide: {
          gameClientService: null,
        },
      },
    });

    expect(wrapper.text()).toContain('✔️');
  });

  it('should disable buttons when disabled prop is true', () => {
    const gameStore = useGameStore();
    gameStore.setPlayers([
      { id: 'player-1', name: 'Alice' },
    ]);

    const wrapper = mount(PlayerSelectionList, {
      props: { disabled: true },
      global: {
        provide: {
          gameClientService: null,
        },
      },
    });

    const buttons = wrapper.findAll('button');
    expect(buttons[0].attributes('disabled')).toBeDefined();
  });

  it('should handle empty player list', () => {
    const wrapper = mount(PlayerSelectionList, {
      global: {
        provide: {
          gameClientService: null,
        },
      },
    });

    expect(wrapper.findAll('button').length).toBe(0);
  });
});
