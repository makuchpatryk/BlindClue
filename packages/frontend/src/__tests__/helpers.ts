import { mount, VueWrapper } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { vi } from "vitest";
import type { Component } from "vue";

export interface MountOptions {
  props?: Record<string, any>;
  slots?: Record<string, any>;
  global?: any;
  [key: string]: any;
}

export function createTestPinia() {
  return createPinia();
}

export function mountComponent(
  component: Component,
  options: MountOptions = {},
) {
  const pinia = createTestPinia();
  setActivePinia(pinia);

  const { props = {}, global = {} } = options;

  return mount(component, {
    props,
    global: {
      plugins: [pinia],
      ...global,
    },
    ...options,
  });
}

export function mockSocketIO() {
  return {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
}

export function mockGameStore() {
  return {
    gameId: "",
    playerId: "",
    status: "WAITING",
    phase: "WAITING",
    players: [],
    currentPlayer: null,
    descriptions: {},
    votes: {},
    guesses: {},
    word: "",
    category: "",
    setGameId: vi.fn(),
    setPlayerId: vi.fn(),
    setStatus: vi.fn(),
    setPhase: vi.fn(),
    addPlayer: vi.fn(),
    removePlayer: vi.fn(),
    setCurrentPlayer: vi.fn(),
    addDescription: vi.fn(),
    addVote: vi.fn(),
    addGuess: vi.fn(),
    setWord: vi.fn(),
    setCategory: vi.fn(),
    reset: vi.fn(),
  };
}
