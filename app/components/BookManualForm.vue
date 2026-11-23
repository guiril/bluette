<script setup lang="ts">
const { initialTitle = '' } = defineProps<{
  initialTitle?: string;
}>();

const emit = defineEmits<{
  added: [title: string];
}>();

const titleField = useTemplateRef('titleField');
const authorField = useTemplateRef('authorField');

const title = ref(initialTitle);
const author = ref('');
const isSubmitting = ref(false);
const errorMessage = ref('');

const canSubmit = computed(() => title.value.trim() !== '');

const clearTitle = () => {
  title.value = '';
  titleField.value?.focus();
};

const clearAuthor = () => {
  author.value = '';
  authorField.value?.focus();
};

const handleSubmit = async () => {
  if (!canSubmit.value || isSubmitting.value) return;

  const trimmedTitle = title.value.trim();

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    await $fetch('/api/user-books', {
      method: 'POST',
      body: {
        title: trimmedTitle,
        author: author.value,
      },
    });

    emit('added', trimmedTitle);
    await navigateTo('/my-books');
  } catch {
    errorMessage.value = '新增失敗，請稍後再試';
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  titleField.value?.focus();
});
</script>

<template>
  <form
    novalidate
    class="flex flex-col gap-6 md:gap-8"
    @submit.prevent="handleSubmit"
  >
    <div class="flex flex-col gap-4">
      <AppTextField
        id="manual-title"
        ref="titleField"
        v-model="title"
        label="書名"
        placeholder="輸入書名"
      >
        <template #trailing>
          <button
            v-if="title"
            type="button"
            aria-label="清除書名"
            class="flex p-2.5 text-fg-default cursor-pointer"
            @mousedown.prevent
            @click="clearTitle"
          >
            <Icon name="bluette:clear" class="size-5" />
          </button>
        </template>
      </AppTextField>
      <AppTextField
        id="manual-author"
        ref="authorField"
        v-model="author"
        label="作者（選填）"
        placeholder="輸入作者"
      >
        <template #trailing>
          <button
            v-if="author"
            type="button"
            aria-label="清除作者"
            class="flex p-2.5 text-fg-default cursor-pointer"
            @mousedown.prevent
            @click="clearAuthor"
          >
            <Icon name="bluette:clear" class="size-5" />
          </button>
        </template>
      </AppTextField>
      <p v-if="errorMessage" role="alert" class="text-body-sm text-text-danger">
        {{ errorMessage }}
      </p>
    </div>
    <AppButton
      type="submit"
      class="w-full"
      :disabled="!canSubmit"
      :is-loading="isSubmitting"
    >
      確定新增
    </AppButton>
  </form>
</template>
