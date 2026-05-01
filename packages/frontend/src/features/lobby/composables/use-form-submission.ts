import { ref } from "vue";

export function useFormSubmission() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const resetForm = (): void => {
    error.value = null;
  };

  const setLoading = (loading: boolean): void => {
    isLoading.value = loading;
  };

  const setError = (errorMsg: string | null): void => {
    error.value = errorMsg;
  };

  const executeWithErrorHandling = async (
    callback: () => Promise<void>,
  ): Promise<void> => {
    setLoading(true);
    resetForm();

    try {
      await callback();
    } catch (e) {
      setError((e as Error).message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    isLoading,
    error,
    resetForm,
    setLoading,
    setError,
    executeWithErrorHandling,
  };
}
