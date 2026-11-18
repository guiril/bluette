<script setup lang="ts">
const {
  id,
  label,
  type = 'text',
  placeholder,
  autocomplete,
  hint,
  errorMessage,
  disabled = false,
} = defineProps<{
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  autocomplete?: string;
  hint?: string;
  errorMessage?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  blur: [];
}>();

const inputValue = defineModel<string>({
  required: true,
});

const inputElement = useTemplateRef<HTMLInputElement>('input');

const messageId = computed(() => `${id}-message`);
const hasMessage = computed(() => Boolean(errorMessage || hint));

const focus = () => {
  inputElement.value?.focus();
};

defineExpose({ focus });
</script>

<template>
  <div class="flex flex-col gap-1">
    <label
      :for="id"
      class="w-fit text-body-sm font-medium tracking-[0.01em] text-text-default"
    >
      {{ label }}
    </label>
    <div
      class="flex h-12 items-center gap-2 pr-1 pl-3 rounded-sm border"
      :class="
        disabled
          ? 'border-border-disabled'
          : errorMessage
            ? 'border-border-danger-emphasis'
            : 'border-border-default focus-within:border-[1.5px] focus-within:border-border-emphasis'
      "
    >
      <input
        :id="id"
        ref="input"
        v-model="inputValue"
        :type="type"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :disabled="disabled"
        :aria-invalid="Boolean(errorMessage)"
        :aria-describedby="hasMessage ? messageId : undefined"
        class="min-w-0 flex-1 text-body-md text-text-default bg-transparent caret-text-brand outline-none placeholder:text-text-placeholder disabled:text-text-disabled"
        @blur="emit('blur')"
      />
      <slot name="trailing" />
    </div>
    <p
      v-if="errorMessage"
      :id="messageId"
      role="alert"
      class="flex items-center gap-1 text-ui-caption text-text-danger"
    >
      <Icon name="bluette:info" class="size-3.5 shrink-0" />
      {{ errorMessage }}
    </p>
    <p v-else-if="hint" :id="messageId" class="text-ui-caption text-text-muted">
      {{ hint }}
    </p>
  </div>
</template>
