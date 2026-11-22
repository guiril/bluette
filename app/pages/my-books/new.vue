<script setup lang="ts">
import type { BookFormValues } from '~/components/BookConfirmForm.vue';
import type { BookDetails } from '~/types/database';

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue';

const SEARCH_DEBOUNCE_MS = 400;
const QUERY_TERM_PATTERN = /\p{Script=Han}|[^\s\p{Script=Han}]+/gu;

const createBlankBookForm = (): BookFormValues => ({
  title: '',
  author: '',
  cover_url: '',
  description: '',
});

let latestSearchId = 0;
let searchTimer: ReturnType<typeof setTimeout> | null = null;

const bookForm = ref<BookFormValues>(createBlankBookForm());
const isSubmitting = ref(false);
const submitErrorMessage = ref('');

const searchQuery = ref('');
const searchedQuery = ref('');
const searchResults = ref<BookDetails[]>([]);

const isSearching = ref(false);
const hasSearched = ref(false);
const searchErrorMessage = ref('');

const selectedGoogleBooksId = ref<string | null>(null);

const searchInput = useTemplateRef<HTMLInputElement>('searchInput');
const toastRef = useTemplateRef('toastRef');

const clearSearchTimer = () => {
  if (!searchTimer) return;

  clearTimeout(searchTimer);
  searchTimer = null;
};

const handleSearch = async () => {
  clearSearchTimer();

  const trimmedQuery = searchQuery.value.trim();

  if (!trimmedQuery) return;

  isSearching.value = true;
  searchErrorMessage.value = '';

  const searchId = latestSearchId + 1;
  latestSearchId = searchId;

  try {
    const books = await $fetch<BookDetails[]>('/api/books/search', {
      query: { q: trimmedQuery },
    });

    if (searchId !== latestSearchId) return;

    searchResults.value = books;
    searchedQuery.value = trimmedQuery;
  } catch {
    if (searchId !== latestSearchId) return;
    searchErrorMessage.value = '搜尋失敗，請稍後再試';
  } finally {
    if (searchId === latestSearchId) {
      isSearching.value = false;
      hasSearched.value = true;
    }
  }
};

const resetSearch = () => {
  latestSearchId += 1;
  searchResults.value = [];
  searchErrorMessage.value = '';
  isSearching.value = false;
  hasSearched.value = false;
};

const splitTitleByQuery = (title: string) => {
  const queryTerms =
    searchedQuery.value.toLowerCase().match(QUERY_TERM_PATTERN) ?? [];

  if (queryTerms.length === 0) return [{ text: title, isMatch: false }];

  const lowerTitle = title.toLowerCase();
  const isMatchedAt = Array.from({ length: title.length }, () => false);

  for (const term of queryTerms) {
    let matchIndex = lowerTitle.indexOf(term);

    while (matchIndex !== -1) {
      for (let offset = 0; offset < term.length; offset += 1) {
        isMatchedAt[matchIndex + offset] = true;
      }

      matchIndex = lowerTitle.indexOf(term, matchIndex + term.length);
    }
  }

  const segments: { text: string; isMatch: boolean }[] = [];

  for (let index = 0; index < title.length; index += 1) {
    const isMatch = isMatchedAt[index] ?? false;
    const lastSegment = segments.at(-1);

    if (lastSegment && lastSegment.isMatch === isMatch) {
      lastSegment.text += title[index];
    } else {
      segments.push({ text: title[index] ?? '', isMatch });
    }
  }

  return segments;
};

const closeDialog = () => {
  navigateTo('/my-books');
};

const clearSearch = () => {
  searchQuery.value = '';
  searchInput.value?.focus();
};

const dismissKeyboard = () => {
  searchInput.value?.blur();
};

const selectBook = (book: BookDetails) => {
  selectedGoogleBooksId.value = book.google_books_id;
  searchQuery.value = '';
  searchResults.value = [];
  hasSearched.value = false;

  bookForm.value = {
    title: book.title,
    author: book.author,
    cover_url: book.cover_url ?? '',
    description: book.description ?? '',
  };

  toastRef.value?.show('已帶入搜尋結果的資料');
};

const resetForm = () => {
  selectedGoogleBooksId.value = null;
  bookForm.value = createBlankBookForm();
};

const handleFormSubmit = async () => {
  isSubmitting.value = true;
  submitErrorMessage.value = '';

  try {
    await $fetch('/api/user-books', {
      method: 'POST',
      body: {
        google_books_id: selectedGoogleBooksId.value ?? undefined,
        title: bookForm.value.title,
        author: bookForm.value.author,
        cover_url: bookForm.value.cover_url,
        description: bookForm.value.description,
      },
    });

    await navigateTo('/my-books');
  } catch (error) {
    const isAlreadyInLibrary =
      error instanceof Error &&
      'statusCode' in error &&
      error.statusCode === 409;

    submitErrorMessage.value = isAlreadyInLibrary
      ? '這本書已經在書庫裡了'
      : '新增失敗，請稍後再試';
  } finally {
    isSubmitting.value = false;
  }
};

watch(searchQuery, (query) => {
  clearSearchTimer();

  if (!query.trim()) {
    resetSearch();
    return;
  }

  searchTimer = setTimeout(() => {
    handleSearch();
  }, SEARCH_DEBOUNCE_MS);
});

onBeforeUnmount(() => {
  clearSearchTimer();
});
</script>

<template>
  <Dialog
    :open="true"
    :initial-focus="searchInput"
    class="relative z-50 font-sans"
    @close="closeDialog"
  >
    <div
      aria-hidden="true"
      class="fixed inset-0 hidden bg-bg-backdrop lg:block"
    />
    <div
      class="fixed inset-0 bg-bg-default lg:flex lg:items-start lg:justify-center lg:pt-16 lg:bg-transparent"
    >
      <DialogPanel
        class="relative flex h-full flex-col bg-bg-default lg:h-auto lg:max-h-[min(47.5rem,calc(100dvh-8rem))] lg:w-204 lg:pt-8 lg:pb-4 lg:rounded-xl"
      >
        <header
          class="page-container flex items-center justify-between pt-3 pb-2.5 md:pt-4 md:pb-3 lg:py-0"
        >
          <NuxtLink
            to="/my-books"
            aria-label="返回書庫"
            class="flex w-11 py-3 pr-3 text-text-nav md:w-12 md:pt-3.75 md:pr-3.5 md:pb-3.25 lg:hidden"
          >
            <Icon name="bluette:arrow-left" class="size-5" />
          </NuxtLink>
          <DialogTitle
            as="h1"
            class="text-body-md font-medium text-text-default lg:text-heading-h4 lg:font-semibold"
          >
            新增一本書
          </DialogTitle>
          <NuxtLink
            to="/my-books"
            class="flex w-11 justify-end py-2.5 pl-3 text-body-md text-text-muted md:w-auto md:py-3 md:pl-3.5 lg:hidden"
          >
            取消
          </NuxtLink>
        </header>
        <button
          type="button"
          aria-label="關閉"
          class="absolute top-2 right-5 hidden h-9 items-center pl-4 text-fg-default opacity-60 cursor-pointer lg:flex"
          @click="closeDialog"
        >
          <Icon name="bluette:close-sm" class="size-4" />
        </button>
        <form
          role="search"
          class="page-container py-3 lg:py-4"
          @submit.prevent="handleSearch"
        >
          <div
            class="flex h-12 items-center gap-2 pr-1 pl-3 rounded-sm border border-border-default focus-within:border-[1.5px] focus-within:border-border-emphasis"
          >
            <Icon
              name="bluette:search"
              class="size-5 shrink-0 text-fg-default"
            />
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="search"
              enterkeyhint="search"
              aria-label="搜尋書籍"
              placeholder="輸入書名、作者或 ISBN"
              class="min-w-0 flex-1 text-body-md text-text-default bg-transparent caret-text-brand outline-none placeholder:text-text-placeholder [&::-webkit-search-cancel-button]:appearance-none"
            />
            <button
              v-if="searchQuery"
              type="button"
              aria-label="清除搜尋"
              class="flex p-2.5 text-fg-default cursor-pointer"
              @mousedown.prevent
              @click="clearSearch"
            >
              <Icon name="bluette:clear" class="size-5" />
            </button>
          </div>
        </form>
        <div
          class="min-h-0 flex-1 overflow-y-auto"
          @touchmove.passive="dismissKeyboard"
        >
          <div
            v-if="!hasSearched && !isSearching"
            class="flex justify-center px-10 py-12 md:py-16 lg:pt-3 lg:pb-6"
          >
            <img
              src="/images/search-books.png"
              alt=""
              width="300"
              height="300"
              class="size-50 md:size-70 lg:size-65"
            />
          </div>
          <div
            v-if="isSearching"
            class="flex justify-center py-8 text-text-muted"
          >
            <AppSpinner label="搜尋中" />
          </div>
          <div v-if="hasSearched && !isSearching" class="page-container pb-4">
            <p
              v-if="searchErrorMessage"
              role="alert"
              class="py-12 text-center text-body-sm text-text-danger"
            >
              {{ searchErrorMessage }}
            </p>
            <div
              v-else-if="searchResults.length > 0"
              class="pt-2 md:pt-4 lg:pt-2"
            >
              <!-- Shows how many results the API returned (capped at 8), not the total number of matches. -->
              <p
                class="mb-2 text-body-sm text-text-muted md:mb-3 md:text-body-md lg:mb-2 lg:text-body-sm"
              >
                找到<span class="mx-1 text-text-default">{{
                  searchResults.length
                }}</span
                >本書
              </p>
              <ul aria-label="搜尋結果" class="-mx-5 md:-mx-6">
                <li
                  v-for="(book, index) in searchResults"
                  :key="book.google_books_id ?? index"
                >
                  <button
                    type="button"
                    class="flex w-full gap-4 px-5 py-2.5 text-left outline-none cursor-pointer md:px-6 md:py-3 lg:py-2.5 hover:bg-bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-button-focus"
                    @click="selectBook(book)"
                  >
                    <img
                      v-if="book.cover_url"
                      :src="book.cover_url"
                      alt=""
                      class="h-20 w-14 shrink-0 object-cover rounded-xs border-[0.6px] border-border-muted md:h-25 md:w-17.25 md:rounded-[0.25rem] md:border-[0.8px] lg:h-20 lg:w-14 lg:rounded-xs lg:border-[0.6px]"
                    />
                    <span
                      v-else
                      class="flex h-20 w-14 shrink-0 items-center justify-center rounded-xs border-[0.6px] border-border-muted bg-bg-muted md:h-25 md:w-17.25 md:rounded-[0.25rem] md:border-[0.8px] lg:h-20 lg:w-14 lg:rounded-xs lg:border-[0.6px]"
                    >
                      <Icon
                        name="bluette:book"
                        class="size-5 text-text-muted md:size-8 lg:size-5"
                      />
                    </span>
                    <span class="flex min-w-0 flex-col">
                      <span
                        class="truncate text-body-sm font-medium tracking-[0.01em] text-text-default md:text-body-md md:tracking-normal"
                      >
                        <span
                          v-for="(segment, segmentIndex) in splitTitleByQuery(
                            book.title,
                          )"
                          :key="segmentIndex"
                          :class="
                            segment.isMatch ? 'text-text-brand' : undefined
                          "
                          >{{ segment.text }}</span
                        >
                      </span>
                      <span
                        class="text-ui-caption text-text-muted md:text-body-sm"
                      >
                        {{ book.author || '作者不詳' }}
                      </span>
                    </span>
                  </button>
                </li>
              </ul>
            </div>
            <div
              v-else
              class="flex flex-col items-center gap-3 pt-2 pb-9 text-center md:gap-8 md:py-14 lg:gap-6 lg:py-9"
            >
              <div class="flex flex-col items-center gap-3 md:gap-5 lg:gap-3">
                <img
                  src="/images/search-empty.png"
                  alt=""
                  width="520"
                  height="458"
                  class="h-42.25 w-75 object-contain md:h-65 md:w-87.5 lg:h-49.25"
                />
                <div class="flex flex-col md:gap-1 lg:gap-0">
                  <h2
                    class="font-serif text-accent-xs text-text-default md:text-accent-sm lg:text-accent-xs"
                  >
                    好像找不到這本書
                  </h2>
                  <p
                    class="font-sans text-body-sm text-text-muted md:text-body-lg lg:text-body-sm"
                  >
                    可能是近期的新書或是比較少見的書
                  </p>
                </div>
              </div>
              <AppButton class="w-63 md:w-75 lg:h-13 lg:w-63 lg:gap-2.5">
                <Icon name="bluette:add" class="size-5 lg:size-6" />
                手動新增書籍
              </AppButton>
            </div>
            <p v-if="submitErrorMessage" class="mt-4 text-sm text-red-600">
              {{ submitErrorMessage }}
            </p>
          </div>
        </div>
        <AppToast ref="toastRef" />
      </DialogPanel>
    </div>
  </Dialog>
</template>
