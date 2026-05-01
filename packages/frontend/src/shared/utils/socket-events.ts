export const SOCKET_EVENTS = {
  // Game state
  GAME_STARTED: "GameStarted",
  ROUND_SUBMITTED: "RoundSubmitted",
  VOTING_STARTED: "VotingStarted",
  GAME_ENDED: "GameEnded",

  // Player management
  PLAYER_JOINED: "PlayerJoined",
  JOIN_REQUEST: "JoinRequest",
  JOIN_GAME_SUCCESS: "joinGameSuccess",
  JOIN_GAME_ERROR: "joinGameError",
  REJOIN_SUCCESS: "rejoinSuccess",
  REJOIN_ERROR: "rejoinError",

  // Game flow
  PLAYER_TURN_ADVANCED: "PlayerTurnAdvanced",
  BUTTON_UNBLOCKED: "ButtonUnblocked",
  PLAYER_VOTED: "PlayerVoted",
  ALL_PLAYERS_VOTED: "AllPlayersVoted",
  IMPOSTOR_DONE_GUESSING: "impostorDoneGuessing",
  PLAYER_WORD_SUBMITTED: "PlayerWordSubmitted",

  // Errors
  ERROR: "error",
} as const;
