<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <FormField label="Email">
      <Input
        v-model="email"
        type="email"
        placeholder="your@email.com"
        required
      />
    </FormField>

    <FormField label="Password">
      <Input
        v-model="password"
        type="password"
        placeholder="••••••••"
        required
      />
      <p class="text-xs text-gray-500 mt-1">
        Min 8 chars: uppercase, lowercase, numbers, special chars
      </p>
    </FormField>

    <FormField label="Confirm Password">
      <Input
        v-model="confirmPassword"
        type="password"
        placeholder="••••••••"
        required
      />
    </FormField>

    <Alert v-if="error" variant="error">
      {{ error }}
    </Alert>

    <Button
      type="submit"
      :disabled="loading || password !== confirmPassword"
      fullWidth
    >
      {{ loading ? "Creating account..." : "Sign Up" }}
    </Button>

    <div class="text-center text-sm">
      <p class="text-gray-400">
        Already have an account?
        <button
          type="button"
          @click="$emit('switch-to-login')"
          class="text-blue-400 hover:text-blue-300"
        >
          Sign in
        </button>
      </p>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import FormField from "@/shared/components/form-field.vue";
import Input from "@/shared/components/input.vue";
import Alert from "@/shared/components/alert.vue";
import Button from "@/shared/components/button.vue";

interface Props {
  loading?: boolean;
  error?: string | null;
}

withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
});

const email = ref("");
const password = ref("");
const confirmPassword = ref("");

const emit = defineEmits<{
  submit: [{ email: string; password: string }];
  "switch-to-login": [];
}>();

const handleSubmit = () => {
  if (password.value !== confirmPassword.value) {
    return;
  }
  emit("submit", { email: email.value, password: password.value });
};

defineExpose({
  reset: () => {
    email.value = "";
    password.value = "";
    confirmPassword.value = "";
  },
});
</script>
