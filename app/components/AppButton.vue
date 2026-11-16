<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';

type ButtonSize = 'md' | 'lg';

const sizeClasses: Record<ButtonSize, string> = {
  md: 'h-10 px-4 text-ui-label max-sm:text-ui-label-lg',
  lg: 'h-12 px-4 text-body-md',
};

const {
  to,
  size = 'lg',
  type = 'button',
  isLoading = false,
  disabled = false,
} = defineProps<{
  to?: RouteLocationRaw;
  size?: ButtonSize;
  type?: 'button' | 'submit';
  isLoading?: boolean;
  disabled?: boolean;
}>();
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    class="flex items-center justify-center gap-2 font-sans text-text-on-inverse rounded-md bg-button-primary-bg-rest shadow-xs outline-none hover:bg-button-primary-bg-hover focus-visible:bg-button-primary-bg-active focus-visible:shadow-none"
    :class="sizeClasses[size]"
  >
    <slot />
  </NuxtLink>
  <button
    v-else
    :type="type"
    :disabled="disabled"
    :aria-busy="isLoading"
    class="flex items-center justify-center gap-2 font-sans text-text-on-inverse rounded-md bg-button-primary-bg-rest shadow-xs outline-none cursor-pointer enabled:hover:bg-button-primary-bg-hover focus-visible:bg-button-primary-bg-active focus-visible:shadow-none disabled:text-text-disabled disabled:bg-control-bg-disabled disabled:cursor-not-allowed"
    :class="sizeClasses[size]"
  >
    <template v-if="isLoading">
      <Icon name="bluette:spinner" class="size-5 animate-spin" />
      <span class="sr-only"><slot /></span>
    </template>
    <slot v-else />
  </button>
</template>
