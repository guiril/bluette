<script setup lang="ts">
definePageMeta({
  layout: false,
});

const {
  email,
  password,
  emailErrorMessage,
  passwordErrorMessage,
  errorMessage,
  isSubmitting,
  isGuestLoggingIn,
  isBusy,
  handleSubmit,
  handleGuestLogin,
} = useAuthForm('login');

const emailField = useTemplateRef('emailField');

const showPassword = ref(false);

const canSubmit = computed(
  () => Boolean(email.value && password.value) && !isGuestLoggingIn.value,
);

const clearEmail = () => {
  email.value = '';
  emailField.value?.focus();
};
</script>

<template>
  <div
    class="flex min-h-screen flex-col px-5 py-10 font-sans bg-bg-default md:items-center md:justify-center md:gap-30"
  >
    <div
      class="flex w-full flex-1 flex-col gap-14 md:w-97.5 md:flex-none md:gap-16 lg:w-100 lg:gap-18"
    >
      <NuxtLink to="/" class="w-fit">
        <AppLogo class="h-8 md:h-10" />
      </NuxtLink>
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-1.5 md:gap-2 lg:gap-2.5">
          <h1
            class="font-serif text-accent-md tracking-[0.01em] text-text-default md:text-accent-lg md:tracking-[0.02em] lg:text-accent-xl lg:tracking-normal"
          >
            歡迎你回來
          </h1>
          <p class="text-body-sm text-text-muted md:text-body-md">
            讀到心動的句子，把它寫成一則筆記
          </p>
        </div>
        <form
          novalidate
          class="flex flex-col gap-8"
          @submit.prevent="handleSubmit"
        >
          <div class="flex flex-col gap-4">
            <AppTextField
              id="email"
              ref="emailField"
              v-model="email"
              label="Email"
              type="email"
              autocomplete="email"
              placeholder="name@example.com"
              :error-message="emailErrorMessage"
            >
              <template #trailing>
                <button
                  v-if="email"
                  type="button"
                  aria-label="清除 Email"
                  class="flex p-2.5 text-fg-default cursor-pointer"
                  @mousedown.prevent
                  @click="clearEmail"
                >
                  <Icon name="bluette:clear" class="size-5" />
                </button>
              </template>
            </AppTextField>
            <AppTextField
              id="password"
              v-model="password"
              label="密碼"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="輸入密碼"
              :error-message="passwordErrorMessage"
            >
              <template #trailing>
                <button
                  type="button"
                  :aria-label="showPassword ? '隱藏密碼' : '顯示密碼'"
                  class="pr-2 text-body-sm font-medium tracking-[0.01em] text-text-muted cursor-pointer"
                  @mousedown.prevent
                  @click="showPassword = !showPassword"
                >
                  {{ showPassword ? '隱藏' : '顯示' }}
                </button>
              </template>
            </AppTextField>
          </div>
          <div class="flex flex-col gap-4">
            <p
              v-if="errorMessage"
              role="alert"
              class="text-ui-caption text-text-danger"
            >
              {{ errorMessage }}
            </p>
            <AppButton
              type="submit"
              :is-loading="isSubmitting"
              :disabled="!canSubmit"
              class="w-full"
            >
              立即登入
            </AppButton>
          </div>
        </form>
      </div>
    </div>
    <div class="flex w-full items-center justify-between md:w-97.5 lg:w-100">
      <p class="flex items-center gap-1 text-body-sm text-text-muted">
        還沒有帳號？
        <NuxtLink
          to="/signup"
          class="font-medium tracking-[0.01em] text-text-default underline"
        >
          建立帳號
        </NuxtLink>
      </p>
      <button
        type="button"
        class="text-body-sm font-medium tracking-[0.01em] text-text-default underline cursor-pointer disabled:cursor-not-allowed"
        :disabled="isBusy"
        :aria-busy="isGuestLoggingIn"
        @click="handleGuestLogin"
      >
        先逛逛，不用帳號
      </button>
    </div>
  </div>
</template>
