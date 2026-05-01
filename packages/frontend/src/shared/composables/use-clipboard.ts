import { ref } from "vue";
import { COPIED_FEEDBACK_DELAY } from "../utils/constants.js";

export function useClipboard() {
  const copied = ref(false);

  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text).then(() => {
      copied.value = true;
      setTimeout(() => {
        copied.value = false;
      }, COPIED_FEEDBACK_DELAY);
    });
  };

  return {
    copied,
    copyToClipboard,
  };
}
