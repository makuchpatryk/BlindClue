import { ref, onBeforeUnmount } from "vue";
import { ROUND_DURATION, VOTING_DURATION } from "../utils/constants.js";
import { GameStatus } from "../utils/game-status.js";

export function useRoundTimer(status: string) {
  const timeRemaining = ref<number>(ROUND_DURATION);
  let interval: ReturnType<typeof setInterval> | null = null;

  function startTimer() {
    const duration =
      status === GameStatus.VOTING ? VOTING_DURATION : ROUND_DURATION;
    timeRemaining.value = duration;

    interval = setInterval(() => {
      timeRemaining.value -= 1000;
      if (timeRemaining.value <= 0) {
        if (interval) clearInterval(interval);
      }
    }, 1000);
  }

  function stopTimer() {
    if (interval) {
      clearInterval(interval);
    }
  }

  onBeforeUnmount(() => {
    stopTimer();
  });

  return {
    timeRemaining,
    startTimer,
    stopTimer,
  };
}
