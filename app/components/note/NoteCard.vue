<script setup lang="ts">
import type { Note } from '~/types/database';

const { note, number } = defineProps<{
  note: Note;
  number: number;
}>();

const paddedNumber = computed(() => String(number).padStart(2, '0'));
const memoText = computed(() => note.thought || note.content);
</script>

<template>
  <article
    class="flex flex-col px-3.5 py-4 rounded-xl border border-border-disabled/60 bg-bg-sub md:px-5 lg:px-6"
  >
    <div class="flex flex-col gap-5" :class="note.excerpt ? 'lg:gap-6' : ''">
      <div class="flex items-center justify-between">
        <span
          class="font-sans text-xs/4.5 font-medium text-text-muted md:text-body-sm md:tracking-[0.01em]"
        >
          {{ paddedNumber }}
        </span>
        <span
          class="px-1 py-0.75 font-sans text-[0.625rem]/3 font-semibold tracking-[0.02em] text-text-default rounded-[3px] md:text-xs/3.5"
          :class="note.excerpt ? 'bg-[#ADC4FA]' : 'bg-[#FAADB3]'"
        >
          {{ note.excerpt ? '書摘' : '隨記' }}
        </span>
      </div>
      <div v-if="note.excerpt" class="flex flex-col gap-4 md:gap-5">
        <p
          class="line-clamp-2 pl-2 font-serif text-accent-xs text-text-default border-l-[1.6px] border-border-brand-emphasis md:pl-2.5 md:text-xl/normal md:tracking-normal md:border-l-2"
        >
          {{ note.excerpt }}
        </p>
        <div v-if="note.thought" class="pl-2.5 md:pl-3.5">
          <p
            class="font-sans text-xs/4.5 font-medium text-text-default md:text-body-sm md:tracking-[0.01em]"
          >
            我的想法：
          </p>
          <p
            class="line-clamp-1 font-sans text-sm/5.5 tracking-[0.01em] text-text-muted md:text-body-md md:font-medium md:tracking-normal md:text-[#545350]"
          >
            {{ note.thought }}
          </p>
        </div>
      </div>
      <p
        v-else
        class="line-clamp-2 font-sans text-lg/normal text-text-default md:text-xl/normal"
      >
        {{ memoText }}
      </p>
    </div>
    <div
      class="flex justify-between font-sans text-xs/4.5 text-text-muted"
      :class="note.excerpt ? 'mt-7 md:mt-6' : 'mt-5'"
    >
      <span v-if="note.page !== null">第 {{ note.page }} 頁</span>
      <time :datetime="note.created_at" class="ml-auto">
        {{ formatNoteDate(note.created_at) }}
      </time>
    </div>
  </article>
</template>
