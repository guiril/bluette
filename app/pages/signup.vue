<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'guest-only',
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
const passwordField = useTemplateRef('passwordField');

const showPassword = ref(false);

const canSubmit = computed(
  () => Boolean(email.value && password.value) && !isGuestLoggingIn.value,
);

const clearEmail = () => {
  email.value = '';
  emailField.value?.focus();
};

const focusFirstError = async () => {
  await nextTick();

  if (emailErrorMessage.value || errorMessage.value) {
    emailField.value?.focus();
  } else if (passwordErrorMessage.value) {
    passwordField.value?.focus();
  }
};

const submitForm = async () => {
  await handleSubmit();
  await focusFirstError();
};
</script>

<template>
  <NuxtLayout name="auth">
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
      <form novalidate class="flex flex-col gap-8" @submit.prevent="submitForm">
        <div class="flex flex-col gap-4">
          <BaseTextField
            id="email"
            ref="emailField"
            v-model="email"
            label="Email"
            type="email"
            autocomplete="email"
            placeholder="name@example.com"
            :disabled="isBusy"
            :error-message="emailErrorMessage"
            @blur="validateEmail"
          >
            <template #trailing>
              <button
                v-if="email && !isBusy"
                type="button"
                aria-label="清除 Email"
                class="flex p-2.5 text-fg-default cursor-pointer"
                @mousedown.prevent
                @click="clearEmail"
              >
                <Icon name="bluette:clear" class="size-5" />
              </button>
            </template>
          </BaseTextField>
          <BaseTextField
            id="password"
            ref="passwordField"
            v-model="password"
            label="密碼"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="建立一組密碼"
            hint="至少 8 碼，要有英文字母和數字"
            :disabled="isBusy"
            :error-message="passwordErrorMessage"
            @blur="validatePassword"
          >
            <template #trailing>
              <button
                type="button"
                :aria-label="showPassword ? '隱藏密碼' : '顯示密碼'"
                class="pr-2 text-body-sm font-medium tracking-[0.01em] text-text-muted cursor-pointer disabled:text-text-disabled disabled:cursor-not-allowed"
                :disabled="isBusy"
                @mousedown.prevent
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? '隱藏' : '顯示' }}
              </button>
            </template>
          </BaseTextField>
        </div>
        <div class="flex flex-col gap-4">
          <p
            v-if="errorMessage"
            role="alert"
            class="text-ui-caption text-text-danger"
          >
            {{ errorMessage }}
          </p>
          <BaseButton
            type="submit"
            :is-loading="isSubmitting"
            :disabled="!canSubmit"
            class="w-full"
          >
            建立帳號
          </BaseButton>
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
    <template #footer>
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
    </template>
  </NuxtLayout>
</template>
