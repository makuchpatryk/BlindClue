import { ref, onBeforeUnmount } from 'vue';
import { ROUND_DURATION, VOTING_DURATION } from '../../shared/utils/constants.js';

export function useRoundTimer(status: string) {
  const timeRemaining = ref<number>(ROUND_DURATION);
  let interval: NodeJS.Timeout | null = null;

  function startTimer() {
    const duration = status === 'VOTING' ? VOTING_DURATION : ROUND_DURATION;
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
