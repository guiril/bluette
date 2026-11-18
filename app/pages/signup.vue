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
  validateEmail,
  validatePassword,
  handleSubmit,
  handleGuestLogin,
} = useAuthForm('signup');

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
            讓那些觸動你的文字，<br />不再是讀過就消逝不見
          </h1>
          <p class="text-body-sm text-text-muted md:text-body-md">
            建立帳號，就可以把書中喜歡的句子和想法寫下來
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
              @blur="validateEmail"
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
              autocomplete="new-password"
              placeholder="建立一組密碼"
              hint="至少 8 碼，要有英文字母和數字"
              :error-message="passwordErrorMessage"
              @blur="validatePassword"
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
              建立帳號
            </AppButton>
            <p class="flex flex-wrap gap-1 text-ui-caption text-text-muted">
              建立帳號，表示你同意 Bluette 的
              <a
                href="#"
                class="font-medium text-text-default underline"
                @click.prevent
              >
                使用條款
              </a>
              並已知悉
              <a
                href="#"
                class="font-medium text-text-default underline"
                @click.prevent
              >
                隱私權政策
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
    <div class="flex w-full items-center justify-between md:w-97.5 lg:w-100">
      <p class="flex items-center gap-1 text-body-sm text-text-muted">
        已經有帳號？
        <NuxtLink
          to="/login"
          class="font-medium tracking-[0.01em] text-text-default underline"
        >
          登入
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
