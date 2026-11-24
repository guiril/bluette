<script setup lang="ts">
import { Dialog, DialogPanel } from '@headlessui/vue';

const supabase = useSupabaseClient();
const route = useRoute();

const isMenuOpen = ref(false);

const isLibraryActive = computed(
  () => route.path.startsWith('/my-books') || route.path.startsWith('/books/'),
);

const openMenu = () => {
  isMenuOpen.value = true;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const handleLogout = async () => {
  closeMenu();
  await supabase.auth.signOut();
  await navigateTo('/login');
};

watch(
  () => route.path,
  () => {
    closeMenu();
  },
);
</script>

<template>
  <div class="min-h-screen flex flex-col bg-bg-default">
    <header
      class="sticky top-0 z-40 font-sans border-b border-border-disabled bg-bg-default lg:border-border-muted"
      :class="route.meta.hideHeaderBelowLg ? 'hidden lg:block' : undefined"
    >
      <div
        class="page-container flex h-14 items-center justify-between md:h-auto md:py-3 lg:py-2"
      >
        <div class="flex items-center gap-40">
          <NuxtLink to="/my-books">
            <AppLogo class="h-5 md:h-6.25 lg:h-7" />
          </NuxtLink>
          <nav aria-label="主要導覽" class="hidden lg:flex items-center">
            <NuxtLink
              to="/my-books"
              :aria-current="isLibraryActive ? 'page' : undefined"
              class="flex h-16 items-center gap-2.5"
              :class="
                isLibraryActive
                  ? 'text-body-md font-medium text-text-default'
                  : 'pt-0.5 text-body-sm text-text-nav'
              "
            >
              書庫
              <span
                v-if="isLibraryActive"
                class="size-2 bg-bg-brand-emphasis"
              />
            </NuxtLink>
          </nav>
        </div>
        <button
          type="button"
          class="hidden lg:flex h-11 items-center gap-1 py-2.5 pl-3 text-body-sm font-medium tracking-[0.01em] text-text-default opacity-80 cursor-pointer"
          @click="handleLogout"
        >
          登出
          <Icon name="bluette:logout" class="size-5" />
        </button>
        <button
          type="button"
          aria-label="開啟選單"
          :aria-expanded="isMenuOpen"
          class="flex p-2.5 -mr-2.5 cursor-pointer lg:hidden"
          @click="openMenu"
        >
          <span class="flex w-5 flex-col items-end gap-1.25">
            <span class="h-[1.5px] w-5 rounded-xs bg-fg-default" />
            <span class="h-[1.5px] w-3.5 rounded-xs bg-fg-default" />
            <span class="h-[1.5px] w-2.5 rounded-xs bg-fg-default" />
          </span>
        </button>
      </div>
    </header>
    <Dialog
      :open="isMenuOpen"
      class="relative z-50 lg:hidden"
      @close="closeMenu"
    >
      <div class="fixed inset-0 bg-bg-backdrop" aria-hidden="true" />
      <DialogPanel
        aria-label="選單"
        class="fixed inset-x-0 top-0 font-sans bg-bg-default"
      >
        <div
          class="flex h-14 items-center justify-between px-5 border-b border-border-disabled md:h-auto md:px-6 md:py-3"
        >
          <NuxtLink to="/my-books" @click="closeMenu">
            <AppLogo class="h-5 md:h-6.25" />
          </NuxtLink>
          <button
            type="button"
            aria-label="關閉選單"
            class="flex p-2.5 -mr-2.5 text-fg-default cursor-pointer"
            @click="closeMenu"
          >
            <Icon name="bluette:close" class="size-5" />
          </button>
        </div>
        <div
          class="flex flex-col gap-3.5 px-5 pt-3 pb-3.5 border-b-2 border-border-emphasis md:gap-4 md:px-6 md:pb-4"
        >
          <nav aria-label="主要導覽" class="flex flex-col">
            <NuxtLink
              to="/my-books"
              :aria-current="isLibraryActive ? 'page' : undefined"
              class="flex h-14 items-center gap-2.5 md:h-18 md:gap-3"
              :class="
                isLibraryActive
                  ? 'text-body-md font-medium text-text-default md:text-lg/6'
                  : 'pt-0.5 text-body-sm text-text-nav md:text-lg/6'
              "
              @click="closeMenu"
            >
              書庫
              <span
                v-if="isLibraryActive"
                class="size-2 bg-bg-brand-emphasis md:size-2.5"
              />
            </NuxtLink>
          </nav>
          <hr class="border-border-muted" />
          <button
            type="button"
            class="flex h-11 items-center gap-1 py-2.5 text-body-sm font-medium tracking-[0.01em] text-text-default opacity-80 cursor-pointer md:h-13 md:gap-2.5 md:py-3.5 md:text-body-md md:font-normal md:tracking-normal"
            @click="handleLogout"
          >
            登出
            <Icon name="bluette:logout" class="size-5 md:size-6" />
          </button>
        </div>
      </DialogPanel>
    </Dialog>
    <main class="flex flex-col flex-1">
      <slot />
    </main>
  </div>
</template>
