<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Request reset stage -->
    <template v-if="stage === 'request'">
      <FormField label="Email">
        <Input
          v-model="email"
          type="email"
          placeholder="your@email.com"
          required
        />
      </FormField>

      <Alert v-if="error" variant="error">
        {{ error }}
      </Alert>

      <Button type="submit" :disabled="loading" fullWidth>
        {{ loading ? "Sending reset code..." : "Send Reset Code" }}
      </Button>
    </template>

    <!-- Confirm reset stage -->
    <template v-else-if="stage === 'confirm'">
      <Alert variant="info">
        Password reset code sent to {{ email }}
      </Alert>

      <FormField label="Reset Code">
        <Input
          v-model="code"
          type="text"
          placeholder="123456"
          required
        />
      </FormField>

      <FormField label="New Password">
        <Input
          v-model="newPassword"
          type="password"
          placeholder="••••••••"
          required
        />
      </FormField>

      <FormField label="Confirm Password">
        <Input
          v-model="confirmNewPassword"
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
        :disabled="loading || newPassword !== confirmNewPassword"
        fullWidth
      >
        {{ loading ? "Resetting password..." : "Reset Password" }}
      </Button>

      <Button
        type="button"
        variant="secondary"
        @click="handleBack"
        fullWidth
      >
        Back
      </Button>
    </template>
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

type Stage = "request" | "confirm";

const stage = ref<Stage>("request");
const email = ref("");
const code = ref("");
const newPassword = ref("");
const confirmNewPassword = ref("");

const emit = defineEmits<{
  "request-reset": [{ email: string }];
  "confirm-reset": [{ email: string; code: string; password: string }];
  "switch-to-login": [];
}>();

const handleSubmit = () => {
  if (stage.value === "request") {
    emit("request-reset", { email: email.value });
    stage.value = "confirm";
  } else if (stage.value === "confirm") {
    if (newPassword.value !== confirmNewPassword.value) {
      return;
    }
    emit("confirm-reset", {
      email: email.value,
      code: code.value,
      password: newPassword.value,
    });
  }
};

const handleBack = () => {
  stage.value = "request";
  code.value = "";
  newPassword.value = "";
  confirmNewPassword.value = "";
};

defineExpose({
  reset: () => {
    stage.value = "request";
    email.value = "";
    code.value = "";
    newPassword.value = "";
    confirmNewPassword.value = "";
  },
});
</script>
