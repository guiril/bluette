<script setup lang="ts">
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue';

import type { UserBookWithNoteCount } from '~/types/database';

const { data: userBooks, refresh } =
  await useFetch<UserBookWithNoteCount[]>('/api/user-books');

const selectedInfoBookId = ref<string | null>(null);
const selectedNotesBookId = ref<string | null>(null);

const toastRef = useTemplateRef('toastRef');

const hasBooks = computed(() => (userBooks.value ?? []).length > 0);

const tabs = computed(() => {
  const books = userBooks.value ?? [];

  return [
    {
      key: 'all',
      label: '全部',
      books,
    },
    {
      key: 'with-notes',
      label: '有筆記',
      books: books.filter((userBook) => userBook.note_count > 0),
      emptyMessage: '還沒有寫過筆記的書',
    },
    {
      key: 'without-notes',
      label: '還沒有筆記',
      books: books.filter((userBook) => userBook.note_count === 0),
      emptyMessage: '每本書都有筆記了',
    },
  ];
});

const selectedInfoBook = computed(
  () =>
    userBooks.value?.find(
      (userBook) => userBook.id === selectedInfoBookId.value,
    ) ?? null,
);

const selectedNotesBook = computed(
  () =>
    userBooks.value?.find(
      (userBook) => userBook.id === selectedNotesBookId.value,
    ) ?? null,
);

const handleOpenInfo = (userBookId: string) => {
  selectedInfoBookId.value = userBookId;
};

const handleOpenNotes = (userBookId: string) => {
  selectedInfoBookId.value = null;
  selectedNotesBookId.value = userBookId;
};

// Notes may have been added or deleted, so the note counts are reloaded.
const handleNotesClose = async () => {
  selectedNotesBookId.value = null;
  await refresh();
};

const handleNotesError = (message: string) => {
  toastRef.value?.show(message);
};

const handleBookRemoved = (userBookId: string) => {
  selectedInfoBookId.value = null;
  userBooks.value = (userBooks.value ?? []).filter(
    (userBook) => userBook.id !== userBookId,
  );
  toastRef.value?.show('已從書庫移除');
};

const handleInfoError = (message: string) => {
  toastRef.value?.show(message);
};
</script>

<template>
  <div class="flex flex-col flex-1">
    <div
      v-if="!hasBooks"
      class="page-container flex flex-1 flex-col pt-12 pb-29 md:pb-20 lg:grid lg:grid-cols-2 lg:grid-rows-[1fr_auto_auto_1fr] lg:gap-x-24 lg:py-20"
    >
      <div class="mb-5 md:mb-3 lg:col-start-2 lg:row-start-2 lg:mb-0">
        <p
          class="flex items-center gap-2 mb-8 font-sans text-eyebrow-sm text-text-muted md:mb-12 md:text-eyebrow"
        >
          <span class="size-2 bg-bg-brand-emphasis md:size-2.5" />
          書庫是空的
        </p>
        <h1
          class="mb-1.5 font-serif text-accent-md text-text-default md:mb-2 md:text-accent-lg lg:mb-2.5 lg:text-accent-xl"
        >
          把正在讀的書<span class="text-text-brand">放進來</span>，<br
            class="md:hidden lg:inline"
          /><span class="hidden lg:inline">輕輕</span>寫下你喜歡的句子
        </h1>
        <p class="font-sans text-body-sm text-text-muted md:text-body-md">
          新增手邊的書，收藏字裡行間的悸動，記下你的隨想
        </p>
      </div>
      <div
        class="relative h-86.25 w-75 mb-3 self-center md:h-auto md:min-h-75 md:w-auto md:flex-1 md:self-stretch md:mb-8 lg:col-start-1 lg:row-span-4 lg:row-start-1 lg:mb-0"
      >
        <img
          src="/images/library-empty.png"
          alt=""
          width="1050"
          height="1110"
          class="absolute inset-0 size-full object-contain"
        />
      </div>
      <AppButton
        to="/my-books/new"
        class="w-full lg:col-start-2 lg:row-start-3 lg:mt-10 lg:mb-12 lg:w-100"
      >
        <Icon name="bluette:add" class="size-5" />
        新增一本書
      </AppButton>
    </div>
    <div v-else class="page-container pt-10 max-sm:pt-6 pb-16">
      <div class="flex items-center justify-between py-1">
        <h1
          class="font-serif text-heading-h2 max-sm:text-heading-h3 text-text-primary"
        >
          書庫
        </h1>
        <AppButton to="/my-books/new" size="md" class="pr-5!">
          <img class="size-4 p-0.5" src="/images/icons/add.svg" alt="" />
          <span>新增一本書</span>
        </AppButton>
      </div>
      <TabGroup>
        <TabList class="flex gap-6 mt-5 border-b border-border-subtle">
          <Tab
            v-for="tab in tabs"
            :key="tab.key"
            v-slot="{ selected }"
            as="template"
          >
            <button
              type="button"
              class="relative flex gap-1 pb-1.5 font-sans text-ui-label-lg cursor-pointer transition-colors hover:text-text-primary focus:outline-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-border-strong after:origin-left after:transition-transform"
              :class="
                selected
                  ? 'text-text-primary after:scale-x-100'
                  : 'text-text-secondary after:scale-x-0 hover:after:scale-x-100'
              "
            >
              <span>{{ tab.label }}</span>
              <span>{{ tab.books.length }}</span>
            </button>
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel
            v-for="tab in tabs"
            :key="tab.key"
            class="rounded-xs outline-offset-4 outline-button-focus focus-visible:outline-2"
          >
            <ul
              v-if="tab.books.length > 0"
              class="grid grid-cols-7 max-lg:grid-cols-6 max-md:grid-cols-4 max-sm:grid-cols-2 gap-4 mt-8"
            >
              <UserBookCard
                v-for="userBook in tab.books"
                :key="userBook.id"
                :user-book="userBook"
                @open-info="handleOpenInfo"
              />
            </ul>
            <p
              v-else
              class="mt-16 text-center font-sans text-base leading-6 text-text-secondary"
            >
              {{ tab.emptyMessage }}
            </p>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
    <BookInfoModal
      v-if="selectedInfoBook"
      :user-book="selectedInfoBook"
      @close="selectedInfoBookId = null"
      @open-notes="handleOpenNotes"
      @removed="handleBookRemoved"
      @error="handleInfoError"
    />
    <BookNotesModal
      v-if="selectedNotesBook"
      :user-book="selectedNotesBook"
      @close="handleNotesClose"
      @error="handleNotesError"
    />
    <AppToast ref="toastRef" />
  </div>
</template>
