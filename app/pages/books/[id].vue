<script setup lang="ts">
import type { UserBookWithNotes } from '~/types/database';

type NoteSortOrder = 'page' | 'recent';

definePageMeta({
  hideHeaderBelowLg: true,
});

const route = useRoute('books-id');
const router = useRouter();
const flashMessage = useFlashMessage();

const toastRef = useTemplateRef('toastRef');
const titleRef = useTemplateRef('titleRef');

const isConfirmingRemove = ref(false);
const isRemoving = ref(false);
const noteSortOrder = ref<NoteSortOrder>('recent');
const isTitleScrolledPast = ref(false);

let titleObserver: IntersectionObserver | null = null;

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

const notes = computed(() => userBook.value?.notes ?? []);

const latestNoteDate = computed(() => {
  const latestNote = notes.value[0];

  return latestNote ? formatNoteDate(latestNote.created_at) : '';
});

const numberedNotes = computed(() =>
  notes.value.map((note, index) => ({
    note,
    number: notes.value.length - index,
  })),
);

const sortedNotes = computed(() => {
  if (noteSortOrder.value === 'recent') return numberedNotes.value;

  return numberedNotes.value.toSorted(
    ({ note: firstNote }, { note: secondNote }) => {
      if (firstNote.page === secondNote.page) return 0;
      if (firstNote.page === null) return 1;
      if (secondNote.page === null) return -1;

      return firstNote.page - secondNote.page;
    },
  );
});

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

onMounted(() => {
  if (!titleRef.value) return;

  titleObserver = new IntersectionObserver(
    ([titleEntry]) => {
      if (!titleEntry) return;

      isTitleScrolledPast.value =
        titleEntry.intersectionRatio < 1 &&
        titleEntry.boundingClientRect.top < 0;
    },
    { threshold: 1 },
  );
  titleObserver.observe(titleRef.value);
});

onBeforeUnmount(() => {
  titleObserver?.disconnect();
});
</script>

<template>
  <div
    v-if="userBook"
    class="flex flex-1 flex-col lg:bg-[linear-gradient(to_right,#EAD3B6_50%,var(--color-bg-default)_50%)]"
  >
    <div
      class="fixed inset-x-0 top-0 z-30 border-b border-border-disabled/60 bg-bg-default/80 backdrop-blur-sm transition-[translate,visibility] duration-200 lg:hidden"
      :class="
        isTitleScrolledPast
          ? 'visible translate-y-0'
          : 'invisible -translate-y-full'
      "
    >
      <div
        class="page-container grid grid-cols-[1fr_minmax(0,auto)_1fr] items-center pt-3 pb-2.5 md:py-3.5"
      >
        <button
          type="button"
          @click="goBack"
          aria-label="返回書庫"
          class="flex w-11 py-3 pr-3 text-text-nav cursor-pointer md:w-12 md:pt-3.75 md:pr-3.5 md:pb-3.25"
        >
          <Icon name="bluette:arrow-left" class="size-5" />
        </button>
        <p
          class="truncate font-sans text-body-md font-medium text-text-default"
        >
          {{ userBook.title }}
        </p>
      </div>
    </div>
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
            class="relative block w-26 h-37.5 overflow-hidden rounded-[0.25rem] bg-surface-raised md:w-34.75 md:h-50 md:shadow-[0_10px_20px_-4px_rgb(89_51_20/0.25)] md:after:absolute md:after:inset-0 md:after:rounded-[0.25rem] md:after:border md:after:border-border-muted/40"
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
            class="flex flex-col w-full py-4 px-8 text-center md:py-6 lg:pt-6 lg:pb-2.5"
          >
            <div class="flex flex-col md:gap-1">
              <h1
                ref="titleRef"
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
            <p
              v-if="notes.length > 0"
              class="mt-1.5 font-sans text-xs/4.5 font-medium text-text-nav md:mt-2.5 md:text-body-sm md:tracking-[0.01em]"
            >
              {{ notes.length }} 則筆記 ·
              <span class="hidden md:inline">最近</span>
              {{ latestNoteDate }}
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
            class="page-container flex flex-col gap-1 pt-4 md:gap-2 md:pt-8 lg:flex-1 lg:gap-4 lg:px-0 lg:pt-5 lg:pb-8 lg:pl-12"
          >
            <div
              class="flex items-center justify-between h-11 lg:h-auto lg:my-4.5"
            >
              <h2
                class="flex gap-2 md:gap-2.5 items-center text-text-default text-body-sm md:text-body-md"
              >
                <span
                  class="size-1.5 bg-bg-brand-emphasis md:size-2 lg:hidden"
                ></span
                >筆記專區<template v-if="notes.length > 0">
                  ({{ notes.length }})</template
                >
              </h2>
              <div
                v-if="notes.length > 0"
                class="flex items-center font-sans text-body-sm font-medium tracking-[0.01em]"
              >
                <button
                  type="button"
                  :aria-pressed="noteSortOrder === 'page'"
                  class="cursor-pointer"
                  :class="
                    noteSortOrder === 'page'
                      ? 'text-text-default'
                      : 'text-text-muted'
                  "
                  @click="noteSortOrder = 'page'"
                >
                  依頁碼
                </button>
                <span class="h-3.5 mx-2.5 border-l border-border-muted"></span>
                <button
                  type="button"
                  :aria-pressed="noteSortOrder === 'recent'"
                  class="cursor-pointer"
                  :class="
                    noteSortOrder === 'recent'
                      ? 'text-text-default'
                      : 'text-text-muted'
                  "
                  @click="noteSortOrder = 'recent'"
                >
                  最近寫下
                </button>
              </div>
            </div>
            <ul
              v-if="notes.length > 0"
              class="flex flex-col gap-2 pb-30 md:gap-3"
            >
              <li v-for="{ note, number } in sortedNotes" :key="note.id">
                <NoteCard :note="note" :number="number" />
              </li>
            </ul>
            <div
              v-else
              class="py-6 md:pt-5 lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:py-0"
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
    <button
      v-if="notes.length > 0"
      type="button"
      :aria-label="isTitleScrolledPast ? '寫下筆記' : undefined"
      class="fixed right-5 bottom-5 z-30 flex items-center text-text-on-inverse bg-button-primary-bg-rest shadow-[0_4px_12px_0_#1111111a] transition-[padding,border-radius] duration-200 cursor-pointer hover:bg-button-primary-bg-hover md:right-6 md:bottom-6"
      :class="
        isTitleScrolledPast
          ? 'px-3.5 py-3 rounded-3xl md:p-4 md:rounded-[1.75rem]'
          : 'py-2.5 pr-5 pl-3 rounded-lg md:py-3 md:pl-3.5'
      "
    >
      <Icon
        name="bluette:pencil"
        class="size-5 transition-[width,height] duration-200"
        :class="isTitleScrolledPast ? 'md:size-6' : ''"
      />
      <span
        class="grid transition-[grid-template-columns] duration-200"
        :class="isTitleScrolledPast ? 'grid-cols-[0fr]' : 'grid-cols-[1fr]'"
      >
        <span class="overflow-hidden">
          <span
            class="block pl-1 font-sans text-body-sm whitespace-nowrap md:pl-1.5 md:text-body-md"
          >
            寫下筆記
          </span>
        </span>
      </span>
    </button>
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
