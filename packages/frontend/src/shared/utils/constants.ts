export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "/";

export const ROUND_DURATION = 60000; // 60 seconds
export const VOTING_DURATION = 45000; // 45 seconds
export const IMPOSTOR_GUESS_DURATION = 30000; // 30 seconds

export const MAX_ROUNDS = 3;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 4;

export const COPIED_FEEDBACK_DELAY = 2000; // 2 seconds
export const IMPOSTOR_DONE_GUESSING_DELAY = 3000; // 3 seconds
export const SOCKET_RECONNECTION_DELAY_MAX = 5000; // 5 seconds
