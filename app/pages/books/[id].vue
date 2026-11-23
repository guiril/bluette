<script setup lang="ts">
import type { UserBookWithNotes } from '~/types/database';

definePageMeta({
  hideHeaderBelowLg: true,
});

const route = useRoute('books-id');
const router = useRouter();
const flashMessage = useFlashMessage();

const toastRef = useTemplateRef('toastRef');

const isConfirmingRemove = ref(false);
const isRemoving = ref(false);

const { data: userBook, error } = await useFetch<UserBookWithNotes>(
  `/api/user-books/${route.params.id}`,
);

if (error.value) {
  throw createError({
    status: error.value.status ?? 500,
    statusText: error.value.status === 404 ? '找不到這本書' : '載入失敗',
    fatal: true,
  });
}

const goBack = () => {
  if (router.options.history.state.back) {
    router.back();
    return;
  }

  navigateTo('/my-books', { replace: true });
};

const removeMessage = computed(
  () => `《${userBook.value?.title}》的筆記不會刪除，會移到未分類。`,
);

const openRemoveConfirm = () => {
  isConfirmingRemove.value = true;
};

const handleCancelRemove = () => {
  if (isRemoving.value) return;

  isConfirmingRemove.value = false;
};

const handleConfirmRemove = async () => {
  isRemoving.value = true;

  try {
    await $fetch(`/api/user-books/${route.params.id}`, { method: 'DELETE' });

    flashMessage.value = '已從書庫移除';
    await navigateTo('/my-books', { replace: true });
  } catch {
    isConfirmingRemove.value = false;
    toastRef.value?.show('移除失敗，請稍後再試');
  } finally {
    isRemoving.value = false;
  }
};
</script>

<template>
  <div
    v-if="userBook"
    class="flex flex-1 flex-col lg:bg-[linear-gradient(to_right,#EAD3B6_50%,var(--color-bg-default)_50%)]"
  >
    <div
      class="flex flex-1 flex-col lg:mx-auto lg:w-full lg:max-w-312 lg:flex-row lg:px-6"
    >
      <div
        class="flex flex-col bg-[#EAD3B6] rounded-br-4xl lg:w-85 lg:shrink-0 lg:rounded-none"
      >
        <div
          class="page-container flex items-center pt-3 pb-2.5 md:py-3.5 lg:h-15 lg:mt-5 lg:px-0 lg:py-0"
        >
          <button
            type="button"
            @click="goBack"
            aria-label="返回書庫"
            class="flex w-11 py-3 pr-3 text-text-nav cursor-pointer md:w-12 md:pt-3.75 md:pr-3.5 md:pb-3.25 lg:w-11 lg:py-3 lg:pr-3"
          >
            <Icon name="bluette:arrow-left" class="size-5" />
          </button>
          <div class="flex ml-auto lg:hidden">
            <button
              type="button"
              aria-label="從書庫移除"
              @click="openRemoveConfirm"
              class="flex w-11 pl-6 py-3 text-text-nav cursor-pointer md:w-12 md:pl-7 md:py-3.5"
            >
              <Icon name="bluette:trash" class="size-5" />
            </button>
            <button
              type="button"
              aria-label="編輯書籍資料"
              class="flex w-11 pl-6 py-3 text-text-nav cursor-pointer md:w-12 md:pl-7 md:py-3.5"
            >
              <Icon name="bluette:edit" class="size-5" />
            </button>
          </div>
        </div>
        <div class="flex flex-col justify-center items-center lg:pt-3">
          <span
            class="relative block w-26 h-37.5 overflow-hidden rounded-[0.25rem] bg-surface-raised md:w-34.75 md:h-50 md:shadow-[0_10px_20px_-4px_rgb(89_51_20/0.25)] md:after:absolute md:after:inset-0 md:after:rounded-[0.25rem] md:after:border md:after:border-[#C0BDB4]/40"
          >
            <img
              v-if="userBook.cover_url"
              :src="userBook.cover_url"
              alt=""
              class="block size-full object-cover"
            />
            <span
              v-else
              class="size-full flex items-center justify-center font-sans text-ui-caption text-text-secondary"
            >
              無封面
            </span>
          </span>
          <div
            class="flex flex-col w-full py-4 px-8 text-center md:gap-1 md:py-6 lg:pt-6 lg:pb-2.5"
          >
            <h1
              class="truncate font-serif text-heading-h6 text-text-default md:text-accent-title"
            >
              {{ userBook.title }}
            </h1>
            <p
              class="truncate font-sans text-body-sm text-text-muted md:text-body-md"
            >
              {{ userBook.author || '作者不詳' }}
            </p>
          </div>
          <div class="hidden lg:flex gap-3 pt-4">
            <button
              type="button"
              class="flex items-center gap-1 font-sans text-body-sm font-medium text-text-default underline underline-offset-2 cursor-pointer"
            >
              <Icon name="bluette:edit" class="size-4" />
              編輯書籍
            </button>
            <button
              type="button"
              @click="openRemoveConfirm"
              class="flex items-center gap-1 font-sans text-body-sm font-medium text-text-default underline underline-offset-2 cursor-pointer"
            >
              <Icon name="bluette:trash" class="size-4" />
              刪除書籍
            </button>
          </div>
        </div>
      </div>
      <div class="bg-[#EAD3B6] lg:flex lg:flex-1 lg:flex-col lg:bg-bg-default">
        <div
          class="rounded-tl-4xl bg-bg-default lg:flex lg:flex-1 lg:flex-col lg:rounded-none"
        >
          <div
            class="page-container flex flex-col gap-1 pt-4 md:pt-8 lg:flex-1 lg:gap-4 lg:px-0 lg:pt-5 lg:pb-8 lg:pl-12"
          >
            <h2
              class="flex gap-2 md:gap-2.5 items-center my-2.5 lg:my-4.5 text-text-default text-body-sm md:text-body-md"
            >
              <span class="size-1.5 bg-bg-brand-emphasis lg:hidden"></span
              >筆記專區
            </h2>
            <div
              class="py-6 lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:py-0"
            >
              <div class="relative w-87.5 h-49.25 mb-3 mx-auto md:h-65 lg:mb-5">
                <img
                  src="/images/library-empty.png"
                  alt=""
                  class="absolute inset-0 size-full object-contain"
                />
              </div>
              <p
                class="font-serif text-accent-xs text-center text-text-default md:text-accent-sm lg:text-accent-title"
              >
                這本書目前還沒有筆記
              </p>
              <p
                class="font-sans text-body-sm text-center text-text-muted md:text-body-lg lg:text-body-md"
              >
                打動你的句子、閃過的念頭，都值得寫下
              </p>
              <BaseButton class="w-63 mt-5 md:mt-8 mx-auto md:w-75 lg:h-13">
                <Icon name="bluette:pencil" class="size-5 lg:size-6" />
                寫下第一則筆記
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
    <BaseConfirmModal
      :open="isConfirmingRemove"
      title="從書庫移除這本書？"
      :message="removeMessage"
      confirm-label="移除"
      variant="danger"
      :is-confirming="isRemoving"
      @confirm="handleConfirmRemove"
      @cancel="handleCancelRemove"
    />
    <BaseToast ref="toastRef" />
  </div>
</template>
