<script setup lang="ts">
import type { BookDetails, UserBook } from '~/types/database';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue';

const SEARCH_PATH = '/my-books/new';

const { userBooks } = defineProps<{
  userBooks: UserBook[];
}>();

const emit = defineEmits<{
  bookAdded: [title: string];
  openBook: [userBookId: string];
}>();

const {
  searchQuery,
  hasSearched,
  isSearching,
  searchResults,
  searchedQuery,
  searchErrorMessage,
  handleSearch,
} = useBookSearch();

const route = useRoute();
const router = useRouter();

const addingBook = ref<BookDetails | null>(null);
const addErrorMessage = ref('');

const searchInput = useTemplateRef<HTMLInputElement>('searchInput');

const isManualMode = computed(() => route.query.mode === 'manual');

const userBookIdByGoogleBooksId = computed(() => {
  const userBookIds = new Map<string, string>();

  for (const userBook of userBooks) {
    if (userBook.google_books_id) {
      userBookIds.set(userBook.google_books_id, userBook.id);
    }
  }

  return userBookIds;
});

const closeDialog = () => {
  navigateTo('/my-books');
};

const backToSearch = () => {
  if (router.options.history.state.back === SEARCH_PATH) {
    router.back();
    return;
  }

  navigateTo(SEARCH_PATH, { replace: true });
};

const clearSearch = () => {
  searchQuery.value = '';
  searchInput.value?.focus();
};

const dismissKeyboard = () => {
  searchInput.value?.blur();
};

const findUserBookId = (googleBooksId: string | null) =>
  googleBooksId
    ? userBookIdByGoogleBooksId.value.get(googleBooksId)
    : undefined;

const selectBook = (book: BookDetails) => {
  const userBookId = findUserBookId(book.google_books_id);

  if (userBookId) {
    emit('openBook', userBookId);
    return;
  }

  addBook(book);
};

const addBook = async (book: BookDetails) => {
  if (addingBook.value) return;

  addingBook.value = book;
  addErrorMessage.value = '';

  try {
    await $fetch('/api/user-books', {
      method: 'POST',
      body: {
        google_books_id: book.google_books_id,
        title: book.title,
        author: book.author,
        cover_url: book.cover_url,
        description: book.description,
      },
    });

    emit('bookAdded', book.title);
    await navigateTo('/my-books');
  } catch (error) {
    const isAlreadyInLibrary =
      error instanceof Error &&
      'statusCode' in error &&
      error.statusCode === 409;

    addErrorMessage.value = isAlreadyInLibrary
      ? '這本書已經在書庫裡了'
      : '新增失敗，請稍後再試';
  } finally {
    addingBook.value = null;
  }
};

watch(searchQuery, () => {
  addErrorMessage.value = '';
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
      class="fixed inset-0 bg-bg-default lg:flex lg:justify-center lg:bg-transparent"
      :class="isManualMode ? 'lg:items-center' : 'lg:items-start lg:pt-16'"
    >
      <DialogPanel
        class="relative flex h-full flex-col bg-bg-default lg:h-auto lg:max-h-[min(47.5rem,calc(100dvh-8rem))] lg:pt-8 lg:rounded-xl"
        :class="isManualMode ? 'lg:w-130 lg:pb-6' : 'lg:w-204 lg:pb-4'"
        @keydown="preventImeEscape"
      >
        <header
          class="page-container flex items-center justify-between pt-3 pb-2.5 md:pt-4 md:pb-3 lg:py-0"
        >
          <button
            v-if="isManualMode"
            type="button"
            aria-label="返回搜尋"
            class="flex w-11 py-3 pr-3 text-text-nav cursor-pointer md:w-12 md:pt-3.75 md:pr-3.5 md:pb-3.25 lg:hidden"
            @click="backToSearch"
          >
            <Icon name="bluette:arrow-left" class="size-5" />
          </button>
          <NuxtLink
            v-else
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
            {{ isManualMode ? '手動新增書籍' : '新增一本書' }}
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
        <BookManualForm
          v-if="isManualMode"
          :initial-title="searchQuery.trim()"
          class="page-container pt-3"
          @added="emit('bookAdded', $event)"
        />
        <template v-else>
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
              <BaseSpinner label="搜尋中" />
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
                <p
                  v-if="addErrorMessage"
                  role="alert"
                  class="mb-2 text-body-sm text-text-danger"
                >
                  {{ addErrorMessage }}
                </p>
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
                    <BookSearchResultItem
                      :book="book"
                      :query="searchedQuery"
                      :is-in-library="!!findUserBookId(book.google_books_id)"
                      :is-adding="addingBook === book"
                      :disabled="addingBook !== null"
                      @select="selectBook(book)"
                    />
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
                <BaseButton
                  :to="{ query: { mode: 'manual' } }"
                  class="w-63 md:w-75 lg:h-13 lg:w-63 lg:gap-2.5"
                >
                  <Icon name="bluette:add" class="size-5 lg:size-6" />
                  手動新增書籍
                </BaseButton>
              </div>
            </div>
          </div>
        </template>
      </DialogPanel>
    </div>
  </Dialog>
</template>
