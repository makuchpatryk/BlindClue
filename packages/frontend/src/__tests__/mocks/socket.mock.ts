import { vi } from "vitest";

export const createMockSocket = () => {
  const listeners: Record<string, Function[]> = {};

  return {
    emit: vi.fn(),
    on: vi.fn((event: string, callback: Function) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(callback);
    }),
    off: vi.fn((event: string) => {
      delete listeners[event];
    }),
    connect: vi.fn(),
    disconnect: vi.fn(),
    connected: true,
    id: "mock-socket-id",
    // Helper to trigger events in tests
    _trigger: (event: string, ...args: any[]) => {
      listeners[event]?.forEach((cb) => cb(...args));
    },
  };
};
