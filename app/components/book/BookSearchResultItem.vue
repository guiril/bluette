<script setup lang="ts">
import type { BookDetails } from '~/types/database';

const { book, query, isInLibrary, isAdding, disabled } = defineProps<{
  book: BookDetails;
  query: string;
  isInLibrary: boolean;
  isAdding: boolean;
  disabled: boolean;
}>();

const emit = defineEmits<{
  select: [];
}>();
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    class="group flex w-full gap-4 px-5 py-2.5 text-left outline-none cursor-pointer md:px-6 md:py-3 lg:py-2.5 disabled:cursor-default enabled:hover:bg-bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-button-focus"
    :class="isAdding ? 'bg-bg-muted' : undefined"
    @click="emit('select')"
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
            query,
          )"
          :key="segmentIndex"
          :class="segment.isMatch ? 'text-text-brand' : undefined"
        >
          {{ segment.text }}
        </span>
      </span>
      <span class="text-ui-caption text-text-muted md:text-body-sm">
        {{ book.author || '作者不詳' }}
      </span>
    </span>
    <span
      v-if="isInLibrary"
      class="py-1 px-2 ml-auto shrink-0 self-start text-ui-caption text-text-nav bg-bg-muted rounded-xs group-enabled:group-hover:bg-bg-default"
    >
      已在書庫
    </span>
    <BaseSpinner
      v-if="isAdding"
      size="sm"
      label="新增中"
      class="ml-auto shrink-0 self-center text-text-muted"
    />
  </button>
</template>
