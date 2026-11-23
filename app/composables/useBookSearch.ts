import type { BookDetails } from '~/types/database';

const SEARCH_DEBOUNCE_MS = 400;

export const useBookSearch = () => {
  let latestSearchId = 0;
  let searchTimer: ReturnType<typeof setTimeout> | null = null;

  const searchQuery = ref('');
  const searchedQuery = ref('');
  const searchResults = ref<BookDetails[]>([]);
  const isSearching = ref(false);
  const hasSearched = ref(false);
  const searchErrorMessage = ref('');

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

  return {
    searchQuery,
    hasSearched,
    isSearching,
    searchResults,
    searchedQuery,
    searchErrorMessage,
    handleSearch,
  };
};
